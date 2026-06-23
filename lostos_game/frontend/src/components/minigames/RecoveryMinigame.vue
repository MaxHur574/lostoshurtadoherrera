<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="mg-box">
      <div class="mg-header">
        <span>📰 Reconstruye la noticia — nota_2020.val</span>
        <button @click="$emit('close')">✕</button>
      </div>
      <div class="mg-body">
        <p class="hint">
          Haz clic en dos fragmentos para intercambiarlos. Reconstruye la
          noticia en orden.
        </p>
        <div class="frags-list">
          <div
            v-for="(f, i) in frags"
            :key="i"
            class="frag"
            :class="{ selected: sel === i, correct: f.pos === i }"
            @click="pick(i)"
          >
            <span class="frag-num">{{ i + 1 }}</span>
            <span class="frag-text">{{ f.text }}</span>
          </div>
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
import { ref, onMounted } from "vue";

const emit = defineEmits(["close", "win"]);
const won = ref(false);
const sel = ref(null);

// Los fragmentos en orden correcto (pos = índice correcto)
const CORRECTOS = [
  "SANTIAGO, 2020 —",
  "Empresa tecnológica acusada de acceso ilegal",
  "a servidores de organismos estatales.",
  "El caso fue archivado sin explicación pública.",
  "La investigadora desapareció semanas después.",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const frags = ref([]);

onMounted(() => {
  let arr;
  do {
    arr = shuffle(CORRECTOS.map((text, pos) => ({ text, pos })));
  } while (arr.every((f, i) => f.pos === i));
  frags.value = arr;
});

function pick(i) {
  if (won.value) return;
  if (sel.value === null) {
    sel.value = i;
  } else {
    [frags.value[sel.value], frags.value[i]] = [
      frags.value[i],
      frags.value[sel.value],
    ];
    sel.value = null;
    if (frags.value.every((f, i) => f.pos === i)) {
      won.value = true;
      setTimeout(() => {
        emit("win");
        emit("close");
      }, 1000);
    }
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.mg-box {
  background: #111;
  border: 1px solid #333;
  border-radius: 6px;
  width: 400px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.9);
}
.mg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  color: #ccc;
  font-size: 12px;
  font-family: "Segoe UI", sans-serif;
}
.mg-header button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}
.mg-header button:hover {
  color: #ff4444;
}
.mg-body {
  padding: 16px;
}
.hint {
  font-size: 11px;
  color: #555;
  font-family: "Segoe UI", sans-serif;
  margin: 0 0 12px;
}
.frags-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.frag {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  background: #161616;
  border: 1px solid #2a2a2a;
  border-radius: 4px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}
.frag:hover {
  background: #1e1e1e;
  border-color: #3a3a3a;
}
.frag.selected {
  border-color: #4a9eff;
  background: #0f1e2a;
}
.frag.correct {
  border-color: #2a5a2a;
}
.frag-num {
  font-size: 10px;
  color: #444;
  font-family: "Courier New", monospace;
  flex-shrink: 0;
  width: 14px;
}
.frag-text {
  font-size: 12px;
  color: #999;
  font-family: "Courier New", monospace;
}
.frag.correct .frag-text {
  color: #3a7a3a;
}
.win-msg {
  text-align: center;
  color: #3a8a3a;
  font-size: 12px;
  font-family: "Courier New", monospace;
  margin: 12px 0 0;
}
.mg-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
  border-top: 1px solid #1a1a1a;
}
.btn-cancel {
  background: #1a1a1a;
  border: 1px solid #333;
  color: #777;
  padding: 5px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}
.btn-cancel:hover {
  color: #ccc;
}
</style>
