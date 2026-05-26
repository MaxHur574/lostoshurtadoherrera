<template>
  <div class="vault-loader">
    <div class="vault-logo">
      <div class="vault-hex">⬡</div>
      <div class="vault-title">LOSTO<span class="vault-os">OS</span></div>
      <div class="vault-sub">Panel de Administración v0.1</div>
    </div>

    <div class="vault-progress-wrap">
      <div class="vault-progress-bar">
        <div class="vault-progress-fill" :style="{ width: progress + '%' }" />
      </div>
      <div class="vault-progress-label">{{ statusText }}</div>
    </div>

    <div class="vault-scanlines" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const emit = defineEmits(["done"]);

const progress = ref(0);
const statusText = ref("Inicializando sistema...");

const steps = [
  { at: 0,   text: "Inicializando sistema..." },
  { at: 20,  text: "Cargando módulos de seguridad..." },
  { at: 40,  text: "Verificando integridad..." },
  { at: 65,  text: "Montando particiones cifradas..." },
  { at: 85,  text: "Estableciendo sesión..." },
  { at: 100, text: "Acceso concedido." },
];

onMounted(() => {
  const duration = 3200; // ms total de la pantalla de carga
  const interval = 30;
  const step = 100 / (duration / interval);

  const timer = setInterval(() => {
    progress.value = Math.min(progress.value + step, 100);

    const current = steps.slice().reverse().find(s => progress.value >= s.at);
    if (current) statusText.value = current.text;

    if (progress.value >= 100) {
      clearInterval(timer);
      setTimeout(() => emit("done"), 600);
    }
  }, interval);
});
</script>

<style scoped>
.vault-loader {
  position: fixed;
  inset: 0;
  background: #080808;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  font-family: 'Courier New', monospace;
  z-index: 9999;
}

.vault-logo {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.vault-hex {
  font-size: 52px;
  color: #cc3333;
  text-shadow: 0 0 20px #cc3333, 0 0 40px #cc3333;
  animation: hex-pulse 2s infinite;
  line-height: 1;
}

@keyframes hex-pulse {
  0%, 100% { opacity: 1; text-shadow: 0 0 20px #cc3333, 0 0 40px #cc3333; }
  50%       { opacity: 0.55; text-shadow: 0 0 8px #cc3333; }
}

.vault-title {
  font-size: 36px;
  color: #ddd;
  letter-spacing: 10px;
  font-weight: bold;
  margin-top: 4px;
}

.vault-os { color: #cc3333; }

.vault-sub {
  font-size: 11px;
  color: #333;
  letter-spacing: 3px;
  margin-top: 2px;
}

.vault-progress-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 280px;
}

.vault-progress-bar {
  width: 100%;
  height: 2px;
  background: #1a1a1a;
  border-radius: 2px;
  overflow: hidden;
}

.vault-progress-fill {
  height: 100%;
  background: #cc3333;
  box-shadow: 0 0 8px #cc3333;
  transition: width 0.08s linear;
  border-radius: 2px;
}

.vault-progress-label {
  font-size: 10px;
  color: #444;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.vault-scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.12) 3px,
    rgba(0, 0, 0, 0.12) 4px
  );
  pointer-events: none;
}
</style>