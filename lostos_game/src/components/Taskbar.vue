<template>
  <div class="taskbar">
    <!-- Botón Inicio -->
    <div class="start-btn" @click="toggleStart">
      <span class="start-icon">⊞</span>
    </div>

    <!-- Apps abiertas -->
    <div class="taskbar-apps">
      <div
        v-for="app in system.openApps"
        :key="app.id"
        class="taskbar-app"
        :class="{ active: app.active, minimized: app.minimized }"
        @click="handleAppClick(app)"
      >
        <span class="app-icon">{{ app.icon }}</span>
        <span class="app-label">{{ app.label }}</span>
      </div>
    </div>

    <!-- Sistema derecho -->
    <div class="taskbar-right">
      <div class="tray-icons">
        <span class="tray-icon" title="Sin conexión">🌐</span>
        <span class="tray-icon" title="Sonido">🔇</span>
        <span class="tray-icon blink" title="Cámara activa">📷</span>
      </div>

      <!-- Botón ajustes -->
      <div class="settings-btn" @click.stop="showSettings = !showSettings" title="Ajustes">⚙</div>

      <div class="taskbar-clock">
        <div class="clock-time">{{ time }}</div>
        <div class="clock-date">{{ date }}</div>
      </div>
    </div>

    <!-- Panel de ajustes -->
    <Transition name="settings-panel">
      <div v-if="showSettings" class="settings-panel" @click.stop>
        <div class="sp-title">// AJUSTES DEL SISTEMA</div>

        <div class="sp-row">
          <span class="sp-label">Volumen</span>
          <input
            type="range"
            min="0"
            max="100"
            v-model="volume"
            class="sp-slider"
            @input="onVolumeChange"
          />
          <span class="sp-val">{{ volume }}%</span>
        </div>

        <div class="sp-row">
          <span class="sp-label">Scanlines</span>
          <button
            class="sp-toggle"
            :class="{ on: scanlines }"
            @click="scanlines = !scanlines"
          >
            <span class="stt" /><span class="sth" />
          </button>
          <span class="sp-val">{{ scanlines ? 'ON' : 'OFF' }}</span>
        </div>

        <div class="sp-row">
          <span class="sp-label">Glitch</span>
          <button
            class="sp-toggle"
            :class="{ on: glitch }"
            @click="glitch = !glitch"
          >
            <span class="stt" /><span class="sth" />
          </button>
          <span class="sp-val">{{ glitch ? 'ON' : 'OFF' }}</span>
        </div>

        <button class="sp-close-btn" @click="showSettings = false">CERRAR</button>
      </div>
    </Transition>

    <!-- Menú inicio -->
    <Transition name="start-menu">
      <div v-if="showStart" class="start-menu" @click.stop>
        <div class="start-header">
          <div class="start-user">👤 ev_local@lost.sys</div>
        </div>
        <div class="start-items">
          <div
            class="start-item"
            @click="emit('open-explorer'); showStart = false;"
          >
            <span>📁</span> Mis archivos
          </div>
          <div
            class="start-item"
            @click="emit('open-mail'); showStart = false;"
          >
            <span>📧</span> Correo
          </div>
          <div
            class="start-item"
            @click="emit('open-browser'); showStart = false;"
          >
            <span>🌐</span> Navegador
          </div>
          <div
            class="start-item"
            @click="emit('open-notes'); showStart = false;"
          >
            <span>📝</span> Notas
          </div>
          <div
            class="start-item"
            @click="emit('open-gallery'); showStart = false;"
          >
            <span>🖼️</span> Galería
          </div>
          <div class="start-divider" />
          <div class="start-item danger"><span>⏻</span> Apagar sistema</div>
        </div>
      </div>
    </Transition>
  </div>

  <div v-if="showStart" class="start-overlay" @click="showStart = false" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useSystem } from "../store/system";
import { useAudio } from "../store/audio";

const emit = defineEmits([
  "open-explorer",
  "open-mail",
  "open-browser",
  "open-notes",
  "open-gallery",
  "restore-app",
]);

const system = useSystem();
const audio  = useAudio();

const showStart    = ref(false);
const showSettings = ref(false);

// ── Ajustes ───────────────────────────────────────────────────────────────────
const volume    = ref(70);
const scanlines = ref(true);
const glitch    = ref(true);

function onVolumeChange() {
  audio.setVolume(volume.value);
}

// Cerrar panel si se hace click fuera
function onClickOutside(e) {
  if (
    !e.target.closest('.settings-panel') &&
    !e.target.closest('.settings-btn')
  ) {
    showSettings.value = false;
  }
}

// ── Reloj fijo narrativo ──────────────────────────────────────────────────────
const time = ref("03:47");
const date = ref("14/05/2024");

function toggleStart() {
  showStart.value = !showStart.value;
}

function handleAppClick(app) {
  if (app.minimized || app.active) {
    emit("restore-app", app.id);
  } else {
    system.focusApp(app.id);
  }
}

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", onClickOutside);
});
</script>

<style scoped>
.taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 44px;
  background: rgba(10, 10, 10, 0.95);
  border-top: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  z-index: 9000;
  backdrop-filter: blur(10px);
  user-select: none;
}

.start-btn {
  width: 48px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.start-btn:hover { background: #1a1a1a; }
.start-icon {
  font-size: 20px;
  color: #4a9eff;
}

.taskbar-apps {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0 4px;
  overflow: hidden;
}

.taskbar-app {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: #888;
  font-size: 12px;
  font-family: "Segoe UI", sans-serif;
  transition: background 0.15s, color 0.15s;
  border-bottom: 2px solid transparent;
  height: 36px;
}
.taskbar-app:hover { background: #1a1a1a; color: #ccc; }
.taskbar-app.active {
  background: #1a1a1a;
  color: #fff;
  border-bottom-color: #4a9eff;
}
.taskbar-app.minimized {
  opacity: 0.5;
  border-bottom-color: #444;
  border-bottom-style: dashed;
}
.taskbar-app.minimized:hover { opacity: 1; }

.app-icon { font-size: 14px; }
.app-label {
  font-size: 11px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.taskbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  flex-shrink: 0;
}

.tray-icons {
  display: flex;
  align-items: center;
  gap: 4px;
}
.tray-icon {
  font-size: 13px;
  opacity: 0.5;
  cursor: default;
}
.tray-icon.blink {
  opacity: 1;
  animation: blink 2s infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}

/* ── Botón ajustes ── */
.settings-btn {
  font-size: 14px;
  color: #555;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: color 0.15s, background 0.15s;
  line-height: 1;
}
.settings-btn:hover { color: #ccc; background: #1a1a1a; }

/* ── Panel ajustes ── */
.settings-panel {
  position: fixed;
  bottom: 52px;
  right: 14px;
  width: 240px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  padding: 14px;
  z-index: 9100;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: "Courier New", monospace;
}

.sp-title {
  font-size: 10px;
  color: #444;
  letter-spacing: 1.5px;
  padding-bottom: 8px;
  border-bottom: 1px solid #1a1a1a;
}

.sp-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sp-label {
  font-size: 11px;
  color: #666;
  flex: 1;
}

.sp-val {
  font-size: 10px;
  color: #444;
  min-width: 32px;
  text-align: right;
}

.sp-slider {
  -webkit-appearance: none;
  width: 80px;
  height: 2px;
  background: #2a2a2a;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.sp-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  background: #cc3333;
  border-radius: 50%;
  cursor: pointer;
}

.sp-toggle {
  position: relative;
  width: 32px;
  height: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}
.stt {
  position: absolute;
  inset: 0;
  background: #1a1a1a;
  border-radius: 8px;
  display: block;
  transition: background 0.2s;
  border: 1px solid #2a2a2a;
}
.sth {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  background: #444;
  border-radius: 50%;
  display: block;
  transition: transform 0.2s, background 0.2s;
}
.sp-toggle.on .stt { background: #1a0000; border-color: #cc3333; }
.sp-toggle.on .sth { transform: translateX(16px); background: #cc3333; }

.sp-close-btn {
  background: #111;
  border: 1px solid #222;
  color: #444;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
  transition: all 0.15s;
  margin-top: 2px;
}
.sp-close-btn:hover { color: #ccc; border-color: #444; }

/* Transición panel */
.settings-panel-enter-active { transition: all 0.2s cubic-bezier(0.34, 1.2, 0.64, 1); }
.settings-panel-leave-active { transition: all 0.15s ease-in; }
.settings-panel-enter-from   { opacity: 0; transform: translateY(10px); }
.settings-panel-leave-to     { opacity: 0; transform: translateY(10px); }

.taskbar-clock {
  text-align: right;
  cursor: default;
}
.clock-time {
  font-size: 12px;
  color: #ccc;
  font-family: "Segoe UI", sans-serif;
  line-height: 1.2;
}
.clock-date {
  font-size: 10px;
  color: #555;
  font-family: "Segoe UI", sans-serif;
  line-height: 1.2;
}

.start-overlay {
  position: fixed;
  inset: 0;
  z-index: 8999;
}

.start-menu {
  position: fixed;
  bottom: 44px;
  left: 0;
  width: 220px;
  background: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  z-index: 9001;
  box-shadow: 4px -4px 20px rgba(0, 0, 0, 0.8);
  overflow: hidden;
}

.start-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid #1a1a1a;
}
.start-user {
  font-size: 12px;
  color: #777;
  font-family: "Segoe UI", sans-serif;
}
.start-items { padding: 6px 0; }

.start-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  font-size: 13px;
  color: #aaa;
  font-family: "Segoe UI", sans-serif;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.start-item:hover { background: #1a1a1a; color: #fff; }
.start-item.danger:hover { background: #2a0000; color: #ff4444; }
.start-divider { border-top: 1px solid #1a1a1a; margin: 4px 0; }

.start-menu-enter-active { animation: slideUp 0.2s ease-out; }
.start-menu-leave-active { animation: slideDown 0.15s ease-in forwards; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(10px); }
}
</style>