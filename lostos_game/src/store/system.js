import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSystem = defineStore('system', () => {
  // Estado de las ventanas
  const openApps = ref([]);
  const globalZ = ref(100);
  
  // Estado del juego/narrativa
  const restoredFiles = ref([]);
  const bootRead = ref(false);
  const logErrorRead = ref(false);

  function openApp(id, label, icon) {
    const exists = openApps.value.find(app => app.id === id);
    if (!exists) {
      openApps.value.push({ id, label, icon, active: true, minimized: false });
    } else {
      exists.minimized = false;
      focusApp(id);
    }
  }

  function focusApp(id) {
    globalZ.value++;
    openApps.value.forEach(app => {
      app.active = (app.id === id);
    });
    return globalZ.value;
  }

  function triggerAlert(message) {
    console.warn("SISTEMA:", message);
    // Aquí podrías añadir una lógica de notificación visual
  }

  function markBootRead() { bootRead.value = true; }
  function markLogErrorRead() { logErrorRead.value = true; }

  return { 
    openApps, globalZ, restoredFiles, 
    openApp, focusApp, triggerAlert,
    markBootRead, markLogErrorRead 
  };
});