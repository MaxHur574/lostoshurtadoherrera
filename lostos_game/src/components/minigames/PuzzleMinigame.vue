<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="mg-box">
      <div class="mg-header">
        <span>🧩 Rompecabezas — nota_14.val</span>
        <button @click="$emit('close')">✕</button>
      </div>
      <div class="mg-body">
        <p class="hint">Haz clic en dos piezas para intercambiarlas.</p>
        <div class="grid">
          <div
            v-for="(val, i) in pieces"
            :key="i"
            class="piece"
            :class="{ selected: sel === i, correct: val === i }"
            @click="pick(i)"
            :style="pieceStyle(val)"
          />
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
import imgUrl from "../../assets/puzzles/foto_14.jpg";

const emit = defineEmits(["close", "win"]);

const pieces = ref([]);
const sel = ref(null);
const won = ref(false);

// Tamaño de cada pieza en porcentaje para backgroundPosition
function pieceStyle(val) {
  const col = val % 3; // columna correcta de esta pieza
  const row = Math.floor(val / 3); // fila correcta
  return {
    backgroundImage: `url(${imgUrl})`,
    backgroundSize: "300% 300%",
    backgroundPosition: `${col * 50}% ${row * 50}%`,
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

onMounted(() => {
  let arr;
  do {
    arr = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  } while (arr.every((v, i) => v === i));
  pieces.value = arr;
});

function pick(i) {
  if (won.value) return;
  if (sel.value === null) {
    sel.value = i;
  } else {
    [pieces.value[sel.value], pieces.value[i]] = [
      pieces.value[i],
      pieces.value[sel.value],
    ];
    sel.value = null;
    if (pieces.value.every((v, i) => v === i)) {
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
  width: 360px;
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
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}
.piece {
  aspect-ratio: 1;
  border: 2px solid #2a2a2a;
  border-radius: 3px;
  cursor: pointer;
  transition: border-color 0.15s;
  background-repeat: no-repeat;
}
.piece:hover {
  border-color: #3a3a3a;
}
.piece.selected {
  border-color: #4a9eff;
}
.piece.correct {
  border-color: #2a5a2a;
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
