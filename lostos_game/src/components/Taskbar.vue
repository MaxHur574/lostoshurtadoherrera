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
      <div class="taskbar-clock">
        <div class="clock-time">{{ time }}</div>
        <div class="clock-date">{{ date }}</div>
      </div>
    </div>

    <!-- Menú inicio -->
    <Transition name="start-menu">
      <div v-if="showStart" class="start-menu" @click.stop>
        <div class="start-header">
          <div class="start-user">👤 ev_local@lost.sys</div>
        </div>
        <div class="start-items">
          <div class="start-item" @click="emit('open-explorer'); showStart = false">
            <span>📁</span> Mis archivos
          </div>
          <div class="start-item" @click="emit('open-mail'); showStart = false">
            <span>📧</span> Correo
          </div>
          <div class="start-item" @click="emit('open-browser'); showStart = false">
            <span>🌐</span> Navegador
          </div>
          <div class="start-item" @click="emit('open-notes'); showStart = false">
            <span>📝</span> Notas
          </div>
          <div class="start-item" @click="emit('open-gallery'); showStart = false">
            <span>🖼️</span> Galería
          </div>
          <div class="start-divider" />
          <div class="start-item danger">
            <span>⏻</span> Apagar sistema
          </div>
        </div>
      </div>
    </Transition>

  </div>

  <div v-if="showStart" class="start-overlay" @click="showStart = false" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useSystem } from '../store/system';

const emit = defineEmits([
  'open-explorer',
  'open-mail',
  'open-browser',
  'open-notes',
  'open-gallery',
  'restore-app',
]);

const system    = useSystem();
const showStart = ref(false);

// ── Reloj fijo narrativo (hora del último acceso de Valeria) ──────────────────
const time = ref('03:47');
const date = ref('14/05/2024');

function toggleStart() {
  showStart.value = !showStart.value;
}

function handleAppClick(app) {
  if (app.minimized || app.active) {
    emit('restore-app', app.id);
  } else {
    system.focusApp(app.id);
  }
}
</script>

<style scoped>
.taskbar {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 44px;
  background: rgba(10,10,10,0.95);
  border-top: 1px solid #2a2a2a;
  display: flex; align-items: center;
  z-index: 9000;
  backdrop-filter: blur(10px);
  user-select: none;
}

.start-btn {
  width: 48px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s; flex-shrink: 0;
}
.start-btn:hover { background: #1a1a1a; }
.start-icon { font-size: 20px; color: #4a9eff; }

.taskbar-apps {
  flex: 1; display: flex; align-items: center;
  gap: 2px; padding: 0 4px; overflow: hidden;
}

.taskbar-app {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 4px; cursor: pointer;
  color: #888; font-size: 12px;
  font-family: 'Segoe UI', sans-serif;
  transition: background 0.15s, color 0.15s;
  border-bottom: 2px solid transparent; height: 36px;
}
.taskbar-app:hover  { background: #1a1a1a; color: #ccc; }
.taskbar-app.active { background: #1a1a1a; color: #fff; border-bottom-color: #4a9eff; }
.taskbar-app.minimized { opacity: 0.5; border-bottom-color: #444; border-bottom-style: dashed; }
.taskbar-app.minimized:hover { opacity: 1; }

.app-icon  { font-size: 14px; }
.app-label { font-size: 11px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.taskbar-right {
  display: flex; align-items: center; gap: 8px;
  padding: 0 12px; flex-shrink: 0;
}

.tray-icons { display: flex; align-items: center; gap: 4px; }
.tray-icon  { font-size: 13px; opacity: 0.5; cursor: default; }
.tray-icon.blink { opacity: 1; animation: blink 2s infinite; }

@keyframes blink { 0%,100%{opacity:1}50%{opacity:0.2} }

.taskbar-clock { text-align: right; cursor: default; }
.clock-time { font-size: 12px; color: #ccc; font-family: 'Segoe UI', sans-serif; line-height: 1.2; }
.clock-date { font-size: 10px; color: #555; font-family: 'Segoe UI', sans-serif; line-height: 1.2; }

.start-overlay { position: fixed; inset: 0; z-index: 8999; }

.start-menu {
  position: fixed; bottom: 44px; left: 0;
  width: 220px;
  background: #0f0f0f; border: 1px solid #2a2a2a;
  border-bottom: none; border-radius: 8px 8px 0 0;
  z-index: 9001; box-shadow: 4px -4px 20px rgba(0,0,0,0.8);
  overflow: hidden;
}

.start-header { padding: 14px 16px 10px; border-bottom: 1px solid #1a1a1a; }
.start-user   { font-size: 12px; color: #777; font-family: 'Segoe UI', sans-serif; }
.start-items  { padding: 6px 0; }

.start-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 16px; font-size: 13px; color: #aaa;
  font-family: 'Segoe UI', sans-serif; cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.start-item:hover        { background: #1a1a1a; color: #fff; }
.start-item.danger:hover { background: #2a0000; color: #ff4444; }
.start-divider           { border-top: 1px solid #1a1a1a; margin: 4px 0; }

.start-menu-enter-active { animation: slideUp 0.2s ease-out; }
.start-menu-leave-active { animation: slideDown 0.15s ease-in forwards; }

@keyframes slideUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideDown { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(10px)} }
</style>