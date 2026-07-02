<template>
  <Teleport to="body">
    <div class="tut-overlay" @click.self="skip">
      <!-- Agujero / spotlight -->
      <div
        v-if="hole"
        class="tut-hole"
        :style="{
          top: hole.top + 'px',
          left: hole.left + 'px',
          width: hole.width + 'px',
          height: hole.height + 'px',
        }"
      />
      <!-- Si no hay target, oscurece todo -->
      <div v-else class="tut-dim-full" />

      <!-- Tarjeta -->
      <div class="tut-card" :style="cardStyle">
        <div class="tut-step-count">{{ index + 1 }} / {{ steps.length }}</div>
        <div class="tut-title">{{ current.title }}</div>
        <div class="tut-text">{{ current.text }}</div>
        <div class="tut-actions">
          <button class="tut-skip" @click="skip">Saltar</button>
          <button class="tut-next" @click="next">
            {{ isLast ? "Entendido" : "Siguiente →" }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";

const emit = defineEmits(["finish"]);

const steps = [
  {
    selector: null,
    title: "Bienvenida a LOST-OS",
    text: "Este es tu escritorio. Explora las apps, busca pistas y desconfía de todo lo que encuentres.",
  },
  {
    selector: ".desktop-icons",
    title: "Iconos del escritorio",
    text: "Doble clic para abrir cada aplicación. Algunas guardan archivos, correos o fotos con pistas.",
  },
  {
    selector: ".taskbar-apps",
    title: "Apps abiertas",
    text: "Aquí verás lo que tienes abierto o minimizado. Haz clic para volver a una ventana.",
  },
  {
    selector: ".settings-btn",
    title: "Ajustes",
    text: "Desde aquí controlas el volumen y los efectos visuales (scanlines, glitch).",
  },
  {
    selector: null,
    title: "Un último consejo",
    text: "Fechas, horas y nombres se repiten en el sistema. Presta atención a los detalles.",
  },
];

const index = ref(0);
const hole = ref(null);
const current = computed(() => steps[index.value]);
const isLast = computed(() => index.value === steps.length - 1);

function updateHole() {
  const step = steps[index.value];
  if (!step.selector) {
    hole.value = null;
    return;
  }
  const el = document.querySelector(step.selector);
  if (!el) {
    hole.value = null;
    return;
  }
  const r = el.getBoundingClientRect();
  const pad = 8;
  hole.value = {
    top: r.top - pad,
    left: r.left - pad,
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
}

const cardStyle = computed(() => {
  if (!hole.value) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
  // Coloca la tarjeta debajo del hueco, o arriba si no hay espacio
  const spaceBelow = window.innerHeight - (hole.value.top + hole.value.height);
  const top =
    spaceBelow > 180
      ? hole.value.top + hole.value.height + 16
      : hole.value.top - 16;
  const translateY = spaceBelow > 180 ? "0" : "-100%";
  let left = hole.value.left;
  left = Math.min(Math.max(left, 12), window.innerWidth - 300);
  return {
    top: top + "px",
    left: left + "px",
    transform: `translateY(${translateY})`,
  };
});

function next() {
  if (isLast.value) {
    finish();
  } else {
    index.value++;
    nextTick(updateHole);
  }
}

function skip() {
  finish();
}

function finish() {
  emit("finish");
}

function onResize() {
  updateHole();
}

onMounted(() => {
  nextTick(updateHole);
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
});
</script>

<style scoped>
.tut-overlay {
  position: fixed;
  inset: 0;
  z-index: 30000;
  font-family: "Courier New", monospace;
}
.tut-dim-full {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.78);
}
.tut-hole {
  position: absolute;
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.78);
  border: 1px solid #cc3333;
  transition: all 0.25s ease;
  pointer-events: none;
}
.tut-card {
  position: absolute;
  width: 280px;
  background: #0d0d0d;
  border: 1px solid #cc3333;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 0 30px rgba(204, 51, 51, 0.25);
  transition: all 0.25s ease;
}
.tut-step-count {
  font-size: 10px;
  color: #555;
  letter-spacing: 1px;
  margin-bottom: 6px;
}
.tut-title {
  font-size: 14px;
  color: #cc3333;
  font-weight: bold;
  margin-bottom: 8px;
}
.tut-text {
  font-size: 12px;
  color: #aaa;
  line-height: 1.6;
  margin-bottom: 14px;
}
.tut-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.tut-skip {
  background: none;
  border: none;
  color: #555;
  font-size: 11px;
  cursor: pointer;
}
.tut-skip:hover {
  color: #999;
}
.tut-next {
  background: #1a0000;
  border: 1px solid #cc3333;
  color: #cc3333;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-family: "Courier New", monospace;
  transition: background 0.15s;
}
.tut-next:hover {
  background: #2a0000;
}
</style>