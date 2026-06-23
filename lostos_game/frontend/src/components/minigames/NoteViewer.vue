<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="note-box">
      <div class="note-header">
        <span>📄 {{ filename }}</span>
        <button @click="$emit('close')">✕</button>
      </div>
      <pre class="note-body">{{ content }}</pre>
    </div>
  </div>
</template>

<script setup>
defineProps({ filename: String, content: String });
defineEmits(["close"]);
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
}
.note-box {
  background: #111;
  border: 1px solid #333;
  border-radius: 6px;
  width: 420px;
  max-width: 95vw;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.9);
}
.note-header {
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
.note-header button {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 13px;
}
.note-header button:hover {
  color: #ff4444;
}
.note-body {
  padding: 20px;
  color: #aaa;
  font-family: "Courier New", monospace;
  font-size: 12px;
  white-space: pre-wrap;
  line-height: 1.8;
  margin: 0;
  max-height: 340px;
  overflow-y: auto;
}
</style>
