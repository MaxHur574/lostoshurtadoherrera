<template>
  <Window title="📧 Correo" @close="$emit('close')" @minimize="$emit('minimize')">

    <!-- ── PANTALLA DE LOGIN ─────────────────────────────────────────── -->
    <div v-if="!loggedIn" class="login-screen">
      <div class="login-box">

        <div class="login-logo">📧</div>
        <div class="login-title">lost.sys — Correo</div>
        <div class="login-subtitle">Inicia sesión para continuar</div>

        <div class="login-form">
          <div class="login-field">
            <label class="login-label">Usuario</label>
            <input
              v-model="loginUser"
              class="login-input"
              type="text"
              placeholder="usuario@lost.sys"
              spellcheck="false"
              autocomplete="off"
              @keyup.enter="pwdRef.focus()"
            />
          </div>
          <div class="login-field">
            <label class="login-label">Contraseña</label>
            <input
              ref="pwdRef"
              v-model="loginPass"
              class="login-input"
              :type="showPass ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="off"
              @keyup.enter="tryLogin"
            />
            <button class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
              {{ showPass ? '🙈' : '👁️' }}
            </button>
          </div>

          <p v-if="loginError" class="login-error">
            {{ loginError }}
            <span v-if="loginAttempts >= 3" class="login-hint">
              Pista: revisa tus notas personales.
            </span>
          </p>

          <button class="login-btn" @click="tryLogin" :disabled="!loginUser || !loginPass">
            Iniciar sesión
          </button>
        </div>

        <div class="login-footer">
          Sistema de correo local · lost.sys v2.1
        </div>
      </div>
    </div>

    <!-- ── APP DE CORREO (tras login) ──────────────────────────────── -->
    <div v-else class="mail-app">

      <!-- Sidebar -->
      <div class="mail-sidebar">
        <div class="mail-user-badge">
          <span class="mub-icon">👤</span>
          <span class="mub-name">{{ loginUser }}</span>
          <button class="mub-logout" @click="logout" title="Cerrar sesión">⏏</button>
        </div>
        <div class="mail-folders">
          <div
            v-for="folder in folders"
            :key="folder.id"
            class="mail-folder"
            :class="{ active: currentFolder === folder.id }"
            @click="currentFolder = folder.id; selectedMail = null"
          >
            <span>{{ folder.icon }}</span>
            <span>{{ folder.label }}</span>
            <span v-if="folder.unread" class="unread-badge">{{ folder.unread }}</span>
          </div>
        </div>
      </div>

      <!-- Lista de correos -->
      <div class="mail-list">
        <div
          v-for="mail in currentMails"
          :key="mail.id"
          class="mail-item"
          :class="{ selected: selectedMail?.id === mail.id, unread: mail.unread }"
          @click="openMail(mail)"
        >
          <div class="mail-from">{{ mail.from }}</div>
          <div class="mail-subject">{{ mail.subject }}</div>
          <div class="mail-preview">{{ mail.preview }}</div>
          <div class="mail-date">{{ mail.date }}</div>
        </div>
        <div v-if="currentMails.length === 0" class="mail-empty">Sin mensajes</div>
      </div>

      <!-- Vista del correo -->
      <div class="mail-view">
        <div v-if="selectedMail" class="mail-content">
          <div class="mail-header">
            <div class="mail-view-subject">{{ selectedMail.subject }}</div>
            <div class="mail-view-meta">
              <span>De: <b>{{ selectedMail.from }}</b></span>
              <span>Para: <b>{{ selectedMail.to }}</b></span>
              <span>{{ selectedMail.date }}</span>
            </div>
          </div>
          <div class="mail-body">{{ selectedMail.body }}</div>
        </div>
        <div v-else class="mail-placeholder">
          Selecciona un mensaje para leerlo
        </div>
      </div>
    </div>

  </Window>
</template>

<script setup>
import { ref, computed } from 'vue'
import Window from './Window.vue'

defineEmits(['close', 'minimize'])

// ── Login ──────────────────────────────────────────────────────────────────
const CORRECT_USER = 'vherrera.mail'
const CORRECT_PASS = 'Luna104'

const loggedIn     = ref(false)
const loginUser    = ref('')
const loginPass    = ref('')
const loginError   = ref('')
const loginAttempts = ref(0)
const showPass     = ref(false)
const pwdRef       = ref(null)

function tryLogin() {
  if (!loginUser.value || !loginPass.value) return

  if (
    loginUser.value.trim().toLowerCase() === CORRECT_USER &&
    loginPass.value === CORRECT_PASS
  ) {
    loggedIn.value   = true
    loginError.value = ''
  } else {
    loginAttempts.value++
    loginError.value = loginAttempts.value === 1
      ? 'Usuario o contraseña incorrectos.'
      : `Acceso denegado. Intento ${loginAttempts.value}.`
    loginPass.value = ''
  }
}

function logout() {
  loggedIn.value    = false
  loginUser.value   = ''
  loginPass.value   = ''
  loginError.value  = ''
  loginAttempts.value = 0
  selectedMail.value  = null
  currentFolder.value = 'inbox'
}

// ── Correo ─────────────────────────────────────────────────────────────────
const currentFolder = ref('inbox')
const selectedMail  = ref(null)

const folders = [
  { id: 'inbox',  icon: '📥', label: 'Bandeja de entrada', unread: 2 },
  { id: 'sent',   icon: '📤', label: 'Enviados',            unread: 0 },
  { id: 'drafts', icon: '📝', label: 'Borradores',          unread: 1 },
  { id: 'trash',  icon: '🗑️', label: 'Papelera',            unread: 0 },
]

const mails = {
  inbox: [
    {
      id: 1,
      from: 'sistema@lost.sys',
      to: 'vherrera.mail',
      subject: 'Aviso de integridad del sistema',
      preview: 'Se han detectado 3 archivos modificados externamente...',
      date: '14/05/2024 02:31',
      unread: true,
      body:
`Aviso automático del sistema.

Se han detectado 3 archivos modificados externamente durante el último arranque.
Los archivos afectados no han podido ser verificados por el módulo de integridad.

Si no reconoces esta actividad, es posible que el sistema haya sido comprometido.

No respondas a este correo. Este es un mensaje automático.

— Sistema de monitorización v2.1`,
    },
    {
      id: 2,
      from: 'remitentedesconocido@[redactado]',
      to: 'vherrera.mail',
      subject: 'Sé lo que encontraste',
      preview: 'No sigas buscando. Por tu bien.',
      date: '13/05/2024 23:47',
      unread: true,
      body:
`No sigas buscando.

Ya saben que tienes el informe.
Ya saben dónde estás.

Borra todo y desaparece.
Por tu bien.

Si publicas lo que encontraste, no habrá nadie que pueda ayudarte.

Esto no es una amenaza.
Es un consejo.

— [Remitente eliminado]`,
    },
    {
      id: 3,
      from: 'd.alsina@fiscalia.gob',
      to: 'vherrera.mail',
      subject: 'Re: Solicitud de reunión — Caso 0047',
      preview: 'Estimada V.H., lamentablemente no podemos continuar...',
      date: '10/03/2022 09:15',
      unread: false,
      body:
`Estimada V.H.,

Lamentablemente no podemos continuar con esta línea de investigación.
El caso 0047 fue archivado el 07/03/2022 por falta de evidencia suficiente.

Le recomiendo que no continúe por su cuenta.
Algunos asuntos es mejor dejarlos cerrados.

Atentamente,
D. Alsina
Fiscal de distrito — Unidad de Delitos Informáticos`,
    },
  ],
  sent: [
    {
      id: 4,
      from: 'vherrera.mail',
      to: 'prensa@periodico.cl',
      subject: 'URGENTE — Documentación adjunta caso Vortex',
      preview: 'Si estás recibiendo esto, algo me ha pasado...',
      date: '14/05/2024 03:41',
      unread: false,
      body:
`Si estás recibiendo esto, algo me ha pasado.

Adjunto todo lo que tengo sobre Vortex Data Sol y su relación con el caso 0047.
El fiscal Alsina está involucrado. Hay registros.

No sé si este correo llegará. La conexión está siendo intervenida.

Publica todo.

— V.H.

[Adjunto: informe_caso_0047_completo.pdf — 4.2 MB]
[Estado del envío: DESCONOCIDO]`,
    },
  ],
  drafts: [
    {
      id: 5,
      from: 'vherrera.mail',
      to: '',
      subject: 'BORRADOR — NO BORRAR',
      preview: 'Si desaparezco: no abras el archivo principal...',
      date: '14/05/2024 03:55',
      unread: true,
      body:
`Si desaparezco: no abras el archivo principal hasta encontrar las tres notas.

Están dentro del sistema.
Están escondidas donde nadie buscaría.

La clave principal nunca debe quedar escrita completa.
La fecha abre el acceso oculto. No la uses sin encontrar las tres primero.

Si estás leyendo esto, ya entraste.
Eso significa que encontraste a Luna.

Sigue buscando.

— V.H.

[BORRADOR — No enviado]`,
    },
    {
      id: 6,
      from: 'vherrera.mail',
      to: '',
      subject: 'Re: acceso interno',
      preview: 'La clave principal nunca debe quedar escrita completa...',
      date: '12/05/2024 22:10',
      unread: false,
      body:
`La clave principal nunca debe quedar escrita completa.

Fragmento recuperado:
"La fecha abre el acceso oculto. No la abras sin encontrar la clave."

Recuerda: las tres notas primero.
Luego la fecha.
Luego la bóveda.

— V.H.`,
    },
  ],
  trash: [],
}

const currentMails = computed(() => mails[currentFolder.value] || [])

function openMail(mail) {
  selectedMail.value = mail
  mail.unread = false
  const folder = folders.find(f => f.id === currentFolder.value)
  if (folder && folder.unread > 0) folder.unread--
}
</script>

<style scoped>
/* ── Login ────────────────────────────────────────────────────────────────── */
.login-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 460px;
  background: #0a0a0a;
}

.login-box {
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.login-logo     { font-size: 36px; margin-bottom: 4px; }
.login-title    { font-size: 15px; color: #ccc; font-family: 'Segoe UI', sans-serif; font-weight: 600; }
.login-subtitle { font-size: 11px; color: #444; font-family: 'Segoe UI', sans-serif; margin-bottom: 12px; }

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.login-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.login-label {
  font-size: 10px;
  color: #555;
  font-family: 'Segoe UI', sans-serif;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.login-input {
  background: #111;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  color: #ccc;
  font-size: 13px;
  padding: 8px 10px;
  outline: none;
  font-family: 'Courier New', monospace;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.login-input:focus { border-color: #4a9eff; }

.toggle-pass {
  position: absolute;
  right: 8px;
  bottom: 7px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  opacity: 0.5;
  transition: opacity 0.15s;
  padding: 0;
}
.toggle-pass:hover { opacity: 1; }

.login-error {
  font-size: 11px;
  color: #cc4444;
  font-family: 'Segoe UI', sans-serif;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.login-hint {
  color: #664444;
  font-size: 10px;
  font-style: italic;
}

.login-btn {
  background: #1a3a5c;
  border: 1px solid #2a5a8c;
  color: #aac4e0;
  padding: 9px 0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Segoe UI', sans-serif;
  transition: background 0.15s;
  margin-top: 4px;
}
.login-btn:hover:not(:disabled) { background: #1f4a7a; }
.login-btn:disabled { opacity: 0.3; cursor: default; }

.login-footer {
  margin-top: 16px;
  font-size: 10px;
  color: #222;
  font-family: 'Courier New', monospace;
}

/* ── Mail app ─────────────────────────────────────────────────────────────── */
.mail-app {
  display: flex;
  height: 460px;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
}

.mail-sidebar {
  width: 160px;
  background: #111;
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 8px 0;
}

/* Badge de usuario */
.mail-user-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px 10px;
  border-bottom: 1px solid #1a1a1a;
  margin-bottom: 6px;
}
.mub-icon { font-size: 13px; opacity: 0.5; }
.mub-name {
  flex: 1;
  font-size: 10px;
  color: #555;
  font-family: 'Courier New', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.mub-logout {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  transition: color 0.15s;
}
.mub-logout:hover { color: #cc4444; }

.mail-folders { display: flex; flex-direction: column; gap: 1px; }

.mail-folder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  transition: background 0.15s;
  font-size: 12px;
}
.mail-folder:hover  { background: #1a1a1a; color: #ccc; }
.mail-folder.active { background: #1a3a5c; color: #fff; }

.unread-badge {
  margin-left: auto;
  background: #4a9eff;
  color: #000;
  font-size: 10px;
  font-weight: bold;
  border-radius: 8px;
  padding: 1px 6px;
}

.mail-list {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #222;
  overflow-y: auto;
  background: #0f0f0f;
}

.mail-item {
  padding: 10px 12px;
  border-bottom: 1px solid #1a1a1a;
  cursor: pointer;
  transition: background 0.15s;
}
.mail-item:hover    { background: #1a1a1a; }
.mail-item.selected { background: #1a3a5c; }
.mail-item.unread .mail-subject { color: #fff; font-weight: bold; }
.mail-item.unread .mail-from    { color: #4a9eff; }

.mail-from    { font-size: 11px; color: #777; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mail-subject { font-size: 12px; color: #ccc; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mail-preview { font-size: 11px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mail-date    { font-size: 10px; color: #444; margin-top: 4px; }
.mail-empty   { padding: 20px; color: #444; text-align: center; font-size: 12px; }

.mail-view {
  flex: 1;
  overflow-y: auto;
  background: #0d0d0d;
}

.mail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #333;
  font-size: 13px;
}

.mail-content { display: flex; flex-direction: column; height: 100%; }

.mail-header {
  padding: 16px;
  border-bottom: 1px solid #1a1a1a;
  background: #111;
}

.mail-view-subject {
  font-size: 15px;
  font-weight: bold;
  color: #ddd;
  margin-bottom: 8px;
}

.mail-view-meta { display: flex; flex-direction: column; gap: 2px; }
.mail-view-meta span { font-size: 11px; color: #555; }
.mail-view-meta b    { color: #888; font-weight: normal; }

.mail-body {
  padding: 16px;
  color: #aaa;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  line-height: 1.7;
}
</style>