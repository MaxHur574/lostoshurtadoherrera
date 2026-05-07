<template>
  <Window title="📁 Mis archivos" @close="$emit('close')" @minimize="$emit('minimize')">
    <div class="explorer">

      <div class="sidebar">
        <div class="sidebar-section">
          <div
            v-for="item in sidebar"
            :key="item.label"
            class="sidebar-item"
            :class="{ active: currentPath === item.path }"
            @click="navigate(item.path)"
          >
            <span class="sidebar-icon">{{ item.icon }}</span>
            {{ item.label }}
          </div>
        </div>

        <div class="sidebar-divider" />

        <div class="sidebar-section">
          <div class="sidebar-item" @click="navigate('disco')">
            <span class="sidebar-icon">💾</span> Disco local (C:)
          </div>
        </div>
      </div>

      <div class="main">
        <div class="breadcrumb">
          <span @click="navigate('root')">Mis archivos</span>
          <span v-if="currentPath !== 'root'"> › {{ currentFolderLabel }}</span>
        </div>

        <div class="file-grid">
          <div
            v-for="item in currentItems"
            :key="item.name"
            class="file-item"
            :class="{ locked: item.locked, selected: selected === item.name }"
            @click="select(item)"
            @dblclick="openItem(item)"
          >
            <div class="file-icon">{{ item.icon }}</div>
            <div class="file-name" :class="{ 'locked-label': item.locked }">
              {{ item.name }}<br v-if="item.locked" /><span v-if="item.locked" class="locked-tag">(Bloqueado)</span>
            </div>
          </div>
        </div>

        <div class="statusbar">
          {{ currentItems.length }} elementos
          <span v-if="selected"> · {{ selected }} seleccionado</span>
          <span v-if="selectedMeta" class="meta-info"> · {{ selectedMeta }}</span>
        </div>
      </div>
    </div>

    <!-- Dialog: Acceso denegado -->
    <Teleport to="body">
      <div v-if="showLocked" class="dialog-overlay" @click.self="showLocked = false">
        <div class="dialog">
          <div class="dialog-title">
            🔒 Acceso denegado
            <button class="dialog-close" @click="showLocked = false">✕</button>
          </div>
          <div class="dialog-body">
            <p>Esta carpeta está protegida con contraseña.</p>
            <input v-model="password" type="password" class="dialog-input" placeholder="••••••••" @keyup.enter="tryUnlock" />
            <p v-if="wrongPassword" class="dialog-error">Contraseña incorrecta.</p>
            <button class="dialog-btn" @click="tryUnlock">Acceder</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Dialog: Bloc de notas -->
    <Teleport to="body">
      <div v-if="openedFile" class="dialog-overlay" @click.self="openedFile = null">
        <div class="dialog notepad">
          <div class="dialog-title">
            📄 {{ openedFile.name }} — Bloc de notas
            <button class="dialog-close" @click="openedFile = null">✕</button>
          </div>
          <div class="notepad-body">{{ openedFile.content }}</div>
          <div class="notepad-statusbar">Línea 1, columna 1 &nbsp;|&nbsp; UTF-8</div>
        </div>
      </div>
    </Teleport>
  </Window>
</template>

<script setup>
import { ref, computed } from "vue";
import Window from "./Window.vue";
import { useSystem } from "../store/system";

const emit = defineEmits(["close", "minimize"]);
const system = useSystem();

const currentPath = ref("root");
const selected = ref(null);
const selectedMeta = ref(null);
const showLocked = ref(false);
const wrongPassword = ref(false);
const password = ref("");
const openedFile = ref(null);

const sidebar = [
  { icon: "⭐", label: "Acceso rápido", path: "root" },
  { icon: "📄", label: "Documentos", path: "documentos" },
  { icon: "🖼️", label: "Imágenes", path: "imagenes" },
  { icon: "🎵", label: "Música", path: "musica" },
  { icon: "🎬", label: "Vídeos", path: "videos" },
];

const filesystem = {
  root: [
    { name: "Documentos", icon: "📁", type: "folder", path: "documentos" },
    { name: "Fotos",      icon: "📁", type: "folder", path: "imagenes" },
    { name: "Sistema",    icon: "📁", type: "folder", path: "sistema" },
    { name: "Privado",    icon: "🔒", type: "folder", path: "privado", locked: true },
  ],
  documentos: [
    {
      name: "Nota_1.txt",
      icon: "📄",
      type: "file",
      content:
`Si estás leyendo esto, ya iniciaste sesión en un sistema que no te pertenece.
Tampoco me pertenecía a mí.

Hay cosas aquí que no deberían existir.
Hay cosas que él no pudo borrar a tiempo.

Empieza por lo que la gente descarta.
Ahí dejé lo más importante.

No confíes en todo lo que encuentres.
Algunas cosas parecen pistas y no lo son.
Otras parecen ruido y son todo.

— E.V.`,
    },
    {
      name: "Informe_caso_0047.docx",
      icon: "📝",
      type: "file",
      content:
`INFORME CLASIFICADO — CASO #0047
Fecha de apertura: 09/03/2022
Investigadora: E.V.
Estado: COMPROMETIDO

[Página 1 — CONTENIDO REDACTADO]
[Páginas 2-8 — CONTENIDO REDACTADO]
[Página 9 — CONTENIDO REDACTADO]

——————————————————————————
Nota al margen, página 9, escrita a mano:

"190. Cuarenta y siete. Recordar."

——————————————————————————

[Resto del documento — CONTENIDO REDACTADO]

NIVEL DE ACCESO REQUERIDO: ADMINISTRADOR`,
    },
    {
      name: "borrado_recuperado.txt",
      icon: "📄",
      type: "file",
      content:
`[ARCHIVO RECUPERADO PARCIALMENTE — DATOS CORRUPTOS]

...comenzó en 2020 cuando el fiscal Alsina...
...la causa fue archivada tres semanas después...
...no fue un accidente...
...el sistema registró actividad...
...03:...
...[DATOS CORRUPTOS]...
...mh...
...[DATOS CORRUPTOS]...
...Vortex Data Sol...
...[DATOS CORRUPTOS]...

[FIN DE DATOS RECUPERABLES]`,
    },
  ],
  imagenes: [
    {
      name: "scan_doc_001.jpg",
      icon: "🖼️",
      type: "file",
      content: `[Archivo de imagen — Sin previsualización disponible]\n\nEscáner de documento en blanco y negro.\nResolución: 300 DPI\nFecha de creación: 11/03/2022\n\nEl contenido del documento no es legible en este formato.`,
    },
    {
      name: "sin_titulo_2.png",
      icon: "🖼️",
      type: "file",
      content: `[Archivo de imagen — Sin previsualización disponible]\n\nImagen capturada desde cámara web.\nResolución: 1280x720\nFecha: 14/05/2024 — 02:51\n\nLa imagen muestra una pantalla de monitor encendida en un cuarto oscuro.`,
    },
  ],
  sistema: [
    {
      name: "boot.log",
      icon: "📄",
      type: "file",
      isBoot: true,
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

——————————————————————————————————————————————————


// primera parte: los primeros dos dígitos son la hora en que él me encontró
// no la fecha. la hora. búscala en el log de errores.
// — E.V.`,
    },
  ],
  privado: [],
  disco: [
    { name: "Sistema",  icon: "📁", type: "folder", path: "sistema" },
    { name: "Privado",  icon: "🔒", type: "folder", path: "privado", locked: true },
    { name: "Usuarios", icon: "📁", type: "folder", path: "root" },
  ],
};

// Metadata especial visible en statusbar al seleccionar ciertos archivos
const fileMeta = {
  "foto_antigua.jpg":    "Modificado por última vez: mh_admin — 14/05/2024 03:19",
  "scan_doc_001.jpg":    "Creado: 11/03/2022 — ev_local",
  "sin_titulo_2.png":    "Creado: 14/05/2024 02:51 — ev_local",
  "borrado_recuperado.txt": "Recuperado de sectores dañados — integridad: 34%",
};

const folderMap = {
  "Documentos": "documentos",
  "Fotos":      "imagenes",
  "Sistema":    "sistema",
};

const currentItems = computed(() => {
  const base = filesystem[currentPath.value] || [];
  const restored = system.restoredFiles.filter(f => {
    const targetPath = folderMap[f.folder] || "documentos";
    return targetPath === currentPath.value;
  }).map(f => ({
    name: f.name, icon: f.icon, type: "file", content: f.content, restored: true,
  }));
  return [...base, ...restored];
});

const currentFolderLabel = computed(() => {
  const found = sidebar.find(s => s.path === currentPath.value);
  return found ? found.label : currentPath.value;
});

function navigate(path) {
  selected.value = null;
  selectedMeta.value = null;
  currentPath.value = path;
}

function select(item) {
  selected.value = item.name;
  selectedMeta.value = fileMeta[item.name] || null;
}

function openItem(item) {
  if (item.locked) {
    showLocked.value = true;
    wrongPassword.value = false;
    password.value = "";
    return;
  }
  if (item.type === "folder") {
    navigate(item.path);
    return;
  }
  if (item.type === "file" && item.content) {
    openedFile.value = item;
    // Marcar boot.log como leído
    if (item.isBoot) {
      system.markBootRead();
    }
    // Marcar archivos restaurados específicos
    if (item.name === "log_sistema_error.txt") {
      system.markLogErrorRead();
    }
  }
}

function tryUnlock() {
  // Contraseña carpeta Privado: 0514 (fecha del log en formato americano 05/14)
  if (password.value === "0514") {
    showLocked.value = false;
    navigate("privado");
  } else {
    wrongPassword.value = true;
    system.triggerAlert("Contraseña incorrecta. Acceso denegado.");
  }
}
</script>

<style scoped>
.explorer {
  display: flex;
  height: 420px;
  font-size: 13px;
  font-family: 'Segoe UI', sans-serif;
}

.sidebar {
  width: 170px;
  background: #141414;
  border-right: 1px solid #2a2a2a;
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
  color: #aaa;
  cursor: pointer;
  border-radius: 4px;
  margin: 1px 4px;
  transition: background 0.15s;
}

.sidebar-item:hover  { background: #1f1f1f; color: #ddd; }
.sidebar-item.active { background: #1a3a5c; color: #fff; }
.sidebar-icon { font-size: 14px; }
.sidebar-divider { border-top: 1px solid #222; margin: 6px 8px; }

.main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.breadcrumb {
  padding: 6px 12px;
  background: #181818;
  border-bottom: 1px solid #222;
  color: #888;
  font-size: 12px;
}

.breadcrumb span { cursor: pointer; }
.breadcrumb span:hover { color: #ccc; }

.file-grid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
}

.file-item {
  width: 76px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}

.file-item:hover    { background: #1f1f1f; }
.file-item.selected { background: #1a3a5c; }
.file-icon { font-size: 28px; }

.file-name {
  color: #ccc;
  font-size: 11px;
  text-align: center;
  word-break: break-word;
}

.locked-label { color: #cc4444; }
.locked-tag   { font-size: 10px; color: #aa3333; }

.statusbar {
  padding: 4px 12px;
  background: #141414;
  border-top: 1px solid #222;
  color: #666;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-info { color: #444; font-family: 'Courier New', monospace; }

/* Dialogs */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog {
  background: #111;
  border: 1px solid #444;
  border-radius: 6px;
  width: 300px;
  box-shadow: 0 0 30px rgba(0,0,0,0.8);
}

.dialog-title {
  background: #1a1a1a;
  padding: 8px 12px;
  color: #ccc;
  font-size: 13px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 6px 6px 0 0;
}

.dialog-close { background: none; border: none; color: #666; cursor: pointer; font-size: 12px; transition: color 0.2s; }
.dialog-close:hover { color: #ff4444; }

.dialog-body {
  padding: 16px;
  color: #aaa;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-input {
  background: #0d0d0d;
  border: 1px solid #444;
  color: #ccc;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.dialog-input:focus { border-color: #666; }
.dialog-error { color: #cc4444; font-size: 12px; margin: 0; }

.dialog-btn {
  background: #1a3a5c;
  border: 1px solid #2a5a8c;
  color: #ccc;
  padding: 6px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.dialog-btn:hover { background: #1f4a7a; }

.notepad { width: 500px; }

.notepad-body {
  padding: 16px;
  color: #bbb;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  line-height: 1.7;
}

.notepad-statusbar {
  padding: 4px 12px;
  background: #141414;
  border-top: 1px solid #222;
  color: #555;
  font-size: 11px;
  border-radius: 0 0 6px 6px;
}
</style>