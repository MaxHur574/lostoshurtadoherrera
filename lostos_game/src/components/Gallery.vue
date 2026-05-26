<template>
  <Window
    title="🖼️ Galería"
    @close="$emit('close')"
    @minimize="$emit('minimize')"
  >
    <div class="gallery-app">
      <!-- Sidebar -->
      <div class="gallery-sidebar">
        <div
          v-for="album in albums"
          :key="album.id"
          class="album-item"
          :class="{ active: selectedAlbum === album.id }"
          @click="
            selectedAlbum = album.id;
            selectedPhoto = null;
          "
        >
          <span class="album-icon">{{ album.icon }}</span>
          <span class="album-label">{{ album.label }}</span>
          <span class="album-count">{{ album.photos.length }}</span>
        </div>
      </div>

      <!-- Grid de fotos -->
      <div class="gallery-main">
        <div class="gallery-toolbar">
          <span class="toolbar-title">{{ currentAlbum?.label }}</span>
          <div class="toolbar-right">
            <button
              class="view-btn"
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
            >
              ⊞
            </button>
            <button
              class="view-btn"
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
            >
              ☰
            </button>
          </div>
        </div>

        <!-- Grid view -->
        <div v-if="viewMode === 'grid'" class="photo-grid">
          <div
            v-for="photo in currentAlbum?.photos"
            :key="photo.id"
            class="photo-thumb"
            :class="{
              selected: selectedPhoto?.id === photo.id,
              corrupted: photo.corrupted,
            }"
            @click="selectedPhoto = photo"
            @dblclick="openPhoto(photo)"
          >
            <div class="thumb-img" :style="{ background: photo.color }">
              <span class="thumb-icon">{{
                photo.corrupted ? "⚠️" : photo.emoji
              }}</span>
              <div v-if="photo.corrupted" class="corrupted-overlay">DAÑADO</div>
            </div>
            <div class="thumb-name">{{ photo.name }}</div>
          </div>
        </div>

        <!-- List view -->
        <div v-else class="photo-list">
          <div
            v-for="photo in currentAlbum?.photos"
            :key="photo.id"
            class="photo-row"
            :class="{
              selected: selectedPhoto?.id === photo.id,
              corrupted: photo.corrupted,
            }"
            @click="selectedPhoto = photo"
            @dblclick="openPhoto(photo)"
          >
            <div class="row-thumb" :style="{ background: photo.color }">
              <span>{{ photo.corrupted ? "⚠️" : photo.emoji }}</span>
            </div>
            <div class="row-info">
              <div class="row-name">{{ photo.name }}</div>
              <div class="row-meta">{{ photo.date }} · {{ photo.size }}</div>
            </div>
            <div v-if="photo.corrupted" class="row-badge">Dañado</div>
          </div>
        </div>

        <!-- Status bar -->
        <div class="gallery-status">
          {{ currentAlbum?.photos.length }} fotos
          <span v-if="selectedPhoto">
            · {{ selectedPhoto.name }} seleccionada</span
          >
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div
        v-if="lightboxPhoto"
        class="lightbox"
        @click.self="lightboxPhoto = null"
      >
        <div class="lightbox-window">
          <div class="lightbox-header">
            <span>{{ lightboxPhoto.name }}</span>
            <button class="lb-close" @click="lightboxPhoto = null">✕</button>
          </div>
          <div class="lightbox-body">
            <div
              class="lightbox-img"
              :style="{ background: lightboxPhoto.color }"
            >
              <span class="lb-emoji">{{
                lightboxPhoto.corrupted ? "⚠️" : lightboxPhoto.emoji
              }}</span>
              <div v-if="lightboxPhoto.corrupted" class="lb-corrupted">
                <div class="lbc-title">Archivo dañado</div>
                <div class="lbc-sub">
                  No se puede mostrar la imagen completa.<br />Datos
                  parcialmente recuperados.
                </div>
              </div>
            </div>
            <div class="lightbox-meta">
              <div class="meta-row">
                <span class="meta-key">Archivo</span
                ><span class="meta-val">{{ lightboxPhoto.name }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Fecha</span
                ><span class="meta-val">{{ lightboxPhoto.date }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Tamaño</span
                ><span class="meta-val">{{ lightboxPhoto.size }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Resolución</span
                ><span class="meta-val">{{ lightboxPhoto.res }}</span>
              </div>
              <div v-if="lightboxPhoto.note" class="meta-note">
                {{ lightboxPhoto.note }}
              </div>
            </div>
          </div>
          <div class="lightbox-nav">
            <button class="lb-nav" @click="prevPhoto">‹ Anterior</button>
            <span class="lb-counter"
              >{{ currentPhotoIndex + 1 }} /
              {{ currentAlbum?.photos.length }}</span
            >
            <button class="lb-nav" @click="nextPhoto">Siguiente ›</button>
          </div>
        </div>
      </div>
    </Teleport>
  </Window>
</template>

<script setup>
import { ref, computed } from "vue";
import Window from "./Window.vue";

const emit = defineEmits(["close", "minimize"]);

const selectedAlbum = ref("recientes");
const selectedPhoto = ref(null);
const lightboxPhoto = ref(null);
const viewMode = ref("grid");

const albums = ref([
  {
    id: "recientes",
    icon: "🕐",
    label: "Recientes",
    photos: [
      {
        id: 1,
        name: "sin_titulo_2.png",
        emoji: "🖥️",
        color: "#0a0a12",
        date: "14/05/2024 02:51",
        size: "1.2 MB",
        res: "1280×720",
        note: "Captura desde cámara web. Cuarto oscuro. Monitor encendido.",
      },
      {
        id: 2,
        name: "scan_doc_001.jpg",
        emoji: "📄",
        color: "#0f0f0f",
        date: "11/03/2022",
        size: "3.8 MB",
        res: "2480×3508",
        note: "Escáner en blanco y negro. 300 DPI.",
      },
      {
        id: 3,
        name: "captura_pantalla_031.png",
        emoji: "💻",
        color: "#081520",
        date: "14/05/2024 03:02",
        size: "890 KB",
        res: "1920×1080",
        note: null,
      },
      {
        id: 4,
        name: "IMG_0047.jpg",
        emoji: "📁",
        color: "#120808",
        date: "09/03/2022",
        size: "2.1 MB",
        res: "3024×4032",
        note: "Fotografía de documentos físicos.",
      },
      {
        id: 5,
        name: "captura_031_copia.png",
        emoji: "⚠️",
        color: "#0a0806",
        date: "14/05/2024 03:47",
        size: "— KB",
        res: "—",
        corrupted: true,
        note: "Archivo dañado. Recuperación fallida.",
      },
    ],
  },
  {
    id: "documentos",
    icon: "📄",
    label: "Documentos escaneados",
    photos: [
      {
        id: 6,
        name: "scan_doc_001.jpg",
        emoji: "📄",
        color: "#0f0f0f",
        date: "11/03/2022",
        size: "3.8 MB",
        res: "2480×3508",
        note: "Escáner en blanco y negro.",
      },
      {
        id: 7,
        name: "scan_doc_002.jpg",
        emoji: "📑",
        color: "#0d0d0d",
        date: "11/03/2022",
        size: "3.6 MB",
        res: "2480×3508",
        note: null,
      },
      {
        id: 8,
        name: "scan_evidencia_A.jpg",
        emoji: "🔍",
        color: "#0a1000",
        date: "12/03/2022",
        size: "4.2 MB",
        res: "2480×3508",
        note: "Evidencia — Caso 0047.",
      },
    ],
  },
  {
    id: "capturas",
    icon: "💻",
    label: "Capturas de pantalla",
    photos: [
      {
        id: 9,
        name: "captura_pantalla_031.png",
        emoji: "💻",
        color: "#081520",
        date: "14/05/2024 03:02",
        size: "890 KB",
        res: "1920×1080",
        note: null,
      },
      {
        id: 10,
        name: "captura_log_error.png",
        emoji: "📟",
        color: "#100808",
        date: "14/05/2024 03:19",
        size: "340 KB",
        res: "1024×768",
        note: "Log del sistema — sesión activa.",
      },
      {
        id: 11,
        name: "captura_031_copia.png",
        emoji: "⚠️",
        color: "#0a0806",
        date: "14/05/2024 03:47",
        size: "— KB",
        res: "—",
        corrupted: true,
        note: "Archivo dañado.",
      },
    ],
  },
  {
    id: "papelera",
    icon: "🗑️",
    label: "Eliminadas recientemente",
    photos: [
      {
        id: 12,
        name: "foto_antigua.jpg",
        emoji: "👤",
        color: "#0d0d0d",
        date: "14/05/2024 03:19",
        size: "1.8 MB",
        res: "800×600",
        note: "Eliminado por: mh_admin — 14/05/2024 03:19",
      },
    ],
  },
]);

const currentAlbum = computed(() =>
  albums.value.find((a) => a.id === selectedAlbum.value),
);

const currentPhotoIndex = computed(() => {
  if (!lightboxPhoto.value || !currentAlbum.value) return 0;
  return currentAlbum.value.photos.findIndex(
    (p) => p.id === lightboxPhoto.value.id,
  );
});

function openPhoto(photo) {
  lightboxPhoto.value = photo;
}

function prevPhoto() {
  const photos = currentAlbum.value?.photos;
  if (!photos) return;
  const idx = currentPhotoIndex.value;
  lightboxPhoto.value = photos[(idx - 1 + photos.length) % photos.length];
}

function nextPhoto() {
  const photos = currentAlbum.value?.photos;
  if (!photos) return;
  const idx = currentPhotoIndex.value;
  lightboxPhoto.value = photos[(idx + 1) % photos.length];
}
</script>

<style scoped>
.gallery-app {
  display: flex;
  height: 460px;
  font-family: "Segoe UI", sans-serif;
  font-size: 13px;
}

/* Sidebar */
.gallery-sidebar {
  width: 180px;
  flex-shrink: 0;
  background: #0f0f0f;
  border-right: 1px solid #1e1e1e;
  padding: 6px 0;
  overflow-y: auto;
}

.album-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  cursor: pointer;
  color: #777;
  font-size: 12px;
  border-radius: 4px;
  margin: 1px 4px;
  transition:
    background 0.15s,
    color 0.15s;
}
.album-item:hover {
  background: #1a1a1a;
  color: #bbb;
}
.album-item.active {
  background: #1a3a5c;
  color: #fff;
}

.album-icon {
  font-size: 14px;
}
.album-label {
  flex: 1;
}
.album-count {
  font-size: 10px;
  background: #1e1e1e;
  color: #555;
  padding: 1px 5px;
  border-radius: 8px;
}
.album-item.active .album-count {
  background: #0f2a40;
  color: #4a9eff;
}

/* Main */
.gallery-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #0d0d0d;
}

.gallery-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #111;
  border-bottom: 1px solid #1e1e1e;
  flex-shrink: 0;
}

.toolbar-title {
  font-size: 12px;
  color: #888;
  font-weight: 600;
}
.toolbar-right {
  display: flex;
  gap: 2px;
}

.view-btn {
  background: none;
  border: 1px solid transparent;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}
.view-btn:hover {
  color: #aaa;
  background: #1a1a1a;
}
.view-btn.active {
  color: #4a9eff;
  border-color: #1a3a5c;
  background: #0f2030;
}

/* Grid */
.photo-grid {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 8px;
  padding: 10px;
  overflow-y: auto;
}

.photo-thumb {
  width: 90px;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid transparent;
  transition:
    border-color 0.15s,
    transform 0.1s;
}
.photo-thumb:hover {
  border-color: #333;
  transform: scale(1.02);
}
.photo-thumb.selected {
  border-color: #4a9eff;
}
.photo-thumb.corrupted {
  opacity: 0.6;
}

.thumb-img {
  width: 90px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.thumb-icon {
  font-size: 28px;
}

.corrupted-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(180, 30, 30, 0.12) 0px,
    rgba(180, 30, 30, 0.12) 2px,
    transparent 2px,
    transparent 8px
  );
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 3px 4px;
  font-size: 8px;
  color: #cc4444;
  letter-spacing: 0.5px;
  font-weight: bold;
}

.thumb-name {
  padding: 4px 5px;
  font-size: 10px;
  color: #666;
  background: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* List */
.photo-list {
  flex: 1;
  overflow-y: auto;
}

.photo-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  cursor: pointer;
  border-bottom: 1px solid #111;
  transition: background 0.15s;
}
.photo-row:hover {
  background: #141414;
}
.photo-row.selected {
  background: #0f2030;
}
.photo-row.corrupted {
  opacity: 0.6;
}

.row-thumb {
  width: 40px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.row-info {
  flex: 1;
  overflow: hidden;
}
.row-name {
  font-size: 12px;
  color: #ccc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-meta {
  font-size: 10px;
  color: #444;
  margin-top: 2px;
}

.row-badge {
  font-size: 10px;
  color: #cc4444;
  background: #1a0808;
  border: 1px solid #3a1010;
  padding: 2px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

/* Status */
.gallery-status {
  padding: 4px 12px;
  background: #111;
  border-top: 1px solid #1e1e1e;
  font-size: 11px;
  color: #444;
  flex-shrink: 0;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.lightbox-window {
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  width: 560px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 60px rgba(0, 0, 0, 0.9);
}

.lightbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #161616;
  border-bottom: 1px solid #222;
  font-size: 12px;
  color: #888;
}

.lb-close {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 12px;
  transition: color 0.15s;
}
.lb-close:hover {
  color: #ff4444;
}

.lightbox-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.lightbox-img {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  position: relative;
}

.lb-emoji {
  font-size: 64px;
  opacity: 0.3;
}

.lb-corrupted {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(
    45deg,
    rgba(180, 30, 30, 0.08) 0px,
    rgba(180, 30, 30, 0.08) 2px,
    transparent 2px,
    transparent 10px
  );
  gap: 6px;
}

.lbc-title {
  font-size: 14px;
  color: #cc4444;
  font-weight: bold;
}
.lbc-sub {
  font-size: 11px;
  color: #555;
  text-align: center;
  line-height: 1.6;
}

.lightbox-meta {
  width: 180px;
  flex-shrink: 0;
  background: #0d0d0d;
  border-left: 1px solid #1e1e1e;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.meta-key {
  font-size: 10px;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.meta-val {
  font-size: 12px;
  color: #888;
  font-family: "Courier New", monospace;
  word-break: break-all;
}

.meta-note {
  margin-top: 6px;
  padding: 8px;
  background: #111;
  border: 1px solid #1e1e1e;
  border-radius: 4px;
  font-size: 11px;
  color: #555;
  font-style: italic;
  line-height: 1.5;
}

.lightbox-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  background: #161616;
  border-top: 1px solid #222;
}

.lb-nav {
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  color: #888;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-family: "Segoe UI", sans-serif;
  transition:
    background 0.15s,
    color 0.15s;
}
.lb-nav:hover {
  background: #222;
  color: #ccc;
}

.lb-counter {
  font-size: 11px;
  color: #444;
}
</style>
