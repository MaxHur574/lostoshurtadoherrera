<template>
  <div class="os-wrapper">
    <!-- PANTALLA WINDOWS NORMAL -->
    <div class="windows-desktop" v-if="!infecting">
      <div class="wallpaper" />

      <!-- Iconos escritorio -->
      <div class="desktop-icons">
        <div class="desk-icon">
          <div class="desk-icon-img">🗂️</div>
          <div class="desk-icon-label">Este equipo</div>
        </div>
        <div class="desk-icon">
          <div class="desk-icon-img">🗑️</div>
          <div class="desk-icon-label">Papelera</div>
        </div>
        <div class="desk-icon">
          <div class="desk-icon-img">📁</div>
          <div class="desk-icon-label">Documentos</div>
        </div>
      </div>

      <!-- Ventana del cliente de correo -->
      <div class="mail-window" :class="{ shake: shaking }">
        <div class="win-titlebar">
          <div class="win-titlebar-left">
            <span class="win-app-icon">📧</span>
            <span class="win-app-title">Correo — Bandeja de entrada</span>
          </div>
          <div class="win-controls">
            <button class="wc-btn wc-min">─</button>
            <button class="wc-btn wc-max">□</button>
            <button class="wc-btn wc-close">✕</button>
          </div>
        </div>

        <div class="mail-client">
          <!-- Sidebar -->
          <div class="mail-sidebar">
            <div class="sidebar-account">
              <div class="acc-avatar">V</div>
              <div class="acc-info">
                <div class="acc-name">Valeria</div>
                <div class="acc-email">valeria.m@gmail.com</div>
              </div>
            </div>
            <div class="sidebar-folders">
              <div class="folder-item active">
                <span>📥</span>
                <span>Bandeja de entrada</span>
                <span class="badge">1</span>
              </div>
              <div class="folder-item">
                <span>⭐</span><span>Destacados</span>
              </div>
              <div class="folder-item">
                <span>📤</span><span>Enviados</span>
              </div>
              <div class="folder-item">
                <span>📝</span><span>Borradores</span>
              </div>
              <div class="folder-item">
                <span>🗑️</span><span>Papelera</span>
              </div>
            </div>
          </div>

          <!-- Lista de correos -->
          <div class="mail-list">
            <div class="mail-row read">
              <div class="mail-row-avatar" style="background: #5c8dd6">J</div>
              <div class="mail-row-body">
                <div class="mail-row-from">Javier Ruiz</div>
                <div class="mail-row-subject">
                  Re: Entrega proyecto de redes
                </div>
                <div class="mail-row-preview">
                  Sí, el martes antes de las 23:59 ...
                </div>
              </div>
              <div class="mail-row-time">Ayer</div>
            </div>
            <div class="mail-row read">
              <div class="mail-row-avatar" style="background: #6db06d">U</div>
              <div class="mail-row-body">
                <div class="mail-row-from">Universidad — Sistemas</div>
                <div class="mail-row-subject">
                  Horarios actualizados — Semestre 2
                </div>
                <div class="mail-row-preview">
                  Te informamos que los horarios han sido...
                </div>
              </div>
              <div class="mail-row-time">Lun</div>
            </div>
            <div class="mail-row read">
              <div class="mail-row-avatar" style="background: #b06db0">A</div>
              <div class="mail-row-body">
                <div class="mail-row-from">Ale 🦋</div>
                <div class="mail-row-subject">jajaja mira esto</div>
                <div class="mail-row-preview">
                  te juro que me morí de la risa...
                </div>
              </div>
              <div class="mail-row-time">Dom</div>
            </div>

            <!-- EL CORREO MISTERIOSO -->
            <div
              class="mail-row unread selected"
              @click="selectedMystery = true"
            >
              <div class="unread-dot" />
              <div class="mail-row-avatar mystery-avatar">?</div>
              <div class="mail-row-body">
                <div class="mail-row-from mystery-from">
                  4x7f2a9b3e@noreply.sys
                </div>
                <div class="mail-row-subject mystery-subject">(sin asunto)</div>
                <div class="mail-row-preview">— — — — —</div>
              </div>
              <div class="mail-row-time mystery-time">Hace 3 min</div>
            </div>
          </div>

          <!-- Vista del correo -->
          <div class="mail-view">
            <div v-if="!selectedMystery" class="mail-placeholder">
              <div class="placeholder-icon">📬</div>
              <div class="placeholder-text">Selecciona un mensaje</div>
            </div>

            <!-- CORREO MISTERIOSO = MENÚ DEL JUEGO -->
            <div v-else class="mystery-mail-content">
              <div class="mystery-header">
                <div class="mystery-subject-line">(sin asunto)</div>
                <div class="mystery-meta">
                  <span class="mystery-sender"
                    >De: <strong>4x7f2a9b3e@noreply.sys</strong></span
                  >
                  <span class="mystery-date">hoy, {{ currentTime }}</span>
                </div>
                <div class="mystery-to">Para: valeria.m@gmail.com</div>
              </div>

              <!-- CUERPO: menú o sub-panel -->
              <div class="mystery-body">
                <!-- MENÚ PRINCIPAL -->
                <div v-if="!activePanel" class="game-menu">
                  <div class="gm-cursor-line">
                    <span class="cursor-blink">_</span>
                  </div>
                  <div class="gm-label">// LOSTO OS v0.1 — MENÚ PRINCIPAL</div>
                  <div
                    v-for="(item, i) in menuItems"
                    :key="item.id"
                    class="gm-item"
                    :class="{
                      selected: hoveredItem === i,
                      disabled: item.disabled,
                    }"
                    @mouseenter="hoveredItem = i"
                    @mouseleave="hoveredItem = -1"
                    @click="handleMenu(item)"
                  >
                    <span class="gm-arrow">{{
                      hoveredItem === i ? "▶" : " "
                    }}</span>
                    <span class="gm-icon">{{ item.icon }}</span>
                    <div class="gm-text">
                      <span class="gm-name">{{ item.label }}</span>
                      <span class="gm-desc">{{ item.desc }}</span>
                    </div>
                    <span class="gm-key" v-if="item.key">{{ item.key }}</span>
                  </div>
                </div>

                <!-- PANEL INSTRUCCIONES -->
                <div
                  v-else-if="activePanel === 'instructions'"
                  class="sub-panel"
                >
                  <div class="sp-header">
                    <button class="sp-back" @click="activePanel = null">
                      ← volver
                    </button>
                    <span class="sp-title">// INSTRUCCIONES</span>
                  </div>
                  <div class="instructions-list">
                    <div class="inst-block">
                      <div class="inst-title">🖥️ Explora el sistema</div>
                      <div class="inst-desc">
                        Abre las apps del escritorio. Cada archivo, correo o
                        nota puede contener una pista.
                      </div>
                    </div>
                    <div class="inst-block">
                      <div class="inst-title">🔑 Encuentra las contraseñas</div>
                      <div class="inst-desc">
                        Algunas carpetas y apps están bloqueadas. Las claves
                        están escondidas en el propio sistema.
                      </div>
                    </div>
                    <div class="inst-block">
                      <div class="inst-title">🧩 Completa los minijuegos</div>
                      <div class="inst-desc">
                        Ciertos archivos requieren resolver un puzzle para
                        desbloquearse.
                      </div>
                    </div>
                    <div class="inst-block">
                      <div class="inst-title">🔍 Conecta las pistas</div>
                      <div class="inst-desc">
                        Fechas, nombres y horas se repiten. Presta atención a
                        los detalles.
                      </div>
                    </div>
                    <div class="inst-note">
                      Doble clic para abrir archivos y carpetas.
                    </div>
                  </div>
                </div>

                <!-- PANEL OPCIONES -->
                <div v-else-if="activePanel === 'options'" class="sub-panel">
                  <div class="sp-header">
                    <button class="sp-back" @click="activePanel = null">
                      ← volver
                    </button>
                    <span class="sp-title">// CONFIGURACIÓN</span>
                  </div>
                  <div class="opt-row" v-for="opt in options" :key="opt.id">
                    <div class="opt-info">
                      <div class="opt-label">{{ opt.label }}</div>
                      <div class="opt-desc-small">{{ opt.desc }}</div>
                    </div>
                    <div class="opt-ctrl">
                      <template v-if="opt.type === 'slider'">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          v-model="opt.value"
                          class="opt-slider"
                        />
                        <span class="opt-val">{{ opt.value }}%</span>
                      </template>
                      <template v-else-if="opt.type === 'toggle'">
                        <button
                          class="opt-toggle"
                          :class="{ on: opt.value }"
                          @click="opt.value = !opt.value"
                        >
                          <span class="ott" /><span class="oth" />
                        </button>
                        <span class="opt-val">{{
                          opt.value ? "ON" : "OFF"
                        }}</span>
                      </template>
                    </div>
                  </div>
                  <button class="sp-save" @click="activePanel = null">
                    GUARDAR
                  </button>
                </div>

                <!-- PANEL CRÉDITOS -->
                <div v-else-if="activePanel === 'credits'" class="sub-panel">
                  <div class="sp-header">
                    <button class="sp-back" @click="activePanel = null">
                      ← volver
                    </button>
                    <span class="sp-title">// CRÉDITOS</span>
                  </div>
                  <div class="credits-list">
                    <div class="credit-row" v-for="c in credits" :key="c.role">
                      <span class="credit-role">{{ c.role }}</span>
                      <span class="credit-name">{{ c.name }}</span>
                    </div>
                    <div class="credit-divider" />
                    <div class="credit-quote">
                      "No confíes en todo lo que encuentres.<br />Algunas cosas
                      parecen pistas y no lo son."
                    </div>
                    <div class="credit-sig">— E.V.</div>
                  </div>
                </div>
              </div>
              <!-- fin mystery-body -->

              <!-- ADJUNTO: lanza el juego -->
              <div class="attachment-zone">
                <div class="attachment-label">ARCHIVOS ADJUNTOS (1)</div>
                <div class="attachment-item">
                  <div class="att-icon">⚙️</div>
                  <div class="att-info">
                    <div class="att-name">PROYECTO_VALERIA_FINAL.exe</div>
                    <div class="att-size">847 MB · Ejecutable</div>
                  </div>
                  <button
                    class="download-btn"
                    :class="{ downloading: isDownloading, done: downloadDone }"
                    @click="startDownload"
                    :disabled="isDownloading || downloadDone"
                  >
                    <span v-if="!isDownloading && !downloadDone"
                      >⬇ Descargar</span
                    >
                    <span v-else-if="isDownloading">
                      <span class="dl-bar"
                        ><span
                          class="dl-fill"
                          :style="{ width: dlProgress + '%' }"
                      /></span>
                      {{ dlProgress }}%
                    </span>
                    <span v-else>✓ Descargado</span>
                  </button>
                </div>
                <div v-if="downloadDone" class="open-prompt">
                  <span class="open-arrow">▶</span>
                  Abriendo archivo...
                  <span class="open-dots">{{ openDots }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Taskbar de Windows -->
      <div class="win-taskbar">
        <div class="win-start"><div class="win-logo">⊞</div></div>
        <div class="taskbar-middle">
          <div class="task-item active"><span>📧</span><span>Correo</span></div>
        </div>
        <div class="taskbar-right">
          <div class="sys-icons">
            <span>🌐</span><span>🔊</span><span>🔋</span>
          </div>
          <div class="sys-clock">
            <div>{{ currentTime }}</div>
            <div>{{ currentDate }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- PANTALLA DE INFECCIÓN -->
    <div class="infect-screen" v-if="infecting">
      <div class="infect-lines">
        <div
          v-for="(line, i) in visibleInfectLines"
          :key="i"
          class="infect-line"
          :class="line.type"
        >
          {{ line.text }}
        </div>
      </div>
      <div class="infect-progress-bar">
        <div class="infect-fill" :style="{ width: infectProgress + '%' }" />
      </div>
      <div class="infect-status">
        SISTEMA COMPROMETIDO — {{ Math.round(infectProgress) }}%
      </div>
    </div>

    <div class="scanlines" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAudio } from "../store/audio.js";
const audio = useAudio();

function playDesktopMusic() {
  audio.startDesktopMusic();
}

const emit = defineEmits(["started"]);

const selectedMystery = ref(false);
const isDownloading = ref(false);
const downloadDone = ref(false);
const dlProgress = ref(0);
const infecting = ref(false);
const infectProgress = ref(0);
const shaking = ref(false);
const openDots = ref("");
const currentTime = ref("");
const currentDate = ref("");
const visibleInfectLines = ref([]);
const activePanel = ref(null);
const hoveredItem = ref(-1);

const menuItems = [
  { id: "new",          icon: "▶", label: "NUEVA SESIÓN",  desc: "Iniciar desde el principio", key: "ENTER" },
  { id: "instructions", icon: "?", label: "INSTRUCCIONES", desc: "Cómo jugar",                  key: null },
  { id: "options",      icon: "⚙", label: "OPCIONES",      desc: "Audio y video",               key: null },
  { id: "credits",      icon: "◈", label: "CRÉDITOS",      desc: "Equipo y agradecimientos",    key: null },
  { id: "exit",         icon: "⏻", label: "SALIR",         desc: "Cerrar el sistema",           key: "ESC" },
];

const options = ref([
  { id: "volume",    label: "Volumen",           desc: "Sonido general del juego",    type: "slider", value: 70   },
  { id: "scanlines", label: "Scanlines",         desc: "Efecto CRT sobre pantalla",   type: "toggle", value: true },
  { id: "glitch",    label: "Animación glitch",  desc: "Distorsiones visuales",       type: "toggle", value: true },
]);

// ── Watch del volumen → actualiza Howler en tiempo real ──
watch(
  () => options.value.find((o) => o.id === "volume")?.value,
  (vol) => {
    if (vol !== undefined) audio.setVolume(vol);
  }
);

const credits = [
  { role: "DISEÑO Y DIRECCIÓN", name: "Proyecto LOSTO" },
  { role: "NARRATIVA",          name: "E.V. — periodista desaparecida" },
  { role: "ADMINISTRADOR",      name: "M.H." },
  { role: "MOTOR",              name: "Vue 3 + Vite" },
];

const allInfectLines = [
  { text: "> ejecutando PROYECTO_VALERIA_FINAL.exe...", type: "ok"   },
  { text: "> verificando integridad del archivo...",    type: "ok"   },
  { text: "> extrayendo payload...",                    type: "ok"   },
  { text: "[!] proceso desconocido iniciado: valeria.sys", type: "warn" },
  { text: "[!] acceso al sistema de archivos: HABILITADO", type: "warn" },
  { text: "[!] acceso a cámara: HABILITADO",            type: "warn" },
  { text: "[!] acceso a micrófono: HABILITADO",         type: "warn" },
  { text: "[ERR] firewall desactivado",                 type: "err"  },
  { text: "[ERR] sistema operativo siendo reemplazado...", type: "err" },
  { text: "[ERR] transferencia de datos en curso → [REDACTADO]", type: "err" },
  { text: "[ERR] control del sistema operativo: PERDIDO",  type: "err" },
  { text: "",                                           type: "ok"   },
  { text: "bienvenida, valeria.",                       type: "final"},
  { text: "ya sabemos que estás ahí.",                  type: "final"},
];

let clockInterval = null;
let dotsInterval  = null;

function updateClock() {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  currentDate.value = now.toLocaleDateString("es-CL",  { day: "2-digit", month: "2-digit", year: "numeric" });
}

function handleMenu(item) {
  if (item.disabled) return;
  if      (item.id === "new")          startDownload();
  else if (item.id === "options")      activePanel.value = "options";
  else if (item.id === "credits")      activePanel.value = "credits";
  else if (item.id === "exit")         window.close();
  else if (item.id === "instructions") activePanel.value = "instructions";
}

function startDownload() {
  if (isDownloading.value || downloadDone.value) return;
  isDownloading.value = true;
  dlProgress.value    = 0;

  const dlInterval = setInterval(() => {
    dlProgress.value += Math.random() * 8 + 3;
    if (dlProgress.value >= 100) {
      dlProgress.value    = 100;
      clearInterval(dlInterval);
      downloadDone.value  = true;
      isDownloading.value = false;

      let dots = 0;
      dotsInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        openDots.value = ".".repeat(dots);
      }, 400);

      setTimeout(() => {
        shaking.value = true;
        setTimeout(() => { shaking.value = false; }, 600);
      }, 800);

      setTimeout(() => {
        clearInterval(dotsInterval);
        startInfection();
      }, 2200);
    }
  }, 80);
}

function startInfection() {
  playDesktopMusic(); // ← arranca el audio aquí

  infecting.value          = true;
  visibleInfectLines.value = [];
  infectProgress.value     = 0;

  allInfectLines.forEach((line, i) => {
    setTimeout(() => {
      visibleInfectLines.value.push(line);
      infectProgress.value = ((i + 1) / allInfectLines.length) * 100;
    }, i * 220);
  });

  setTimeout(() => {
    emit("started");
  }, allInfectLines.length * 220 + 800);
}

function onKey(e) {
  if (!selectedMystery.value) return;
  if (e.key === "Escape" && activePanel.value)  activePanel.value = null;
  if (e.key === "Enter"  && !activePanel.value) startDownload();
}

onMounted(() => {
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
  window.addEventListener("keydown", onKey);
});

onUnmounted(() => {
  clearInterval(clockInterval);
  clearInterval(dotsInterval);
  window.removeEventListener("keydown", onKey);
});
</script>

<style scoped>
.os-wrapper {
  position: fixed;
  inset: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  background: #000;
}

.wallpaper {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 30% 40%, #1a3a6a 0%, transparent 55%),
    radial-gradient(ellipse at 75% 60%, #0d2040 0%, transparent 50%),
    linear-gradient(160deg, #0a1628 0%, #071020 50%, #030810 100%);
  z-index: 0;
}

.desktop-icons {
  position: absolute;
  top: 18px;
  left: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1;
}

.desk-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 68px;
  padding: 6px 4px;
  cursor: default;
  border-radius: 4px;
}

.desk-icon:hover {
  background: rgba(255, 255, 255, 0.08);
}
.desk-icon-img {
  font-size: 30px;
}
.desk-icon-label {
  font-size: 11px;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
  text-align: center;
}

.mail-window {
  position: absolute;
  top: 24px;
  left: 110px;
  right: 16px;
  bottom: 52px;
  background: #fafafa;
  border-radius: 8px 8px 4px 4px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2;
}

.mail-window.shake {
  animation: window-shake 0.5s ease;
}

@keyframes window-shake {
  0%,
  100% {
    transform: translate(0, 0);
  }
  15% {
    transform: translate(-6px, 2px);
  }
  30% {
    transform: translate(6px, -2px);
  }
  45% {
    transform: translate(-4px, 4px);
  }
  60% {
    transform: translate(4px, -1px);
  }
  75% {
    transform: translate(-2px, 2px);
  }
  90% {
    transform: translate(2px, 0px);
  }
}

.win-titlebar {
  height: 36px;
  background: #f3f3f3;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 12px;
  flex-shrink: 0;
  user-select: none;
}

.win-titlebar-left {
  display: flex;
  align-items: center;
  gap: 7px;
}
.win-app-icon {
  font-size: 16px;
}
.win-app-title {
  font-size: 12px;
  color: #333;
}
.win-controls {
  display: flex;
}

.wc-btn {
  width: 46px;
  height: 36px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
}
.wc-btn:hover {
  background: rgba(0, 0, 0, 0.07);
}
.wc-close:hover {
  background: #c42b1c;
  color: #fff;
}

.mail-client {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #fff;
}

.mail-sidebar {
  width: 200px;
  background: #f0f4f8;
  border-right: 1px solid #dde3ea;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-account {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  border-bottom: 1px solid #dde3ea;
}

.acc-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5c8dd6, #4a7bc8);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  flex-shrink: 0;
}

.acc-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a2e;
}
.acc-email {
  font-size: 10px;
  color: #888;
}

.sidebar-folders {
  padding: 6px 4px;
}

.folder-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  font-size: 13px;
  color: #444;
  cursor: pointer;
  border-radius: 6px;
  margin: 1px 0;
  transition: background 0.15s;
}
.folder-item:hover {
  background: rgba(0, 0, 0, 0.05);
}
.folder-item.active {
  background: #dce8f5;
  color: #1a4a8a;
  font-weight: 600;
}

.badge {
  margin-left: auto;
  background: #c42b1c;
  color: #fff;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 10px;
  font-weight: bold;
}

.mail-list {
  width: 280px;
  border-right: 1px solid #eee;
  overflow-y: auto;
  flex-shrink: 0;
  background: #fff;
}

.mail-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  position: relative;
  transition: background 0.1s;
}
.mail-row:hover {
  background: #f5f8ff;
}
.mail-row.selected {
  background: #eaf1fb;
}
.mail-row.read {
  opacity: 0.7;
}

.mail-row-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.mystery-avatar {
  background: #1a1a1a !important;
  color: #cc3333;
  border: 1px solid #cc3333;
  font-family: "Courier New", monospace;
  animation: avatar-pulse 2s infinite;
}

@keyframes avatar-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(204, 51, 51, 0);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(204, 51, 51, 0.2);
  }
}

.mail-row-body {
  flex: 1;
  min-width: 0;
}
.mail-row-from {
  font-size: 12px;
  font-weight: 600;
  color: #222;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mail-row-subject {
  font-size: 12px;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.mail-row-preview {
  font-size: 11px;
  color: #aaa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}
.mail-row-time {
  font-size: 10px;
  color: #aaa;
  flex-shrink: 0;
}

.mystery-from {
  color: #cc3333 !important;
  font-family: "Courier New", monospace;
  font-size: 11px !important;
}
.mystery-subject {
  color: #888 !important;
  font-style: italic;
}
.mystery-time {
  color: #cc3333 !important;
  font-weight: 600;
}

.unread-dot {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cc3333;
}

.mail-view {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.mail-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc;
  gap: 10px;
}
.placeholder-icon {
  font-size: 40px;
  opacity: 0.3;
}
.placeholder-text {
  font-size: 14px;
}

/* ─── CORREO MISTERIOSO ─── */
.mystery-mail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mystery-header {
  padding: 20px 24px 14px;
  border-bottom: 1px solid #eee;
  background: #fafafa;
  flex-shrink: 0;
}

.mystery-subject-line {
  font-size: 18px;
  font-weight: 600;
  color: #888;
  font-style: italic;
  margin-bottom: 8px;
}
.mystery-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
.mystery-sender strong {
  color: #cc3333;
  font-family: "Courier New", monospace;
  font-size: 11px;
}
.mystery-date {
  font-size: 11px;
  color: #bbb;
}
.mystery-to {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
}

.mystery-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
  background: #fff;
}

/* ─── MENÚ DEL JUEGO ─── */
.game-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: "Courier New", monospace;
}

.gm-cursor-line {
  font-size: 18px;
  color: #ddd;
  margin-bottom: 8px;
}
.cursor-blink {
  animation: cblink 1s step-end infinite;
}
@keyframes cblink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.gm-label {
  font-size: 10px;
  color: #bbb;
  letter-spacing: 1px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.gm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  border: 1px solid transparent;
}
.gm-item:hover,
.gm-item.selected {
  background: #f5f0f0;
  border-color: rgba(204, 51, 51, 0.12);
}
.gm-item.disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

.gm-arrow {
  font-size: 10px;
  color: #cc3333;
  width: 12px;
  flex-shrink: 0;
}
.gm-icon {
  font-size: 15px;
  flex-shrink: 0;
}
.gm-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.gm-name {
  font-size: 13px;
  color: #222;
  font-family: "Segoe UI", sans-serif;
  font-weight: 600;
}
.gm-desc {
  font-size: 11px;
  color: #aaa;
  font-family: "Segoe UI", sans-serif;
}
.gm-key {
  font-size: 10px;
  color: #bbb;
  border: 1px solid #e0e0e0;
  padding: 2px 7px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  flex-shrink: 0;
}

/* ─── SUB-PANELES ─── */
.sub-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-family: "Segoe UI", sans-serif;
}

.sp-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.sp-back {
  background: none;
  border: 1px solid #ddd;
  color: #888;
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-family: "Courier New", monospace;
  transition: all 0.15s;
}
.sp-back:hover {
  color: #333;
  border-color: #aaa;
}
.sp-title {
  font-size: 11px;
  color: #aaa;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
}

.opt-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #f5f5f5;
}
.opt-info {
  flex: 1;
}
.opt-label {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}
.opt-desc-small {
  font-size: 10px;
  color: #bbb;
  margin-top: 1px;
}
.opt-ctrl {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.opt-val {
  font-size: 11px;
  color: #888;
  min-width: 32px;
  text-align: right;
}

.opt-slider {
  -webkit-appearance: none;
  width: 80px;
  height: 3px;
  background: #e0e0e0;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.opt-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #cc3333;
  border-radius: 50%;
  cursor: pointer;
}

.opt-toggle {
  position: relative;
  width: 36px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.ott {
  position: absolute;
  inset: 0;
  background: #e0e0e0;
  border-radius: 9px;
  display: block;
  transition: background 0.2s;
}
.oth {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  display: block;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.opt-toggle.on .ott {
  background: #cc3333;
}
.opt-toggle.on .oth {
  transform: translateX(18px);
}

.opt-select {
  width: 110px;
  background: #f8f8f8;
  border: 1px solid #ddd;
  color: #333;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  outline: none;
  cursor: pointer;
}

.sp-save {
  margin-top: 14px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #555;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
  transition: background 0.15s;
}
.sp-save:hover {
  background: #eee;
  color: #222;
}

.credits-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: "Courier New", monospace;
}
.credit-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.credit-role {
  font-size: 9px;
  color: #bbb;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.credit-name {
  font-size: 13px;
  color: #444;
}
.credit-divider {
  border-top: 1px solid #f0f0f0;
  margin: 4px 0;
}
.credit-quote {
  font-size: 12px;
  color: #aaa;
  font-style: italic;
  line-height: 1.7;
  font-family: "Segoe UI", sans-serif;
}
.credit-sig {
  font-size: 11px;
  color: #bbb;
}

/* ─── ADJUNTO ─── */
.attachment-zone {
  padding: 14px 24px 20px;
  border-top: 1px solid #eee;
  background: #f8f9fa;
  flex-shrink: 0;
}
.attachment-label {
  font-size: 10px;
  font-weight: 700;
  color: #aaa;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.att-icon {
  font-size: 26px;
  flex-shrink: 0;
}
.att-info {
  flex: 1;
}
.att-name {
  font-size: 13px;
  font-weight: 600;
  color: #222;
  font-family: "Courier New", monospace;
}
.att-size {
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

.download-btn {
  background: #0066cc;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 16px;
  font-size: 13px;
  cursor: pointer;
  font-family: "Segoe UI", sans-serif;
  transition:
    background 0.2s,
    transform 0.1s;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.download-btn:hover:not(:disabled) {
  background: #0052a3;
  transform: translateY(-1px);
}
.download-btn:disabled {
  cursor: default;
}
.download-btn.downloading {
  background: #333;
}
.download-btn.done {
  background: #2a7a2a;
}

.dl-bar {
  display: inline-block;
  width: 60px;
  height: 6px;
  background: #555;
  border-radius: 3px;
  overflow: hidden;
  vertical-align: middle;
  margin-right: 4px;
}
.dl-fill {
  height: 100%;
  background: #4aaa4a;
  border-radius: 3px;
  transition: width 0.1s linear;
}

.open-prompt {
  margin-top: 10px;
  font-size: 12px;
  color: #cc3333;
  font-family: "Courier New", monospace;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: fadeIn 0.3s ease;
}
.open-arrow {
  animation: pulse 0.5s infinite alternate;
}
@keyframes pulse {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ─── TASKBAR ─── */
.win-taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: rgba(240, 244, 248, 0.92);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  z-index: 10;
}

.win-start {
  width: 52px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.1s;
}
.win-start:hover {
  background: rgba(0, 0, 0, 0.06);
}
.win-logo {
  font-size: 22px;
}

.taskbar-middle {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.task-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.06);
  border-bottom: 2px solid #0066cc;
}

.taskbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
}
.sys-icons {
  display: flex;
  gap: 6px;
  font-size: 14px;
  opacity: 0.6;
}
.sys-clock {
  text-align: right;
  font-size: 11px;
  color: #333;
  line-height: 1.4;
}

/* ─── INFECCIÓN ─── */
.infect-screen {
  position: absolute;
  inset: 0;
  background: #000;
  z-index: 100;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 60px;
  font-family: "Courier New", monospace;
}

.infect-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 3px;
  overflow: hidden;
  margin-bottom: 24px;
}

.infect-line {
  font-size: 13px;
  animation: lineIn 0.15s ease-out;
}
@keyframes lineIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.infect-line.ok {
  color: #336633;
}
.infect-line.warn {
  color: #aa8800;
}
.infect-line.err {
  color: #cc3333;
}
.infect-line.final {
  color: #ff4444;
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 0 12px #ff4444;
  margin-top: 6px;
}

.infect-progress-bar {
  height: 3px;
  background: #1a1a1a;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 10px;
}
.infect-fill {
  height: 100%;
  background: linear-gradient(90deg, #cc3333, #ff4444);
  transition: width 0.2s linear;
  box-shadow: 0 0 8px #ff4444;
}
.infect-status {
  font-size: 11px;
  color: #444;
  letter-spacing: 2px;
}

/* ─── SCANLINES ─── */
.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.08) 3px,
    rgba(0, 0, 0, 0.08) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

.instructions-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: "Segoe UI", sans-serif;
}
.inst-block {
  padding: 10px 12px;
  background: #f8f8f8;
  border: 1px solid #eee;
  border-radius: 6px;
}
.inst-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}
.inst-desc {
  font-size: 11px;
  color: #888;
  line-height: 1.6;
}
.inst-note {
  font-size: 10px;
  color: #bbb;
  text-align: center;
  font-family: "Courier New", monospace;
  padding-top: 4px;
}
</style>