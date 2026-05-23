<template>
  <Window title="📁 Mis archivos" @close="$emit('close')" @minimize="$emit('minimize')">
    <div class="explorer">

      <!-- ── Sidebar ──────────────────────────────────────────────────────── -->
      <div class="sidebar">
        <div class="sidebar-section">
          <div
            v-for="item in sidebar"
            :key="item.label"
            class="sidebar-item"
            :class="{ active: currentPathStr === item.path }"
            @click="navigateTo(item.path)"
          >
            <span class="sidebar-icon">{{ item.icon }}</span>
            {{ item.label }}
          </div>
        </div>
        <div class="sidebar-divider" />
        <div class="sidebar-section">
          <div class="sidebar-item" @click="navigateTo('disco')">
            <span class="sidebar-icon">💾</span> Disco local (C:)
          </div>
        </div>

        <!-- Mini progreso narrativo (solo en desarrollo, puede quitarse) -->
        <!--
        <div class="sidebar-divider" />
        <div class="sidebar-progress">
          Nivel 1: {{ system.level1Progress }}/5 pistas
        </div>
        -->
      </div>

      <!-- ── Panel principal ──────────────────────────────────────────────── -->
      <div class="main">

        <!-- Breadcrumb con ruta completa -->
        <div class="breadcrumb">
          <span
            v-for="(crumb, i) in breadcrumbs"
            :key="crumb.path"
            class="crumb"
            :class="{ last: i === breadcrumbs.length - 1 }"
            @click="navigateTo(crumb.path)"
          >
            <span v-if="i > 0" class="crumb-sep">›</span>
            {{ crumb.label }}
          </span>
        </div>

        <!-- Grilla de archivos -->
        <div class="file-grid" ref="gridRef">
          <div
            v-for="item in currentItems"
            :key="item.name + item.path"
            class="file-item"
            :class="{
              locked:   item.locked,
              selected: selectedName === item.name,
              restored: item.restored,
              danger:   item.danger,
            }"
            @click="select(item)"
            @dblclick="openItem(item)"
          >
            <div class="file-icon">{{ item.icon }}</div>
            <div class="file-name">
              {{ item.name }}
              <span v-if="item.locked"  class="tag tag-locked">bloqueado</span>
              <span v-if="item.restored" class="tag tag-restored">recuperado</span>
              <span v-if="item.danger"  class="tag tag-danger">corrupto</span>
            </div>
          </div>
          <div v-if="currentItems.length === 0" class="empty-folder">
            Carpeta vacía
          </div>
        </div>

        <!-- Barra de estado -->
        <div class="statusbar">
          <span>{{ currentItems.length }} elemento{{ currentItems.length !== 1 ? 's' : '' }}</span>
          <span v-if="selectedName"> · {{ selectedName }}</span>
          <span v-if="selectedMeta" class="meta-chip">{{ selectedMeta }}</span>
        </div>
      </div>
    </div>

    <!-- ── Dialog: Carpeta bloqueada ─────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showLocked" class="overlay" @click.self="closeLocked">
        <div class="dialog lock-dialog">
          <div class="dialog-title">
            🔒 Acceso restringido
            <button class="dialog-close" @click="closeLocked">✕</button>
          </div>
          <div class="dialog-body">
            <p class="lock-hint">
              Esta carpeta está cifrada.<br/>
              <span v-if="lockedHint" class="lock-hint-sub">{{ lockedHint }}</span>
            </p>
            <input
              ref="pwdInput"
              v-model="password"
              type="password"
              class="dialog-input"
              placeholder="••••••••"
              @keyup.enter="tryUnlock"
              autocomplete="off"
            />
            <p v-if="wrongPassword" class="dialog-error">
              Contraseña incorrecta. <span class="attempts">Intento {{ unlockAttempts }}/5</span>
            </p>
            <button class="dialog-btn" @click="tryUnlock">Desbloquear</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Dialog: Visor de archivo (Bloc de notas) ───────────────────────── -->
    <Teleport to="body">
      <div v-if="openedFile" class="overlay" @click.self="closeFile">
        <div class="dialog notepad" :class="{ 'notepad-danger': openedFile.danger }">
          <div class="dialog-title">
            {{ openedFile.icon || '📄' }} {{ openedFile.name }} — Bloc de notas
            <button class="dialog-close" @click="closeFile">✕</button>
          </div>

          <!-- Visor estándar -->
          <div
            v-if="!openedFile.isNoMires"
            class="notepad-body"
            :class="{ 'body-mono': openedFile.mono, 'body-corrupted': openedFile.danger }"
          >{{ openedFile.content }}</div>

          <!-- Visor especial: no_mires.txt ─────────────────────────────── -->
          <!-- Genera las miles de líneas dinámicamente para no inflar el bundle -->
          <div
            v-else
            class="notepad-body no-mires-body"
            ref="noMiresRef"
            @scroll="onNoMiresScroll"
          >
            <div
              v-for="(line, i) in noMiresLines"
              :key="i"
              class="no-mires-line"
              :class="{ 'line-final': i >= noMiresLines.length - 3 }"
            >{{ line }}</div>
          </div>

          <div class="notepad-statusbar">
            <span>{{ openedFile.isNoMires ? `Línea ${noMiresScrollLine} / ${NO_MIRES_TOTAL}` : 'Línea 1, col 1' }}</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>
    </Teleport>

  </Window>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue';
import Window from './Window.vue';
import { useSystem, PASSWORDS } from '../store/system.js';

const emit = defineEmits(['close', 'minimize']);
const system = useSystem();

// ── Estado de navegación ──────────────────────────────────────────────────────
// Guardamos el historial como stack de paths (strings) para poder
// implementar botón "atrás" en el futuro sin refactorizar.
const pathStack    = ref(['root']);
const selectedName = ref(null);
const selectedMeta = ref(null);
const gridRef      = ref(null);

const currentPathStr = computed(() => pathStack.value[pathStack.value.length - 1]);

// ── Estado del visor ─────────────────────────────────────────────────────────
const openedFile   = ref(null);
const noMiresRef   = ref(null);
const noMiresScrollLine = ref(1);

// ── Estado del lock dialog ────────────────────────────────────────────────────
const showLocked     = ref(false);
const wrongPassword  = ref(false);
const password       = ref('');
const unlockAttempts = ref(0);
const pwdInput       = ref(null);
const pendingUnlockPath = ref(null);  // path destino si se desbloquea

// ── Sidebar ──────────────────────────────────────────────────────────────────
const sidebar = [
  { icon: '⭐', label: 'Acceso rápido', path: 'root' },
  { icon: '📄', label: 'Documentos',    path: 'documentos' },
  { icon: '🖼️', label: 'Imágenes',      path: 'imagenes' },
  { icon: '🎵', label: 'Música',        path: 'musica' },
  { icon: '🎬', label: 'Vídeos',        path: 'videos' },
];

// ── no_mires.txt: generación dinámica ────────────────────────────────────────
// No guardamos 10k strings en el bundle. Las generamos al montar el visor.
// Esto también hace que el efecto de scroll sea genuinamente largo.
const NO_MIRES_TOTAL = 8000;
const noMiresLines = computed(() => {
  if (!openedFile.value?.isNoMires) return [];
  const lines = [];
  for (let i = 0; i < NO_MIRES_TOTAL - 3; i++) {
    // Variaciones sutiles para que no se vea 100% idéntico
    const variants = [
      'Él está detrás de la puerta',
      'él está detrás de la puerta.',
      'ÉL ESTÁ DETRÁS DE LA PUERTA',
      'él está detrás de     la puerta',
    ];
    lines.push(variants[i % variants.length]);
  }
  // Las últimas 3 líneas son distintas (el mensaje oculto)
  lines.push('');
  lines.push('');
  lines.push('La luz de la habitación 104 nunca se apaga.');
  return lines;
});

// Detectar cuando el jugador llega al final de no_mires.txt
function onNoMiresScroll(e) {
  const el = e.target;
  const lineHeight = 20; // approx px por línea
  noMiresScrollLine.value = Math.floor(el.scrollTop / lineHeight) + 1;

  const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  if (nearBottom && !system.flags.readNoMires) {
    system.setFlag('readNoMires');
    // Efecto extra: el texto final parpadea en rojo
    nextTick(() => {
      const finalLines = noMiresRef.value?.querySelectorAll('.line-final');
      finalLines?.forEach(el => el.classList.add('line-final-revealed'));
    });
  }
}

// ── Sistema de archivos completo ─────────────────────────────────────────────
// Separamos la data de archivos del estado reactivo para mantener
// el componente limpio. Solo el filesystem y fileMeta son "data pura".
const filesystem = {
  // ── Raíz ──
  root: [
    { name: 'Documentos',           icon: '📁', type: 'folder', path: 'documentos' },
    { name: 'Fotos',                 icon: '📁', type: 'folder', path: 'imagenes' },
    { name: 'Sistema',               icon: '📁', type: 'folder', path: 'sistema' },
    { name: 'Basura',                icon: '🗑️', type: 'folder', path: 'basura' },
    { name: 'Investigacion_Privada', icon: '🔒', type: 'folder', path: 'investigacion', locked: true,
      lockHint: 'Esta carpeta pertenece a ev_local. Acceso restringido.' },
    { name: 'Privado',               icon: '🔒', type: 'folder', path: 'privado',       locked: true,
      lockHint: null },
  ],

  // ── Documentos (Nivel 1: pistas principales) ──
  documentos: [
    {
      name: 'URGENTE_LEER.txt',
      icon: '📄',
      type: 'file',
      flagOnOpen: 'readUrgenteLeer',
      content:
`Fecha: 14/05/2024 — 03:43

No sé cuánto tiempo me queda.

Llevo tres horas intentando salir de aquí y el sistema no me deja.
Cada vez que intento apagar el monitor, algo lo vuelve a encender.

Luna tiene hambre. No la he alimentado en todo el día.
Siempre come a las 6. Ella nunca se olvida.
Ojalá ella sea la clave para que alguien encuentre esto.

Si estás leyendo esto, necesitas entender algo:
el sistema no es una herramienta. Es una trampa.
Y yo caí en ella.

Busca en mis cosas. Lo que importa está donde cuido a los que quiero.
No lo busques en los archivos obvios.

—E.V.

[URGENTE — NO BORRAR]`,
    },
    {
      name: 'Nota_al_margen.txt',
      icon: '📄',
      type: 'file',
      flagOnOpen: 'readNotaAlMargen',
      content:
`Recordatorio técnico — escrito el 07/03/2022

El técnico me dijo que si alguna vez olvido la contraseña
de alguna carpeta personal, debo buscar en la sección "Mascotas"
de la aplicación de Notas o en archivos de texto del escritorio.

Las contraseñas buenas son las que no parecen contraseñas.

También me dijo: "Usa algo que no puedas olvidar aunque quieras."

Todavía sigo su consejo.

[Nota guardada en Documentos — E.V.]`,
    },
    {
      name: 'Entrevista_Pendiente.docx',
      icon: '📝',
      type: 'file',
      flagOnOpen: 'readEntrevistaPendiente',
      content:
`BORRADOR — Entrevista pendiente de edición
Periodista: E.V.
Fecha objetivo de publicación: [REDACTADO]

—

Fuente anónima, primera conversación: "Todo empezó en octubre.
El día exacto... [TEXTO ILEGIBLE POR CORRUPCIÓN] ...ya no recuerdo el número,
pero sé que era un viernes. Un viernes de octubre."

Segundo contacto (por chat seguro): "Él los eligió a todos en esa fecha.
La fecha fundacional, como la llama. El inicio de la colección."

Tercer contacto: [NO HUBO. FUENTE DESAPARECIÓ.]

Notas de redacción:
- Falta confirmar el día exacto. Buscar en archivos anteriores.
- El mes está claro: octubre. El día está en alguno de mis documentos viejos.
- Ver carpeta de evidencias cuando se desbloquee el acceso.

[DOCUMENTO SIN TERMINAR]`,
    },
    {
      name: 'Informe_caso_0047.docx',
      icon: '📝',
      type: 'file',
      content:
`INFORME CLASIFICADO — CASO #0047
Fecha de apertura: 09/03/2022
Investigadora: E.V.
Estado: COMPROMETIDO

[Página 1 — CONTENIDO REDACTADO]
[Páginas 2–8 — CONTENIDO REDACTADO]
[Página 9 — CONTENIDO REDACTADO]

——————————————
Nota al margen, página 9, escrita a mano:
"190. Cuarenta y siete. Recordar."
——————————————

[Resto del documento — CONTENIDO REDACTADO]

NIVEL DE ACCESO REQUERIDO: ADMINISTRADOR`,
    },
    {
      name: 'borrado_recuperado.txt',
      icon: '📄',
      type: 'file',
      danger: true,
      content:
`[ARCHIVO RECUPERADO PARCIALMENTE — DATOS CORRUPTOS]

...comenzó en 2020 cuando el fiscal Alsina...
...la causa fue archivada tres semanas después...
...no fue un accidente...
...el sistema registró actividad a las...
...03:...
...[DATOS CORRUPTOS]...
...mh...
...[DATOS CORRUPTOS]...
...Vortex Data Sol...
...[DATOS CORRUPTOS]...

[FIN DE DATOS RECUPERABLES]`,
    },
  ],

  // ── Imágenes ──
  imagenes: [
    {
      name: 'sin_titulo_2.png',
      icon: '🖼️',
      type: 'file',
      content: `[Archivo de imagen — Sin previsualización disponible]\n\nImagen capturada desde cámara web.\nResolución: 1280×720\nFecha: 14/05/2024 — 02:51\n\nLa imagen muestra una pantalla de monitor encendida en un cuarto oscuro.`,
    },
    {
      name: 'scan_doc_001.jpg',
      icon: '🖼️',
      type: 'file',
      content: `[Archivo de imagen — Sin previsualización disponible]\n\nEscáner de documento en blanco y negro.\nResolución: 300 DPI\nFecha de creación: 11/03/2022`,
    },
    {
      name: 'Captura_de_pantalla_082.png',
      icon: '🖼️',
      type: 'file',
      danger: true,
      content:
`[Archivo de imagen — Contenido parcialmente legible]

Captura de una interfaz desconocida.
Resolución: 1920×1080
Fecha: 02/03/2022 — 23:17

Texto visible en la imagen:
"LOTE #0 — ESTADO: ACTIVO"
"Conectado desde: [REDACTADO]"
"Cámara: ONLINE"

[Resto del contenido: ILEGIBLE — interferencia digital]`,
    },
  ],

  // ── Sistema ──
  sistema: [
    {
      name: 'boot.log',
      icon: '📄',
      type: 'file',
      isBoot: true,
      mono: true,
      content:
`[sistema] POST completado — sin errores de hardware
[sistema] carga de kernel — OK
[sistema] montaje de particiones — OK
[sistema] inicio de servicios — OK
[sistema] verificación de integridad — ADVERTENCIA: 3 archivos modificados externamente
[sistema] conexión saliente — DETECTADA — servidor: [REDACTADO] — duración: 2s
[sistema] sesión iniciada — usuario: ev_local — 14/05/2024 02:31
[sistema] sesión interrumpida de forma abrupta — 14/05/2024 03:58
[sistema] último cierre limpio: NUNCA

——————————————————————————

// primera parte: los primeros dos dígitos son la hora en que él me encontró
// no la fecha. la hora. búscala en el log de errores.
// — E.V.`,
    },
  ],

  // ── Basura (carpeta trampa con Octubre.txt escondido) ─────────────────────
  // El 95% son archivos inútiles. El jugador debe buscar el archivo real.
  // Por qué esta estructura? Simula la sensación de "hurgar en la basura"
  // que hace que encontrar Octubre.txt se sienta como un logro genuino.
  basura: [
    { name: 'temp_01.tmp',       icon: '📄', type: 'file', content: '[Archivo temporal — Sin contenido relevante]' },
    { name: 'temp_02.tmp',       icon: '📄', type: 'file', content: '[Archivo temporal — Sin contenido relevante]' },
    { name: 'temp_03.tmp',       icon: '📄', type: 'file', content: '[Archivo temporal — Sin contenido relevante]' },
    { name: 'cache_log.txt',     icon: '📄', type: 'file', content: 'Cache flush: 14/05/2024 03:12\nEntradas eliminadas: 4821\nEstado: OK' },
    { name: 'cache_log_2.txt',   icon: '📄', type: 'file', content: 'Cache flush: 13/05/2024 18:44\nEntradas eliminadas: 1203\nEstado: OK' },
    { name: '~WRD0001.tmp',      icon: '📄', type: 'file', content: '[Archivo de recuperación de Word — datos binarios ilegibles]' },
    { name: '~WRD0002.tmp',      icon: '📄', type: 'file', content: '[Archivo de recuperación de Word — datos binarios ilegibles]' },
    { name: 'thumbs.db',         icon: '📄', type: 'file', content: '[Base de datos de miniaturas del sistema — binario]' },
    { name: 'desktop.ini',       icon: '📄', type: 'file', content: '[ShellClassInfo]\nIconResource=C:\\Windows\\System32\\imageres.dll' },
    { name: 'error_dump_01.log', icon: '📄', type: 'file', content: 'Application crash: explorer.exe\nTimestamp: 14/05/2024 03:47:22\nCode: 0xC0000005\nModule: unknown' },
    {
      // El archivo real — mezclado entre la basura
      name: 'Octubre.txt',
      icon: '📄',
      type: 'file',
      flagOnOpen: 'foundOctubreTxt',
      content:
`Nota personal — no borrar

El día exacto: 14.
El mes: octubre.

Lo escribo aquí para no olvidarlo.
Ese fue el día que desapareció el primero.
El día que él eligió para empezar.

14 de octubre.

Si necesitas el código, ya lo tienes.
Solo tienes que saber en qué orden usarlo.

— E.V.`,
    },
    { name: 'update_log.txt',    icon: '📄', type: 'file', content: 'Sistema actualizado: 12/05/2024\nPaquetes: 47\nEstado: completado' },
    { name: 'recycle_meta.bin',  icon: '📄', type: 'file', content: '[Metadatos de reciclaje — binario ilegible]' },
    { name: 'ntuser.dat.LOG1',   icon: '📄', type: 'file', content: '[Registro de usuario — binario]' },
  ],

  // ── no_mires.txt está en la raíz, no en documentos ──
  // (se añade abajo como entrada especial en root usando un computed)

  // ── Investigación Privada (desbloqueada con "luna") ──
  investigacion: [
    {
      name: 'Expediente_1410.pdf',
      icon: '📝',
      type: 'file',
      content:
`EXPEDIENTE JUDICIAL — USO INTERNO
Caso: 0047-B / Archivo de referencia: 1410

[Páginas 1–8 — TEXTO LEGAL — REDACTADO]

——————
NOTA AL PIE — Página 9 (manuscrita):

"Caso archivado por falta de pruebas el día 14.
Firmado: D. Alsina, Fiscal de distrito."

"Quien archive este expediente, recuerde: 14 del 10."
——————

[Resto del documento — ACCESO DENEGADO]`,
    },
    {
      name: 'Grabacion_04_Transcripcion.txt',
      icon: '📄',
      type: 'file',
      mono: true,
      content:
`[TRANSCRIPCIÓN AUTOMÁTICA — GRABACION_04.aac]
[Calidad de audio: BAJA — fragmentos perdidos]

[00:00] [sonido de teclado]
[00:04] Valeria: Tengo que dejarlo registrado antes de que...
[00:09] [interferencia]
[00:14] Valeria: El PIN de la bóveda... es la fecha...
[00:18] Valeria: 14 del 10... no lo olvides...
[00:22] [sonido de pasos]
[00:24] Valeria: Dios mío, ya están—
[00:25] [FIN DE GRABACIÓN — CORTE ABRUPTO]`,
    },
    {
      name: 'Contactos_Sospechosos.csv',
      icon: '📄',
      type: 'file',
      mono: true,
      content:
`NOMBRE,EMAIL,ÚLTIMA_ACTIVIDAD,NOTAS
JR_dev,jr***@[redactado],2022-01-14,Desaparecido
M.H.,mh***@[redactado],2024-05-14,Contacto activo — no confirmar identidad
D.Alsina,alsina@fiscalia.gob,2022-03-10,Fiscal — caso archivado
[REDACTADO],[REDACTADO],2021-10-14,Primera desaparición registrada
VDS_admin,admin@[redactado],2024-05-14,Servidor activo
[14 entradas adicionales — ACCESO DENEGADO]`,
    },
    {
      name: 'Chat_Interrumpido.log',
      icon: '📄',
      type: 'file',
      mono: true,
      content:
`[Canal: SEGURO_EV_PRIVADO — 12/03/2022 22:14]

ev_local: ¿Estás ahí?
[CONTACTO_A]: Sí. ¿Encontraste algo?
ev_local: Tengo el nombre del Creador guardado en la bóveda.
ev_local: El código es el día que empezó todo, cuando desapareció el primero.
[CONTACTO_A]: ¿Cuándo fue?
ev_local: 14 de octu—
[CANAL CERRADO — 22:17:03]
[Reconexión fallida. Usuario ev_local: DESCONECTADO.]`,
    },
  ],

  // ── Privado (legacy) ──
  privado: [],

  // ── Disco ──
  disco: [
    { name: 'Sistema',               icon: '📁', type: 'folder', path: 'sistema' },
    { name: 'Investigacion_Privada', icon: '🔒', type: 'folder', path: 'investigacion', locked: true },
    { name: 'Privado',               icon: '🔒', type: 'folder', path: 'privado',       locked: true },
    { name: 'Usuarios',              icon: '📁', type: 'folder', path: 'root' },
  ],
};

// Archivo especial no_mires.txt (raíz)
const noMiresFile = {
  name: 'no_mires.txt',
  icon: '📄',
  type: 'file',
  danger: true,
  isNoMires: true,
  flagOnOpen: 'readNoMires_opened',   // solo por abrir; el flag real se setea al hacer scroll
  content: '',
};

// Metadata de archivo visible en statusbar
const fileMeta = {
  'Captura_de_pantalla_082.png': 'Creado: 02/03/2022 — origen desconocido',
  'sin_titulo_2.png':            'Creado: 14/05/2024 02:51 — ev_local',
  'scan_doc_001.jpg':            'Creado: 11/03/2022 — ev_local',
  'borrado_recuperado.txt':      'Recuperado de sectores dañados — integridad: 34%',
  'Octubre.txt':                 'Creado: 09/03/2022 — oculto entre archivos temporales',
  'no_mires.txt':                '⚠ Tamaño inusual — 847 KB — se recomienda no abrir',
};

// Hints para el dialog de lock
const lockHints = {
  investigacion: 'Contraseña definida por ev_local. Relacionada con algo que ella cuidaba.',
  privado:       null,
};

// ── Items del path actual ────────────────────────────────────────────────────
const currentItems = computed(() => {
  const base = [...(filesystem[currentPathStr.value] || [])];

  // Añadir no_mires.txt solo en la raíz
  if (currentPathStr.value === 'root') {
    base.push(noMiresFile);
  }

  // Archivos restaurados dinámicamente (legacy del store)
  const pathMap = { documentos: 'Documentos', imagenes: 'Fotos' };
  const restoredLabel = pathMap[currentPathStr.value];
  if (restoredLabel) {
    system.restoredFiles
      .filter(f => f.folder === restoredLabel)
      .forEach(f => base.push({ name: f.name, icon: f.icon, type: 'file', content: f.content, restored: true }));
  }

  return base;
});

// ── Breadcrumbs ───────────────────────────────────────────────────────────────
const pathLabels = {
  root:          'Mis archivos',
  documentos:    'Documentos',
  imagenes:      'Fotos',
  sistema:       'Sistema',
  basura:        'Basura',
  investigacion: 'Investigacion_Privada',
  privado:       'Privado',
  disco:         'Disco local (C:)',
  musica:        'Música',
  videos:        'Vídeos',
};

const breadcrumbs = computed(() => {
  return pathStack.value.map((p, i) => ({
    path: p,
    label: pathLabels[p] || p,
  }));
});

// ── Navegación ────────────────────────────────────────────────────────────────
function navigateTo(path) {
  selectedName.value = null;
  selectedMeta.value = null;

  // Si ya estamos en ese path, no hacemos nada
  if (currentPathStr.value === path) return;

  // Si es la raíz, reseteamos el stack
  if (path === 'root') {
    pathStack.value = ['root'];
  } else if (pathStack.value.includes(path)) {
    // Navegación hacia atrás via breadcrumb
    const idx = pathStack.value.indexOf(path);
    pathStack.value = pathStack.value.slice(0, idx + 1);
  } else {
    pathStack.value.push(path);
  }
}

function select(item) {
  selectedName.value = item.name;
  selectedMeta.value = fileMeta[item.name] || null;
}

function openItem(item) {
  if (item.locked) {
    pendingUnlockPath.value = item.path;
    lockedHint.value = lockHints[item.path] || item.lockHint || null;
    showLocked.value = true;
    wrongPassword.value = false;
    password.value = '';
    unlockAttempts.value = 0;
    nextTick(() => pwdInput.value?.focus());
    return;
  }
  if (item.type === 'folder') {
    navigateTo(item.path);
    return;
  }
  if (item.type === 'file') {
    openedFile.value = item;

    // Disparar flag si el archivo lo requiere
    if (item.flagOnOpen && item.flagOnOpen in system.flags) {
      system.setFlag(item.flagOnOpen);
    }
    if (item.isBoot) system.markBootRead();
    if (item.name === 'log_sistema_error.txt') system.markLogErrorRead();
  }
}

function closeFile() {
  openedFile.value = null;
  noMiresScrollLine.value = 1;
}

// ── Lock dialog ───────────────────────────────────────────────────────────────
const lockedHint = ref(null);

function closeLocked() {
  showLocked.value = false;
  pendingUnlockPath.value = null;
}

function tryUnlock() {
  unlockAttempts.value++;

  const target = pendingUnlockPath.value;
  const correct = PASSWORDS[target] ||
    (target === 'investigacion' ? PASSWORDS.investigacion_privada : null);

  if (password.value.toLowerCase() === correct) {
    showLocked.value = false;

    // Flag narrativo de desbloqueo
    if (target === 'investigacion' && !system.flags.unlockedInvestigacion) {
      system.setFlag('unlockedInvestigacion');
    }

    navigateTo(target);
  } else {
    wrongPassword.value = true;
    system.triggerAlert('Contraseña incorrecta. Acceso denegado.');

    // Penalización extra: glitch al intentar contraseña errónea
    system.triggerEvent('glitch', {
      intensity: unlockAttempts.value >= 3 ? 'medium' : 'low',
      duration: 300,
    });

    // A los 5 intentos: susto psicológico
    if (unlockAttempts.value >= 5) {
      system.triggerEvent('flicker',   { times: 6, interval: 100 });
      system.triggerEvent('sound',     { clip: 'static_noise', volume: 0.4 });
      system.triggerEvent('notification', {
        message: 'Demasiados intentos fallidos. Actividad registrada.',
      });
    }
  }
}

// Legacy: privado usa contraseña diferente
watch(() => pendingUnlockPath.value, (p) => {
  if (p === 'privado') lockedHint.value = null;
});
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────────────────────── */
.explorer {
  display: flex;
  height: 440px;
  font-size: 13px;
  font-family: 'Segoe UI', sans-serif;
  background: #0d0d0d;
}

/* ── Sidebar ─────────────────────────────────────────────────────────────────── */
.sidebar {
  width: 170px;
  background: #111;
  border-right: 1px solid #1e1e1e;
  padding: 8px 0;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-section { padding: 4px 0; }

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  margin: 1px 4px;
  font-size: 12px;
  transition: background 0.15s, color 0.15s;
}
.sidebar-item:hover  { background: #1a1a1a; color: #ccc; }
.sidebar-item.active { background: #1a3a5c; color: #fff; }
.sidebar-icon { font-size: 14px; flex-shrink: 0; }
.sidebar-divider { border-top: 1px solid #1e1e1e; margin: 6px 8px; }

/* ── Main ────────────────────────────────────────────────────────────────────── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 12px;
  background: #151515;
  border-bottom: 1px solid #1e1e1e;
  font-size: 12px;
  color: #555;
  min-height: 30px;
}

.crumb { cursor: pointer; color: #555; transition: color 0.15s; }
.crumb:hover:not(.last) { color: #aaa; text-decoration: underline; }
.crumb.last { color: #888; cursor: default; }
.crumb-sep { margin: 0 3px; color: #333; }

/* ── File Grid ───────────────────────────────────────────────────────────────── */
.file-grid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 6px;
  padding: 10px;
  overflow-y: auto;
}

.file-item {
  width: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 4px 6px;
  border-radius: 5px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
}
.file-item:hover    { background: #1a1a1a; border-color: #2a2a2a; }
.file-item.selected { background: #0f2a40; border-color: #1a4a6c; }
.file-item.restored { opacity: 0.85; }
.file-item.danger   { opacity: 0.75; }
.file-item.locked .file-icon { filter: grayscale(0.5) opacity(0.7); }

.file-icon { font-size: 28px; line-height: 1; }
.file-name {
  color: #bbb;
  font-size: 10px;
  text-align: center;
  word-break: break-all;
  line-height: 1.3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.file-item.locked .file-name { color: #774444; }
.file-item.danger .file-name { color: #886655; }

.tag {
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  line-height: 1.4;
}
.tag-locked   { background: #2a0000; color: #cc4444; border: 1px solid #3a0000; }
.tag-restored { background: #001a1a; color: #44ccaa; border: 1px solid #003030; }
.tag-danger   { background: #1a1000; color: #cc8844; border: 1px solid #2a2000; }

.empty-folder {
  width: 100%;
  text-align: center;
  color: #333;
  font-size: 12px;
  padding: 30px 0;
}

/* ── Statusbar ───────────────────────────────────────────────────────────────── */
.statusbar {
  padding: 4px 12px;
  background: #111;
  border-top: 1px solid #1e1e1e;
  font-size: 11px;
  color: #555;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
  overflow: hidden;
}

.meta-chip {
  color: #444;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Dialogs ─────────────────────────────────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog {
  background: #0f0f0f;
  border: 1px solid #333;
  border-radius: 6px;
  width: 320px;
  box-shadow: 0 0 40px rgba(0,0,0,0.9);
  overflow: hidden;
}

.dialog-title {
  background: #161616;
  padding: 9px 12px;
  color: #ccc;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #222;
}

.dialog-close {
  background: none; border: none;
  color: #555; cursor: pointer;
  font-size: 12px; padding: 2px 4px;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s;
}
.dialog-close:hover { color: #ff4444; background: #2a0000; }

.dialog-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #888;
  font-size: 13px;
}

.lock-hint     { margin: 0; color: #666; line-height: 1.5; }
.lock-hint-sub { color: #444; font-size: 11px; font-style: italic; }

.dialog-input {
  background: #0a0a0a;
  border: 1px solid #333;
  color: #ccc;
  padding: 7px 10px;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  letter-spacing: 3px;
  font-family: 'Courier New', monospace;
  transition: border-color 0.15s;
}
.dialog-input:focus { border-color: #555; }

.dialog-error {
  margin: 0;
  color: #cc4444;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
}
.attempts { color: #664444; }

.dialog-btn {
  background: #1a3a5c;
  border: 1px solid #2a5a8c;
  color: #7ab8e0;
  padding: 7px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Segoe UI', sans-serif;
  transition: background 0.15s;
}
.dialog-btn:hover { background: #1f4a7a; }

/* ── Notepad ─────────────────────────────────────────────────────────────────── */
.notepad { width: 520px; }
.notepad-danger { border-color: #442a1a; }
.notepad-danger .dialog-title { border-color: #332010; }

.notepad-body {
  padding: 14px 16px;
  color: #aaa;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  white-space: pre-wrap;
  min-height: 180px;
  max-height: 420px;
  overflow-y: auto;
  line-height: 1.75;
}

.body-mono { font-family: 'Courier New', monospace; font-size: 12px; }

.body-corrupted {
  color: #886655;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

/* ── no_mires.txt ────────────────────────────────────────────────────────────── */
.no-mires-body {
  padding: 12px 16px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #555;
  line-height: 1.6;
  max-height: 420px;
  overflow-y: scroll;
  /* Cursor perturbador en este archivo */
  cursor: ns-resize;
}

.no-mires-line { color: #444; }

/* Las últimas líneas empiezan igual de oscuras */
.line-final { color: #333; transition: color 0.5s, text-shadow 0.5s; }

/* Una vez reveladas (por scroll), brillan levemente */
.line-final-revealed {
  color: #cc4444 !important;
  text-shadow: 0 0 8px rgba(204, 68, 68, 0.4);
  font-weight: bold;
  letter-spacing: 0.5px;
}

.notepad-statusbar {
  display: flex;
  justify-content: space-between;
  padding: 4px 12px;
  background: #111;
  border-top: 1px solid #1e1e1e;
  font-size: 10px;
  color: #444;
  font-family: 'Courier New', monospace;
}
</style>