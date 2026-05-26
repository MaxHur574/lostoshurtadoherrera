<template>
  <Window
    title="🌐 Navegador"
    @close="$emit('close')"
    @minimize="$emit('minimize')"
  >
    <div class="browser">
      <!-- Barra de navegación -->
      <div class="nav-bar">
        <button
          class="nav-btn"
          @click="goBack"
          :disabled="historyStack.length <= 1"
        >
          ‹
        </button>
        <button
          class="nav-btn"
          @click="goForward"
          :disabled="forwardStack.length === 0"
        >
          ›
        </button>
        <button class="nav-btn" @click="reload">↺</button>
        <div class="url-bar" :class="{ error: currentPage?.error }">
          <span class="url-icon">{{ currentPage?.error ? "⚠️" : "🌐" }}</span>
          <input
            ref="urlInput"
            v-model="urlValue"
            class="url-input"
            @keyup.enter="navigate(urlValue)"
            spellcheck="false"
          />
        </div>
        <button class="nav-btn go-btn" @click="navigate(urlValue)">→</button>
      </div>

      <!-- Pestañas -->
      <div class="tabs-bar">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ active: currentTabId === tab.id }"
          @click="switchTab(tab.id)"
        >
          <span>{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.title }}</span>
          <button class="tab-close" @click.stop="closeTab(tab.id)">✕</button>
        </div>
        <button class="new-tab-btn" @click="newTab">+</button>
      </div>

      <!-- Contenido -->
      <div class="browser-content">
        <!-- Nueva pestaña -->
        <div v-if="currentPage?.id === 'newtab'" class="new-tab-page">
          <div class="new-tab-logo">lost.sys</div>
          <div class="new-tab-subtitle">
            Sin conexión · Solo caché local disponible
          </div>

          <div class="nt-section">
            <div class="nt-title">🕐 Historial reciente</div>
            <div
              v-for="h in historial"
              :key="h.url"
              class="history-item"
              @click="navigate(h.url)"
            >
              <span class="h-icon">{{ h.icon }}</span>
              <div class="h-info">
                <div class="h-label">{{ h.label }}</div>
                <div class="h-url">{{ h.url }}</div>
              </div>
              <span class="h-date">{{ h.date }}</span>
            </div>
          </div>

          <div class="nt-section">
            <div class="nt-title">⭐ Favoritos</div>
            <div class="quick-links">
              <div
                v-for="link in favoritos"
                :key="link.url"
                class="quick-link"
                @click="navigate(link.url)"
              >
                <div class="quick-link-icon">{{ link.icon }}</div>
                <div class="quick-link-label">{{ link.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error sin conexión -->
        <div v-else-if="currentPage?.error" class="error-page">
          <div class="error-icon">⚠️</div>
          <div class="error-title">Sin conexión</div>
          <div class="error-msg">
            No se puede acceder a <b>{{ currentPage.url }}</b>
          </div>
          <div class="error-detail">
            Este equipo no tiene conexión a internet.<br />Solo están
            disponibles las páginas en caché local.
          </div>
          <button class="error-retry" @click="reload">Reintentar</button>
        </div>

        <!-- Páginas internas -->
        <div v-else-if="currentPage" class="site-page">
          <div
            class="site-header"
            :style="{ background: currentPage.headerBg || '#0a0a0a' }"
          >
            <div class="site-title">{{ currentPage.title }}</div>
            <div class="site-url-display">{{ currentPage.url }}</div>
          </div>
          <div class="site-body" v-html="currentPage.html" />
        </div>
      </div>

      <!-- Status bar -->
      <div class="status-bar">
        <span v-if="loading" class="status-loading">Cargando...</span>
        <span v-else class="status-text">{{ currentPage?.url || "" }}</span>
        <span class="status-right">🌐 Sin conexión · Modo caché</span>
      </div>
    </div>
  </Window>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Window from "./Window.vue";

defineEmits(["close", "minimize"]);

const urlInput = ref(null);
const loading = ref(false);
let tabCounter = 2;

// ── Historial narrativo ───────────────────────────────────────────────────────
const historial = [
  {
    icon: "🔍",
    label: "recuperar acceso cuenta bloqueada",
    url: "buscar:recuperar+acceso+cuenta+bloqueada",
    date: "29/10/2020",
  },
  {
    icon: "🔍",
    label: "mercado rojo darknet",
    url: "buscar:mercado+rojo+darknet",
    date: "14/05/2024",
  },
  {
    icon: "🔍",
    label: "desapariciones zona industrial",
    url: "buscar:desapariciones+zona+industrial",
    date: "10/03/2022",
  },
  {
    icon: "🌐",
    label: "Recuperación de cuenta — lost.sys",
    url: "lost.sys/cache/recuperacion",
    date: "29/10/2020",
  },
  {
    icon: "🔴",
    label: "mercadorojo.onion — caché local",
    url: "lost.sys/cache/mercadorojo",
    date: "14/05/2024",
  },
];

// ── Favoritos ─────────────────────────────────────────────────────────────────
const favoritos = [
  {
    icon: "🔑",
    label: "Recuperación de cuenta",
    url: "lost.sys/cache/recuperacion",
  },
  { icon: "🔴", label: "Mercado Rojo", url: "lost.sys/cache/mercadorojo" },
];

// ── Páginas internas ──────────────────────────────────────────────────────────
const pages = {
  newtab: {
    id: "newtab",
    title: "Nueva pestaña",
    icon: "🌐",
    url: "about:blank",
  },

  // ── Nivel 1: Recuperación de cuenta ──
  "lost.sys/cache/recuperacion": {
    id: "recuperacion",
    title: "Recuperación de cuenta — lost.sys",
    url: "lost.sys/cache/recuperacion",
    icon: "🔑",
    headerBg: "#0a1220",
    html: `
      <div style="padding:24px;color:#aaa;font-family:'Courier New',monospace;font-size:13px;line-height:1.9;max-width:480px;">
        <div style="color:#4a9eff;font-size:16px;font-weight:bold;margin-bottom:4px;">🔑 Recuperación de acceso</div>
        <div style="color:#333;font-size:11px;margin-bottom:20px;">lost.sys · Servicio de cuentas</div>

        <div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:4px;padding:14px;margin-bottom:20px;">
          <div style="color:#555;font-size:11px;margin-bottom:10px;">REGISTRO DE ÚLTIMO ACCESO</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div><span style="color:#444;">Usuario:</span> <span style="color:#888;">vherrera.mail</span></div>
            <div><span style="color:#444;">Nombre:</span> <span style="color:#888;">Valeria Herrera</span></div>
            <div><span style="color:#444;">Último acceso:</span> <span style="color:#cc8844;">29/10/2020 — 03:11 AM</span></div>
            <div><span style="color:#444;">Estado:</span> <span style="color:#cc4444;">Sesión cerrada de forma abrupta</span></div>
          </div>
        </div>

        <div style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:4px;padding:14px;margin-bottom:20px;">
          <div style="color:#555;font-size:11px;margin-bottom:10px;">PISTA DE CONTRASEÑA</div>
          <div style="color:#666;font-size:12px;line-height:1.8;">
            La contraseña fue definida por el usuario.<br/>
            <span style="color:#444;">Pista:</span> <span style="color:#777;font-style:italic;">nombre + número habitual</span><br/>
            <span style="color:#333;font-size:11px;">(El sistema no puede mostrar contraseñas por seguridad.)</span>
          </div>
        </div>

        <div style="color:#2a2a2a;font-size:11px;border-top:1px solid #1a1a1a;padding-top:12px;">
          Página guardada en caché local · lost.sys/cache/recuperacion<br/>
          <span style="color:#cc4444;">⚠️ Página original eliminada del servidor el 15/05/2024</span>
        </div>
      </div>
    `,
  },

  // ── Nivel 4: Mercado Rojo ──
  "lost.sys/cache/mercadorojo": {
    id: "mercadorojo",
    title: "mercadorojo.onion — Caché local",
    url: "lost.sys/cache/mercadorojo",
    icon: "🔴",
    headerBg: "#140000",
    html: `
      <div style="padding:24px;color:#aaa;font-family:'Courier New',monospace;font-size:13px;line-height:1.9;">
        <div style="background:#0d0d0d;border:1px solid #2a0000;border-radius:4px;padding:10px 14px;margin-bottom:20px;">
          <span style="color:#cc4444;font-size:11px;">⚠️ CACHÉ LOCAL — Captura guardada el 14/05/2024 03:29</span>
        </div>

        <div style="color:#cc2222;font-size:20px;font-weight:bold;letter-spacing:2px;margin-bottom:4px;">MERCADO ROJO</div>
        <div style="color:#330000;font-size:11px;margin-bottom:24px;">Sistema de subastas privado · Acceso restringido</div>

        <div style="background:#0d0d0d;border:1px solid #1a0000;border-radius:4px;padding:16px;margin-bottom:16px;">
          <div style="color:#444;font-size:10px;margin-bottom:12px;letter-spacing:1px;">LOTES ACTIVOS</div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#111;border:1px solid #1a0000;border-radius:3px;">
              <span style="color:#cc4444;font-weight:bold;">R3D-██-███</span>
              <span style="color:#333;font-size:11px;">ACTIVO</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#111;border:1px solid #1a0000;border-radius:3px;">
              <span style="color:#882222;">LOTE-██████</span>
              <span style="color:#333;font-size:11px;">CERRADO</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#111;border:1px solid #1a0000;border-radius:3px;">
              <span style="color:#882222;">LOTE-██████</span>
              <span style="color:#333;font-size:11px;">CERRADO</span>
            </div>
          </div>
        </div>

        <div style="color:#2a0000;font-size:11px;border-top:1px solid #1a0000;padding-top:12px;">
          Acceso original requería autenticación.<br/>
          Esta página fue capturada antes de que el acceso fuera revocado.
        </div>
      </div>
    `,
  },
};

// ── Estado de pestañas ────────────────────────────────────────────────────────
const tabs = ref([
  { id: 1, title: "Nueva pestaña", icon: "🌐", pageId: "newtab" },
]);

const currentTabId = ref(1);
const historyStack = ref(["newtab"]);
const forwardStack = ref([]);
const urlValue = ref("");

const currentPage = computed(() => {
  const tab = tabs.value.find((t) => t.id === currentTabId.value);
  if (!tab) return null;
  if (pages[tab.pageId]) return pages[tab.pageId];
  return { id: "error", url: tab.pageId, error: true };
});

watch(currentPage, (page) => {
  if (page) urlValue.value = page.url === "about:blank" ? "" : page.url || "";
});

// ── Navegación ────────────────────────────────────────────────────────────────
function navigate(url) {
  if (!url || url === "about:blank" || url === "") {
    setPage("newtab");
    return;
  }
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    const key = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (pages[key]) {
      setPage(key);
    } else {
      // Cualquier URL externa → sin conexión
      const errKey = "__err__" + url;
      if (!pages[errKey]) pages[errKey] = { id: "error", url, error: true };
      const tab = tabs.value.find((t) => t.id === currentTabId.value);
      if (tab) {
        tab.pageId = errKey;
        tab.title = "Sin conexión";
        tab.icon = "⚠️";
      }
    }
  }, 500);
}

function setPage(pageId) {
  const tab = tabs.value.find((t) => t.id === currentTabId.value);
  if (!tab) return;
  forwardStack.value = [];
  historyStack.value.push(pageId);
  tab.pageId = pageId;
  const page = pages[pageId];
  if (page) {
    tab.title = page.title || "Nueva pestaña";
    tab.icon = page.icon || "🌐";
    urlValue.value = page.url === "about:blank" ? "" : page.url || "";
  }
}

function goBack() {
  if (historyStack.value.length <= 1) return;
  const current = historyStack.value.pop();
  forwardStack.value.push(current);
  const prev = historyStack.value[historyStack.value.length - 1];
  const tab = tabs.value.find((t) => t.id === currentTabId.value);
  if (tab && prev) {
    tab.pageId = prev;
    const page = pages[prev];
    if (page) {
      tab.title = page.title;
      tab.icon = page.icon;
      urlValue.value = page.url === "about:blank" ? "" : page.url;
    }
  }
}

function goForward() {
  if (forwardStack.value.length === 0) return;
  const next = forwardStack.value.pop();
  historyStack.value.push(next);
  const tab = tabs.value.find((t) => t.id === currentTabId.value);
  if (tab && next) {
    tab.pageId = next;
    const page = pages[next];
    if (page) {
      tab.title = page.title;
      tab.icon = page.icon;
      urlValue.value = page.url === "about:blank" ? "" : page.url;
    }
  }
}

function reload() {
  navigate(urlValue.value);
}

function newTab() {
  tabCounter++;
  tabs.value.push({
    id: tabCounter,
    title: "Nueva pestaña",
    icon: "🌐",
    pageId: "newtab",
  });
  currentTabId.value = tabCounter;
  historyStack.value = ["newtab"];
  forwardStack.value = [];
  urlValue.value = "";
}

function switchTab(id) {
  currentTabId.value = id;
  const tab = tabs.value.find((t) => t.id === id);
  const page = tab ? pages[tab.pageId] : null;
  urlValue.value = page?.url === "about:blank" ? "" : page?.url || "";
}

function closeTab(id) {
  if (tabs.value.length === 1) return;
  const idx = tabs.value.findIndex((t) => t.id === id);
  tabs.value.splice(idx, 1);
  if (currentTabId.value === id)
    currentTabId.value = tabs.value[Math.max(0, idx - 1)].id;
}
</script>

<style scoped>
.browser {
  display: flex;
  flex-direction: column;
  height: 500px;
  font-family: "Segoe UI", sans-serif;
  background: #0d0d0d;
}

/* Nav */
.nav-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background: #141414;
  border-bottom: 1px solid #222;
}
.nav-btn {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  color: #888;
  width: 26px;
  height: 26px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}
.nav-btn:hover:not(:disabled) {
  background: #222;
  color: #ccc;
}
.nav-btn:disabled {
  opacity: 0.3;
  cursor: default;
}
.go-btn {
  font-size: 12px;
}
.url-bar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0d0d0d;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 0 8px;
  height: 26px;
}
.url-bar:focus-within {
  border-color: #555;
}
.url-bar.error {
  border-color: #5a2a2a;
}
.url-icon {
  font-size: 11px;
  opacity: 0.6;
  flex-shrink: 0;
}
.url-input {
  flex: 1;
  background: none;
  border: none;
  color: #ccc;
  font-size: 12px;
  outline: none;
  font-family: "Courier New", monospace;
}

/* Tabs */
.tabs-bar {
  display: flex;
  align-items: center;
  background: #111;
  border-bottom: 1px solid #222;
  overflow-x: auto;
  min-height: 32px;
}
.tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
  height: 32px;
  min-width: 100px;
  max-width: 180px;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  border-right: 1px solid #1a1a1a;
  transition: background 0.15s;
  flex-shrink: 0;
}
.tab:hover {
  background: #1a1a1a;
  color: #aaa;
}
.tab.active {
  background: #0d0d0d;
  color: #ccc;
  border-bottom: 2px solid #4a9eff;
}
.tab-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tab-close {
  background: none;
  border: none;
  color: #444;
  font-size: 10px;
  cursor: pointer;
  padding: 2px 3px;
  border-radius: 3px;
  transition: background 0.15s;
  flex-shrink: 0;
}
.tab-close:hover {
  background: #2a2a2a;
  color: #ff6666;
}
.new-tab-btn {
  background: none;
  border: none;
  color: #555;
  font-size: 16px;
  cursor: pointer;
  padding: 0 10px;
  height: 32px;
  transition: color 0.15s;
  flex-shrink: 0;
}
.new-tab-btn:hover {
  color: #aaa;
}

/* Contenido */
.browser-content {
  flex: 1;
  overflow-y: auto;
}

/* Nueva pestaña */
.new-tab-page {
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.new-tab-logo {
  font-size: 20px;
  color: #2a2a2a;
  font-weight: bold;
  font-family: "Courier New", monospace;
}
.new-tab-subtitle {
  font-size: 11px;
  color: #222;
  font-family: "Courier New", monospace;
  margin-top: -14px;
}

.nt-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.nt-title {
  font-size: 10px;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  background: #0f0f0f;
  border: 1px solid #1a1a1a;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
}
.history-item:hover {
  background: #161616;
  border-color: #2a2a2a;
}
.h-icon {
  font-size: 13px;
  flex-shrink: 0;
  opacity: 0.5;
}
.h-info {
  flex: 1;
  overflow: hidden;
}
.h-label {
  font-size: 12px;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.h-url {
  font-size: 10px;
  color: #2a2a2a;
  font-family: "Courier New", monospace;
}
.h-date {
  font-size: 10px;
  color: #2a2a2a;
  flex-shrink: 0;
}

.quick-links {
  display: flex;
  gap: 8px;
}
.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: #0f0f0f;
  border: 1px solid #1a1a1a;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  min-width: 80px;
}
.quick-link:hover {
  background: #161616;
  border-color: #2a2a2a;
}
.quick-link-icon {
  font-size: 22px;
}
.quick-link-label {
  font-size: 10px;
  color: #555;
  text-align: center;
  line-height: 1.3;
}

/* Error */
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 10px;
  color: #555;
  text-align: center;
  padding: 20px;
}
.error-icon {
  font-size: 40px;
}
.error-title {
  font-size: 18px;
  color: #888;
  font-weight: bold;
}
.error-msg {
  font-size: 13px;
  color: #555;
}
.error-msg b {
  color: #777;
  font-weight: normal;
}
.error-detail {
  font-size: 12px;
  color: #444;
  max-width: 300px;
  line-height: 1.6;
}
.error-retry {
  margin-top: 8px;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #888;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.error-retry:hover {
  background: #222;
  color: #ccc;
}

/* Site */
.site-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.site-header {
  padding: 10px 16px;
  border-bottom: 1px solid #1a1a1a;
}
.site-title {
  font-size: 13px;
  color: #aaa;
  font-weight: bold;
}
.site-url-display {
  font-size: 11px;
  color: #555;
  font-family: "Courier New", monospace;
}
.site-body {
  flex: 1;
  overflow-y: auto;
}

/* Status */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 10px;
  background: #111;
  border-top: 1px solid #1a1a1a;
  font-size: 11px;
  color: #444;
}
.status-loading {
  color: #4a9eff;
  animation: pulse 1s infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
.status-right {
  color: #2a2a2a;
}
</style>
