<template>
  <Window
    title="📁 Investigación Privada"
    @close="$emit('close')"
    @minimize="$emit('minimize')"
  >
    <div class="inv-app">
      <!-- Lista de archivos -->
      <div class="file-list">
        <div
          v-for="nota in notas"
          :key="nota.key"
          class="file-item"
          :class="{
            locked: !mg.unlocked[nota.key],
            selected: selected === nota.key,
          }"
          @click="selected = nota.key"
          @dblclick="openNota(nota)"
        >
          <span class="file-icon">{{
            mg.unlocked[nota.key] ? "📄" : "🔒"
          }}</span>
          <div class="file-info">
            <div class="file-name">{{ nota.filename }}</div>
            <div class="file-sub">
              {{
                mg.unlocked[nota.key]
                  ? "Desbloqueado · doble clic para leer"
                  : "Bloqueado · doble clic para desbloquear"
              }}
            </div>
          </div>
        </div>

        <!-- Informe completo (aparece solo cuando los 3 están desbloqueados) -->
        <Transition name="file-appear">
          <div
            v-if="allUnlocked"
            class="file-item file-item-special"
            :class="{ selected: selected === 'informe' }"
            @click="selected = 'informe'"
            @dblclick="openInformeCompleto"
          >
            <span class="file-icon">📋</span>
            <div class="file-info">
              <div class="file-name file-name-special">
                INFORME_POLICIAL_COMPLETO.val
              </div>
              <div class="file-sub file-sub-special">
                Desbloqueado · doble clic para leer
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Panel derecho -->
      <div class="file-preview">
        <div v-if="!selected" class="preview-empty">
          Selecciona un archivo para ver detalles.
        </div>
        <div v-else-if="selected === 'informe'" class="preview-info">
          <div class="pi-name">INFORME_POLICIAL_COMPLETO.val</div>
          <div class="pi-row">
            <span>Estado</span><span>🟢 Desbloqueado</span>
          </div>
          <div class="pi-row">
            <span>Tipo</span><span>.val — archivo cifrado</span>
          </div>
          <div class="pi-row"><span>Autor</span><span>E.V.</span></div>
          <div class="pi-hint pi-hint-special">
            Doble clic para leer el informe.
          </div>
        </div>
        <div v-else class="preview-info">
          <div class="pi-name">{{ currentNota?.filename }}</div>
          <div class="pi-row">
            <span>Estado</span>
            <span>{{
              mg.unlocked[currentNota?.key] ? "🟢 Desbloqueado" : "🔴 Bloqueado"
            }}</span>
          </div>
          <div class="pi-row">
            <span>Tipo</span><span>.val — archivo cifrado</span>
          </div>
          <div class="pi-row"><span>Autor</span><span>E.V.</span></div>
          <div class="pi-hint">
            {{
              mg.unlocked[currentNota?.key]
                ? "Doble clic para leer el contenido."
                : "Doble clic para iniciar el minijuego de desbloqueo."
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Minijuegos -->
    <Teleport to="body">
      <PuzzleMinigame
        v-if="activeGame === 'Pista_1'"
        @close="activeGame = null"
        @win="onWin('Pista_1')"
      />
      <CalendarMinigame
        v-if="activeGame === 'Pista_2'"
        @close="activeGame = null"
        @win="onWin('Pista_2')"
      />
      <RecoveryMinigame
        v-if="activeGame === 'Pista_3'"
        @close="activeGame = null"
        @win="onWin('Pista_3')"
      />
    </Teleport>

    <!-- Nota desbloqueada normal -->
    <Teleport to="body">
      <NoteViewer
        v-if="openedNote"
        :filename="openedNote.filename"
        :content="openedNote.content"
        @close="openedNote = null"
      />
    </Teleport>

    <!-- ══ INFORME POLICIAL COMPLETO ══ -->
    <Teleport to="body">
      <Transition name="fade-in">
        <div
          v-if="showInforme"
          class="informe-overlay"
          @click.self="showInforme = false"
        >
          <div class="informe-window">
            <div class="informe-header">
              <span class="informe-title-bar"
                >📋 INFORME_POLICIAL_COMPLETO.val</span
              >
              <button class="informe-close" @click="showInforme = false">
                ✕
              </button>
            </div>
            <div class="informe-body">
              <div class="informe-stamp">
                POLICIA — USO INTERNO — CLASIFICADO
              </div>
              <div class="informe-divider">
                ══════════════════════════════════════
              </div>
              <div class="informe-section-title">INFORME POLICIAL INTERNO</div>
              <div class="informe-section-title">CASO 14</div>
              <div class="informe-divider">
                ══════════════════════════════════════
              </div>

              <div class="informe-field">
                <span class="ifield-label">Fecha inicial registrada</span>
                <span class="ifield-val">14/10/2020</span>
              </div>
              <div class="informe-field">
                <span class="ifield-label">Hora</span>
                <span class="ifield-val ifield-red">03:14 AM</span>
              </div>
              <div class="informe-field">
                <span class="ifield-label"
                  >Primera desaparición confirmada</span
                >
                <span class="ifield-val ifield-red">14/10/2020 — 03:14 AM</span>
              </div>

              <div class="informe-divider informe-divider-sm">
                ──────────────────────────
              </div>

              <div class="informe-block">
                Desde entonces se registran
                <span class="highlight">47 desapariciones</span> relacionadas al
                mismo patrón.
              </div>
              <div class="informe-block">
                La fecha <span class="highlight">14/10/2020</span> aparece
                repetida en todos los registros.
              </div>
              <div class="informe-block">
                La hora <span class="highlight">03:14</span> coincide en:
                cámaras, actividad del sistema, accesos no autorizados,
                evidencia recuperada.
              </div>
              <div class="informe-block">
                La figura registrada a las 03:14
                <span class="ifield-red"
                  >no aparece en ninguna base oficial.</span
                >
              </div>
              <div class="informe-block">
                Los expedientes posteriores fueron
                <span class="ifield-red">alterados manualmente.</span>
              </div>

              <div class="informe-divider">
                ══════════════════════════════════════
              </div>
              <div class="informe-fin">
                [ FIN DEL DOCUMENTO — NIVEL DE ACCESO: MÁXIMO ]
              </div>
            </div>
            <div class="informe-footer">
              <button class="informe-btn" @click="closeInformeAndOpenTerminal">
                Cerrar e iniciar protocolo de acceso
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══ TERMINAL DEL SO ══ -->
    <Teleport to="body">
      <Transition name="fade-in">
        <div v-if="showTerminal" class="terminal-overlay">
          <div class="terminal-window">
            <div class="terminal-header">
              <span class="terminal-dot red" />
              <span class="terminal-dot yellow" />
              <span class="terminal-dot green" />
              <span class="terminal-title">SYSTEM://hidden_access</span>
            </div>
            <div class="terminal-body" ref="terminalBodyRef">
              <div
                v-for="(line, i) in visibleTerminalLines"
                :key="i"
                class="term-line"
                :class="line.type"
              >
                {{ line.text }}
              </div>

              <!-- Input de clave -->
              <div v-if="showKeyInput" class="term-input-row">
                <span class="term-prompt">Inserte clave: </span>
                <input
                  ref="keyInputRef"
                  v-model="keyInput"
                  class="term-input"
                  type="password"
                  maxlength="8"
                  spellcheck="false"
                  autocomplete="off"
                  @keyup.enter="tryTerminalKey"
                  placeholder="________"
                />
                <button class="term-enter-btn" @click="tryTerminalKey">
                  ↵
                </button>
              </div>

              <div v-if="keyError" class="term-line err">
                ⛔ Clave incorrecta. Acceso denegado.
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </Window>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import Window from "../Window.vue";
import PuzzleMinigame from "./PuzzleMinigame.vue";
import CalendarMinigame from "./CalendarMinigame.vue";
import RecoveryMinigame from "./RecoveryMinigame.vue";
import NoteViewer from "./NoteViewer.vue";
import { useMinigames } from "../../store/minigames.js";
import { useSystem } from "../../store/system.js";

const emit = defineEmits(["close", "minimize", "decryptor-unlocked"]);

const mg = useMinigames();
const system = useSystem();
const selected = ref(null);
const activeGame = ref(null);
const openedNote = ref(null);

// ── Informe completo ──────────────────────────────────────────────────────────
const showInforme = ref(false);

// ── Terminal ──────────────────────────────────────────────────────────────────
const showTerminal = ref(false);
const visibleTerminalLines = ref([]);
const showKeyInput = ref(false);
const keyInput = ref("");
const keyError = ref(false);
const terminalBodyRef = ref(null);
const keyInputRef = ref(null);

const SECRET_KEY = "14102020";

const TERMINAL_INTRO_LINES = [
  { text: "", type: "ok" },
  { text: "SYSTEM://hidden_access", type: "title" },
  { text: "══════════════════════════════════════", type: "dim" },
  { text: "> Detectando módulo oculto...", type: "ok" },
  { text: "> Verificando integridad del caso 14...", type: "ok" },
  { text: "[INFO] Caso 14/10/2020 — 03:14 AM — VERIFICADO", type: "warn" },
  { text: "[INFO] 47 registros cargados.", type: "warn" },
  { text: "", type: "ok" },
  {
    text: "> Para continuar se requiere autenticación de nivel máximo.",
    type: "log",
  },
  { text: "", type: "ok" },
];

const TERMINAL_SUCCESS_LINES = [
  { text: "> Verificando...", type: "ok" },
  { text: "", type: "ok" },
  { text: "✓ Clave aceptada.", type: "success" },
  { text: "", type: "ok" },
  { text: "> Nuevo módulo desbloqueado.", type: "warn" },
  { text: "> Instalando DESENCRIPTADOR...", type: "warn" },
  { text: "", type: "ok" },
  { text: "[████████████████████] 100%", type: "progress" },
  { text: "", type: "ok" },
  { text: "✓ Módulo instalado correctamente.", type: "success" },
  { text: "> DESENCRIPTADOR disponible en el escritorio.", type: "log" },
  { text: "", type: "ok" },
  { text: "Pantalla parpadea...", type: "dim" },
];

// ── Notas ─────────────────────────────────────────────────────────────────────
const notas = [
  {
    key: "Pista_1",
    filename: "Pista_1",
    content: `EXPEDIENTE #14\n\nVíctima encontrada sin identificación oficial.\nLa escena fue acordonada a las 03:14 AM.\n\n[DATOS ELIMINADOS]\n\nEl cuerpo presentaba signos de...`,
  },
  {
    key: "Pista_2",
    filename: "Pista_2",
    content: `REGISTRO DE DESAPARICIONES\n\n3 casos archivados durante octubre.\n\nLas fechas coinciden con los reportes no oficiales enviados por V.H.\n\n[ARCHIVO INCOMPLETO]`,
  },
  {
    key: "Pista_3",
    filename: "Pista_3",
    content: `14 DE OCTUBRE DE 2020\n\nLa policía local descarta relación entre los incidentes.\n\nSin embargo, documentos internos indican actividad no registrada en la zona industrial norte.`,
  },
];

const currentNota = computed(() => notas.find((n) => n.key === selected.value));

const allUnlocked = computed(
  () => mg.unlocked.Pista_1 && mg.unlocked.Pista_2 && mg.unlocked.Pista_3,
);

// Cuando se completan los 3, pequeño efecto y notificación
watch(allUnlocked, (v) => {
  if (!v) return;
  system.triggerEvent("flicker", { times: 3, interval: 150 });
  system.triggerEvent("notification", {
    message: "Nuevo archivo desbloqueado: INFORME_POLICIAL_COMPLETO.val",
  });
});

function openNota(nota) {
  if (mg.unlocked[nota.key]) {
    openedNote.value = nota;
  } else {
    activeGame.value = nota.key;
  }
}

function onWin(key) {
  mg.unlock(key);
  activeGame.value = null;
  const nota = notas.find((n) => n.key === key);
  if (nota) openedNote.value = nota;

  // si ya están los 3 desbloqueados, reproducir sonido
  const allDone = notas.every((n) => mg.unlocked[n.key]);
  if (allDone) {
    const audio = useAudio();
    audio.play("unlock_horror");
  }
}

// ── Informe completo ──────────────────────────────────────────────────────────
function openInformeCompleto() {
  showInforme.value = true;
}

function closeInformeAndOpenTerminal() {
  showInforme.value = false;
  setTimeout(() => {
    showTerminal.value = true;
    visibleTerminalLines.value = [];
    showKeyInput.value = false;
    keyError.value = false;
    keyInput.value = "";
    animateTerminalLines(TERMINAL_INTRO_LINES, () => {
      showKeyInput.value = true;
      nextTick(() => keyInputRef.value?.focus());
    });
  }, 300);
}

// ── Terminal helpers ──────────────────────────────────────────────────────────
function animateTerminalLines(lines, onDone) {
  lines.forEach((line, i) => {
    setTimeout(() => {
      visibleTerminalLines.value.push(line);
      nextTick(() => {
        if (terminalBodyRef.value) {
          terminalBodyRef.value.scrollTop = terminalBodyRef.value.scrollHeight;
        }
      });
      if (i === lines.length - 1 && onDone) onDone();
    }, i * 180);
  });
}

function tryTerminalKey() {
  if (!keyInput.value) return;
  const entered = keyInput.value.trim();

  if (entered === SECRET_KEY) {
    showKeyInput.value = false;
    keyError.value = false;
    keyInput.value = "";

    setTimeout(() => {
      animateTerminalLines(TERMINAL_SUCCESS_LINES, () => {
        // Setear flag y emitir evento al escritorio
        setTimeout(() => {
          system.setFlag("unlockedDecryptor");
          emit("decryptor-unlocked");
          // Parpadeo final y cierra terminal
          setTimeout(() => {
            showTerminal.value = false;
          }, 1200);
        }, 800);
      });
    }, 200);
  } else {
    keyError.value = true;
    keyInput.value = "";
    system.triggerEvent("glitch", { intensity: "medium", duration: 400 });
    nextTick(() => keyInputRef.value?.focus());
    setTimeout(() => {
      keyError.value = false;
    }, 2500);
  }
}
</script>

<style scoped>
.inv-app {
  display: flex;
  height: 380px;
  font-family: "Segoe UI", sans-serif;
  font-size: 13px;
}

/* Lista izquierda */
.file-list {
  width: 240px;
  flex-shrink: 0;
  background: #0f0f0f;
  border-right: 1px solid #1e1e1e;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #141414;
  cursor: pointer;
  transition: background 0.15s;
}
.file-item:hover {
  background: #161616;
}
.file-item.selected {
  background: #1a2a3a;
}
.file-item.locked {
  opacity: 0.75;
}

/* Informe especial */
.file-item-special {
  border-top: 1px solid #2a1a00;
  background: #0d0800;
  animation: pulse-row 2s ease-in-out 3;
}
.file-item-special:hover {
  background: #151000;
}
.file-item-special.selected {
  background: #1a1200;
}

@keyframes pulse-row {
  0%,
  100% {
    background: #0d0800;
  }
  50% {
    background: #1a1000;
  }
}

.file-name-special {
  color: #cc8844 !important;
  font-family: "Courier New", monospace;
}
.file-sub-special {
  color: #664422 !important;
}

.file-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.file-name {
  font-size: 12px;
  color: #ccc;
}
.file-sub {
  font-size: 10px;
  color: #444;
  margin-top: 2px;
}
.file-item.locked .file-sub {
  color: #6a2a2a;
}

/* Panel derecho */
.file-preview {
  flex: 1;
  background: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-empty {
  color: #2a2a2a;
  font-size: 12px;
  text-align: center;
}

.preview-info {
  padding: 24px;
  width: 100%;
}
.pi-name {
  font-size: 13px;
  color: #888;
  font-family: "Courier New", monospace;
  margin-bottom: 16px;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 8px;
}
.pi-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #555;
  padding: 4px 0;
  border-bottom: 1px solid #111;
}
.pi-row span:last-child {
  color: #777;
  font-family: "Courier New", monospace;
}
.pi-hint {
  margin-top: 16px;
  font-size: 11px;
  color: #3a5a3a;
  font-style: italic;
}
.pi-hint-special {
  color: #664422 !important;
}

/* Transición de aparición del informe */
.file-appear-enter-active {
  transition: all 0.5s ease;
}
.file-appear-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

/* ══ INFORME OVERLAY ══ */
.informe-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10100;
}

.informe-window {
  background: #080808;
  border: 1px solid #332200;
  border-radius: 6px;
  width: 520px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 60px rgba(180, 100, 0, 0.15);
  overflow: hidden;
}

.informe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #0f0900;
  border-bottom: 1px solid #332200;
}
.informe-title-bar {
  font-size: 12px;
  color: #cc8844;
  font-family: "Courier New", monospace;
}
.informe-close {
  background: none;
  border: none;
  color: #553300;
  cursor: pointer;
  font-size: 13px;
  transition: color 0.15s;
}
.informe-close:hover {
  color: #ff4444;
}

.informe-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  font-family: "Courier New", monospace;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.informe-stamp {
  font-size: 10px;
  color: #553300;
  letter-spacing: 2px;
  text-align: center;
}
.informe-divider {
  color: #221100;
  font-size: 12px;
}
.informe-divider-sm {
  color: #1a0d00;
  font-size: 11px;
}

.informe-section-title {
  font-size: 14px;
  color: #aa6622;
  font-weight: bold;
  letter-spacing: 2px;
  text-align: center;
}

.informe-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
  border-bottom: 1px solid #110800;
}
.ifield-label {
  font-size: 9px;
  color: #443300;
  letter-spacing: 1px;
  text-transform: uppercase;
}
.ifield-val {
  font-size: 13px;
  color: #998855;
}
.ifield-red {
  color: #cc3333 !important;
}

.informe-block {
  font-size: 12px;
  color: #776644;
  line-height: 1.8;
}
.highlight {
  color: #cc8844;
  font-weight: bold;
}

.informe-fin {
  font-size: 10px;
  color: #332200;
  text-align: center;
  letter-spacing: 1px;
  margin-top: 8px;
}

.informe-footer {
  padding: 12px 16px;
  background: #0a0600;
  border-top: 1px solid #221100;
  display: flex;
  justify-content: flex-end;
}
.informe-btn {
  background: #1a0a00;
  border: 1px solid #cc4400;
  color: #cc6622;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.informe-btn:hover {
  background: #2a1200;
  border-color: #ff6633;
  color: #ff8844;
  box-shadow: 0 0 10px rgba(200, 80, 0, 0.2);
}

/* ══ TERMINAL ══ */
.terminal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10200;
}

.terminal-window {
  background: #030303;
  border: 1px solid #cc3333;
  border-radius: 8px;
  width: 560px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 0 40px rgba(204, 51, 51, 0.2),
    0 0 80px rgba(204, 51, 51, 0.08);
  overflow: hidden;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #0a0a0a;
  border-bottom: 1px solid #1a0000;
}
.terminal-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.terminal-dot.red {
  background: #cc3333;
  box-shadow: 0 0 6px #cc3333;
}
.terminal-dot.yellow {
  background: #cc8800;
}
.terminal-dot.green {
  background: #333;
}
.terminal-title {
  margin-left: 8px;
  font-size: 11px;
  color: #cc3333;
  font-family: "Courier New", monospace;
  letter-spacing: 1px;
}

.terminal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 280px;
  max-height: 500px;
}

.term-line {
  font-size: 13px;
  font-family: "Courier New", monospace;
  line-height: 1.6;
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

.term-line.ok {
  color: #226622;
}
.term-line.warn {
  color: #aa7700;
}
.term-line.err {
  color: #cc3333;
}
.term-line.dim {
  color: #222;
}
.term-line.title {
  color: #cc3333;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 2px;
}
.term-line.log {
  color: #888;
}
.term-line.success {
  color: #33cc66;
  font-weight: bold;
}
.term-line.progress {
  color: #cc3333;
  letter-spacing: 1px;
  font-size: 12px;
}

.term-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  animation: lineIn 0.2s ease-out;
}
.term-prompt {
  font-family: "Courier New", monospace;
  font-size: 13px;
  color: #cc3333;
  white-space: nowrap;
}
.term-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid #cc3333;
  color: #cc3333;
  font-family: "Courier New", monospace;
  font-size: 13px;
  outline: none;
  letter-spacing: 4px;
  width: 120px;
  caret-color: #cc3333;
}
.term-input::placeholder {
  color: #330000;
  letter-spacing: 2px;
}

.term-enter-btn {
  background: none;
  border: 1px solid #cc3333;
  color: #cc3333;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  transition: all 0.15s;
}
.term-enter-btn:hover {
  background: #cc3333;
  color: #000;
}

/* Transición global fade-in */
.fade-in-enter-active {
  transition: opacity 0.35s ease;
}
.fade-in-enter-from {
  opacity: 0;
}
.fade-in-leave-active {
  transition: opacity 0.25s ease;
}
.fade-in-leave-to {
  opacity: 0;
}
</style>
