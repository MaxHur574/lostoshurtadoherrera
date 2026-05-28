<template>
  <Window
    title="🔐 Desencriptador"
    @close="$emit('close')"
    @minimize="$emit('minimize')"
  >
    <div class="dec-app">
      <!-- ══ PANTALLA PRINCIPAL: ingresar clave ══ -->
      <div v-if="phase === 'input'" class="dec-main">
        <div class="dec-logo">
          <div class="dec-hex">⬡</div>
          <div class="dec-title">DESENCRIPTADOR</div>
          <div class="dec-sub">Sistema de recuperación · módulo activo</div>
        </div>

        <div class="dec-form">
          <div class="dec-form-label">INGRESE CLAVE DE DESENCRIPTADO</div>
          <input
            ref="claveInputRef"
            v-model="claveInput"
            class="dec-input"
            type="text"
            placeholder="___-___-___"
            spellcheck="false"
            autocomplete="off"
            maxlength="11"
            @keyup.enter="tryClave"
            :class="{ error: claveError }"
          />
          <p v-if="claveError" class="dec-error">
            ⛔ Clave incorrecta. Formato: XXX-XXX-XXX
          </p>
          <button class="dec-btn" @click="tryClave">DESCIFRAR</button>
        </div>

        <div class="dec-status">
          <span class="status-dot" />
          Módulo activo — esperando clave de acceso
        </div>
      </div>

      <!-- ══ PANTALLA GLITCH (transición) ══ -->
      <div v-else-if="phase === 'glitch'" class="dec-glitch-screen">
        <div class="glitch-lines">
          <div
            v-for="(l, i) in glitchLines"
            :key="i"
            class="glitch-line"
            :class="l.type"
          >
            {{ l.text }}
          </div>
        </div>
        <div class="glitch-bar">
          <div class="glitch-fill" :style="{ width: glitchProgress + '%' }" />
        </div>
        <div class="glitch-label">
          PROCESANDO... {{ Math.round(glitchProgress) }}%
        </div>
      </div>

      <!-- ══ ARCHIVOS GENERADOS ══ -->
      <div v-else-if="phase === 'files'" class="dec-files">
        <div class="files-header">
          <div class="files-title">✓ Desencriptado exitoso</div>
          <div class="files-sub">
            2 archivos generados — doble clic para abrir
          </div>
        </div>
        <div class="files-list">
          <div
            class="file-row"
            :class="{ selected: selectedFile === 'pin' }"
            @click="selectedFile = 'pin'"
            @dblclick="openFile('pin')"
          >
            <span class="fr-icon">📄</span>
            <div class="fr-info">
              <div class="fr-name">PIN_BOVEDA.txt</div>
              <div class="fr-meta">1.2 KB · texto plano</div>
            </div>
          </div>
          <div
            class="file-row"
            :class="{ selected: selectedFile === 'boveda' }"
            @click="selectedFile = 'boveda'"
            @dblclick="openFile('boveda')"
          >
            <span class="fr-icon">🔒</span>
            <div class="fr-info">
              <div class="fr-name">BOVEDA_RESTRINGIDA</div>
              <div class="fr-meta">acceso restringido · requiere PIN</div>
            </div>
          </div>
        </div>
        <div class="files-status">
          Sistema en espera — selecciona un archivo
        </div>
      </div>
    </div>
  </Window>

  <!-- ══ VISOR PIN_BOVEDA.txt ══ -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="showPinViewer"
        class="overlay"
        @click.self="showPinViewer = false"
      >
        <div class="notepad-window">
          <div class="notepad-header">
            <span>📄 PIN_BOVEDA.txt — Bloc de notas</span>
            <button @click="showPinViewer = false">✕</button>
          </div>
          <pre class="notepad-body">
SYSTEM://archive_note

Acceso restaurado correctamente.

PIN asignado:
1410

Nivel de acceso:
RESTRINGIDO

Advertencia:
si el sistema detecta corrupción,
el protocolo automático será desactivado.</pre
          >
          <div class="notepad-footer">UTF-8 · Línea 1, col 1</div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ BÓVEDA ══ -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showBoveda" class="overlay" @click.self="closeBoveda">
        <div class="boveda-window" :class="{ glitching: bovedaGlitch }">
          <div class="boveda-header">
            <span>🔒 BOVEDA_RESTRINGIDA</span>
            <button @click="closeBoveda">✕</button>
          </div>

          <!-- Estado: ingresar PIN -->
          <div v-if="bovedaPhase === 'pin'" class="boveda-body">
            <div class="bov-icon">⬡</div>
            <div class="bov-title">ACCESO RESTRINGIDO</div>
            <div class="bov-label">Ingrese PIN:</div>
            <div class="pin-row">
              <input
                v-for="(_, i) in 4"
                :key="i"
                :ref="(el) => (pinRefs[i] = el)"
                v-model="pinDigits[i]"
                class="pin-digit"
                maxlength="1"
                type="text"
                :class="{ error: pinError }"
                @input="onPinInput(i)"
                @keydown.backspace="onPinBackspace(i)"
              />
            </div>
            <p v-if="pinError" class="bov-error">PIN incorrecto.</p>
            <button
              class="bov-btn"
              @click="tryPin"
              :disabled="pinDigits.some((d) => !d)"
            >
              CONFIRMAR
            </button>
          </div>

          <!-- Estado: "parece que funcionó" -->
          <div v-else-if="bovedaPhase === 'confirming'" class="boveda-body">
            <div class="bov-icon bov-icon-ok">✓</div>
            <div class="bov-title bov-title-ok">PIN confirmado.</div>
            <div class="bov-label">Desbloqueo automático iniciado...</div>
            <div class="confirm-bar">
              <div
                class="confirm-fill"
                :style="{ width: confirmProgress + '%' }"
              />
            </div>
          </div>

          <!-- Estado: ERROR / corrompido -->
          <div v-else-if="bovedaPhase === 'corrupted'" class="boveda-body">
            <div class="bov-icon bov-icon-err">✕</div>
            <div class="bov-err-title">ERROR</div>
            <div class="bov-err-sub">ARCHIVO PRINCIPAL CORROMPIDO</div>
            <div class="bov-err-divider" />
            <div class="bov-err-text">
              La estructura de la bóveda fue dañada.<br /><br />
              El acceso automático ya no está disponible.<br /><br />
              Se requiere sincronización manual<br />del registro original.
            </div>
            <button class="bov-recover-btn" @click="startMinigame">
              [ INICIAR RECUPERACIÓN ]
            </button>
          </div>

          <!-- Estado: minijuego -->
          <div
            v-else-if="bovedaPhase === 'minigame'"
            class="boveda-body boveda-mg"
          >
            <MatrixMinigame
              @success="onMinigameSuccess"
              @fail="onMinigameFail"
            />
          </div>

          <!-- Estado: éxito final -->
          <div v-else-if="bovedaPhase === 'success'" class="boveda-body">
            <div class="bov-icon bov-icon-ok">✓</div>
            <div class="bov-title bov-title-ok">Registro confirmado.</div>
            <div class="success-date">14/10/2020 — 03:14 AM</div>
            <div class="bov-label" style="margin-top: 12px">
              Acceso manual concedido.
            </div>
            <button class="bov-open-btn" @click="launchEndgame">
              ABRIR BÓVEDA
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- ══ ENDGAME ══ -->
  <VaultEndgame v-if="showEndgame" />
</template>

<script setup>
import { ref, nextTick } from "vue";
import Window from "./Window.vue";
import MatrixMinigame from "./minigames/MatrixMinigame.vue";
import VaultEndgame from "./Vaultendgame.vue";
import { useSystem } from "../store/system.js";

const emit = defineEmits(["close", "minimize", "vault-opened"]);
const system = useSystem();

// ── Endgame ───────────────────────────────────────────────────────────────────
const showEndgame = ref(false);

function launchEndgame() {
  showBoveda.value = false;
  showEndgame.value = true;
}

// ── Fase principal ────────────────────────────────────────────────────────────
const phase = ref("input");
const claveInput = ref("");
const claveError = ref(false);
const claveInputRef = ref(null);
const selectedFile = ref(null);
const glitchProgress = ref(0);

const CORRECT_CLAVE = "R3D-M4R-K3T";

const glitchLines = [
  { text: "> validando clave de desencriptado...", type: "ok" },
  { text: "> clave aceptada: R3D-M4R-K3T", type: "ok" },
  { text: "> descifrando contenido...", type: "ok" },
  { text: "[INFO] bloque 1/3 — descifrado", type: "warn" },
  { text: "[INFO] bloque 2/3 — descifrado", type: "warn" },
  { text: "[INFO] bloque 3/3 — descifrado", type: "warn" },
  { text: "[OK] ACCESO_BOVEDA.key — generado", type: "ok" },
  { text: "[OK] PIN_BOVEDA.txt — generado", type: "ok" },
  { text: "", type: "ok" },
  { text: "> archivos disponibles en el sistema.", type: "log" },
];

const visibleGlitchLines = ref([]);

function tryClave() {
  const val = claveInput.value.trim().toUpperCase();
  if (val === CORRECT_CLAVE) {
    claveError.value = false;
    phase.value = "glitch";
    runGlitch();
  } else {
    claveError.value = true;
    system.triggerEvent("glitch", { intensity: "medium", duration: 400 });
    setTimeout(() => {
      claveError.value = false;
    }, 2500);
  }
}

function runGlitch() {
  glitchProgress.value = 0;
  visibleGlitchLines.value = [];

  glitchLines.forEach((line, i) => {
    setTimeout(() => {
      visibleGlitchLines.value.push(line);
      glitchProgress.value = ((i + 1) / glitchLines.length) * 100;
    }, i * 200);
  });

  setTimeout(
    () => {
      system.triggerEvent("flicker", { times: 4, interval: 100 });
      phase.value = "files";
    },
    glitchLines.length * 200 + 600,
  );
}

function openFile(id) {
  if (id === "pin") {
    showPinViewer.value = true;
  } else {
    openBoveda();
  }
}

// ── PIN Visor ─────────────────────────────────────────────────────────────────
const showPinViewer = ref(false);

// ── Bóveda ────────────────────────────────────────────────────────────────────
const showBoveda = ref(false);
const bovedaPhase = ref("pin");
const bovedaGlitch = ref(false);
const pinDigits = ref(["", "", "", ""]);
const pinRefs = ref([]);
const pinError = ref(false);
const confirmProgress = ref(0);

const CORRECT_PIN = ["1", "4", "1", "0"];

function openBoveda() {
  bovedaPhase.value = "pin";
  pinDigits.value = ["", "", "", ""];
  pinError.value = false;
  confirmProgress.value = 0;
  showBoveda.value = true;
  nextTick(() => pinRefs.value[0]?.focus());
}

function closeBoveda() {
  showBoveda.value = false;
}

function onPinInput(i) {
  pinDigits.value[i] = pinDigits.value[i].slice(-1).replace(/[^0-9]/, "");
  pinError.value = false;
  if (pinDigits.value[i] && i < 3) {
    nextTick(() => pinRefs.value[i + 1]?.focus());
  }
}

function onPinBackspace(i) {
  if (!pinDigits.value[i] && i > 0) {
    pinDigits.value[i - 1] = "";
    nextTick(() => pinRefs.value[i - 1]?.focus());
  }
}

function tryPin() {
  const entered = pinDigits.value.join("");
  if (entered === CORRECT_PIN.join("")) {
    bovedaPhase.value = "confirming";
    confirmProgress.value = 0;

    // Animar barra de confirmación
    const interval = setInterval(() => {
      confirmProgress.value += 4;
      if (confirmProgress.value >= 100) {
        clearInterval(interval);
        // Glitch y fallo
        setTimeout(() => {
          bovedaGlitch.value = true;
          setTimeout(() => {
            bovedaGlitch.value = false;
            bovedaPhase.value = "corrupted";
          }, 700);
        }, 400);
      }
    }, 40);
  } else {
    pinError.value = true;
    system.triggerEvent("glitch", { intensity: "low", duration: 300 });
    nextTick(() => {
      pinDigits.value = ["", "", "", ""];
      pinRefs.value[0]?.focus();
    });
    setTimeout(() => {
      pinError.value = false;
    }, 2000);
  }
}

function startMinigame() {
  bovedaPhase.value = "minigame";
}

function onMinigameSuccess() {
  bovedaPhase.value = "success";
  system.setFlag("unlockedDecryptor"); // flag por si acaso
  system.triggerEvent("flicker", { times: 3, interval: 150 });
  system.triggerEvent("notification", {
    message: "Acceso a bóveda concedido.",
  });
}

function onMinigameFail() {
  // Reinicia el minijuego (el propio componente lo maneja, pero por si se quiere reset total)
}
</script>

<style scoped>
.dec-app {
  height: 420px;
  display: flex;
  flex-direction: column;
  font-family: "Courier New", monospace;
  background: #080808;
}

/* ── PANTALLA INPUT ── */
.dec-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  padding: 24px;
}

.dec-logo {
  text-align: center;
}
.dec-hex {
  font-size: 44px;
  color: #cc3333;
  text-shadow: 0 0 20px #cc3333;
  animation: hex-pulse 2s infinite;
}
@keyframes hex-pulse {
  0%,
  100% {
    opacity: 1;
    text-shadow:
      0 0 20px #cc3333,
      0 0 40px #cc3333;
  }
  50% {
    opacity: 0.55;
    text-shadow: 0 0 8px #cc3333;
  }
}
.dec-title {
  font-size: 24px;
  color: #ddd;
  letter-spacing: 6px;
  font-weight: bold;
  margin-top: 4px;
}
.dec-sub {
  font-size: 10px;
  color: #333;
  letter-spacing: 2px;
  margin-top: 4px;
}

.dec-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}
.dec-form-label {
  font-size: 10px;
  color: #444;
  letter-spacing: 1.5px;
}

.dec-input {
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  color: #cc3333;
  font-family: "Courier New", monospace;
  font-size: 18px;
  letter-spacing: 4px;
  text-align: center;
  outline: none;
  padding: 10px 14px;
  width: 100%;
  box-sizing: border-box;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  caret-color: #cc3333;
}
.dec-input:focus {
  border-color: #cc3333;
  box-shadow: 0 0 10px rgba(204, 51, 51, 0.15);
}
.dec-input.error {
  border-color: #ff4444;
  animation: shake 0.3s ease;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}

.dec-error {
  font-size: 11px;
  color: #cc3333;
  margin: 0;
}

.dec-btn {
  background: #0d0000;
  border: 1px solid #441111;
  color: #cc3333;
  padding: 9px 28px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  letter-spacing: 3px;
  cursor: pointer;
  border-radius: 4px;
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
  width: 100%;
}
.dec-btn:hover {
  background: #1a0000;
  border-color: #cc3333;
  box-shadow: 0 0 12px rgba(204, 51, 51, 0.15);
}

.dec-status {
  font-size: 10px;
  color: #222;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cc3333;
  animation: dot-pulse 1.5s infinite;
}
@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}

/* ── GLITCH SCREEN ── */
.dec-glitch-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 32px 40px;
  background: #040404;
}
.glitch-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 3px;
  margin-bottom: 20px;
}
.glitch-line {
  font-size: 12px;
  animation: lineIn 0.12s ease-out;
}
@keyframes lineIn {
  from {
    opacity: 0;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.glitch-line.ok {
  color: #226622;
}
.glitch-line.warn {
  color: #aa7700;
}
.glitch-line.log {
  color: #888;
}

.glitch-bar {
  height: 2px;
  background: #1a1a1a;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}
.glitch-fill {
  height: 100%;
  background: #cc3333;
  box-shadow: 0 0 8px #cc3333;
  transition: width 0.15s linear;
}
.glitch-label {
  font-size: 10px;
  color: #333;
  letter-spacing: 2px;
}

/* ── FILES ── */
.dec-files {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.files-header {
  padding: 14px 16px 10px;
  border-bottom: 1px solid #1a1a1a;
}
.files-title {
  font-size: 13px;
  color: #33cc66;
  font-family: "Courier New", monospace;
}
.files-sub {
  font-size: 10px;
  color: #333;
  margin-top: 4px;
  letter-spacing: 0.5px;
}

.files-list {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #0d0d0d;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  animation: fileAppear 0.4s ease-out;
}
.file-row:nth-child(2) {
  animation-delay: 0.2s;
  animation-fill-mode: both;
}
@keyframes fileAppear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.file-row:hover {
  background: #111;
  border-color: #333;
}
.file-row.selected {
  background: #0d1a0d;
  border-color: #cc3333;
}

.fr-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.fr-name {
  font-size: 13px;
  color: #ccc;
  font-family: "Courier New", monospace;
}
.fr-meta {
  font-size: 10px;
  color: #444;
  margin-top: 2px;
}

.files-status {
  padding: 6px 16px;
  background: #0a0a0a;
  border-top: 1px solid #1a1a1a;
  font-size: 10px;
  color: #333;
  letter-spacing: 1px;
}

/* ── OVERLAY ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10300;
}
.fade-enter-active {
  transition: opacity 0.3s;
}
.fade-enter-from {
  opacity: 0;
}
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-leave-to {
  opacity: 0;
}

/* ── NOTEPAD ── */
.notepad-window {
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 6px;
  width: 440px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.9);
  overflow: hidden;
}
.notepad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  background: #161616;
  border-bottom: 1px solid #222;
  font-size: 12px;
  color: #888;
  font-family: "Segoe UI", sans-serif;
}
.notepad-header button {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 13px;
}
.notepad-header button:hover {
  color: #ff4444;
}
.notepad-body {
  padding: 20px;
  color: #aaa;
  font-family: "Courier New", monospace;
  font-size: 13px;
  white-space: pre-wrap;
  line-height: 1.8;
  margin: 0;
}
.notepad-footer {
  padding: 4px 12px;
  background: #111;
  border-top: 1px solid #1e1e1e;
  font-size: 10px;
  color: #444;
  font-family: "Courier New", monospace;
}

/* ── BÓVEDA ── */
.boveda-window {
  background: #080808;
  border: 1px solid #cc3333;
  border-radius: 8px;
  width: 400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 40px rgba(204, 51, 51, 0.2);
  overflow: hidden;
  transition: transform 0.05s;
}
.boveda-window.glitching {
  animation: bov-glitch 0.15s steps(2) 4;
}
@keyframes bov-glitch {
  0% {
    transform: translate(-3px, 1px) skewX(-1deg);
    filter: hue-rotate(20deg);
  }
  50% {
    transform: translate(3px, -1px) skewX(1deg);
  }
  100% {
    transform: translate(0, 0);
    filter: none;
  }
}

.boveda-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #0f0000;
  border-bottom: 1px solid #330000;
  font-size: 12px;
  color: #cc3333;
  font-family: "Courier New", monospace;
}
.boveda-header button {
  background: none;
  border: none;
  color: #553333;
  cursor: pointer;
  font-size: 13px;
}
.boveda-header button:hover {
  color: #ff4444;
}

.boveda-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 24px;
  gap: 12px;
  font-family: "Courier New", monospace;
}
.boveda-mg {
  padding: 0;
  justify-content: flex-start;
}

.bov-icon {
  font-size: 40px;
  opacity: 0.35;
}
.bov-icon-ok {
  opacity: 1;
  color: #33cc66;
  font-size: 40px;
}
.bov-icon-err {
  opacity: 1;
  color: #cc3333;
  font-size: 40px;
}

.bov-title {
  font-size: 14px;
  color: #888;
  letter-spacing: 2px;
}
.bov-title-ok {
  color: #33cc66 !important;
}
.bov-label {
  font-size: 12px;
  color: #444;
  letter-spacing: 1px;
}

.pin-row {
  display: flex;
  gap: 8px;
  margin: 4px 0;
}
.pin-digit {
  width: 42px;
  height: 50px;
  background: #0d0d0d;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  color: #cc3333;
  font-size: 20px;
  text-align: center;
  outline: none;
  caret-color: transparent;
  font-family: "Courier New", monospace;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}
.pin-digit:focus {
  border-color: #cc3333;
  box-shadow: 0 0 8px rgba(204, 51, 51, 0.2);
}
.pin-digit.error {
  border-color: #ff4444;
  animation: shake 0.3s ease;
}

.bov-error {
  font-size: 11px;
  color: #cc3333;
  margin: 0;
}

.bov-btn {
  background: #0d0000;
  border: 1px solid #441111;
  color: #cc3333;
  padding: 8px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  letter-spacing: 2px;
  font-family: "Courier New", monospace;
  transition: background 0.2s;
  margin-top: 4px;
}
.bov-btn:hover:not(:disabled) {
  background: #1a0000;
  border-color: #cc3333;
}
.bov-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.confirm-bar {
  width: 200px;
  height: 3px;
  background: #1a1a1a;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}
.confirm-fill {
  height: 100%;
  background: #33cc66;
  transition: width 0.04s linear;
}

.bov-err-title {
  font-size: 18px;
  color: #cc3333;
  font-weight: bold;
  letter-spacing: 3px;
}
.bov-err-sub {
  font-size: 12px;
  color: #882222;
  letter-spacing: 1px;
}
.bov-err-divider {
  width: 200px;
  height: 1px;
  background: #1a0000;
  margin: 4px 0;
}
.bov-err-text {
  font-size: 12px;
  color: #665544;
  line-height: 1.8;
  text-align: center;
}

.bov-recover-btn {
  background: #0d0000;
  border: 1px solid #cc4400;
  color: #cc6622;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-family: "Courier New", monospace;
  font-size: 13px;
  letter-spacing: 1px;
  margin-top: 8px;
  transition: all 0.2s;
}
.bov-recover-btn:hover {
  background: #1a0800;
  border-color: #ff6633;
  color: #ff8844;
}

.success-date {
  font-size: 16px;
  color: #33cc66;
  letter-spacing: 2px;
  margin-top: 4px;
}
.bov-open-btn {
  background: #001a00;
  border: 1px solid #33cc66;
  color: #33cc66;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-family: "Courier New", monospace;
  font-size: 12px;
  letter-spacing: 2px;
  margin-top: 12px;
  transition: all 0.2s;
}
.bov-open-btn:hover {
  background: #003300;
  box-shadow: 0 0 12px rgba(51, 204, 102, 0.2);
}
</style>
