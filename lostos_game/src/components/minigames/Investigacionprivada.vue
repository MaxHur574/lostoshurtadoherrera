<template>
  <Window
    title="📁 Investigación Privada"
    @close="$emit('close')"
    @minimize="$emit('minimize')"
  >
    <div class="inv-app">
      <!-- Lista de archivos -->
      <div class="file-list">
        <div
          v-for="nota in notas"
          :key="nota.key"
          class="file-item"
          :class="{
            locked: !mg.unlocked[nota.key],
            selected: selected === nota.key,
          }"
          @click="selected = nota.key"
          @dblclick="openNota(nota)"
        >
          <span class="file-icon">{{
            mg.unlocked[nota.key] ? "📄" : "🔒"
          }}</span>
          <div class="file-info">
            <div class="file-name">{{ nota.filename }}</div>
            <div class="file-sub">
              {{
                mg.unlocked[nota.key]
                  ? "Desbloqueado · doble clic para leer"
                  : "Bloqueado · doble clic para desbloquear"
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- Panel derecho -->
      <div class="file-preview">
        <div v-if="!selected" class="preview-empty">
          Selecciona un archivo para ver detalles.
        </div>
        <div v-else class="preview-info">
          <div class="pi-name">{{ currentNota?.filename }}</div>
          <div class="pi-row">
            <span>Estado</span
            ><span>{{
              mg.unlocked[currentNota?.key] ? "🟢 Desbloqueado" : "🔴 Bloqueado"
            }}</span>
          </div>
          <div class="pi-row">
            <span>Tipo</span><span>.val — archivo cifrado</span>
          </div>
          <div class="pi-row"><span>Autor</span><span>E.V.</span></div>
          <div class="pi-hint">
            {{
              mg.unlocked[currentNota?.key]
                ? "Doble clic para leer el contenido."
                : "Doble clic para iniciar el minijuego de desbloqueo."
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Minijuegos -->
    <Teleport to="body">
      <PuzzleMinigame
        v-if="activeGame === 'Pista_1'"
        @close="activeGame = null"
        @win="onWin('Pista_1')"
      />
      <CalendarMinigame
        v-if="activeGame === 'Pista_2'"
        @close="activeGame = null"
        @win="onWin('Pista_2')"
      />
      <RecoveryMinigame
        v-if="activeGame === 'Pista_3'"
        @close="activeGame = null"
        @win="onWin('Pista_3')"
      />
    </Teleport>

    <!-- Nota desbloqueada -->
    <Teleport to="body">
      <NoteViewer
        v-if="openedNote"
        :filename="openedNote.filename"
        :content="openedNote.content"
        @close="openedNote = null"
      />
    </Teleport>
  </Window>
</template>

<script setup>
import { ref, computed } from "vue";
import Window from "../Window.vue";
import PuzzleMinigame from "./PuzzleMinigame.vue";
import CalendarMinigame from "./CalendarMinigame.vue";
import RecoveryMinigame from "./RecoveryMinigame.vue";
import NoteViewer from "./NoteViewer.vue";
import { useMinigames } from "../../store/minigames.js";

defineEmits(["close", "minimize"]);

const mg = useMinigames();
const selected = ref(null);
const activeGame = ref(null);
const openedNote = ref(null);

const notas = [
  {
    key: "Pista_1",
    filename: "Pista_1",
    content: `EXPEDIENTE #14

Víctima encontrada sin identificación oficial.
La escena fue acordonada a las 03:14 AM.

[DATOS ELIMINADOS]

El cuerpo presentaba signos de...`,
  },
  {
    key: "Pista_2",
    filename: "Pista_2",
    content: `REGISTRO DE DESAPARICIONES

3 casos archivados durante octubre.

Las fechas coinciden con los reportes no oficiales enviados por V.H.

[ARCHIVO INCOMPLETO]`,
  },
  {
    key: "Pista_3",
    filename: "Pista_3",
    content: `14 DE OCTUBRE DE 2020

La policía local descarta relación entre los incidentes.

Sin embargo, documentos internos indican actividad no registrada en la zona industrial norte.`,
  },
];

const currentNota = computed(() => notas.find((n) => n.key === selected.value));

function openNota(nota) {
  if (mg.unlocked[nota.key]) {
    // Ya desbloqueada → mostrar nota directo
    openedNote.value = nota;
  } else {
    // Bloqueada → lanzar minijuego
    activeGame.value = nota.key;
  }
}

function onWin(key) {
  mg.unlock(key);
  activeGame.value = null;
  // Abrir la nota inmediatamente al ganar
  const nota = notas.find((n) => n.key === key);
  if (nota) openedNote.value = nota;
}
</script>

<style scoped>
.inv-app {
  display: flex;
  height: 380px;
  font-family: "Segoe UI", sans-serif;
  font-size: 13px;
}

/* Lista izquierda */
.file-list {
  width: 240px;
  flex-shrink: 0;
  background: #0f0f0f;
  border-right: 1px solid #1e1e1e;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #141414;
  cursor: pointer;
  transition: background 0.15s;
}
.file-item:hover {
  background: #161616;
}
.file-item.selected {
  background: #1a2a3a;
}
.file-item.locked {
  opacity: 0.75;
}

.file-icon {
  font-size: 22px;
  flex-shrink: 0;
}
.file-name {
  font-size: 12px;
  color: #ccc;
}
.file-sub {
  font-size: 10px;
  color: #444;
  margin-top: 2px;
}
.file-item.locked .file-sub {
  color: #6a2a2a;
}

/* Panel derecho */
.file-preview {
  flex: 1;
  background: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-empty {
  color: #2a2a2a;
  font-size: 12px;
  text-align: center;
}

.preview-info {
  padding: 24px;
  width: 100%;
}

.pi-name {
  font-size: 13px;
  color: #888;
  font-family: "Courier New", monospace;
  margin-bottom: 16px;
  border-bottom: 1px solid #1a1a1a;
  padding-bottom: 8px;
}

.pi-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #555;
  padding: 4px 0;
  border-bottom: 1px solid #111;
}
.pi-row span:last-child {
  color: #777;
  font-family: "Courier New", monospace;
}

.pi-hint {
  margin-top: 16px;
  font-size: 11px;
  color: #3a5a3a;
  font-style: italic;
}
</style>
