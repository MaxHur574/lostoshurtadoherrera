<template>
  <Window title="📝 Notas" @close="$emit('close')" @minimize="$emit('minimize')">
    <div class="notes-app">

      <!-- Sidebar: carpetas -->
      <div class="notes-sidebar">
        <div
          v-for="folder in folders"
          :key="folder.id"
          class="notes-folder"
          :class="{ active: currentFolder === folder.id }"
          @click="selectFolder(folder.id)"
        >
          <span class="folder-icon">{{ folder.icon }}</span>
          <span class="folder-label">{{ folder.label }}</span>
          <span class="folder-count">{{ folder.notes.length }}</span>
        </div>
      </div>

      <!-- Lista de notas -->
      <div class="notes-list">
        <div
          v-for="note in currentNotes"
          :key="note.id"
          class="note-item"
          :class="{ active: selectedNote?.id === note.id }"
          @click="selectedNote = note"
        >
          <div class="note-title">{{ note.title }}</div>
          <div class="note-preview">{{ note.preview }}</div>
          <div class="note-date">{{ note.date }}</div>
        </div>
        <div v-if="currentNotes.length === 0" class="notes-empty">Sin notas</div>
      </div>

      <!-- Vista de nota -->
      <div class="note-view">
        <div v-if="selectedNote" class="note-content">
          <div class="note-view-title">{{ selectedNote.title }}</div>
          <div class="note-view-date">{{ selectedNote.date }}</div>
          <pre class="note-view-body">{{ selectedNote.body }}</pre>
        </div>
        <div v-else class="note-placeholder">Selecciona una nota</div>
      </div>

    </div>
  </Window>
</template>

<script setup>
import { ref, computed } from 'vue'
import Window from './Window.vue'

defineEmits(['close', 'minimize'])

const currentFolder = ref('mascotas')
const selectedNote  = ref(null)

const folders = ref([
  {
    id: 'mascotas',
    icon: '🐾',
    label: 'Mascotas',
    notes: [
      {
        id: 1,
        title: 'Luna',
        preview: 'comida · agua · próxima vacuna octubre',
        date: '12/05/2024',
        body:
`comida
agua
próxima vacuna octubre

Luna come a las 6.
Nunca se olvida.`,
      },
    ],
  },
  {
    id: 'personal',
    icon: '🔒',
    label: 'Personal',
    notes: [
      {
        id: 2,
        title: 'Recordatorio',
        preview: 'revisar correo antes de abrir carpeta privada',
        date: '08/05/2024',
        body:
`revisar correo antes de abrir carpeta privada`,
      },
    ],
  },
  {
    id: 'bitacora',
    icon: '📓',
    label: 'Bitácora',
    notes: [
      {
        id: 3,
        title: '29_octubre.txt',
        preview: '03:14 Otra vez esa hora...',
        date: '29/10/2020',
        body:
`03:14 Otra vez esa hora.

Revisé el primer informe y coincide exactamente.
La primera desaparición fue registrada a las 03:14.
La cámara volvió a captar movimiento a esa misma hora.

No puede seguir repitiéndose.
Mañana termino esto.`,
      },
    ],
  },
])

const currentNotes = computed(
  () => folders.value.find(f => f.id === currentFolder.value)?.notes ?? []
)

function selectFolder(id) {
  currentFolder.value = id
  selectedNote.value  = null
}
</script>

<style scoped>
.notes-app {
  display: flex;
  height: 460px;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
  background: #0d0d0d;
}

/* Sidebar */
.notes-sidebar {
  width: 150px;
  flex-shrink: 0;
  background: #111;
  border-right: 1px solid #1e1e1e;
  padding: 6px 0;
  overflow-y: auto;
}

.notes-folder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  cursor: pointer;
  color: #777;
  font-size: 12px;
  border-radius: 4px;
  margin: 1px 4px;
  transition: background 0.15s, color 0.15s;
}
.notes-folder:hover  { background: #1a1a1a; color: #bbb; }
.notes-folder.active { background: #1a3a5c; color: #fff; }

.folder-icon  { font-size: 13px; }
.folder-label { flex: 1; }
.folder-count {
  font-size: 10px;
  background: #1e1e1e;
  color: #555;
  padding: 1px 5px;
  border-radius: 8px;
}
.notes-folder.active .folder-count { background: #0f2a40; color: #4a9eff; }

/* Lista */
.notes-list {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid #1e1e1e;
  overflow-y: auto;
  background: #0f0f0f;
}

.note-item {
  padding: 10px 12px;
  border-bottom: 1px solid #141414;
  cursor: pointer;
  transition: background 0.15s;
}
.note-item:hover  { background: #161616; }
.note-item.active { background: #1a2a3a; }

.note-title   { font-size: 12px; color: #ccc; font-weight: 600; margin-bottom: 3px; }
.note-preview { font-size: 11px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note-date    { font-size: 10px; color: #333; margin-top: 4px; }

.notes-empty { padding: 20px; color: #333; text-align: center; font-size: 12px; }

/* Vista */
.note-view {
  flex: 1;
  overflow-y: auto;
  background: #0d0d0d;
}

.note-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #2a2a2a;
  font-size: 13px;
}

.note-content    { display: flex; flex-direction: column; padding: 16px; height: 100%; box-sizing: border-box; }
.note-view-title { font-size: 16px; color: #ccc; font-weight: 600; margin-bottom: 4px; }
.note-view-date  { font-size: 11px; color: #444; margin-bottom: 16px; }
.note-view-body  {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #888;
  white-space: pre-wrap;
  line-height: 1.8;
  margin: 0;
}
</style>
