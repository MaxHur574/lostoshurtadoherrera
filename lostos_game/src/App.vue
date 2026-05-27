<script setup>
import { ref, computed } from "vue";
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

const showExplorer = ref(false);
const showMail = ref(false);
const showBrowser = ref(false);
const showNotes = ref(false);
const showGallery = ref(false);
const showDecryptor = ref(false);

// ── Iconos del escritorio ─────────────────────────────────────────────────────
const baseDesktopIcons = [
  { id: "explorer", label: "Mis archivos", icon: "📁" },
  { id: "mail", label: "Correo", icon: "📧" },
  { id: "browser", label: "Navegador", icon: "🌐" },
  { id: "notes", label: "Notas", icon: "📝" },
  { id: "gallery", label: "Galería", icon: "🖼️" },
];

const desktopIcons = computed(() => {
  const icons = [...baseDesktopIcons];
  if (system.flags.unlockedDecryptor) {
    icons.push({
      id: "decryptor",
      label: "Desencriptador",
      icon: "🔐",
      isNew: true,
    });
  }
  return icons;
});

const appMeta = {
  explorer: { label: "Explorador", icon: "📁" },
  mail: { label: "Correo", icon: "📧" },
  browser: { label: "Navegador", icon: "🌐" },
  notes: { label: "Notas", icon: "📝" },
  gallery: { label: "Galería", icon: "🖼️" },
  decryptor: { label: "Desencriptador", icon: "🔐" },
};

const showMap = {
  explorer: showExplorer,
  mail: showMail,
  browser: showBrowser,
  notes: showNotes,
  gallery: showGallery,
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
</script>

<template>
  <div class="os-container">
    <!-- 1. Pantalla de inicio -->
    <TitleScreen v-if="stage === 'title'" @started="stage = 'vault'" />

    <!-- 2. Pantalla de carga -->
    <VaultLoader v-else-if="stage === 'vault'" @done="stage = 'desktop'" />

    <!-- 3. Escritorio -->
    <template v-else>
      <div class="desktop">
        <div class="desktop-icons">
          <TransitionGroup
            name="icon-appear"
            tag="div"
            class="desktop-icons-inner"
          >
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
    </template>
  </div>
</template>

<style>
body,
html {
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
.desktop {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>

<style scoped>
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
.desktop-icon:hover {
  background: rgba(255, 255, 255, 0.07);
}
.desktop-icon:active {
  background: rgba(74, 158, 255, 0.2);
}

.desktop-icon-new {
  animation: new-icon-glow 2s ease-in-out 4;
}
@keyframes new-icon-glow {
  0%,
  100% {
    background: transparent;
  }
  50% {
    background: rgba(204, 51, 51, 0.15);
    box-shadow: 0 0 16px rgba(204, 51, 51, 0.3);
  }
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
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.icon-appear-enter-active {
  transition: all 0.4s ease;
}
.icon-appear-enter-from {
  opacity: 0;
  transform: scale(0.7) translateY(10px);
}
</style>
