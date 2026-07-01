<template>
  <div class="nm" @mousemove="onMouseMove" @mouseup="onMouseUp">

    <!-- Header -->
    <div class="nm-header">
      <div class="nm-header-left">
        <div class="nm-header-title">MINIJUEGO: RECONEXIÓN DE RED</div>
        <div class="nm-header-sub">PROTOCOLO DE ACCESO v2.4 · SECTOR 7G</div>
      </div>
      <div class="nm-header-right">
        <div class="nm-hstat">ESTADO: <span :class="solved ? 'clr-ok' : 'clr-warn'">{{ solved ? 'SINCRONIZADO' : 'ACTIVO' }}</span></div>
        <div class="nm-hstat">SEGURIDAD: <span class="clr-danger">ALTA</span></div>
      </div>
    </div>

    <!-- Title -->
    <div class="nm-bigtitle">VOLTAGE OVERRIDE</div>

    <!-- Main area -->
    <div class="nm-main">

      <!-- Nodos izquierda -->
      <div class="nm-col-left">
        <div
          v-for="node in puzzle.nodes"
          :key="node.id"
          class="nm-node"
          :class="{ 'nm-node--connected': getConnectionFrom(node.id) }"
          @contextmenu.prevent="disconnect(node.id)"
        >
          <div class="nm-node-tag">{{ node.id }}</div>
          <div class="nm-node-hex" @mousedown.stop="startDrag($event, node)">
            {{ node.id }}
          </div>
          <div class="nm-node-info">
            <div class="nm-node-label">Número:</div>
            <div class="nm-node-val">{{ node.value }}</div>
          </div>
        </div>
      </div>

      <!-- SVG cables -->
      <svg class="nm-cables-svg" ref="svgRef">
        <line
          v-for="(conn, i) in connections"
          :key="'c' + i"
          :x1="getLeftAnchor(conn.from).x"
          :y1="getLeftAnchor(conn.from).y"
          :x2="getRightAnchor(conn.to).x"
          :y2="getRightAnchor(conn.to).y"
          class="nm-line"
          :class="solved ? 'nm-line--solved' : 'nm-line--active'"
        />
        <line
          v-if="dragging"
          :x1="dragStart.x"   :y1="dragStart.y"
          :x2="dragCurrent.x" :y2="dragCurrent.y"
          class="nm-line nm-line--drag"
        />
      </svg>

      <!-- Operadores derecha -->
      <div class="nm-col-right">
        <div
          v-for="op in puzzle.ops"
          :key="op.id"
          class="nm-op"
          :class="{ 'nm-op--connected': getConnectionTo(op.id) }"
          @mouseup.stop="endDrag(op)"
        >
          <div class="nm-op-hex" :class="getConnectionTo(op.id) ? 'nm-op-hex--lit' : ''">
            {{ op.label }}
          </div>
          <div class="nm-op-info">
            <div class="nm-op-label">{{ op.label }}</div>
            <div class="nm-op-result">
              {{ getResultFor(op.id) !== null ? 'Resultado: ' + getResultFor(op.id) : '—' }}
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Bottom bar -->
    <div class="nm-bottom">

      <div class="nm-bottom-target">
        <div class="nm-bt-label">VOLTAJE OBJETIVO:</div>
        <div class="nm-bt-val">{{ puzzle.target }}</div>
      </div>

      <div class="nm-bottom-current">
        <div class="nm-bc-top">
          <span class="nm-bc-label">VOLTAJE ACTUAL: </span>
          <span class="nm-bc-val" :class="totalCorrect ? 'clr-ok' : 'clr-warn'">
            {{ currentTotal }}
          </span>
          <span v-if="totalCorrect" class="nm-bc-sync">SINCRONIZADO</span>
        </div>
        <div class="nm-progress-bar">
          <div
            class="nm-progress-fill"
            :style="{ width: progressPct + '%' }"
            :class="totalCorrect ? 'nm-progress--ok' : ''"
          />
        </div>
        <div v-if="totalCorrect" class="nm-sync-msg">VOLTAJE SINCRONIZADO [ÉXITO]</div>
      </div>

      <div class="nm-bottom-conns">
        <div class="nm-bc-label">CONEXIONES ACTIVAS</div>
        <div v-for="conn in connections" :key="conn.from + conn.to" class="nm-conn-item">
          {{ conn.from }} → {{ getOp(conn.to).label }}
        </div>
        <div class="nm-timer">TIMER: <span class="clr-warn">{{ timerDisplay }}</span></div>
      </div>

    </div>

    <!-- Footer -->
    <div class="nm-footer">
      <span>[ARRASTRAR] CONECTAR</span>
      <span>[CLIC DERECHO] DESCONECTAR</span>
      <span>RESUMEN DE CIRCUITO</span>
      <span>LOG DE CÁLCULOS</span>
    </div>

    <!-- Panel victoria -->
    <transition name="nm-win">
      <div v-if="solved" class="nm-win-panel">
        <div class="nm-win-title">// ACCESO CONCEDIDO</div>
        <div class="nm-win-sub">Red reconectada. Iniciando navegador...</div>
        <button class="nm-win-btn" @click="onComplete">CONTINUAR →</button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useMinigames } from '../../store/minigames.js'

const emit = defineEmits(['complete'])
const minigamesStore = useMinigames()

// ─── 4 Puzzles predefinidos ───────────────────────────────────────────────────
// Cada puzzle tiene nodos, ops mezclados visualmente, y target calculado
// La solución siempre es: A↔op1, B↔op2, C↔op3, D↔op4 (por índice, no por id)
// Los ids de ops están mezclados para que no sea obvio el orden

const PUZZLES = [
  // ── Puzzle 1 ── Suma total: 3×5 + 7×4 + 12×2 + 9×3 = 15+28+24+27 = 94
  {
    target: 94,
    nodes: [
      { id: 'A', value: 3  },
      { id: 'B', value: 7  },
      { id: 'C', value: 12 },
      { id: 'D', value: 9  },
    ],
    ops: shuffle([
      { id: 'op1', label: '×5', fn: (v) => v * 5 },  // A×5 = 15
      { id: 'op2', label: '×4', fn: (v) => v * 4 },  // B×4 = 28
      { id: 'op3', label: '×2', fn: (v) => v * 2 },  // C×2 = 24
      { id: 'op4', label: '×3', fn: (v) => v * 3 },  // D×3 = 27
    ]),
  },

  // ── Puzzle 2 ── 10+5 + 8×3 + 6×4 + 15+2 = 15+24+24+17 = 80
  {
    target: 80,
    nodes: [
      { id: 'A', value: 10 },
      { id: 'B', value: 8  },
      { id: 'C', value: 6  },
      { id: 'D', value: 15 },
    ],
    ops: shuffle([
      { id: 'op1', label: '+5', fn: (v) => v + 5  },  // A+5 = 15
      { id: 'op2', label: '×3', fn: (v) => v * 3  },  // B×3 = 24
      { id: 'op3', label: '×4', fn: (v) => v * 4  },  // C×4 = 24
      { id: 'op4', label: '+2', fn: (v) => v + 2  },  // D+2 = 17
    ]),
  },

  // ── Puzzle 3 ── 4×8 + 11+9 + 5×6 + 2×10 = 32+20+30+20 = 102
  {
    target: 102,
    nodes: [
      { id: 'A', value: 4  },
      { id: 'B', value: 11 },
      { id: 'C', value: 5  },
      { id: 'D', value: 2  },
    ],
    ops: shuffle([
      { id: 'op1', label: '×8',  fn: (v) => v * 8  },  // A×8  = 32
      { id: 'op2', label: '+9',  fn: (v) => v + 9  },  // B+9  = 20
      { id: 'op3', label: '×6',  fn: (v) => v * 6  },  // C×6  = 30
      { id: 'op4', label: '×10', fn: (v) => v * 10 },  // D×10 = 20
    ]),
  },

  // ── Puzzle 4 ── 20-8 + 6×7 + 13+4 + 3×9 = 12+42+17+27 = 98
  {
    target: 98,
    nodes: [
      { id: 'A', value: 20 },
      { id: 'B', value: 6  },
      { id: 'C', value: 13 },
      { id: 'D', value: 3  },
    ],
    ops: shuffle([
      { id: 'op1', label: '-8', fn: (v) => v - 8 },  // A-8 = 12
      { id: 'op2', label: '×7', fn: (v) => v * 7 },  // B×7 = 42
      { id: 'op3', label: '+4', fn: (v) => v + 4 },  // C+4 = 17
      { id: 'op4', label: '×9', fn: (v) => v * 9 },  // D×9 = 27
    ]),
  },
]

// ─── Shuffle helper ───────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Selección aleatoria del puzzle ──────────────────────────────────────────
const puzzle = ref(PUZZLES[Math.floor(Math.random() * PUZZLES.length)])

// ─── Estado ───────────────────────────────────────────────────────────────────
const svgRef      = ref(null)
const connections = ref([])   // { from: nodeId, to: opId }
const dragging    = ref(false)
const dragNode    = ref(null)
const dragStart   = ref({ x: 0, y: 0 })
const dragCurrent = ref({ x: 0, y: 0 })
const solved      = ref(false)

// ─── Timer ────────────────────────────────────────────────────────────────────
const seconds = ref(0)
let timerInterval = null
const timerDisplay = computed(() => {
  const m = String(Math.floor(seconds.value / 60)).padStart(2, '0')
  const s = String(seconds.value % 60).padStart(2, '0')
  return `${m}:${s}`
})

onMounted(() => {
  timerInterval = setInterval(() => { if (!solved.value) seconds.value++ }, 1000)
})
onUnmounted(() => clearInterval(timerInterval))

// ─── Lookups ──────────────────────────────────────────────────────────────────
const getNode = (id) => puzzle.value.nodes.find(n => n.id === id)
const getOp   = (id) => puzzle.value.ops.find(o => o.id === id)

const getConnectionFrom = (nodeId) => connections.value.find(c => c.from === nodeId)
const getConnectionTo   = (opId)   => connections.value.find(c => c.to === opId)

const getResultFor = (opId) => {
  const conn = getConnectionTo(opId)
  if (!conn) return null
  const node = getNode(conn.from)
  const op   = getOp(opId)
  if (!node || !op) return null
  return op.fn(node.value)
}

// ─── Total y victoria ─────────────────────────────────────────────────────────
const currentTotal = computed(() => {
  if (connections.value.length < puzzle.value.nodes.length) return '—'
  return puzzle.value.ops.reduce((sum, op) => {
    const r = getResultFor(op.id)
    return sum + (r ?? 0)
  }, 0)
})

const totalCorrect = computed(() =>
  connections.value.length === puzzle.value.nodes.length &&
  currentTotal.value === puzzle.value.target
)

const progressPct = computed(() => {
  if (currentTotal.value === '—') return 0
  return Math.min(100, Math.round((currentTotal.value / puzzle.value.target) * 100))
})

watch(totalCorrect, (v) => {
  if (v && !solved.value) setTimeout(() => { solved.value = true }, 600)
})

// ─── Anchors ──────────────────────────────────────────────────────────────────
const getLeftAnchor = (nodeId) => {
  const idx = puzzle.value.nodes.findIndex(n => n.id === nodeId)
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const step = svg.clientHeight / puzzle.value.nodes.length
  return { x: 0, y: step * idx + step / 2 }
}

const getRightAnchor = (opId) => {
  const idx = puzzle.value.ops.findIndex(o => o.id === opId)
  const svg = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const step = svg.clientHeight / puzzle.value.ops.length
  return { x: svg.clientWidth, y: step * idx + step / 2 }
}

// ─── SVG coords ───────────────────────────────────────────────────────────────
const getSVGCoords = (e) => {
  const svg  = svgRef.value
  if (!svg) return { x: 0, y: 0 }
  const rect = svg.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

// ─── Drag ─────────────────────────────────────────────────────────────────────
const startDrag = (e, node) => {
  if (solved.value) return
  dragging.value    = true
  dragNode.value    = node
  dragStart.value   = getLeftAnchor(node.id)
  dragCurrent.value = getLeftAnchor(node.id)
}

const onMouseMove = (e) => {
  if (!dragging.value) return
  dragCurrent.value = getSVGCoords(e)
}

const onMouseUp = (e) => {
  if (dragging.value) {
    dragging.value = false
    dragNode.value = null
  }
}

const endDrag = (op) => {
  if (!dragging.value || !dragNode.value) return
  dragging.value = false
  const nodeId = dragNode.value.id
  dragNode.value = null
  // Quitar conexiones previas del mismo nodo o al mismo operador
  connections.value = connections.value.filter(
    c => c.from !== nodeId && c.to !== op.id
  )
  connections.value.push({ from: nodeId, to: op.id })
}

const disconnect = (nodeId) => {
  connections.value = connections.value.filter(c => c.from !== nodeId)
}

// ─── Completar ────────────────────────────────────────────────────────────────
const onComplete = () => {
  minigamesStore.unlock('NetworkMinigame')
  emit('complete')
}
</script>

<style scoped>
.nm {
  position: relative;
  width: 100%;
  background: #0a1a0a;
  border: 2px solid #2a4a2a;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  color: #88cc88;
  overflow: hidden;
  user-select: none;
}

/* Header */
.nm-header {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: #0d1f0d;
  border-bottom: 1px solid #2a4a2a;
  font-size: 10px;
}
.nm-header-title { color: #88cc88; letter-spacing: .06em; }
.nm-header-sub   { color: #446644; margin-top: 2px; }
.nm-hstat        { color: #446644; text-align: right; }

/* Big title */
.nm-bigtitle {
  text-align: center;
  font-size: 22px;
  letter-spacing: .2em;
  color: #aaeaaa;
  padding: 10px 0 6px;
  text-shadow: 0 0 20px #44ff4488;
  border-bottom: 1px solid #2a4a2a;
}

/* Main */
.nm-main {
  display: flex;
  align-items: stretch;
  padding: 16px 0;
  min-height: 320px;
}

/* Col izquierda */
.nm-col-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 12px;
  justify-content: space-around;
  min-width: 140px;
}
.nm-node {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #0f2a0f;
  border: 1px solid #2a5a2a;
  border-radius: 4px;
  cursor: grab;
  transition: border-color .2s, box-shadow .2s;
}
.nm-node:active { cursor: grabbing; }
.nm-node--connected {
  border-color: #f0c040;
  box-shadow: 0 0 8px #f0c04044;
}
.nm-node-tag  { font-size: 9px; color: #446644; min-width: 14px; }
.nm-node-hex  {
  width: 44px; height: 44px;
  background: #1a3a1a;
  border: 2px solid #f0c040;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: bold;
  color: #f0c040;
  text-shadow: 0 0 10px #f0c04099;
  box-shadow: 0 0 12px #f0c04033;
  flex-shrink: 0;
}
.nm-node-info  { display: flex; flex-direction: column; gap: 2px; }
.nm-node-label { font-size: 9px; color: #446644; }
.nm-node-val   { font-size: 14px; color: #aaeaaa; font-weight: bold; }

/* SVG */
.nm-cables-svg {
  flex: 1;
  min-width: 160px;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 19px, #1a2a1a11 20px),
    repeating-linear-gradient(90deg, transparent, transparent 19px, #1a2a1a11 20px);
}
.nm-line              { stroke-width: 2.5; stroke-linecap: round; fill: none; }
.nm-line--active      { stroke: #f0c040; filter: drop-shadow(0 0 4px #f0c04088); }
.nm-line--drag        { stroke: #88cc8866; stroke-dasharray: 5 4; }
.nm-line--solved      {
  stroke: #00ffaa; stroke-width: 3;
  filter: drop-shadow(0 0 6px #00ffaa);
  animation: pulse-line 1.2s infinite;
}
@keyframes pulse-line { 0%,100%{opacity:1} 50%{opacity:.5} }

/* Col derecha */
.nm-col-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 12px;
  justify-content: space-around;
  min-width: 140px;
}
.nm-op {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #0f2a0f;
  border: 1px solid #2a5a2a;
  border-radius: 4px;
  transition: border-color .2s, box-shadow .2s;
}
.nm-op--connected {
  border-color: #44aaff;
  box-shadow: 0 0 8px #44aaff44;
}
.nm-op-hex {
  width: 44px; height: 44px;
  background: #0a2a3a;
  border: 2px solid #44aaff;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: bold;
  color: #44aaff;
  text-shadow: 0 0 10px #44aaff99;
  box-shadow: 0 0 12px #44aaff22;
  flex-shrink: 0;
  transition: background .2s, box-shadow .2s;
}
.nm-op-hex--lit {
  background: #0a3a5a;
  box-shadow: 0 0 20px #44aaff66;
  color: #88ccff;
}
.nm-op-info   { display: flex; flex-direction: column; gap: 2px; }
.nm-op-label  { font-size: 13px; color: #44aaff; font-weight: bold; }
.nm-op-result { font-size: 11px; color: #aaeaaa; }

/* Bottom */
.nm-bottom {
  display: flex;
  border-top: 1px solid #2a4a2a;
  background: #0d1f0d;
}
.nm-bottom-target {
  padding: 10px 16px;
  border-right: 1px solid #2a4a2a;
  min-width: 130px;
}
.nm-bt-label { font-size: 9px; color: #446644; margin-bottom: 4px; }
.nm-bt-val   {
  font-size: 32px; color: #aaeaaa; font-weight: bold;
  letter-spacing: .05em; text-shadow: 0 0 12px #44ff4444;
}
.nm-bottom-current {
  flex: 1;
  padding: 10px 16px;
  border-right: 1px solid #2a4a2a;
}
.nm-bc-top   { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.nm-bc-label { font-size: 10px; color: #446644; }
.nm-bc-val   { font-size: 18px; font-weight: bold; }
.nm-bc-sync  { font-size: 10px; color: #00ffaa; letter-spacing: .08em; }
.nm-sync-msg { font-size: 10px; color: #00ffaa; margin-top: 4px; letter-spacing: .06em; }
.nm-progress-bar {
  height: 14px;
  background: #1a2a1a;
  border: 1px solid #2a4a2a;
  border-radius: 2px;
  overflow: hidden;
}
.nm-progress-fill {
  height: 100%;
  background: repeating-linear-gradient(90deg, #f0c040 0px,#f0c040 8px,#c89820 9px,#c89820 10px);
  transition: width .3s;
}
.nm-progress--ok {
  background: repeating-linear-gradient(90deg, #00ffaa 0px,#00ffaa 8px,#00cc88 9px,#00cc88 10px);
}
.nm-bottom-conns {
  padding: 10px 16px;
  min-width: 160px;
  font-size: 10px;
}
.nm-conn-item { color: #f0c040; margin: 2px 0; }
.nm-timer     { margin-top: 8px; color: #446644; }

/* Footer */
.nm-footer {
  display: flex;
  gap: 24px;
  padding: 5px 16px;
  background: #0a150a;
  border-top: 1px solid #1a3a1a;
  font-size: 9px;
  color: #2a5a2a;
  letter-spacing: .05em;
}

/* Colores */
.clr-ok     { color: #00ffaa; }
.clr-warn   { color: #f0c040; }
.clr-danger { color: #ff4444; }

/* Victoria */
.nm-win-panel {
  position: absolute; inset: 0;
  background: rgba(7,21,7,.92);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px;
  backdrop-filter: blur(2px);
}
.nm-win-title {
  font-size: 22px; color: #00ffaa;
  letter-spacing: .14em; text-shadow: 0 0 20px #00ffaa;
}
.nm-win-sub { font-size: 11px; color: #88cc88; letter-spacing: .06em; }
.nm-win-btn {
  margin-top: 8px;
  background: #00ffaa22;
  border: 1px solid #00ffaa;
  color: #00ffaa;
  font-family: 'Courier New', monospace;
  font-size: 12px; letter-spacing: .1em;
  padding: 8px 24px; border-radius: 4px;
  cursor: pointer; transition: background .2s;
}
.nm-win-btn:hover { background: #00ffaa33; }
.nm-win-enter-active { transition: opacity .5s; }
.nm-win-enter-from   { opacity: 0; }
</style>