<template>
  <Teleport to="body">
    <div class="endgame-root" ref="rootRef">

      <!-- ══ FASE 1: Bóveda abierta con el archivo ══ -->
      <Transition name="phase-fade">
        <div v-if="phase === 'vault'" class="vault-open-screen">
          <div class="vo-toolbar">
            <span class="vo-path">// bóveda_principal / IDENTIDAD_CREADOR /</span>
            <span class="vo-badge">✓ Acceso manual concedido</span>
          </div>
          <div class="vo-files">
            <div
              class="vo-file"
              :class="{ selected: fileSelected }"
              @click="fileSelected = true"
              @dblclick="openIdentidadFile"
            >
              <span class="vo-file-icon">📄</span>
              <div class="vo-file-info">
                <div class="vo-file-name">IDENTIDAD_CREADOR.txt</div>
                <div class="vo-file-meta">2.4 KB · texto cifrado · doble clic para abrir</div>
              </div>
            </div>
          </div>
          <div class="vo-statusbar">1 archivo — Bóveda desbloqueada</div>
        </div>
      </Transition>

      <!-- ══ FASE 2: Visor del archivo con animación de carga → ERROR ══ -->
      <Transition name="phase-fade">
        <div v-if="phase === 'reading'" class="reading-screen">
          <div class="rs-header">
            <span class="rs-filename">📄 IDENTIDAD_CREADOR.txt</span>
            <div class="rs-dots">
              <span v-for="i in 3" :key="i" class="rs-dot" :style="{ animationDelay: (i * 0.25) + 's' }" />
            </div>
          </div>
          <div class="rs-terminal">
            <div
              v-for="(line, i) in visibleReadLines"
              :key="i"
              class="rs-line"
              :class="line.type"
            >{{ line.text }}</div>
            <span v-if="showCursor" class="rs-cursor">_</span>
          </div>
        </div>
      </Transition>

      <!-- ══ FASE 3: ERROR → datos del jugador ══ -->
      <Transition name="phase-fade">
        <div v-if="phase === 'error'" class="error-screen">
          <div class="err-header">
            <span class="rs-filename">📄 IDENTIDAD_CREADOR.txt</span>
          </div>
          <div class="err-terminal">
            <div v-for="(line, i) in readLines" :key="'rl' + i" class="rs-line" :class="line.type">{{ line.text }}</div>

            <div class="err-block" :class="{ visible: errorVisible }">
              <div class="err-title">ERROR</div>
              <div class="err-sub">IDENTIDAD NO ENCONTRADA</div>
              <div class="err-divider" />
            </div>

            <div class="player-data" :class="{ visible: playerDataVisible }">
              <div class="pd-separator">══════════════════════════════</div>
              <div class="pd-title">HISTORIAL DEL JUGADOR</div>
              <div class="pd-separator">══════════════════════════════</div>
              <div class="pd-row">
                <span class="pd-label">Sesión activa</span>
                <span class="pd-val">usuario local</span>
              </div>
              <div class="pd-row">
                <span class="pd-label">Equipo detectado</span>
                <span class="pd-val typed">{{ typedHostname }}</span>
              </div>
              <div class="pd-row">
                <span class="pd-label">Hora de ingreso</span>
                <span class="pd-val typed">{{ typedTime }}</span>
              </div>
              <div class="pd-row">
                <span class="pd-label">Estado</span>
                <span class="pd-val pd-val-red typed">{{ typedStatus }}</span>
              </div>
              <div class="pd-separator pd-sep-dim">──────────────────────────────</div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ══ FASE 4: Chat del administrador ══ -->
      <Transition name="chat-slide">
        <div v-if="showAdminChat" class="admin-chat-window" ref="chatWindowRef">
          <div class="ac-header">
            <div class="ac-dots">
              <span class="ac-dot red" />
              <span class="ac-dot yellow" />
              <span class="ac-dot green" />
            </div>
            <span class="ac-title">CHAT DEL ADMINISTRADOR</span>
            <span class="ac-status">● EN LÍNEA</span>
          </div>
          <div class="ac-body">
            <div class="ac-messages">
              <div
                v-for="(msg, i) in visibleChatLines"
                :key="i"
                class="ac-msg"
              >
                <span class="ac-sender">ADMIN</span>
                <span class="ac-text">{{ msg }}</span>
              </div>
            </div>
          </div>
          <div class="ac-footer">
            <button
              ref="transmitBtnRef"
              class="ac-btn"
              :class="{ 'ac-btn-hover': btnHovered, 'ac-btn-pulse': btnPulse }"
              @click="onTransmitClick"
              @mouseenter="btnHovered = true"
              @mouseleave="btnHovered = false"
            >
              [ INICIAR TRANSMISIÓN ]
            </button>
          </div>
        </div>
      </Transition>

      <!-- ══ CURSOR FANTASMA ══ -->
      <div
        v-if="showGhostCursor"
        class="ghost-cursor"
        :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
      >▌</div>

      <!-- ══ OVERLAY DE GLITCH ══ -->
      <div v-if="glitching" class="glitch-overlay" />

      <!-- ══ SCANLINES ACELERADAS (activo durante secuencia del cursor) ══ -->
      <div v-if="scanlinesActive" class="scanlines-fast-overlay" />

      <!-- ══ FADE A NEGRO ══ -->
      <Transition name="blackout">
        <div v-if="fadeToBlack" class="blackout-screen">
          <div class="blackout-noise" />
        </div>
      </Transition>

      <!-- ══ PANTALLA FINAL ══ -->
      <Transition name="finale-fade">
        <div v-if="showFinale" class="finale-screen">
          <div class="finale-scanlines" />
          <div class="finale-content">
            <div class="finale-logo">⬡</div>
            <div class="finale-title">LOSTO<span class="finale-os">OS</span></div>
            <div class="finale-divider">══════════════════════════════════════</div>
            <div class="finale-msg-wrap">
              <div
                v-for="(line, i) in finaleLines"
                :key="i"
                class="finale-line"
                :class="{ visible: visibleFinaleLines > i }"
              >{{ line }}</div>
            </div>
            <div class="finale-divider finale-divider-dim">──────────────────────────────</div>
            <div class="finale-sub" :class="{ visible: visibleFinaleLines >= finaleLines.length }">
              FIN DE LA SESIÓN
            </div>
            <div class="finale-case" :class="{ visible: visibleFinaleLines >= finaleLines.length + 1 }">
              CASO 0047 — ARCHIVADO
            </div>
          </div>
        </div>
      </Transition>

    </div>
  </Teleport>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const emit = defineEmits(['done'])

// ── Refs de DOM ───────────────────────────────────────────────────────────────
const rootRef        = ref(null)
const chatWindowRef  = ref(null)
const transmitBtnRef = ref(null)

// ── Estado de fases ───────────────────────────────────────────────────────────
const phase           = ref('vault')
const fileSelected    = ref(false)
const showAdminChat   = ref(false)
const showGhostCursor = ref(false)
const glitching       = ref(false)
const scanlinesActive = ref(false)
const fadeToBlack     = ref(false)
const showFinale      = ref(false)

// ── Fase 2: lector ────────────────────────────────────────────────────────────
const visibleReadLines = ref([])
const showCursor       = ref(true)

const readLines = [
  { text: '> Cargando archivo...', type: 'ok' },
  { text: '> Leyendo identidad del creador...', type: 'ok' },
  { text: '> Comparando registros...', type: 'ok' },
  { text: '', type: 'ok' },
]

// ── Fase 3: error + datos ─────────────────────────────────────────────────────
const errorVisible      = ref(false)
const playerDataVisible = ref(false)

const realTime    = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const hostname    = window.location.hostname || 'EQUIPO_LOCAL'
const displayHost = hostname === 'localhost' || hostname === '' ? 'EQUIPO_LOCAL' : hostname.toUpperCase()

const typedHostname = ref('')
const typedTime     = ref('')
const typedStatus   = ref('')

function typeText(target, text, delay = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        target.value += text[i]
        i++
        if (i >= text.length) {
          clearInterval(interval)
          resolve()
        }
      }, 38)
    }, delay)
  })
}

// ── Fase 4: Chat ──────────────────────────────────────────────────────────────
const visibleChatLines = ref([])
const btnHovered       = ref(false)
const btnPulse         = ref(false)

const chatMessages = [
  'No estabas buscando a Valeria.',
  'Estabas entrando.',
  'Ahora eres el siguiente lote.',
]

// ── Cursor fantasma ───────────────────────────────────────────────────────────
const cursorX = ref(-100)
const cursorY = ref(-100)

// ── Finale ────────────────────────────────────────────────────────────────────
const visibleFinaleLines = ref(0)
const finaleLines = [
  'La transmisión fue iniciada.',
  'Tu sesión ha sido registrada.',
  'Tu equipo ha sido añadido al sistema.',
  '',
  'Valeria nunca encontró al creador.',
  'Pero el sistema encontró a alguien más.',
]

// ── Flujo principal ───────────────────────────────────────────────────────────
function openIdentidadFile() {
  phase.value = 'reading'
  showCursor.value = true

  readLines.forEach((line, i) => {
    setTimeout(() => {
      visibleReadLines.value.push(line)
    }, i * 700)
  })

  setTimeout(() => {
    phase.value = 'error'
    showCursor.value = false
    animateErrorPhase()
  }, readLines.length * 700 + 600)
}

async function animateErrorPhase() {
  await sleep(500)
  errorVisible.value = true

  await sleep(1400)
  playerDataVisible.value = true

  await typeText(typedHostname, displayHost, 300)
  await typeText(typedTime, realTime, 200)
  await typeText(typedStatus, 'vinculado al lote actual', 200)

  await sleep(1200)
  launchAdminChat()
}

async function launchAdminChat() {
  showAdminChat.value = true

  await sleep(600)

  for (let i = 0; i < chatMessages.length; i++) {
    await sleep(i === 0 ? 400 : 1100)
    visibleChatLines.value.push(chatMessages[i])
  }

  await sleep(800)
  btnPulse.value = true

  await sleep(600)
  startGhostCursor()
}

// ── CURSOR FANTASMA — secuencia completa con resistencia y jalón ──────────────
async function startGhostCursor() {
  showGhostCursor.value = true
  scanlinesActive.value = true

  // Posición inicial: esquina superior izquierda, lejos del botón
  cursorX.value = window.innerWidth * 0.15
  cursorY.value = window.innerHeight * 0.22

  await sleep(300)
  await nextTick()

  const btn = transmitBtnRef.value
  if (!btn) { onTransmitClick(); return }

  const rect   = btn.getBoundingClientRect()
  const targetX = rect.left + rect.width  / 2 - 8
  const targetY = rect.top  + rect.height / 2 - 8

  const proxy = { x: cursorX.value, y: cursorY.value, skew: 0 }
  const root  = rootRef.value

  // ── FASE A: Inclinación progresiva de la pantalla a lo largo de toda la secuencia
  gsap.to(proxy, {
    duration: 5.2,
    skew: 4,
    ease: 'power2.in',
    onUpdate: () => {
      if (root) root.style.transform = `skewX(${proxy.skew}deg)`
    },
  })

  // ── FASE B: El cursor HUYE — corre en dirección opuesta al botón ─────────────
  // El botón está abajo-derecha, así que huye hacia arriba-izquierda
  const fleeX = window.innerWidth  * 0.72
  const fleeY = window.innerHeight * 0.12

  gsap.to(proxy, {
    duration: 0.85,
    x: fleeX,
    y: fleeY,
    ease: 'power3.out',
    onUpdate: () => {
      cursorX.value = proxy.x
      cursorY.value = proxy.y
    },
  })

  await sleep(900)

  // ── FASE C: Frena — como si algo lo detuviera a la fuerza ────────────────────
  gsap.to(proxy, {
    duration: 0.55,
    x: fleeX * 0.65,
    y: fleeY * 1.5,
    ease: 'power3.out',
    onUpdate: () => {
      cursorX.value = proxy.x
      cursorY.value = proxy.y
    },
  })

  await sleep(580)

  // ── FASE D: Temblor / tensión — vibración rápida en su sitio ─────────────────
  const shakeOriginX = proxy.x
  const shakeOriginY = proxy.y

  // 14 sacudidas con amplitud decreciente (como luchando pero perdiendo)
  for (let i = 0; i < 14; i++) {
    await sleep(52)
    const amp = 22 - i * 1.2   // disminuye gradualmente
    cursorX.value = shakeOriginX + (Math.random() - 0.5) * amp * 2
    cursorY.value = shakeOriginY + (Math.random() - 0.5) * amp
  }

  // Volver al origen exacto antes del jalón
  cursorX.value = shakeOriginX
  cursorY.value = shakeOriginY
  proxy.x = shakeOriginX
  proxy.y = shakeOriginY

  await sleep(180)

  // ── FASE E: Corrupción de texto en el chat mientras se pierde el control ─────
  corruptChat()

  await sleep(350)

  // ── FASE F: Primera atracción — movimiento medio hacia el target ──────────────
  gsap.to(proxy, {
    duration: 0.55,
    x: shakeOriginX + (targetX - shakeOriginX) * 0.42,
    y: shakeOriginY + (targetY - shakeOriginY) * 0.38,
    ease: 'power1.in',
    onUpdate: () => {
      cursorX.value = proxy.x
      cursorY.value = proxy.y
    },
  })

  await sleep(520)

  // ── FASE G: Jalón inevitable — aceleración brutal e imparable ────────────────
  gsap.to(proxy, {
    duration: 0.75,
    x: targetX,
    y: targetY,
    ease: 'power4.in',
    onUpdate: () => {
      cursorX.value = proxy.x
      cursorY.value = proxy.y
      // La inclinación se dispara en el tramo final
      const t = gsap.getProperty(proxy, 'progress') || 0
      if (root) {
        const extraSkew = Math.min(proxy.skew + t * 3.5, 8)
        root.style.transform = `skewX(${extraSkew}deg)`
      }
    },
    onComplete: () => {
      // Limpiar efectos y disparar el click
      scanlinesActive.value = false
      if (root) {
        gsap.to(root, { duration: 0.15, skewX: 0, clearProps: 'transform' })
      }
      setTimeout(onTransmitClick, 120)
    },
  })
}

// ── Corrupción de caracteres individuales del chat ────────────────────────────
function corruptChat() {
  const textEls = document.querySelectorAll('.ac-text')

  textEls.forEach(el => {
    const original = el.textContent
    const chars = [...original]

    // Envolver cada carácter en su propio span
    el.innerHTML = chars
      .map(c => `<span class="corrupt-char">${c === ' ' ? '&nbsp;' : c}</span>`)
      .join('')

    el.querySelectorAll('.corrupt-char').forEach((span, i) => {
      const dx    = (Math.random() - 0.5) * 22
      const dy    = (Math.random() - 0.5) * 14
      const rot   = (Math.random() - 0.5) * 30
      const delay = i * 0.022

      gsap.to(span, {
        duration: 0.45,
        x: dx,
        y: dy,
        rotation: rot,
        opacity: Math.random() * 0.45 + 0.25,
        color: Math.random() > 0.65 ? '#ff1111' : undefined,
        ease: 'power2.out',
        delay,
      })
    })
  })

  // La ventana entera también se sacude
  const chatWin = chatWindowRef.value
  if (chatWin) {
    gsap.to(chatWin, {
      duration: 0.07,
      x: 'random(-7, 7)',
      y: 'random(-5, 5)',
      repeat: 14,
      yoyo: true,
      ease: 'none',
      onComplete: () => {
        gsap.set(chatWin, { x: 0, y: 0 })
      },
    })
  }
}

// ── Click en el botón de transmisión ─────────────────────────────────────────
async function onTransmitClick() {
  showGhostCursor.value = false
  scanlinesActive.value = false
  btnPulse.value  = false
  btnHovered.value = false

  // Limpiar cualquier inclinación residual
  if (rootRef.value) {
    gsap.to(rootRef.value, { duration: 0.1, skewX: 0, clearProps: 'transform' })
  }

  // Glitch fuerte en ráfagas
  for (let i = 0; i < 6; i++) {
    await sleep(55)
    glitching.value = !glitching.value
  }
  glitching.value = true

  await sleep(280)

  // Parpadeo rápido
  for (let i = 0; i < 10; i++) {
    await sleep(70)
    glitching.value = !glitching.value
  }
  glitching.value = false

  await sleep(180)

  // Fade a negro
  fadeToBlack.value  = true
  showAdminChat.value = false

  await sleep(1800)

  // Pantalla final
  showFinale.value = true
  phase.value = ''

  await sleep(600)

  for (let i = 0; i <= finaleLines.length + 1; i++) {
    await sleep(900)
    visibleFinaleLines.value = i + 1
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// Bloquear el mouse del jugador durante la secuencia del cursor fantasma
function suppressMouseEvents(e) {
  if (showGhostCursor.value) {
    e.stopPropagation()
    e.preventDefault()
  }
}

onMounted(() => {
  document.addEventListener('mousemove', suppressMouseEvents, true)
  document.addEventListener('mousedown', suppressMouseEvents, true)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', suppressMouseEvents, true)
  document.removeEventListener('mousedown', suppressMouseEvents, true)
})
</script>

<style scoped>
/* ── Raíz ── */
.endgame-root {
  position: fixed;
  inset: 0;
  background: #080808;
  z-index: 20000;
  font-family: 'Courier New', monospace;
  overflow: hidden;
  /* La inclinación la aplica GSAP directamente en style.transform */
  transform-origin: center center;
}

/* ── Transiciones de fase ── */
.phase-fade-enter-active { transition: opacity 0.5s ease; }
.phase-fade-enter-from   { opacity: 0; }
.phase-fade-leave-active { transition: opacity 0.3s ease; }
.phase-fade-leave-to     { opacity: 0; }

/* ══ FASE 1: Bóveda ══ */
.vault-open-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}

.vo-toolbar {
  padding: 10px 16px;
  background: #0d0d0d;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.vo-path  { font-size: 11px; color: #444; }
.vo-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #001a00;
  color: #33cc66;
  border: 1px solid #004400;
}

.vo-files {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vo-file {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #0d0d0d;
  border: 1px solid #1a1a1a;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  animation: file-appear 0.6s ease-out;
}
@keyframes file-appear {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.vo-file:hover    { background: #111; border-color: #333; }
.vo-file.selected { background: #0d1a0d; border-color: #33cc66; }

.vo-file-icon { font-size: 28px; flex-shrink: 0; }
.vo-file-name { font-size: 14px; color: #ccc; margin-bottom: 3px; }
.vo-file-meta { font-size: 10px; color: #444; }

.vo-statusbar {
  padding: 5px 16px;
  background: #0a0a0a;
  border-top: 1px solid #1a1a1a;
  font-size: 10px;
  color: #333;
  flex-shrink: 0;
}

/* ══ FASE 2: Leyendo ══ */
.reading-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #060606;
}

.rs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #0d0d0d;
  border-bottom: 1px solid #1a1a1a;
  flex-shrink: 0;
}
.rs-filename { font-size: 12px; color: #888; }
.rs-dots { display: flex; gap: 5px; }
.rs-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #cc3333;
  animation: dot-blink 1.2s infinite;
}
@keyframes dot-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.1; }
}

.rs-terminal {
  flex: 1;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rs-line {
  font-size: 13px;
  line-height: 1.7;
  animation: line-in 0.15s ease-out;
}
@keyframes line-in {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
.rs-line.ok   { color: #336633; }
.rs-line.warn { color: #aa7700; }
.rs-line.err  { color: #cc3333; }

.rs-cursor {
  color: #cc3333;
  font-size: 15px;
  animation: cur-blink 1s step-end infinite;
}
@keyframes cur-blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ══ FASE 3: Error + datos ══ */
.error-screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #060606;
}
.err-header {
  padding: 10px 16px;
  background: #0d0d0d;
  border-bottom: 1px solid #1a1a1a;
  flex-shrink: 0;
}
.err-terminal {
  flex: 1;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.err-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 16px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.err-block.visible {
  opacity: 1;
  transform: translateY(0);
}

.err-title {
  font-size: 28px;
  font-weight: bold;
  color: #cc3333;
  letter-spacing: 6px;
  text-shadow: 0 0 20px #cc3333, 0 0 40px rgba(204,51,51,0.4);
  animation: err-pulse 1.5s ease-in-out 3;
}
@keyframes err-pulse {
  0%,100% { text-shadow: 0 0 20px #cc3333, 0 0 40px rgba(204,51,51,0.4); }
  50%      { text-shadow: 0 0 4px #cc3333; }
}
.err-sub { font-size: 13px; color: #882222; letter-spacing: 2px; margin-top: 2px; }
.err-divider {
  width: 200px;
  height: 1px;
  background: #1a0000;
  margin: 10px 0;
}

/* Datos del jugador */
.player-data {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s;
}
.player-data.visible {
  opacity: 1;
  transform: translateY(0);
}

.pd-separator { font-size: 11px; color: #221100; letter-spacing: 1px; }
.pd-sep-dim   { color: #1a0d00; margin-top: 8px; }
.pd-title {
  font-size: 12px;
  color: #996644;
  letter-spacing: 2px;
  font-weight: bold;
  margin: 2px 0;
}
.pd-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  padding: 3px 0;
  border-bottom: 1px solid #110800;
}
.pd-label { color: #443322; min-width: 140px; }
.pd-val   { color: #998855; }
.pd-val-red { color: #cc3333 !important; }

/* ══ CHAT DEL ADMIN ══ */
.chat-slide-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.2, 0.64, 1); }
.chat-slide-enter-from   { opacity: 0; transform: translateY(30px) scale(0.95); }

.admin-chat-window {
  position: fixed;
  bottom: 60px;
  right: 40px;
  width: 420px;
  background: #050505;
  border: 1px solid #cc3333;
  border-radius: 10px;
  box-shadow:
    0 0 40px rgba(204,51,51,0.25),
    0 0 80px rgba(204,51,51,0.1),
    0 20px 60px rgba(0,0,0,0.9);
  overflow: hidden;
  z-index: 21000;
}

.ac-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #0a0000;
  border-bottom: 1px solid #1a0000;
}
.ac-dots { display: flex; gap: 5px; }
.ac-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
}
.ac-dot.red    { background: #cc3333; box-shadow: 0 0 5px #cc3333; }
.ac-dot.yellow { background: #cc8800; }
.ac-dot.green  { background: #1a3a1a; }
.ac-title {
  flex: 1;
  font-size: 11px;
  color: #cc3333;
  letter-spacing: 2px;
  margin-left: 6px;
}
.ac-status {
  font-size: 9px;
  color: #cc3333;
  animation: status-pulse 1.5s infinite;
}
@keyframes status-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.ac-body {
  padding: 20px 18px 8px;
  min-height: 100px;
}
.ac-messages { display: flex; flex-direction: column; gap: 10px; }
.ac-msg {
  display: flex;
  flex-direction: column;
  gap: 2px;
  animation: msg-appear 0.4s ease-out;
}
@keyframes msg-appear {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.ac-sender { font-size: 9px; color: #551111; letter-spacing: 1px; }
.ac-text   { font-size: 14px; color: #ddaaaa; line-height: 1.5; }

.ac-footer {
  padding: 14px 18px 18px;
  display: flex;
  justify-content: center;
}

.ac-btn {
  background: #0d0000;
  border: 1px solid #882222;
  color: #cc3333;
  padding: 11px 28px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
}
.ac-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(204,51,51,0);
  transition: background 0.15s;
}
.ac-btn.ac-btn-hover {
  background: #1a0000;
  border-color: #cc3333;
  box-shadow: 0 0 14px rgba(204,51,51,0.3);
}
.ac-btn.ac-btn-pulse {
  animation: btn-pulse 1.2s ease-in-out infinite;
}
@keyframes btn-pulse {
  0%,100% {
    box-shadow: 0 0 0 0 rgba(204,51,51,0);
    border-color: #882222;
  }
  50% {
    box-shadow: 0 0 0 6px rgba(204,51,51,0.15), 0 0 20px rgba(204,51,51,0.2);
    border-color: #cc3333;
  }
}

/* ══ CURSOR FANTASMA ══ */
.ghost-cursor {
  position: fixed;
  pointer-events: none;
  z-index: 22000;
  font-size: 22px;
  color: #cc3333;
  text-shadow: 0 0 10px #cc3333, 0 0 20px rgba(204,51,51,0.5);
  transform: translate(-50%, -50%);
  transition: none;
  filter: drop-shadow(0 0 8px #cc3333);
  font-family: monospace;
  will-change: left, top;
}

/* ══ CORRUPCIÓN DE CARACTERES ══ */
/* GSAP anima directamente los spans con transform inline */
:deep(.corrupt-char) {
  display: inline-block;
}

/* ══ SCANLINES ACELERADAS ══ */
/* Se activa como overlay independiente vía v-if durante la secuencia del cursor */
.scanlines-fast-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 21800;
  /* Líneas más gruesas (3px) y rojas tenues */
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(204, 51, 51, 0.07) 2px,
    rgba(204, 51, 51, 0.07) 5px
  );
  /* Animación de desplazamiento rápido — da sensación de aceleración */
  animation: scanlines-rush 0.09s linear infinite;
  mix-blend-mode: screen;
}

@keyframes scanlines-rush {
  from { background-position: 0 0; }
  to   { background-position: 0 10px; }
}

/* ══ OVERLAY DE GLITCH ══ */
.glitch-overlay {
  position: fixed;
  inset: 0;
  z-index: 21500;
  background: repeating-linear-gradient(
    0deg,
    rgba(204,51,51,0.05) 0px,
    rgba(204,51,51,0.05) 1px,
    transparent 1px,
    transparent 4px
  );
  animation: glitch-anim 0.06s steps(2) infinite;
  mix-blend-mode: screen;
}
@keyframes glitch-anim {
  0%   { transform: translate(0, 0) skewX(0deg); }
  25%  { transform: translate(-5px, 3px) skewX(-3deg); filter: hue-rotate(40deg); }
  50%  { transform: translate(5px, -3px) skewX(3deg); filter: hue-rotate(-15deg); }
  75%  { transform: translate(-3px, -2px) skewX(1.5deg); filter: hue-rotate(20deg); }
  100% { transform: translate(0, 0); }
}

/* ══ FADE A NEGRO ══ */
.blackout-enter-active { transition: opacity 1.4s ease; }
.blackout-enter-from   { opacity: 0; }

.blackout-screen {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 23000;
}
.blackout-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  opacity: 0.5;
}

/* ══ PANTALLA FINAL ══ */
.finale-fade-enter-active { transition: opacity 1.2s ease 0.4s; }
.finale-fade-enter-from   { opacity: 0; }

.finale-screen {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 24000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.finale-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 3px,
    rgba(0,0,0,0.18) 3px,
    rgba(0,0,0,0.18) 4px
  );
  pointer-events: none;
}

.finale-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  font-family: 'Courier New', monospace;
  text-align: center;
  padding: 40px;
}

.finale-logo {
  font-size: 48px;
  color: #cc3333;
  text-shadow: 0 0 20px #cc3333, 0 0 40px rgba(204,51,51,0.3);
  animation: finale-hex 3s infinite;
}
@keyframes finale-hex {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

.finale-title {
  font-size: 36px;
  font-weight: bold;
  color: #ddd;
  letter-spacing: 10px;
}
.finale-os { color: #cc3333; }

.finale-divider { font-size: 11px; color: #221100; letter-spacing: 1px; }
.finale-divider-dim { color: #111; }

.finale-msg-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 6px 0;
}

.finale-line {
  font-size: 14px;
  color: #776655;
  line-height: 1.7;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.finale-line.visible {
  opacity: 1;
  transform: translateY(0);
}
.finale-line:empty { height: 8px; }

.finale-sub {
  font-size: 11px;
  color: #333;
  letter-spacing: 3px;
  opacity: 0;
  transition: opacity 0.8s ease;
  margin-top: 4px;
}
.finale-sub.visible { opacity: 1; }

.finale-case {
  font-size: 13px;
  color: #441111;
  letter-spacing: 2px;
  opacity: 0;
  transition: opacity 0.8s ease 0.3s;
}
.finale-case.visible { opacity: 1; }
</style>