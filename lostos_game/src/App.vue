<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import Taskbar from "./components/Taskbar.vue";
import Explorer from "./components/Explorer.vue";
import Mail from "./components/Mail.vue";
import Browser from "./components/Browser.vue";
import Notes from "./components/Notes.vue";
import Gallery from "./components/Gallery.vue";
import TitleScreen from "./components/TitleScreen.vue";
import VaultLoader from "./components/VaultLoader.vue";
import Decryptor from "./components/Decryptor.vue";
import { useSystem } from "./store/system.js";

const system = useSystem();

// "title" → "vault" → "desktop"
const stage = ref("title");

const showExplorer  = ref(false);
const showMail      = ref(false);
const showBrowser   = ref(false);
const showNotes     = ref(false);
const showGallery   = ref(false);
const showDecryptor = ref(false);

// ── Iconos del escritorio ─────────────────────────────────────────────────────
const baseDesktopIcons = [
  { id: "explorer", label: "Mis archivos", icon: "📁" },
  { id: "mail",     label: "Correo",       icon: "📧" },
  { id: "browser",  label: "Navegador",    icon: "🌐" },
  { id: "notes",    label: "Notas",        icon: "📝" },
  { id: "gallery",  label: "Galería",      icon: "🖼️" },
];

const desktopIcons = computed(() => {
  const icons = [...baseDesktopIcons];
  if (system.flags.unlockedDecryptor) {
    icons.push({ id: "decryptor", label: "Desencriptador", icon: "🔐", isNew: true });
  }
  return icons;
});

const appMeta = {
  explorer:  { label: "Explorador",     icon: "📁" },
  mail:      { label: "Correo",         icon: "📧" },
  browser:   { label: "Navegador",      icon: "🌐" },
  notes:     { label: "Notas",          icon: "📝" },
  gallery:   { label: "Galería",        icon: "🖼️" },
  decryptor: { label: "Desencriptador", icon: "🔐" },
};

const showMap = {
  explorer:  showExplorer,
  mail:      showMail,
  browser:   showBrowser,
  notes:     showNotes,
  gallery:   showGallery,
  decryptor: showDecryptor,
};

function openApp(id) {
  if (!showMap[id]) return;
  showMap[id].value = true;
  const meta = appMeta[id];
  system.openApp(id, meta.label, meta.icon);
}

function closeApp(id) {
  if (!showMap[id]) return;
  showMap[id].value = false;
  system.openApps = system.openApps.filter((app) => app.id !== id);
}

function onVaultOpened() {
  system.setFlag("vaultFinalUnlocked");
  closeApp("decryptor");
}

// ── Toast: archivos agregados ─────────────────────────────────────────────────
const showFileToast = ref(false);
let toastTimer = null;

watch(
  () => system.flags.unlockedDecryptor,
  (v) => {
    if (!v) return;
    showFileToast.value = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { showFileToast.value = false; }, 7000);
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// ── GLITCHES DE ESCRITORIO ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const glitchActive    = ref(false);   // clase CSS en el desktop
const glitchStrips    = ref([]);      // franjas de distorsión de color
const glitchInterval  = ref(null);

// Dispara un glitch visual aleatorio de 80–300ms
function triggerDesktopGlitch() {
  if (stage.value !== "desktop") return;

  glitchActive.value = true;

  // Generar 2-5 franjas horizontales aleatorias
  const count = Math.floor(Math.random() * 4) + 2;
  glitchStrips.value = Array.from({ length: count }, () => ({
    top:    Math.random() * 90,           // % desde arriba
    height: Math.random() * 6 + 1,       // % de alto
    offset: (Math.random() - 0.5) * 40,  // px de desplazamiento horizontal
    color:  Math.random() > 0.5 ? 'rgba(204,51,51,0.15)' : 'rgba(0,180,255,0.10)',
    opacity: Math.random() * 0.7 + 0.3,
  }));

  const duration = Math.random() * 220 + 80;
  setTimeout(() => {
    glitchActive.value = false;
    glitchStrips.value = [];
  }, duration);
}

// Programa glitches con intervalos aleatorios entre 8 y 25 segundos
function scheduleGlitch() {
  const delay = Math.random() * 17000 + 8000;
  glitchInterval.value = setTimeout(() => {
    triggerDesktopGlitch();
    scheduleGlitch(); // reprogramar el siguiente
  }, delay);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ALERTAS DE SISTEMA (cámara, micrófono, etc.) ─────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

const sysAlert       = ref(null);   // { icon, title, body, accent }
const sysAlertTimer  = ref(null);
const sysAlertQueue  = ref([]);
let   alertScheduler = null;

// Pool de mensajes — van rotando en orden aleatorio
const ALERT_POOL = [
  {
    icon: "📷",
    title: "Cámara en uso",
    body: "lost.sys está accediendo a tu cámara.",
    accent: "#cc3333",
  },
  {
    icon: "🎙️",
    title: "Micrófono activo",
    body: "Captura de audio iniciada — canal abierto.",
    accent: "#cc3333",
  },
  {
    icon: "🌐",
    title: "Conexión saliente detectada",
    body: "Destino: [REDACTADO] · Puerto 443 · duración desconocida",
    accent: "#cc8800",
  },
  {
    icon: "📍",
    title: "Acceso a ubicación",
    body: "Coordenadas enviadas a servidor remoto.",
    accent: "#cc3333",
  },
  {
    icon: "⚠️",
    title: "Proceso no autorizado",
    body: "valeria.sys · consumo de CPU: 34% · origen desconocido",
    accent: "#cc8800",
  },
  {
    icon: "🔴",
    title: "Cámara en uso",
    body: "Grabación activa — sin interacción del usuario.",
    accent: "#cc3333",
  },
  {
    icon: "💾",
    title: "Lectura de disco",
    body: "Acceso a /Documentos/ · 847 archivos escaneados",
    accent: "#4a9eff",
  },
  {
    icon: "📡",
    title: "Transmisión en curso",
    body: "Datos enviados: 2.3 MB · receptor: [REDACTADO]",
    accent: "#cc3333",
  },
];

function showSysAlert(alert) {
  sysAlert.value = alert;
  clearTimeout(sysAlertTimer.value);
  sysAlertTimer.value = setTimeout(() => {
    sysAlert.value = null;
    // Si hay más en cola, mostrar el siguiente con un pequeño delay
    if (sysAlertQueue.value.length > 0) {
      setTimeout(() => {
        showSysAlert(sysAlertQueue.value.shift());
      }, 600);
    }
  }, 5000);
}

function queueAlert(alert) {
  if (!sysAlert.value) {
    showSysAlert(alert);
  } else {
    sysAlertQueue.value.push(alert);
  }
}

// Mezcla el pool y dispara alertas con intervalos aleatorios entre 20 y 50s
function scheduleAlerts() {
  // Mezclar el pool para que el orden sea distinto cada partida
  const pool = [...ALERT_POOL].sort(() => Math.random() - 0.5);
  let idx = 0;

  function next() {
    const delay = Math.random() * 30000 + 20000; // 20–50 segundos
    alertScheduler = setTimeout(() => {
      if (stage.value === "desktop") {
        queueAlert(pool[idx % pool.length]);
        idx++;
      }
      next();
    }, delay);
  }

  // Primera alerta más rápida para que el jugador la vea pronto (10–18s)
  setTimeout(() => {
    if (stage.value === "desktop") queueAlert(pool[idx++]);
    next();
  }, Math.random() * 8000 + 10000);
}

// ── Arrancar todo cuando entra al escritorio ──────────────────────────────────
watch(stage, (v) => {
  if (v === "desktop") {
    scheduleGlitch();
    scheduleAlerts();
  }
});

onUnmounted(() => {
  clearTimeout(glitchInterval.value);
  clearTimeout(alertScheduler);
  clearTimeout(sysAlertTimer.value);
});
</script>

<template>
  <div class="os-container">
    <!-- 1. Pantalla de inicio -->
    <TitleScreen v-if="stage === 'title'" @started="stage = 'vault'" />

    <!-- 2. Pantalla de carga -->
    <VaultLoader v-else-if="stage === 'vault'" @done="stage = 'desktop'" />

    <!-- 3. Escritorio -->
    <template v-else>
      <div class="desktop" :class="{ 'desktop-glitch': glitchActive }">

        <!-- ── Franjas de glitch ── -->
        <div
          v-for="(strip, i) in glitchStrips"
          :key="i"
          class="glitch-strip"
          :style="{
            top:       strip.top + '%',
            height:    strip.height + '%',
            transform: `translateX(${strip.offset}px)`,
            background: strip.color,
            opacity:   strip.opacity,
          }"
        />

        <div class="desktop-icons">
          <TransitionGroup name="icon-appear" tag="div" class="desktop-icons-inner">
            <div
              v-for="icon in desktopIcons"
              :key="icon.id"
              class="desktop-icon"
              :class="{ 'desktop-icon-new': icon.isNew }"
              @dblclick="openApp(icon.id)"
            >
              <div class="desktop-icon-img">{{ icon.icon }}</div>
              <div class="desktop-icon-label">{{ icon.label }}</div>
              <div v-if="icon.isNew" class="new-badge">NUEVO</div>
            </div>
          </TransitionGroup>
        </div>

        <Explorer
          v-if="showExplorer"
          @close="closeApp('explorer')"
          @minimize="showExplorer = false"
          @decryptor-unlocked="system.setFlag('unlockedDecryptor')"
        />
        <Mail
          v-if="showMail"
          @close="closeApp('mail')"
          @minimize="showMail = false"
        />
        <Browser
          v-if="showBrowser"
          @close="closeApp('browser')"
          @minimize="showBrowser = false"
        />
        <Notes
          v-if="showNotes"
          @close="closeApp('notes')"
          @minimize="showNotes = false"
        />
        <Gallery
          v-if="showGallery"
          @close="closeApp('gallery')"
          @minimize="showGallery = false"
        />
        <Decryptor
          v-if="showDecryptor"
          @close="closeApp('decryptor')"
          @minimize="showDecryptor = false"
          @vault-opened="onVaultOpened"
        />
      </div>

      <Taskbar
        @open-explorer="openApp('explorer')"
        @open-mail="openApp('mail')"
        @open-browser="openApp('browser')"
        @open-notes="openApp('notes')"
        @open-gallery="openApp('gallery')"
      />

      <!-- ══ ALERTA DE SISTEMA ══ -->
      <Transition name="sys-alert">
        <div
          v-if="sysAlert"
          class="sys-alert"
          :style="{ '--accent': sysAlert.accent }"
          @click="sysAlert = null"
        >
          <div class="sa-indicator" />
          <div class="sa-icon">{{ sysAlert.icon }}</div>
          <div class="sa-content">
            <div class="sa-title">{{ sysAlert.title }}</div>
            <div class="sa-body">{{ sysAlert.body }}</div>
          </div>
          <button class="sa-close" @click.stop="sysAlert = null">✕</button>
          <div class="sa-progress">
            <div class="sa-progress-fill" />
          </div>
        </div>
      </Transition>

      <!-- ── Toast: archivos agregados ── -->
      <Transition name="toast">
        <div v-if="showFileToast" class="file-toast">
          <div class="ft-header">
            <span class="ft-icon">📂</span>
            <span class="ft-title">2 archivos agregados al sistema</span>
            <button class="ft-close" @click="showFileToast = false">✕</button>
          </div>
          <div class="ft-files">
            <div class="ft-file">
              <span class="ft-file-icon">📄</span>
              <div class="ft-file-info">
                <div class="ft-file-name">acceso_parcial.txt</div>
                <div class="ft-file-path">Mis archivos /</div>
              </div>
            </div>
            <div class="ft-file">
              <span class="ft-file-icon">📄</span>
              <div class="ft-file-info">
                <div class="ft-file-name">~key_fragment.tmp</div>
                <div class="ft-file-path">Mis archivos / Basura /</div>
              </div>
            </div>
          </div>
          <div class="ft-progress">
            <div class="ft-progress-fill" />
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>

<style>
body, html {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #0a0a0a;
}
.os-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
/* ── FONDO DE ESCRITORIO ── */
.desktop {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-image: url('/src/assets/lostos_fondo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>

<style scoped>
/* ══ GLITCH DEL ESCRITORIO ══ */

/* Clase que activa el desplazamiento cromático de toda la pantalla */
.desktop-glitch {
  animation: desktop-shake 0.08s steps(2) infinite;
  filter: contrast(1.08) saturate(1.2);
}
@keyframes desktop-shake {
  0%   { transform: translate(0, 0)      skewX(0deg); filter: hue-rotate(0deg); }
  25%  { transform: translate(-3px, 1px) skewX(-0.8deg); filter: hue-rotate(15deg) contrast(1.1); }
  50%  { transform: translate(3px, -1px) skewX(0.8deg);  filter: hue-rotate(-10deg); }
  75%  { transform: translate(-1px, 2px) skewX(-0.4deg); filter: hue-rotate(8deg); }
  100% { transform: translate(0, 0); }
}

/* Franjas de distorsión generadas dinámicamente */
.glitch-strip {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 8999;
  mix-blend-mode: screen;
}

/* ══ ICONOS ══ */
.desktop-icons {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
}

.desktop-icons-inner {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: 72px;
  padding: 8px 4px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
  position: relative;
}
.desktop-icon:hover  { background: rgba(255, 255, 255, 0.07); }
.desktop-icon:active { background: rgba(74, 158, 255, 0.2); }

.desktop-icon-new {
  animation: new-icon-glow 2s ease-in-out 4;
}
@keyframes new-icon-glow {
  0%, 100% { background: transparent; }
  50%       { background: rgba(204, 51, 51, 0.15); box-shadow: 0 0 16px rgba(204, 51, 51, 0.3); }
}

.desktop-icon-img {
  font-size: 32px;
  line-height: 1;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.8));
}
.desktop-icon-label {
  font-size: 11px;
  color: #ddd;
  font-family: "Segoe UI", sans-serif;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  word-break: break-word;
  line-height: 1.3;
}

.new-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #cc3333;
  color: #fff;
  font-size: 7px;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  letter-spacing: 0.5px;
  animation: badge-pulse 1.5s ease-in-out infinite;
}
@keyframes badge-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

.icon-appear-enter-active { transition: all 0.4s ease; }
.icon-appear-enter-from   { opacity: 0; transform: scale(0.7) translateY(10px); }

/* ══ ALERTA DE SISTEMA ══ */
.sys-alert-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
}
.sys-alert-leave-active {
  transition: all 0.3s ease-in;
}
.sys-alert-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
.sys-alert-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.sys-alert {
  position: fixed;
  top: 14px;
  right: 14px;
  width: 300px;
  background: #080808;
  border: 1px solid #1e1e1e;
  border-left: 3px solid var(--accent, #cc3333);
  border-radius: 6px;
  box-shadow:
    0 8px 32px rgba(0,0,0,0.8),
    0 0 0 1px rgba(0,0,0,0.4),
    0 0 20px rgba(204,51,51,0.06);
  z-index: 9600;
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
  cursor: pointer;
}

/* Indicador parpadeante izquierdo */
.sa-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent, #cc3333);
  animation: sa-blink 1.2s ease-in-out infinite;
}
@keyframes sa-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}

.sys-alert > .sa-icon {
  position: absolute;
  top: 14px;
  left: 16px;
  font-size: 18px;
  line-height: 1;
}

.sa-content {
  padding: 12px 36px 10px 44px;
}
.sa-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent, #cc3333);
  letter-spacing: 0.3px;
  margin-bottom: 3px;
}
.sa-body {
  font-size: 11px;
  color: #555;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
}

.sa-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 5px;
  border-radius: 3px;
  transition: color 0.15s, background 0.15s;
  line-height: 1;
}
.sa-close:hover { color: #ff4444; background: #1a0000; }

/* Barra de progreso que se consume en 5s */
.sa-progress {
  height: 2px;
  background: #111;
}
.sa-progress-fill {
  height: 100%;
  background: var(--accent, #cc3333);
  opacity: 0.5;
  animation: sa-drain 5s linear forwards;
}
@keyframes sa-drain {
  from { width: 100%; }
  to   { width: 0%; }
}

/* ══ TOAST DE ARCHIVOS ══ */
.toast-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1); }
.toast-leave-active { transition: all 0.25s ease-in; }
.toast-enter-from   { opacity: 0; transform: translateX(24px); }
.toast-leave-to     { opacity: 0; transform: translateX(24px); }

.file-toast {
  position: fixed;
  top: 84px; /* desplazado para no chocar con sys-alert */
  right: 14px;
  width: 290px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-left: 3px solid #4a9eff;
  border-radius: 6px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,158,255,0.08);
  z-index: 9500;
  overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
}

.ft-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 10px 8px 12px;
}
.ft-icon  { font-size: 14px; flex-shrink: 0; }
.ft-title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #ccc;
  line-height: 1.3;
}
.ft-close {
  background: none;
  border: none;
  color: #444;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 3px;
  flex-shrink: 0;
  transition: color 0.15s, background 0.15s;
  line-height: 1;
}
.ft-close:hover { color: #ff4444; background: #1a0000; }

.ft-files {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 12px 10px;
}
.ft-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  background: #141414;
  border-radius: 4px;
  border: 1px solid #1e1e1e;
}
.ft-file-icon { font-size: 13px; flex-shrink: 0; opacity: 0.7; }
.ft-file-name {
  font-size: 11px;
  color: #aaa;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ft-file-path {
  font-size: 10px;
  color: #444;
  margin-top: 1px;
  font-family: 'Courier New', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ft-progress {
  height: 2px;
  background: #1a1a1a;
  overflow: hidden;
}
.ft-progress-fill {
  height: 100%;
  background: #4a9eff;
  animation: toast-drain 7s linear forwards;
}
@keyframes toast-drain {
  from { width: 100%; }
  to   { width: 0%; }
}
</style>
