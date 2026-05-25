<script setup>
import { ref } from 'vue';
import Taskbar  from './components/Taskbar.vue';
import Explorer from './components/Explorer.vue';
import Mail     from './components/Mail.vue';
import Browser  from './components/Browser.vue';
import Notes    from './components/Notes.vue';
import Gallery  from './components/Gallery.vue';
import { useSystem } from './store/system.js';

const system = useSystem();

const showExplorer = ref(false);
const showMail     = ref(false);
const showBrowser  = ref(false);
const showNotes    = ref(false);
const showGallery  = ref(false);

const desktopIcons = [
  { id: 'explorer', label: 'Mis archivos', icon: '📁' },
  { id: 'mail',     label: 'Correo',       icon: '📧' },
  { id: 'browser',  label: 'Navegador',    icon: '🌐' },
  { id: 'notes',    label: 'Notas',        icon: '📝' },
  { id: 'gallery',  label: 'Galería',      icon: '🖼️' },
];

const appMeta = {
  explorer: { label: 'Explorador', icon: '📁' },
  mail:     { label: 'Correo',     icon: '📧' },
  browser:  { label: 'Navegador',  icon: '🌐' },
  notes:    { label: 'Notas',      icon: '📝' },
  gallery:  { label: 'Galería',    icon: '🖼️' },
};

const showMap = {
  explorer: showExplorer,
  mail:     showMail,
  browser:  showBrowser,
  notes:    showNotes,
  gallery:  showGallery,
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
  system.openApps = system.openApps.filter(app => app.id !== id);
}
</script>

<template>
  <div class="os-container">
    <div class="desktop">
      <div class="desktop-icons">
        <div
          v-for="icon in desktopIcons"
          :key="icon.id"
          class="desktop-icon"
          @dblclick="openApp(icon.id)"
        >
          <div class="desktop-icon-img">{{ icon.icon }}</div>
          <div class="desktop-icon-label">{{ icon.label }}</div>
        </div>
      </div>

      <Explorer v-if="showExplorer" @close="closeApp('explorer')" @minimize="showExplorer = false" />
      <Mail     v-if="showMail"     @close="closeApp('mail')"     @minimize="showMail = false" />
      <Browser  v-if="showBrowser"  @close="closeApp('browser')"  @minimize="showBrowser = false" />
      <Notes    v-if="showNotes"    @close="closeApp('notes')"    @minimize="showNotes = false" />
      <Gallery  v-if="showGallery"  @close="closeApp('gallery')"  @minimize="showGallery = false" />
    </div>

    <Taskbar
      @open-explorer="openApp('explorer')"
      @open-mail="openApp('mail')"
      @open-browser="openApp('browser')"
      @open-notes="openApp('notes')"
      @open-gallery="openApp('gallery')"
    />
  </div>
</template>

<style>
body, html {
  margin: 0; padding: 0;
  overflow: hidden;
  background: #0a0a0a;
}
.os-container { width: 100vw; height: 100vh; display: flex; flex-direction: column; }
.desktop { flex: 1; position: relative; overflow: hidden; }
</style>

<style scoped>
.desktop-icons {
  position: absolute;
  top: 12px; left: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 1;
}
.desktop-icon {
  display: flex; flex-direction: column;
  align-items: center; gap: 5px;
  width: 72px; padding: 8px 4px;
  border-radius: 6px; cursor: pointer;
  user-select: none; transition: background 0.15s;
}
.desktop-icon:hover  { background: rgba(255,255,255,0.07); }
.desktop-icon:active { background: rgba(74,158,255,0.2); }
.desktop-icon-img {
  font-size: 32px; line-height: 1;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.8));
}
.desktop-icon-label {
  font-size: 11px; color: #ddd;
  font-family: 'Segoe UI', sans-serif;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0,0,0,0.9);
  word-break: break-word; line-height: 1.3;
}
</style>