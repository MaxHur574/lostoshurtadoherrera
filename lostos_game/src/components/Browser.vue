<template>
  <Window title="🌐 Navegador" @close="$emit('close')" @minimize="$emit('minimize')">
    <div class="browser">

      <!-- Barra de navegación -->
      <div class="nav-bar">
        <button class="nav-btn" @click="goBack" :disabled="historyIndex <= 0">‹</button>
        <button class="nav-btn" @click="goForward" :disabled="historyIndex >= history.length - 1">›</button>
        <button class="nav-btn" @click="reload">↺</button>
        <div class="url-bar" :class="{ secure: currentPage?.secure, error: currentPage?.error }">
          <span class="url-icon">{{ currentPage?.secure ? '🔒' : currentPage?.error ? '⚠️' : '🌐' }}</span>
          <input
            ref="urlInput"
            v-model="urlValue"
            class="url-input"
            @keyup.enter="navigate(urlValue)"
            @focus="urlInput?.select()"
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

        <!-- Página de inicio -->
        <div v-if="currentPage?.id === 'newtab'" class="new-tab-page">
          <div class="new-tab-title">lost.sys — Navegador</div>
          <div class="new-tab-subtitle">Sin conexión a internet</div>
          <div class="quick-links">
            <div
              v-for="link in quickLinks"
              :key="link.url"
              class="quick-link"
              @click="navigate(link.url)"
            >
              <div class="quick-link-icon">{{ link.icon }}</div>
              <div class="quick-link-label">{{ link.label }}</div>
            </div>
          </div>
        </div>

        <!-- Página de error de red -->
        <div v-else-if="currentPage?.id === 'error'" class="error-page">
          <div class="error-icon">⚠️</div>
          <div class="error-title">Sin conexión</div>
          <div class="error-msg">No se puede acceder a <b>{{ currentPage.url }}</b></div>
          <div class="error-detail">El equipo no tiene conexión a internet o el servidor no responde.</div>
          <button class="error-retry" @click="reload">Reintentar</button>
        </div>

        <!-- Páginas internas -->
        <div v-else-if="currentPage" class="site-page">
          <div class="site-header" :style="{ background: currentPage.headerBg }">
            <div class="site-title">{{ currentPage.title }}</div>
            <div class="site-url-display">{{ currentPage.url }}</div>
          </div>
          <div class="site-body" v-html="currentPage.html" />
        </div>

      </div>

      <!-- Status bar -->
      <div class="status-bar">
        <span v-if="loading" class="status-loading">Cargando...</span>
        <span v-else class="status-text">{{ currentPage?.url || '' }}</span>
        <span class="status-right">🌐 Sin conexión</span>
      </div>

    </div>
  </Window>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import Window from "./Window.vue";

const emit = defineEmits(["close", "minimize"]);

const urlInput = ref(null);
const loading = ref(false);
let tabCounter = 2;

// Páginas internas cacheadas
const pages = {
  "newtab": { id: "newtab", title: "Nueva pestaña", icon: "🌐", url: "about:blank" },
  "error": null,
  "lost.sys/cache/vortex": {
    id: "vortex",
    title: "Vortex Data Sol — Inicio",
    url: "lost.sys/cache/vortex",
    secure: false,
    icon: "🏢",
    headerBg: "#0a1628",
    html: `
      <div style="padding:20px; color:#aaa; font-family:'Courier New',monospace; font-size:13px; line-height:1.8;">
        <div style="color:#4a9eff; font-size:18px; font-weight:bold; margin-bottom:4px;">VORTEX DATA SOL</div>
        <div style="color:#555; font-size:11px; margin-bottom:20px;">Soluciones de almacenamiento y análisis de datos empresariales</div>
        <div style="background:#0d0d0d; border:1px solid #222; border-radius:4px; padding:12px; margin-bottom:16px;">
          <div style="color:#cc4444; font-size:11px; margin-bottom:8px;">⚠️ AVISO — PÁGINA EN CACHÉ (14/05/2024)</div>
          <div style="color:#666; font-size:11px;">Esta es una copia local del sitio. Puede estar desactualizada.</div>
        </div>
        <p>Vortex Data Sol es una empresa de tecnología especializada en infraestructura de datos para organismos públicos y privados.</p>
        <p>Fundada en <b style="color:#ccc;">2018</b>, opera desde Santiago de Chile y cuenta con contratos con más de <b style="color:#ccc;">40 instituciones</b>, incluyendo organismos estatales.</p>
        <div style="margin-top:20px; padding-top:12px; border-top:1px solid #1a1a1a; color:#444; font-size:11px;">
          Director ejecutivo: [Información no disponible en caché]<br/>
          Registro: [Información no disponible en caché]<br/>
          <span style="color:#cc4444;">Nota: 3 páginas de este sitio fueron eliminadas entre el 13/05 y el 14/05 de 2024.</span>
        </div>
      </div>
    `,
  },
  "lost.sys/cache/caso-0047": {
    id: "caso-0047",
    title: "Archivo — Caso 0047",
    url: "lost.sys/cache/caso-0047",
    secure: false,
    icon: "📰",
    headerBg: "#140a00",
    html: `
      <div style="padding:20px; color:#aaa; font-family:'Courier New',monospace; font-size:13px; line-height:1.8;">
        <div style="color:#cc8844; font-size:15px; font-weight:bold; margin-bottom:4px;">El Observador Digital</div>
        <div style="color:#555; font-size:11px; margin-bottom:20px;">Artículo archivado localmente</div>
        <div style="background:#0d0d0d; border:1px solid #222; border-radius:4px; padding:12px; margin-bottom:16px;">
          <div style="color:#cc4444; font-size:11px;">⚠️ CACHÉ LOCAL — Artículo eliminado del sitio original el 15/05/2024</div>
        </div>
        <div style="color:#ddd; font-size:15px; font-weight:bold; margin-bottom:8px;">Investigadora denuncia irregularidades en archivado de causa informática</div>
        <div style="color:#555; font-size:11px; margin-bottom:16px;">Publicado: 12/03/2022 · Autor: [REDACTADO]</div>
        <p>Una investigadora independiente presentó ante la fiscalía evidencia de accesos no autorizados a servidores de organismos públicos, señalando a una empresa de tecnología como responsable.</p>
        <p>La causa, identificada internamente como <b style="color:#ccc;">caso 0047</b>, fue archivada apenas tres semanas después de su apertura, decisión que la investigadora calificó como "políticamente motivada".</p>
        <p>El fiscal a cargo, D. Alsina, declaró que "no existía evidencia suficiente". La investigadora no pudo ser contactada al cierre de esta edición.</p>
        <div style="margin-top:20px; padding-top:12px; border-top:1px solid #1a1a1a; color:#444; font-size:11px;">
          Este artículo fue eliminado del sitio original sin aviso previo.<br/>
          <span style="color:#666;">Guardado localmente por: ev_local — 13/03/2022</span>
        </div>
      </div>
    `,
  },
};

const quickLinks = [
  { icon: "🏢", label: "Vortex Data Sol",  url: "lost.sys/cache/vortex" },
  { icon: "📰", label: "Caso 0047 — Caché", url: "lost.sys/cache/caso-0047" },
];

const tabs = ref([
  { id: 1, title: "Nueva pestaña", icon: "🌐", pageId: "newtab" },
]);

const currentTabId = ref(1);
const historyIndex = ref(0);
const history = ref(["newtab"]);
const urlValue = ref("about:blank");

const currentPage = computed(() => {
  const tab = tabs.value.find(t => t.id === currentTabId.value);
  if (!tab) return null;
  return pages[tab.pageId] || { id: "error", url: tab.pageId, error: true };
});

watch(currentPage, (page) => {
  if (page) {
    urlValue.value = page.url === "about:blank" ? "" : (page.url || "");
  }
});

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
      // Simular error de conexión para URLs externas
      const tab = tabs.value.find(t => t.id === currentTabId.value);
      if (tab) {
        pages["__error_" + url] = { id: "error", url, error: true };
        tab.pageId = "__error_" + url;
        tab.title = "Sin conexión";
        tab.icon = "⚠️";
      }
    }
  }, 600);
}

function setPage(pageId) {
  const tab = tabs.value.find(t => t.id === currentTabId.value);
  if (!tab) return;
  tab.pageId = pageId;
  const page = pages[pageId];
  if (page) {
    tab.title = page.title || "Nueva pestaña";
    tab.icon = page.icon || "🌐";
    urlValue.value = page.url === "about:blank" ? "" : (page.url || "");
  }
}

function goBack()    { /* simplified */ }
function goForward() { /* simplified */ }
function reload()    { navigate(urlValue.value); }

function newTab() {
  tabCounter++;
  tabs.value.push({ id: tabCounter, title: "Nueva pestaña", icon: "🌐", pageId: "newtab" });
  currentTabId.value = tabCounter;
}

function switchTab(id) {
  currentTabId.value = id;
  const tab = tabs.value.find(t => t.id === id);
  const page = tab ? pages[tab.pageId] : null;
  urlValue.value = page?.url === "about:blank" ? "" : (page?.url || "");
}

function closeTab(id) {
  if (tabs.value.length === 1) return;
  const idx = tabs.value.findIndex(t => t.id === id);
  tabs.value.splice(idx, 1);
  if (currentTabId.value === id) {
    currentTabId.value = tabs.value[Math.max(0, idx - 1)].id;
  }
}
</script>

<style scoped>
.browser {
  display: flex;
  flex-direction: column;
  height: 500px;
  font-family: 'Segoe UI', sans-serif;
  background: #0d0d0d;
}

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
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.nav-btn:hover:not(:disabled) { background: #222; color: #ccc; }
.nav-btn:disabled { opacity: 0.3; cursor: default; }
.go-btn { font-size: 12px; }

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
  transition: border-color 0.15s;
}
.url-bar:focus-within { border-color: #555; }
.url-bar.secure  { border-color: #2a5a3a; }
.url-bar.error   { border-color: #5a2a2a; }

.url-icon { font-size: 11px; opacity: 0.6; flex-shrink: 0; }

.url-input {
  flex: 1;
  background: none;
  border: none;
  color: #ccc;
  font-size: 12px;
  outline: none;
  font-family: 'Courier New', monospace;
}

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
  max-width: 160px;
  cursor: pointer;
  color: #666;
  font-size: 12px;
  border-right: 1px solid #1a1a1a;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.tab:hover  { background: #1a1a1a; color: #aaa; }
.tab.active { background: #0d0d0d; color: #ccc; border-bottom: 2px solid #4a9eff; }

.tab-label { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.tab-close {
  background: none;
  border: none;
  color: #444;
  font-size: 10px;
  cursor: pointer;
  padding: 2px 3px;
  border-radius: 3px;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.tab-close:hover { background: #2a2a2a; color: #ff6666; }

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
.new-tab-btn:hover { color: #aaa; }

.browser-content { flex: 1; overflow-y: auto; }

/* Nueva pestaña */
.new-tab-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 8px;
}
.new-tab-title    { font-size: 20px; color: #444; font-weight: bold; }
.new-tab-subtitle { font-size: 12px; color: #333; margin-bottom: 20px; }

.quick-links {
  display: flex;
  gap: 12px;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  background: #111;
  border: 1px solid #222;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  width: 80px;
}
.quick-link:hover { background: #1a1a1a; border-color: #333; }

.quick-link-icon  { font-size: 24px; }
.quick-link-label { font-size: 11px; color: #777; text-align: center; line-height: 1.3; }

/* Error page */
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
.error-icon   { font-size: 40px; }
.error-title  { font-size: 18px; color: #888; font-weight: bold; }
.error-msg    { font-size: 13px; color: #555; }
.error-msg b  { color: #777; font-weight: normal; }
.error-detail { font-size: 12px; color: #444; max-width: 300px; }

.error-retry {
  margin-top: 8px;
  background: #1a1a1a;
  border: 1px solid #333;
  color: #888;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}
.error-retry:hover { background: #222; color: #ccc; }

/* Site page */
.site-page { display: flex; flex-direction: column; height: 100%; }

.site-header {
  padding: 10px 16px;
  border-bottom: 1px solid #1a1a1a;
}

.site-title      { font-size: 13px; color: #aaa; font-weight: bold; }
.site-url-display { font-size: 11px; color: #555; font-family: 'Courier New', monospace; }

.site-body { flex: 1; overflow-y: auto; }

/* Status bar */
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

.status-loading { color: #4a9eff; animation: pulse 1s infinite; }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
.status-right { color: #333; }
</style>