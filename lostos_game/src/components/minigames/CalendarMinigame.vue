<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="mg-box">
      <div class="mg-header">
        <span>📅 Ordena los meses — nota_octubre.val</span>
        <button @click="$emit('close')">✕</button>
      </div>
      <div class="mg-body">
        <p class="hint">Haz clic en los meses en orden cronológico.</p>
        <p class="progress">Progreso: {{ done }} / 12</p>
        <div class="meses-grid">
          <button
            v-for="m in meses"
            :key="m.name"
            class="mes-btn"
            :class="{ done: m.done, wrong: m.wrong }"
            :disabled="m.done"
            @click="click(m)"
          >
            {{ m.name }}
          </button>
        </div>
        <p v-if="won" class="win-msg">✓ Correcto — abriendo nota...</p>
      </div>
      <div class="mg-footer">
        <button class="btn-cancel" @click="$emit('close')">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['close', 'win']);
const won  = ref(false);

const ORDEN = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const meses   = ref(shuffle(ORDEN).map(name => ({ name, done: false, wrong: false })));
const nextIdx = ref(0);

const done = computed(() => meses.value.filter(m => m.done).length);

function click(m) {
  if (won.value || m.done) return;
  if (m.name === ORDEN[nextIdx.value]) {
    m.done = true;
    nextIdx.value++;
    if (nextIdx.value === ORDEN.length) {
      won.value = true;
      setTimeout(() => { emit('win'); emit('close'); }, 1000);
    }
  } else {
    m.wrong = true;
    setTimeout(() => { m.wrong = false; }, 500);
  }
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 10000;
}
.mg-box {
  background: #111; border: 1px solid #333;
  border-radius: 6px; width: 420px;
  box-shadow: 0 0 40px rgba(0,0,0,.9);
}
.mg-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px; background: #1a1a1a; border-bottom: 1px solid #2a2a2a;
  color: #ccc; font-size: 12px; font-family: 'Segoe UI', sans-serif;
}
.mg-header button { background: none; border: none; color: #666; cursor: pointer; }
.mg-header button:hover { color: #ff4444; }
.mg-body { padding: 16px; }
.hint     { font-size: 11px; color: #555; font-family: 'Segoe UI', sans-serif; margin: 0 0 4px; }
.progress { font-size: 11px; color: #444; font-family: 'Courier New', monospace; margin: 0 0 12px; }
.meses-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.mes-btn {
  background: #1a1a1a; border: 1px solid #2a2a2a;
  color: #888; padding: 8px 12px;
  border-radius: 4px; cursor: pointer;
  font-size: 12px; font-family: 'Segoe UI', sans-serif;
  transition: all .15s;
}
.mes-btn:hover:not(:disabled):not(.done) { background: #222; color: #ccc; border-color: #3a3a3a; }
.mes-btn.done  { background: #0f2a0f; border-color: #1a4a1a; color: #3a7a3a; cursor: default; }
.mes-btn.wrong { border-color: #7a1a1a; color: #cc3333; }
.mes-btn:disabled:not(.done) { opacity: .35; cursor: default; }
.win-msg {
  text-align: center; color: #3a8a3a;
  font-size: 12px; font-family: 'Courier New', monospace; margin: 12px 0 0;
}
.mg-footer {
  display: flex; justify-content: flex-end;
  padding: 8px 12px; border-top: 1px solid #1a1a1a;
}
.btn-cancel {
  background: #1a1a1a; border: 1px solid #333;
  color: #777; padding: 5px 14px;
  border-radius: 4px; cursor: pointer; font-size: 12px;
}
.btn-cancel:hover { color: #ccc; }
</style>