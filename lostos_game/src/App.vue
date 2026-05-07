<script setup>
import { ref } from 'vue';
import Window from './components/Window.vue';
import Taskbar from './components/Taskbar.vue';
import Explorer from './components/Explorer.vue';
import { useSystem } from './store/system.js';

const system = useSystem();
const showExplorer = ref(true);

const openApp = (id) => {
  if (id === 'explorer') {
    showExplorer.value = true;
    system.openApp('explorer', 'Explorador', '📁');
  }
};

const closeApp = (id) => {
  if (id === 'explorer') showExplorer.value = false;
  system.openApps = system.openApps.filter(app => app.id !== id);
};
</script>

<template>
  <div class="os-container">
    <div class="desktop">
      <Explorer 
        v-if="showExplorer" 
        @close="closeApp('explorer')" 
        @minimize="showExplorer = false"
      />
    </div>
    <Taskbar @open-explorer="openApp('explorer')" />
  </div>
</template>

<style>
body, html { margin: 0; padding: 0; overflow: hidden; background: #1a1a1a; }
.os-container { width: 100vw; height: 100vh; display: flex; flex-direction: column; }
.desktop { flex: 1; position: relative; overflow: hidden; }
</style>