import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';


export const PASSWORDS = {
  investigacion_privada: 'luna',   // Nivel 1 → deducida de URGENTE_LEER + Mascotas
  privado:               '0514',   // Legacy Explorer (fecha del log)
};

// Flags narrativos que persisten durante la sesión.
// Añadir nuevos flags aquí al diseñar nuevos niveles.
const INITIAL_FLAGS = {
  // ── Nivel 1 ──
  readUrgenteLeer:         false,  // leyó URGENTE_LEER.txt
  readNotaAlMargen:        false,  // leyó Nota_al_margen.txt → conecta "Mascotas"
  readEntrevistaPendiente: false,  // leyó Entrevista_Pendiente.docx
  readNoMires:             false,  // leyó no_mires.txt (scroll completo)
  foundOctubreTxt:         false,  // abrió Octubre.txt desde Basura/
  unlockedInvestigacion:   false,  // desbloqueó Investigacion_Privada

  // ── Legado (nivel 0 / Explorer original) ──
  bootRead:     false,
  logErrorRead: false,

  // ── Nivel 2+ (reservado) ──
  // readExpediente1410: false,
  // foundIdentidadCreador: false,
};

// ── STORE PRINCIPAL ───────────────────────────────────────────────────────────
export const useSystem = defineStore('system', () => {

  // ── Window Manager ──────────────────────────────────────────────────────────
  const openApps = ref([]);
  const globalZ  = ref(100);

  function openApp(id, label, icon) {
    const exists = openApps.value.find(a => a.id === id);
    if (!exists) {
      openApps.value.push({ id, label, icon, active: true, minimized: false });
    } else {
      exists.minimized = false;
      focusApp(id);
    }
  }

  function focusApp(id) {
    globalZ.value++;
    openApps.value.forEach(a => { a.active = (a.id === id); });
    return globalZ.value;
  }

  // ── Narrative State ──────────────────────────────────────────────────────────
  const flags         = ref({ ...INITIAL_FLAGS });
  const currentLevel  = ref(1);
  const restoredFiles = ref([]);   // archivos desbloqueados dinámicamente

  // Método genérico para setear cualquier flag.
  // Esto permite que los componentes no conozcan la estructura interna del store.
  function setFlag(key, value = true) {
    if (key in flags.value) {
      flags.value[key] = value;
    } else {
      console.warn(`[system] Flag desconocido: "${key}"`);
    }
  }

  // Atajos de compatibilidad con el código existente
  function markBootRead()     { setFlag('bootRead'); }
  function markLogErrorRead() { setFlag('logErrorRead'); }

  // Computed: cuántas pistas del nivel 1 ha encontrado el jugador (0-5)
  const level1Progress = computed(() => {
    const keys = [
      'readUrgenteLeer',
      'readNotaAlMargen',
      'readEntrevistaPendiente',
      'readNoMires',
      'foundOctubreTxt',
    ];
    return keys.filter(k => flags.value[k]).length;
  });


  const atmosphereEvents = ref([]);   // cola consumida por AtmosphereEngine
  let   _evtId = 0;

  function triggerEvent(type, payload = {}) {
    _evtId++;
    atmosphereEvents.value.push({ id: _evtId, type, payload, consumed: false });
  }

  // Alias de compatibilidad
  function triggerAlert(message) {
    triggerEvent('notification', { message });
    console.warn('[SISTEMA]', message);
  }

 
  watch(() => flags.value.readUrgenteLeer, (v) => {
    if (!v) return;
    triggerEvent('glitch',       { intensity: 'low', duration: 400 });
    triggerEvent('notification', { message: 'Actividad de archivo registrada.' });
  });

  watch(() => flags.value.readNoMires, (v) => {
    if (!v) return;
    // El archivo más perturbador del nivel 1 → respuesta más intensa
    triggerEvent('flicker',      { times: 3, interval: 200 });
    triggerEvent('scanlines',    { duration: 3000 });
    triggerEvent('sound',        { clip: 'static_noise', volume: 0.3 });
    triggerEvent('notification', { message: 'Error de integridad: no_mires.txt — acceso completado.' });
  });

  watch(() => flags.value.readNotaAlMargen, (v) => {
    if (!v) return;
    triggerEvent('glitch', { intensity: 'low', duration: 300 });
  });

  watch(() => flags.value.foundOctubreTxt, (v) => {
    if (!v) return;
    triggerEvent('glitch',       { intensity: 'medium', duration: 600 });
    triggerEvent('sound',        { clip: 'heartbeat', volume: 0.2 });
  });

  watch(() => flags.value.unlockedInvestigacion, (v) => {
    if (!v) return;
    // Desbloqueo del nivel 1 → evento dramático
    triggerEvent('flicker',      { times: 5, interval: 150 });
    triggerEvent('glitch',       { intensity: 'high', duration: 1200 });
    triggerEvent('scanlines',    { duration: 5000 });
    triggerEvent('sound',        { clip: 'unlock_horror', volume: 0.5 });
    triggerEvent('notification', { message: 'Acceso concedido. Bienvenido, investigador.' });
    currentLevel.value = 2;
  });


  watch(atmosphereEvents, (events) => {
    if (events.length > 30) {
      atmosphereEvents.value = events.filter(e => !e.consumed);
    }
  }, { deep: true });

  return {
    // Window manager
    openApps, globalZ, openApp, focusApp,

    // Narrative
    flags, currentLevel, restoredFiles,
    setFlag, level1Progress,
    markBootRead, markLogErrorRead,

    // Atmosphere
    atmosphereEvents, triggerEvent, triggerAlert,

    // Passwords (exportados para que Explorer no hardcodee strings)
    PASSWORDS,
  };
});