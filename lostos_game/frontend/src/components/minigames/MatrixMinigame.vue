<template>
  <div class="mg-wrap">
    <!-- Secuencia objetivo -->
    <div class="mg-header">
      <div class="mg-title">
        SINCRONIZAR REGISTRO — INTRODUCE LA SECUENCIA EN ORDEN
      </div>
      <div class="mg-sequence">
        <div
          v-for="(num, i) in TARGET"
          :key="i"
          class="seq-cell"
          :class="{
            done: i < progress,
            current: i === progress,
            pending: i > progress,
          }"
        >
          {{ String(num).padStart(2, "0") }}
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="mg-info">
      <div class="info-item" :class="{ warn: timeLeft <= 15 }">
        <span class="info-label">TIEMPO</span>
        <span class="info-val">{{ timeLeft }}s</span>
      </div>
      <div class="info-item">
        <span class="info-label">PROGRESO</span>
        <span class="info-val">{{ progress }}/{{ TARGET.length }}</span>
      </div>
      <div class="info-item" :class="{ danger: errors >= 2 }">
        <span class="info-label">ERRORES</span>
        <span class="info-val">{{ errors }}/3</span>
      </div>
    </div>

    <!-- Cuadrícula 6×4 -->
    <div class="mg-grid">
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="grid-cell"
        :class="{
          correct: cell.justCorrect,
          wrong: cell.justWrong,
        }"
        @click="pickCell(i)"
      >
        <span class="cell-val">{{ String(cell.value).padStart(2, "0") }}</span>
      </div>
    </div>

    <!-- Barra de tiempo -->
    <div class="mg-timebar">
      <div
        class="mg-timefill"
        :style="{ width: (timeLeft / MAX_TIME) * 100 + '%' }"
        :class="{ low: timeLeft <= 15 }"
      />
    </div>

    <!-- Overlay de fallo -->
    <Transition name="result-fade">
      <div v-if="failed" class="mg-result">
        <div class="res-title">⛔ FALLO — REINICIANDO</div>
        <div class="res-sub">Demasiados errores o tiempo agotado.</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const emit = defineEmits(["success", "fail"]);

// TARGET con valores únicos — 14, 10, 20, 3 (sin repetidos)
const TARGET = [14, 10, 20, 20, 3, 14];
const MAX_TIME = 90;
const TOTAL = 24; // 6×4
const SHUFFLE_INTERVAL = 1800;

const progress = ref(0);
const errors = ref(0);
const timeLeft = ref(MAX_TIME);
const won = ref(false);
const failed = ref(false);
const cells = ref([]);

let shuffleTimer = null;
let countdownTimer = null;

// ── Construir 24 valores TODOS ÚNICOS ────────────────────────────────────────
// Los valores de TARGET aparecen exactamente una vez cada uno.
// El resto son números únicos que no están en TARGET ni se repiten entre sí.
function buildValues() {
  // Valores únicos de TARGET (sin duplicados)
  const targetUnique = [...new Set(TARGET)]; // [14, 10, 20, 3]

  // Pool de relleno: números del 1 al 99 que no estén en TARGET
  const pool = [];
  for (let n = 1; n <= 99; n++) {
    if (!TARGET.includes(n)) pool.push(n);
  }

  // Mezclar pool y tomar los que necesitamos
  const shuffledPool = shuffle(pool);
  const filler = shuffledPool.slice(0, TOTAL - targetUnique.length);

  // Combinar y mezclar todo
  return shuffle([...targetUnique, ...filler]);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initCells() {
  const vals = buildValues();
  cells.value = vals.map((v) => ({
    value: v,
    justCorrect: false,
    justWrong: false,
  }));
}

// Mezcla los valores entre celdas — las celdas no se mueven, solo los números
function shuffleValues() {
  if (won.value || failed.value) return;
  const vals = cells.value.map((c) => c.value);
  const shuffled = shuffle(vals);
  cells.value.forEach((c, i) => {
    c.value = shuffled[i];
  });
}

function pickCell(i) {
  if (won.value || failed.value) return;
  const cell = cells.value[i];
  const expected = TARGET[progress.value];

  if (cell.value === expected) {
    cell.justCorrect = true;
    setTimeout(() => {
      cell.justCorrect = false;
    }, 500);
    progress.value++;
    if (progress.value === TARGET.length) {
      won.value = true;
      clearInterval(shuffleTimer);
      clearInterval(countdownTimer);
      setTimeout(() => emit("success"), 800);
    }
  } else {
    errors.value++;
    cell.justWrong = true;
    setTimeout(() => {
      cell.justWrong = false;
    }, 500);
    if (errors.value >= 3) triggerFail();
  }
}

function triggerFail() {
  failed.value = true;
  clearInterval(shuffleTimer);
  clearInterval(countdownTimer);
  emit("fail");
  setTimeout(() => {
    failed.value = false;
    progress.value = 0;
    errors.value = 0;
    timeLeft.value = MAX_TIME;
    initCells();
    startTimers();
  }, 2000);
}

function startTimers() {
  shuffleTimer = setInterval(shuffleValues, SHUFFLE_INTERVAL);
  countdownTimer = setInterval(() => {
    if (won.value || failed.value) return;
    timeLeft.value--;
    if (timeLeft.value <= 0) triggerFail();
  }, 1000);
}

onMounted(() => {
  initCells();
  startTimers();
});

onUnmounted(() => {
  clearInterval(shuffleTimer);
  clearInterval(countdownTimer);
});
</script>

<style scoped>
.mg-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #040404;
  font-family: "Courier New", monospace;
  user-select: none;
  position: relative;
}

/* ── Cabecera ── */
.mg-header {
  padding: 12px 14px 10px;
  border-bottom: 1px solid #1a0000;
  background: #080808;
}
.mg-title {
  font-size: 8px;
  color: #443322;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
  text-transform: uppercase;
}
.mg-sequence {
  display: flex;
  gap: 5px;
}
.seq-cell {
  width: 36px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 13px;
  font-weight: bold;
  border: 1px solid;
  transition: all 0.25s;
}
.seq-cell.done {
  background: #003300;
  border-color: #33cc66;
  color: #33cc66;
}
.seq-cell.current {
  background: #1a0000;
  border-color: #cc3333;
  color: #cc3333;
  animation: seq-pulse 1s infinite;
}
.seq-cell.pending {
  background: #0a0a0a;
  border-color: #1e1e1e;
  color: #2a2a2a;
}

@keyframes seq-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(204, 51, 51, 0);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(204, 51, 51, 0.2);
  }
}

/* ── Info bar ── */
.mg-info {
  display: flex;
  border-bottom: 1px solid #111;
}
.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 8px;
  border-right: 1px solid #0f0f0f;
}
.info-item:last-child {
  border-right: none;
}
.info-label {
  font-size: 8px;
  color: #2a2a2a;
  letter-spacing: 1px;
}
.info-val {
  font-size: 14px;
  color: #555;
  font-weight: bold;
  margin-top: 1px;
}
.info-item.warn .info-val {
  color: #cc8800;
  animation: blink-warn 1s infinite;
}
.info-item.danger .info-val {
  color: #cc3333;
  animation: blink-warn 0.6s infinite;
}

@keyframes blink-warn {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

/* ── Cuadrícula 6×4 ── */
.mg-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: 10px;
  background: #050505;
}

.grid-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f14;
  border: 1px solid #1e1e28;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background 0.12s,
    border-color 0.12s;
}
.grid-cell:hover {
  background: #18181f;
  border-color: #2e2e3e;
}
.cell-val {
  font-size: 14px;
  font-weight: bold;
  color: #7a7a9a;
  pointer-events: none;
  text-shadow: 0 0 8px rgba(130, 130, 180, 0.25);
}

/* Correcto — flash verde */
.grid-cell.correct {
  background: #003300 !important;
  border-color: #33cc66 !important;
}
.grid-cell.correct .cell-val {
  color: #33cc66 !important;
}

/* Incorrecto — flash rojo */
.grid-cell.wrong {
  background: #1a0000 !important;
  border-color: #ff4444 !important;
  animation: shake 0.3s ease;
}
.grid-cell.wrong .cell-val {
  color: #ff4444 !important;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

/* ── Barra de tiempo ── */
.mg-timebar {
  height: 2px;
  background: #111;
}
.mg-timefill {
  height: 100%;
  background: #cc3333;
  transition: width 1s linear;
  box-shadow: 0 0 6px #cc3333;
}
.mg-timefill.low {
  background: #ff4444;
  animation: timeblink 0.5s infinite;
}
@keyframes timeblink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* ── Overlay fallo ── */
.mg-result {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.9);
  z-index: 10;
}
.res-title {
  font-size: 13px;
  color: #cc3333;
  letter-spacing: 2px;
}
.res-sub {
  font-size: 10px;
  color: #553333;
}

.result-fade-enter-active {
  transition: opacity 0.2s;
}
.result-fade-enter-from {
  opacity: 0;
}
</style>
