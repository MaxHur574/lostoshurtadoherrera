import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export const PASSWORDS = {
  investigacion_privada: "Luna",
  mail_user: "vherrera.mail",
  mail_pass: "Luna14",
  galeria_creador: "0314",
};

const INITIAL_FLAGS = {
  // ── Nivel 1 ──
  readUrgenteLeer: false,
  readNotaAlMargen: false,
  readEntrevistaPendiente: false,
  readNoMires: false,
  foundOctubreTxt: false,
  unlockedInvestigacion: false,

  // ── Nivel 2 ──
  completedAllMinigames: false,
  readInformeCompleto: false,
  unlockedDecryptor: false,

  // ── Nivel 3 ──
  vaultFinalUnlocked: false,

  // ── Legado ──
  bootRead: false,
  logErrorRead: false,
};

export const useSystem = defineStore("system", () => {
  // ── Window Manager ──────────────────────────────────────────────────────────
  const openApps = ref([]);
  const globalZ = ref(100);

  function openApp(id, label, icon) {
    const exists = openApps.value.find((a) => a.id === id);
    if (!exists) {
      openApps.value.push({ id, label, icon, active: true, minimized: false });
    } else {
      exists.minimized = false;
      focusApp(id);
    }
  }

  function focusApp(id) {
    globalZ.value++;
    openApps.value.forEach((a) => {
      a.active = a.id === id;
    });
    return globalZ.value;
  }

  // ── Narrative State ──────────────────────────────────────────────────────────
  const flags = ref({ ...INITIAL_FLAGS });
  const currentLevel = ref(1);
  const restoredFiles = ref([]);

  function setFlag(key, value = true) {
    if (key in flags.value) {
      flags.value[key] = value;
    } else {
      console.warn(`[system] Flag desconocido: "${key}"`);
    }
  }

  function markBootRead() {
    setFlag("bootRead");
  }
  function markLogErrorRead() {
    setFlag("logErrorRead");
  }

  const level1Progress = computed(() => {
    const keys = [
      "readUrgenteLeer",
      "readNotaAlMargen",
      "readEntrevistaPendiente",
      "readNoMires",
      "foundOctubreTxt",
    ];
    return keys.filter((k) => flags.value[k]).length;
  });

  const atmosphereEvents = ref([]);
  let _evtId = 0;

  function triggerEvent(type, payload = {}) {
    _evtId++;
    atmosphereEvents.value.push({ id: _evtId, type, payload, consumed: false });
  }

  function triggerAlert(message) {
    triggerEvent("notification", { message });
    console.warn("[SISTEMA]", message);
  }

  // ── Watches narrativos ───────────────────────────────────────────────────────
  watch(
    () => flags.value.readUrgenteLeer,
    (v) => {
      if (!v) return;
      triggerEvent("glitch", { intensity: "low", duration: 400 });
      triggerEvent("notification", {
        message: "Actividad de archivo registrada.",
      });
    },
  );

  watch(
    () => flags.value.readNoMires,
    (v) => {
      if (!v) return;
      triggerEvent("flicker", { times: 3, interval: 200 });
      triggerEvent("scanlines", { duration: 3000 });
      triggerEvent("sound", { clip: "static_noise", volume: 0.3 });
      triggerEvent("notification", {
        message: "Error de integridad: no_mires.txt — acceso completado.",
      });
    },
  );

  watch(
    () => flags.value.readNotaAlMargen,
    (v) => {
      if (!v) return;
      triggerEvent("glitch", { intensity: "low", duration: 300 });
    },
  );

  watch(
    () => flags.value.foundOctubreTxt,
    (v) => {
      if (!v) return;
      triggerEvent("glitch", { intensity: "medium", duration: 600 });
      triggerEvent("sound", { clip: "heartbeat", volume: 0.2 });
    },
  );

  watch(
    () => flags.value.unlockedInvestigacion,
    (v) => {
      if (!v) return;
      triggerEvent("flicker", { times: 5, interval: 150 });
      triggerEvent("glitch", { intensity: "high", duration: 1200 });
      triggerEvent("scanlines", { duration: 5000 });
      triggerEvent("sound", { clip: "unlock_horror", volume: 0.5 });
      triggerEvent("notification", {
        message: "Acceso concedido. Bienvenido, investigador.",
      });
      currentLevel.value = 2;
    },
  );

  watch(
    () => flags.value.unlockedDecryptor,
    (v) => {
      if (!v) return;
      triggerEvent("flicker", { times: 4, interval: 120 });
      triggerEvent("glitch", { intensity: "high", duration: 1500 });
      triggerEvent("notification", {
        message: "Módulo DESENCRIPTADOR instalado.",
      });
      currentLevel.value = 3;
    },
  );

  watch(
    () => flags.value.vaultFinalUnlocked,
    (v) => {
      if (!v) return;
      triggerEvent("flicker", { times: 6, interval: 100 });
      triggerEvent("glitch", { intensity: "high", duration: 2000 });
      triggerEvent("scanlines", { duration: 6000 });
      triggerEvent("notification", {
        message: "Bóveda principal desbloqueada. Acceso total concedido.",
      });
      currentLevel.value = 4;
    },
  );

  watch(
    atmosphereEvents,
    (events) => {
      if (events.length > 30) {
        atmosphereEvents.value = events.filter((e) => !e.consumed);
      }
    },
    { deep: true },
  );

  return {
    openApps,
    globalZ,
    openApp,
    focusApp,
    flags,
    currentLevel,
    restoredFiles,
    setFlag,
    level1Progress,
    markBootRead,
    markLogErrorRead,
    atmosphereEvents,
    triggerEvent,
    triggerAlert,
    PASSWORDS,
  };
});
