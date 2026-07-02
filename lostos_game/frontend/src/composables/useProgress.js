// src/composables/useProgress.js
// Sincroniza el estado del juego con el backend (MongoDB via Express).
// Uso: importar en los componentes que necesiten guardar o cargar progreso.

import { watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'
import { useMinigames } from '../store/minigames.js'
import { useSystem } from '../store/system.js'

const API = 'http://localhost:3000/api/progress'
const SAVE_DEBOUNCE_MS = 1500

let saveTimer = null
let watchersStarted = false

export function useProgress() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0()
  const mg = useMinigames()
  const system = useSystem()

  // ── Token ──────────────────────────────────────────────────────────────────
  async function getToken() {
    try {
      return await getAccessTokenSilently()
    } catch (e) {
      console.error('[progress] Error obteniendo token:', e)
      return null
    }
  }

  // ── Cargar progreso desde el backend y aplicarlo al estado local ───────────
  async function loadProgress() {
    const token = await getToken()
    if (!token) return

    try {
      const res = await fetch(API, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()

      // Restaurar minijuegos
      if (Array.isArray(data.minigamesCompleted)) {
        data.minigamesCompleted.forEach((key) => mg.unlock(key))
      }

      // Restaurar flags narrativos
      if (data.flags) {
        Object.entries(data.flags).forEach(([key, value]) => {
          if (value) system.setFlag(key)
        })
      }

      // Restaurar nivel
      if (data.currentLevel) {
        system.currentLevel = data.currentLevel
      }

      console.log('[progress] Progreso cargado:', data)
      return data
    } catch (e) {
      console.error('[progress] Error cargando progreso:', e)
    }
  }

  // ── Guardar progreso completo ──────────────────────────────────────────────
  async function saveProgress(overrides = {}) {
    const token = await getToken()
    if (!token) return

    // minigamesCompleted: array de keys desbloqueados
    const minigamesCompleted = Object.entries(mg.unlocked)
      .filter(([, v]) => v)
      .map(([k]) => k)

    const body = {
      currentLevel: system.currentLevel,
      minigamesCompleted,
      flags: { ...system.flags },
      ...overrides,
    }

    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      console.log('[progress] Guardado:', data)
      return data
    } catch (e) {
      console.error('[progress] Error guardando progreso:', e)
    }
  }

  // ── Guardar completado de un minijuego específico ─────────────────────────
  async function saveMinigameWin(key) {
    mg.unlock(key)
    await saveProgress()
  }

  // ── Marcar juego como completado (endgame) ────────────────────────────────
  async function saveCompletion() {
    await saveProgress({ completedAt: new Date().toISOString() })
  }

  // ── Guardado automático con debounce ────────────────────────────────────────
  function scheduleSave() {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => saveProgress(), SAVE_DEBOUNCE_MS)
  }

  // Registra watchers UNA sola vez (aunque useProgress() se llame varias veces
  // desde distintos componentes). Cualquier cambio en flags, minijuegos o nivel
  // dispara un guardado automático sin tener que llamar saveProgress() a mano.
  function startAutosave() {
    if (watchersStarted) return
    watchersStarted = true

    watch(
      () => ({ ...system.flags }),
      () => {
        if (isAuthenticated.value) scheduleSave()
      },
      { deep: true },
    )

    watch(
      () => ({ ...mg.unlocked }),
      () => {
        if (isAuthenticated.value) scheduleSave()
      },
      { deep: true },
    )

    watch(
      () => system.currentLevel,
      () => {
        if (isAuthenticated.value) scheduleSave()
      },
    )
  }

  return {
    loadProgress,
    saveProgress,
    saveMinigameWin,
    saveCompletion,
    startAutosave,
  }
}