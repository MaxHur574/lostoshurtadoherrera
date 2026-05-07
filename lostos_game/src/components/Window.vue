<script setup>
import { ref, onMounted, onUnmounted } from "vue";
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
      x: 0, y: 0, 
      ease: "power2.out" 
    });
    isMaximized.value = true;
  } else {
    gsap.to(win.value, { 
      duration: 0.2, 
      width: savedState.width, 
      height: savedState.height, 
      x: savedState.x, y: savedState.y, 
      ease: "power2.out" 
    });
    isMaximized.value = false;
  }
}

onMounted(() => {
  gsap.from(win.value, { duration: 0.2, scale: 0.9, opacity: 0, ease: "back.out(1.4)" });
  bringToFront();

  interact(titleBar.value).draggable({
    listeners: {
      move(event) {
        if (isMaximized.value) return;
        const target = win.value;
        const x = (parseFloat(target.dataset.x) || 0) + event.dx;
        const y = (parseFloat(target.dataset.y) || 0) + event.dy;
        target.style.transform = `translate(${x}px, ${y}px)`;
        target.dataset.x = x;
        target.dataset.y = y;
      }
    }
  });

  interact(win.value).resizable({
    edges: { right: ".resize-r", bottom: ".resize-b", bottomRight: ".resize-rb" },
    listeners: {
      move(event) {
        if (isMaximized.value) return;
        Object.assign(event.target.style, {
          width: `${event.rect.width}px`,
          height: `${event.rect.height}px`
        });
      }
    }
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
    <div class="resize-handle resize-r" /><div class="resize-handle resize-b" /><div class="resize-handle resize-rb" />
  </div>
</template>

<style scoped>
/* Mantén tus estilos originales aquí, funcionan perfecto */
.window { position: absolute; top: 50px; left: 50px; min-width: 300px; background: #0d0d0d; border: 1px solid #333; display: flex; flex-direction: column; border-radius: 6px; overflow: hidden; touch-action: none; }
.title { background: #161616; padding: 8px; display: flex; justify-content: space-between; cursor: move; }
.window-controls { display: flex; gap: 5px; }
.ctrl-btn { border: none; background: #222; color: #aaa; cursor: pointer; padding: 2px 8px; }
.ctrl-btn.close:hover { background: #c33; }
.content { flex: 1; overflow: auto; }
.resize-handle { position: absolute; z-index: 10; background: transparent; }
.resize-r { right: 0; top: 0; bottom: 0; width: 5px; cursor: e-resize; }
.resize-b { bottom: 0; left: 0; right: 0; height: 5px; cursor: s-resize; }
.resize-rb { right: 0; bottom: 0; width: 10px; height: 10px; cursor: se-resize; }
</style>