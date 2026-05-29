<script setup>
import { ref, onMounted } from "vue";
import interact from "interactjs";
import gsap from "gsap";
import { useSystem } from "../store/system.js";

const props = defineProps(["title"]);
const emit = defineEmits(["close", "minimize"]);
const system = useSystem();

const win = ref(null);
const titleBar = ref(null);
const isMaximized = ref(false);
let savedState = {};

function bringToFront() {
  const newZ = system.focusApp(props.title);
  if (win.value) win.value.style.zIndex = newZ;
}

function toggleMaximize() {
  if (!isMaximized.value) {
    savedState = {
      width: win.value.offsetWidth,
      height: win.value.offsetHeight,
      x: parseFloat(win.value.dataset.x) || 0,
      y: parseFloat(win.value.dataset.y) || 0,
    };
    gsap.to(win.value, {
      duration: 0.2,
      width: "100vw",
      height: "calc(100vh - 44px)",
      x: 0,
      y: 0,
      ease: "power2.out",
    });
    isMaximized.value = true;
  } else {
    gsap.to(win.value, {
      duration: 0.2,
      width: savedState.width,
      height: savedState.height,
      x: savedState.x,
      y: savedState.y,
      ease: "power2.out",
    });
    isMaximized.value = false;
  }
}

onMounted(() => {
  gsap.from(win.value, {
    duration: 0.2,
    scale: 0.9,
    opacity: 0,
    ease: "back.out(1.4)",
  });
  bringToFront();

  // ── DRAG ─────────────────────────────────────────────────────────────────
  interact(titleBar.value).draggable({
    listeners: {
      move(event) {
        if (isMaximized.value) return;
        const target = win.value;

        let x = (parseFloat(target.dataset.x) || 0) + event.dx;
        let y = (parseFloat(target.dataset.y) || 0) + event.dy;

        const TASKBAR = 44; // altura taskbar
        const TITLE_H = 36; // altura barra de título (siempre visible)
        const MIN_VIS = 80; // px mínimos visibles horizontalmente

        // posición absoluta base (sin el translate)
        const rect = target.getBoundingClientRect();
        const baseLeft = rect.left - (parseFloat(target.dataset.x) || 0);
        const baseTop = rect.top - (parseFloat(target.dataset.y) || 0);

        // límites verticales
        const minY = -baseTop; // no salir por arriba
        const maxY = window.innerHeight - TASKBAR - TITLE_H - baseTop; // no hundirse bajo taskbar

        // límites horizontales (siempre dejar MIN_VIS px visibles)
        const minX = -baseLeft - target.offsetWidth + MIN_VIS; // borde derecho visible
        const maxX = window.innerWidth - baseLeft - MIN_VIS; // borde izquierdo visible

        x = Math.min(Math.max(x, minX), maxX);
        y = Math.min(Math.max(y, minY), maxY);

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.dataset.x = x;
        target.dataset.y = y;
      },
    },
  });

  // ── RESIZE ───────────────────────────────────────────────────────────────
  interact(win.value).resizable({
    edges: {
      right: ".resize-r",
      bottom: ".resize-b",
      bottomRight: ".resize-rb",
    },
    modifiers: [
      interact.modifiers.restrictSize({
        min: { width: 300, height: 200 },
        max: { width: window.innerWidth, height: window.innerHeight - 44 },
      }),
    ],
    listeners: {
      move(event) {
        if (isMaximized.value) return;
        const target = event.target;
        target.style.width = `${event.rect.width}px`;
        target.style.height = `${event.rect.height}px`;
      },
    },
  });
});
</script>

<template>
  <div ref="win" class="window" @mousedown="bringToFront">
    <div ref="titleBar" class="title">
      <span class="title-text">{{ title }}</span>
      <div class="window-controls">
        <button class="ctrl-btn" @click="emit('minimize')">─</button>
        <button class="ctrl-btn" @click="toggleMaximize">□</button>
        <button class="ctrl-btn close" @click="emit('close')">✕</button>
      </div>
    </div>
    <div class="content"><slot /></div>
    <div class="resize-handle resize-r" />
    <div class="resize-handle resize-b" />
    <div class="resize-handle resize-rb" />
  </div>
</template>

<style scoped>
.window {
  position: absolute;
  top: 50px;
  left: 50px;
  width: 680px;
  min-width: 300px;
  min-height: 200px;
  background: #0d0d0d;
  border: 1px solid #333;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  touch-action: none;
}
.title {
  background: #161616;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  flex-shrink: 0;
  height: 36px;
  box-sizing: border-box;
}
.title-text {
  font-size: 12px;
  color: #aaa;
  font-family: "Segoe UI", sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.window-controls {
  display: flex;
  gap: 5px;
  flex-shrink: 0;
}
.ctrl-btn {
  border: none;
  background: #222;
  color: #aaa;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  transition: background 0.15s;
}
.ctrl-btn:hover {
  background: #333;
  color: #fff;
}
.ctrl-btn.close:hover {
  background: #c33;
  color: #fff;
}
.content {
  flex: 1;
  overflow: auto;
  min-height: 0;
}
.resize-handle {
  position: absolute;
  z-index: 10;
  background: transparent;
}
.resize-r {
  right: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  cursor: e-resize;
}
.resize-b {
  bottom: 0;
  left: 0;
  right: 0;
  height: 5px;
  cursor: s-resize;
}
.resize-rb {
  right: 0;
  bottom: 0;
  width: 10px;
  height: 10px;
  cursor: se-resize;
}
</style>
