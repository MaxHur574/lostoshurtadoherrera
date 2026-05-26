<template>
  <!-- ══ MODO FULLSCREEN (transición desde TitleScreen) ══ -->
  <div v-if="fullscreen" class="vault-fullscreen-wrap">
    <div class="vault-app" :class="{ 'is-fullscreen': fullscreen }">
      <template v-if="!unlocked">
        <div class="vault-locked">
          <div class="vault-logo">
            <div class="vault-hex">⬡</div>
            <div class="vault-title">LOSTO<span class="vault-os">OS</span></div>
            <div class="vault-sub">Panel de Administración v0.1</div>
          </div>
          <div class="vault-form">
            <div class="vault-form-label">INTRODUCE EL PIN DE ACCESO</div>
            <div class="pin-inputs">
              <input
                v-for="(_, i) in 4"
                :key="i"
                :ref="el => pinRefs[i] = el"
                v-model="pin[i]"
                class="pin-digit"
                maxlength="1"
                type="text"
                :class="{ error: showError }"
                @input="onPinInput(i)"
                @keydown.backspace="onPinBackspace(i)"
              />
            </div>
            <button class="vault-submit" @click="tryUnlock" :disabled="pin.some(p => !p)">
              ACCEDER
            </button>
            <div v-if="showError" class="vault-error">
              ⛔ PIN incorrecto. {{ errorAttempts }}/3 intentos.
            </div>
            <div v-if="blocked" class="vault-blocked">
              🔒 Demasiados intentos. Sistema bloqueado temporalmente.
            </div>
          </div>
          <div class="vault-hint" v-if="hintVisible">
            <span class="hint-icon">💡</span>
            La clave está relacionada con la primera víctima...
          </div>
        </div>
      </template>

      <template v-else-if="!twistStarted">
        <div class="vault-open">
          <div class="vault-toolbar">
            <span class="toolbar-path">// bóveda_principal / IDENTIDAD_CREADOR /</span>
            <span class="toolbar-badge access">✓ Acceso concedido</span>
          </div>
          <div class="vault-files">
            <div class="vault-file-item"
              v-for="f in vaultFiles"
              :key="f.name"
              :class="{ loading: f.loading, selected: selectedFile === f.name }"
              @click="selectedFile = f.name"
              @dblclick="openVaultFile(f)"
            >
              <span class="vf-icon">{{ f.icon }}</span>
              <div class="vf-info">
                <div class="vf-name">{{ f.name }}</div>
                <div class="vf-size">{{ f.size }}</div>
              </div>
              <span class="vf-status" :class="f.statusClass">{{ f.status }}</span>
            </div>
          </div>
          <div class="vault-statusbar">
            {{ vaultFiles.length }} archivo(s) — Bóveda cifrada desbloqueada
          </div>
        </div>
      </template>

      <template v-else>
        <div class="vault-twist">
          <div class="twist-terminal">
            <div class="terminal-line" v-for="(line, i) in twistLines" :key="i" :class="line.type">
              {{ line.text }}
            </div>
            <div class="terminal-cursor" v-if="twistLines.length < allTwistLines.length">_</div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- ══ MODO VENTANA NORMAL ══ -->
  <Window
    v-else
    title="🔒 Panel de Administración — ACCESO RESTRINGIDO"
    @close="$emit('close')"
    @minimize="$emit('minimize')"
  >
    <div class="vault-app">
      <div v-if="!unlocked" class="vault-locked">
        <div class="vault-logo">
          <div class="vault-hex">⬡</div>
          <div class="vault-title">LOSTO<span class="vault-os">OS</span></div>
          <div class="vault-sub">Panel de Administración v0.1</div>
        </div>
        <div class="vault-form">
          <div class="vault-form-label">INTRODUCE EL PIN DE ACCESO</div>
          <div class="pin-inputs">
            <input
              v-for="(_, i) in 4"
              :key="i"
              :ref="el => pinRefs[i] = el"
              v-model="pin[i]"
              class="pin-digit"
              maxlength="1"
              type="text"
              :class="{ error: showError }"
              @input="onPinInput(i)"
              @keydown.backspace="onPinBackspace(i)"
            />
          </div>
          <button class="vault-submit" @click="tryUnlock" :disabled="pin.some(p => !p)">
            ACCEDER
          </button>
          <div v-if="showError" class="vault-error">
            ⛔ PIN incorrecto. {{ errorAttempts }}/3 intentos.
          </div>
          <div v-if="blocked" class="vault-blocked">
            🔒 Demasiados intentos. Sistema bloqueado temporalmente.
          </div>
        </div>
        <div class="vault-hint" v-if="hintVisible">
          <span class="hint-icon">💡</span>
          La clave está relacionada con la primera víctima...
        </div>
      </div>

      <div v-else-if="!twistStarted" class="vault-open">
        <div class="vault-toolbar">
          <span class="toolbar-path">// bóveda_principal / IDENTIDAD_CREADOR /</span>
          <span class="toolbar-badge access">✓ Acceso concedido</span>
        </div>
        <div class="vault-files">
          <div class="vault-file-item"
            v-for="f in vaultFiles"
            :key="f.name"
            :class="{ loading: f.loading, selected: selectedFile === f.name }"
            @click="selectedFile = f.name"
            @dblclick="openVaultFile(f)"
          >
            <span class="vf-icon">{{ f.icon }}</span>
            <div class="vf-info">
              <div class="vf-name">{{ f.name }}</div>
              <div class="vf-size">{{ f.size }}</div>
            </div>
            <span class="vf-status" :class="f.statusClass">{{ f.status }}</span>
          </div>
        </div>
        <div class="vault-statusbar">
          {{ vaultFiles.length }} archivo(s) — Bóveda cifrada desbloqueada
        </div>
      </div>

      <div v-else class="vault-twist">
        <div class="twist-terminal">
          <div class="terminal-line" v-for="(line, i) in twistLines" :key="i" :class="line.type">
            {{ line.text }}
          </div>
          <div class="terminal-cursor" v-if="twistLines.length < allTwistLines.length">_</div>
        </div>
      </div>
    </div>
  </Window>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import Window from "./Window.vue";
import { useSystem } from "../store/system.js";

const props = defineProps({
  fullscreen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "minimize", "twist"]);
const system = useSystem();

const pin = ref(["", "", "", ""]);
const pinRefs = ref([]);
const unlocked = ref(false);
const showError = ref(false);
const errorAttempts = ref(0);
const blocked = ref(false);
const selectedFile = ref(null);
const twistStarted = ref(false);
const twistLines = ref([]);
const hintVisible = ref(false);

const SECRET_PIN = ["1", "4", "1", "0"];

const now = new Date();
const timeStr = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });

const vaultFiles = ref([
  { name: "IDENTIDAD_CREADOR.jpg", icon: "🖼️", size: "2.1 MB", status: "CIFRADO", statusClass: "status-enc", loading: false },
  { name: "lista_compradores.db",  icon: "📋", size: "847 KB", status: "CIFRADO", statusClass: "status-enc", loading: false },
  { name: "log_transmisiones.txt", icon: "📄", size: "12.4 MB", status: "CIFRADO", statusClass: "status-enc", loading: false },
]);

const allTwistLines = [
  { text: `> abriendo IDENTIDAD_CREADOR.jpg...`,            type: "ok" },
  { text: `> descifrando imagen...`,                        type: "ok" },
  { text: `> cargando datos...`,                            type: "ok" },
  { text: ``,                                               type: "ok" },
  { text: `[ERROR] el archivo no contiene una imagen.`,     type: "err" },
  { text: `[INFO] redirigiendo a: historial_actividad.log`, type: "warn" },
  { text: ``,                                               type: "ok" },
  { text: `═══════════════════════════════════════════`,     type: "dim" },
  { text: `  HISTORIAL DE ACTIVIDAD — SESIÓN ACTUAL`,        type: "title" },
  { text: `═══════════════════════════════════════════`,     type: "dim" },
  { text: ``,                                               type: "ok" },
  { text: `[${timeStr}] Usuario inició sesión en PROYECTO_VALERIA_FINAL.`,  type: "log" },
  { text: `[${timeStr}] Usuario abrió "Chat de Valeria".`,                  type: "log" },
  { text: `[${timeStr}] Usuario accedió a "Galería — Recortes de prensa".`, type: "log" },
  { text: `[${timeStr}] PIN 1410 introducido. Acceso total concedido.`,     type: "log" },
  { text: ``,                                               type: "ok" },
  { text: `[SISTEMA] Rastreo de ubicación: COMPLETADO.`,    type: "err" },
  { text: `[SISTEMA] Puerta de enlace: ABIERTA.`,           type: "err" },
  { text: `[SISTEMA] Transmisión iniciada.`,                type: "err" },
];

function onPinInput(i) {
  pin.value[i] = pin.value[i].slice(-1).replace(/[^0-9]/, "");
  showError.value = false;
  if (pin.value[i] && i < 3) {
    nextTick(() => pinRefs.value[i + 1]?.focus());
  }
}

function onPinBackspace(i) {
  if (!pin.value[i] && i > 0) {
    pin.value[i - 1] = "";
    nextTick(() => pinRefs.value[i - 1]?.focus());
  }
}

function tryUnlock() {
  if (blocked.value) return;
  const entered = pin.value.join("");
  if (entered === SECRET_PIN.join("")) {
    unlocked.value = true;
    system.unlockVault?.();
    system.triggerAlert("🔓 Bóveda desbloqueada. Acceso concedido.");
  } else {
    errorAttempts.value++;
    showError.value = true;
    system.triggerAlert("⛔ PIN incorrecto.");
    if (errorAttempts.value >= 3) {
      blocked.value = true;
      showError.value = false;
      setTimeout(() => {
        blocked.value = false;
        errorAttempts.value = 0;
      }, 8000);
    }
  }
}

function openVaultFile(f) {
  if (f.name !== "IDENTIDAD_CREADOR.jpg") {
    system.triggerAlert("⛔ Archivo cifrado. No se puede abrir.");
    return;
  }

  twistStarted.value = true;
  system.discoverClue?.("historyViewed");

  allTwistLines.forEach((line, i) => {
    setTimeout(() => {
      twistLines.value.push(line);
    }, i * 180);
  });

  const totalTime = allTwistLines.length * 180 + 1200;
  setTimeout(() => {
    emit("twist");
  }, totalTime);
}

onMounted(() => {
  nextTick(() => pinRefs.value[0]?.focus());
  setTimeout(() => {
    if (!unlocked.value) hintVisible.value = true;
  }, 5000);
});
</script>

<style scoped>
/* ── Fullscreen wrapper ── */
.vault-fullscreen-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
}

.vault-app {
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', monospace;
  background: #080808;
  height: 460px;
}

/* En fullscreen ocupa todo el espacio disponible */
.vault-app.is-fullscreen {
  height: 100%;
  flex: 1;
}

/* ─── BLOQUEADO ─── */
.vault-locked {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 24px;
}

.vault-logo { text-align: center; }

.vault-hex {
  font-size: 40px;
  color: #cc3333;
  text-shadow: 0 0 20px #cc3333;
  animation: hex-pulse 2s infinite;
}

@keyframes hex-pulse {
  0%,100% { opacity: 1; text-shadow: 0 0 20px #cc3333, 0 0 40px #cc3333; }
  50%      { opacity: 0.6; text-shadow: 0 0 8px #cc3333; }
}

.vault-title {
  font-size: 28px;
  color: #ddd;
  letter-spacing: 8px;
  font-weight: bold;
  margin-top: 4px;
}

.vault-os { color: #cc3333; }

.vault-sub {
  font-size: 10px;
  color: #333;
  letter-spacing: 2px;
  margin-top: 4px;
}

.vault-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.vault-form-label {
  font-size: 10px;
  color: #444;
  letter-spacing: 2px;
}

.pin-inputs {
  display: flex;
  gap: 10px;
}

.pin-digit {
  width: 44px;
  height: 52px;
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  color: #cc3333;
  font-size: 22px;
  text-align: center;
  outline: none;
  font-family: 'Courier New', monospace;
  transition: border-color 0.2s, box-shadow 0.2s;
  caret-color: transparent;
}

.pin-digit:focus {
  border-color: #cc3333;
  box-shadow: 0 0 10px rgba(204,51,51,0.2);
}

.pin-digit.error {
  border-color: #ff4444;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%,100% { transform: translateX(0); }
  25%      { transform: translateX(-5px); }
  75%      { transform: translateX(5px); }
}

.vault-submit {
  background: #0d0000;
  border: 1px solid #441111;
  color: #cc3333;
  padding: 10px 32px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  letter-spacing: 3px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
  border-radius: 4px;
  margin-top: 4px;
}

.vault-submit:hover:not(:disabled) {
  background: #1a0000;
  border-color: #cc3333;
  box-shadow: 0 0 14px rgba(204,51,51,0.2);
}

.vault-submit:disabled { opacity: 0.3; cursor: not-allowed; }

.vault-error {
  font-size: 11px;
  color: #cc3333;
  text-align: center;
}

.vault-blocked {
  font-size: 11px;
  color: #ff4444;
  text-align: center;
  animation: glitch 0.4s infinite;
}

@keyframes glitch {
  0%,100% { transform: translate(0); }
  25%      { transform: translate(-2px,1px); }
  75%      { transform: translate(2px,-1px); }
}

.vault-hint {
  font-size: 11px;
  color: #444;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.hint-icon { font-size: 14px; }

/* ─── ABIERTO ─── */
.vault-open {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.vault-toolbar {
  padding: 8px 14px;
  background: #0d0d0d;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.toolbar-path { font-size: 11px; color: #444; }

.toolbar-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  letter-spacing: 0.5px;
}

.access { background: #001a00; color: #00cc44; border: 1px solid #004400; }

.vault-files {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vault-file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #0d0d0d;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.vault-file-item:hover { background: #111; border-color: #333; }
.vault-file-item.selected { background: #0d1a0d; border-color: #cc3333; }

.vf-icon  { font-size: 22px; flex-shrink: 0; }
.vf-info  { flex: 1; }
.vf-name  { font-size: 13px; color: #ccc; }
.vf-size  { font-size: 10px; color: #444; margin-top: 2px; }

.vf-status { font-size: 10px; padding: 2px 8px; border-radius: 10px; flex-shrink: 0; }
.status-enc { background: #1a0a00; color: #aa4400; border: 1px solid #440000; }

.vault-statusbar {
  padding: 5px 14px;
  background: #0a0a0a;
  border-top: 1px solid #1a1a1a;
  font-size: 10px;
  color: #444;
  flex-shrink: 0;
}

/* ─── GIRO ─── */
.vault-twist {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.twist-terminal {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #040404;
}

.terminal-line {
  font-size: 12px;
  line-height: 1.6;
  animation: lineSlide 0.15s ease-out;
}

@keyframes lineSlide {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}

.terminal-line.ok    { color: #336633; }
.terminal-line.warn  { color: #aa7700; }
.terminal-line.err   { color: #cc3333; }
.terminal-line.dim   { color: #1e1e1e; }
.terminal-line.title { color: #888; font-weight: bold; letter-spacing: 1px; }
.terminal-line.log   { color: #aaa; }

.terminal-cursor {
  color: #cc3333;
  animation: blink 1s step-end infinite;
  font-size: 14px;
}

@keyframes blink { 0%,100%{ opacity: 1; } 50%{ opacity: 0; } }
</style>