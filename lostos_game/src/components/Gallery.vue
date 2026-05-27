<template>
  <Window title="🖼️ Galería" @close="$emit('close')" @minimize="$emit('minimize')">
    <div class="gallery-app">

      <!-- Sidebar -->
      <div class="gallery-sidebar">
        <div
          v-for="album in albums"
          :key="album.id"
          class="album-item"
          :class="{ active: selectedAlbum === album.id }"
          @click="selectedAlbum = album.id; selectedPhoto = null"
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
            <button class="view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">⊞</button>
            <button class="view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">☰</button>
          </div>
        </div>

        <!-- Grid view -->
        <div v-if="viewMode === 'grid'" class="photo-grid">
          <div
            v-for="photo in currentAlbum?.photos"
            :key="photo.id"
            class="photo-thumb"
            :class="{ selected: selectedPhoto?.id === photo.id, corrupted: photo.corrupted, locked: photo.locked && !unlockedPhotos[photo.id] }"
            @click="selectedPhoto = photo"
            @dblclick="openPhoto(photo)"
          >
            <div class="thumb-img" :style="photo.img
              ? { backgroundImage: `url(${photo.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: photo.color }">
              <span class="thumb-icon">
                {{ photo.locked && !unlockedPhotos[photo.id] ? '🔒' : (photo.corrupted ? '⚠️' : (photo.img ? '' : photo.emoji)) }}
              </span>
              <div v-if="photo.corrupted" class="corrupted-overlay">DAÑADO</div>
              <div v-if="photo.locked && !unlockedPhotos[photo.id]" class="locked-overlay">BLOQUEADO</div>
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
            :class="{ selected: selectedPhoto?.id === photo.id, corrupted: photo.corrupted, locked: photo.locked && !unlockedPhotos[photo.id] }"
            @click="selectedPhoto = photo"
            @dblclick="openPhoto(photo)"
          >
            <div class="row-thumb" :style="photo.img
              ? { backgroundImage: `url(${photo.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: photo.color }">
              <span>{{ photo.locked && !unlockedPhotos[photo.id] ? '🔒' : (photo.corrupted ? '⚠️' : (photo.img ? '' : photo.emoji)) }}</span>
            </div>
            <div class="row-info">
              <div class="row-name">{{ photo.name }}</div>
              <div class="row-meta">{{ photo.date }} · {{ photo.size }}</div>
            </div>
            <div v-if="photo.corrupted" class="row-badge">Dañado</div>
            <div v-if="photo.locked && !unlockedPhotos[photo.id]" class="row-badge row-badge-lock">Bloqueado</div>
          </div>
        </div>

        <!-- Status bar -->
        <div class="gallery-status">
          {{ currentAlbum?.photos.length }} fotos
          <span v-if="selectedPhoto"> · {{ selectedPhoto.name }} seleccionada</span>
        </div>
      </div>

    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <div v-if="lightboxPhoto" class="lightbox" @click.self="closeLightbox">
        <div class="lightbox-window">
          <div class="lightbox-header">
            <span>{{ lightboxPhoto.name }}</span>
            <button class="lb-close" @click="closeLightbox">✕</button>
          </div>
          <div class="lightbox-body">

            <!-- Foto bloqueada → formulario de código -->
            <div v-if="lightboxPhoto.locked && !unlockedPhotos[lightboxPhoto.id]" class="lb-lock-panel">
              <div class="lb-lock-icon">🔒</div>
              <div class="lb-lock-title">Archivo bloqueado</div>
              <div class="lb-lock-sub">Introduce el código de 4 dígitos</div>
              <input
                v-model="lockCode"
                class="lb-lock-input"
                type="password"
                maxlength="4"
                placeholder="••••"
                @keyup.enter="tryUnlockPhoto(lightboxPhoto)"
                autofocus
              />
              <p v-if="lockError" class="lb-lock-error">Código incorrecto.</p>
              <button class="lb-lock-btn" @click="tryUnlockPhoto(lightboxPhoto)">Desbloquear</button>
            </div>

            <!-- Foto desbloqueada (antes estaba bloqueada) -->
            <div v-else-if="lightboxPhoto.locked && unlockedPhotos[lightboxPhoto.id]" class="lightbox-img" :style="{ background: lightboxPhoto.color }">
              <div class="lb-unlocked-content">
                <div class="lb-unlocked-icon">👤</div>
                <div class="lb-unlocked-desc">Rostro parcial — sin identificación oficial.</div>
                <div class="lb-unlocked-sub">Creador del sistema. Oscuro. Serio.</div>
              </div>
            </div>

            <!-- Foto normal o corrupta -->
            <div v-else class="lightbox-img" :style="lightboxPhoto.img
              ? { backgroundImage: `url(${lightboxPhoto.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: lightboxPhoto.color }">
              <span v-if="!lightboxPhoto.img" class="lb-emoji">{{ lightboxPhoto.corrupted ? '⚠️' : lightboxPhoto.emoji }}</span>
              <div v-if="lightboxPhoto.corrupted" class="lb-corrupted">
                <div class="lbc-title">Archivo dañado</div>
                <div class="lbc-sub">No se puede mostrar la imagen completa.<br/>Datos parcialmente recuperados.</div>
              </div>
            </div>

            <div class="lightbox-meta">
              <div class="meta-row"><span class="meta-key">Archivo</span><span class="meta-val">{{ lightboxPhoto.name }}</span></div>
              <div class="meta-row"><span class="meta-key">Fecha</span><span class="meta-val">{{ lightboxPhoto.date }}</span></div>
              <div class="meta-row"><span class="meta-key">Tamaño</span><span class="meta-val">{{ lightboxPhoto.size }}</span></div>
              <div class="meta-row"><span class="meta-key">Resolución</span><span class="meta-val">{{ lightboxPhoto.res }}</span></div>
              <div v-if="lightboxPhoto.note" class="meta-note">{{ lightboxPhoto.note }}</div>
            </div>
          </div>

          <div class="lightbox-nav">
            <button class="lb-nav" @click="prevPhoto">‹ Anterior</button>
            <span class="lb-counter">{{ currentPhotoIndex + 1 }} / {{ currentAlbum?.photos.length }}</span>
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
import lunaImg from "../assets/gallery/foto_luna.jpg";
import camaraImg from "../assets/gallery/camara_seguridad_0314.jpg";
import calendarioImg from "../assets/gallery/octubre_calendario.jpg";
import creadorImg from "../assets/gallery/creador_bloqueado.jpg";
import scanEvidenciaImg from "../assets/gallery/scan_evidencia_A.jpg";

const emit = defineEmits(["close", "minimize"]);

const selectedAlbum = ref("recientes");
const selectedPhoto = ref(null);
const lightboxPhoto = ref(null);
const viewMode      = ref("grid");

// ── Desbloqueo de fotos con código ────────────────────────────────────────
const lockCode        = ref('');
const lockError       = ref(false);
const unlockedPhotos  = ref({});

function tryUnlockPhoto(photo) {
  if (lockCode.value === photo.lockCode) {
    unlockedPhotos.value[photo.id] = true;
    lockError.value = false;
    lockCode.value  = '';
  } else {
    lockError.value = true;
    lockCode.value  = '';
  }
}

function closeLightbox() {
  lightboxPhoto.value = null;
  lockCode.value      = '';
  lockError.value     = false;
}

// ── Albums ────────────────────────────────────────────────────────────────
const albums = ref([
  {
    id: "recientes",
    icon: "🕐",
    label: "Recientes",
    photos: [
      {
        id: 1,
        name: "foto_luna.jpg",
        emoji: "🐱",
        img: lunaImg,
        color: "#0a0a12",
        date: "12/05/2024",
        size: "1.4 MB",
        res: "1280×720",
        note: "Luna durmiendo en el sillón. Su foto favorita.",
      },
      {
        id: 2,
        name: "octubre_calendario.jpg",
        emoji: "📅",
        img: calendarioImg,
        color: "#0f0a0a",
        date: "01/10/2020",
        size: "880 KB",
        res: "1024×768",
        note: "Octubre marcado con rojo. Día 14 señalado.",
      },
      {
        id: 3,
        name: "camara_seguridad_0314.png",
        emoji: "📷",
        img: camaraImg,
        color: "#080808",
        date: "14/10/2020 03:14",
        size: "2.1 MB",
        res: "1280×720",
        note: "Cámara interior — pasillo norte.\nRegistro automático: 03:14 AM\nHora coincidente con la primera desaparición registrada el 14/10/2020.\nFigura detectada al fondo del pasillo.",
      },
      
    ],
  },
  {
    id: "documentos",
    icon: "📄",
    label: "Documentos escaneados",
    photos: [
      {
        id: 5,
        name: "scan_doc_001.jpg",
        emoji: "📄",
        color: "#0f0f0f",
        date: "11/03/2022",
        size: "3.8 MB",
        res: "2480×3508",
        note: "Escáner en blanco y negro.",
      },
      {
        id: 6,
        name: "scan_evidencia_A.jpg",
        emoji: "🔍",
        img: scanEvidenciaImg,
        color: "#0a1000",
        date: "12/03/2022",
        size: "4.2 MB",
        res: "2480×3508",
        note: "Evidencia — Casos de desapariciones.",
      },
    ],
  },
  {
    id: "papelera",
    icon: "🗑️",
    label: "Eliminadas recientemente",
    photos: [
      {
        id: 4,
        name: "creador_bloqueado.jpg",
        emoji: "👤",
        img: creadorImg,
        color: "#050505",
        date: "14/05/2024",
        size: "3.2 MB",
        res: "1920×1080",
        locked: true,
        lockCode: "0314",
        note: "Acceso restringido. Se requiere código.",
      },
    ],
  },
]);

const currentAlbum = computed(() =>
  albums.value.find(a => a.id === selectedAlbum.value)
);

const currentPhotoIndex = computed(() => {
  if (!lightboxPhoto.value || !currentAlbum.value) return 0;
  return currentAlbum.value.photos.findIndex(p => p.id === lightboxPhoto.value.id);
});

function openPhoto(photo) {
  lockCode.value  = '';
  lockError.value = false;
  lightboxPhoto.value = photo;
}

function prevPhoto() {
  const photos = currentAlbum.value?.photos;
  if (!photos) return;
  const idx = currentPhotoIndex.value;
  lightboxPhoto.value = photos[(idx - 1 + photos.length) % photos.length];
  lockCode.value  = '';
  lockError.value = false;
}

function nextPhoto() {
  const photos = currentAlbum.value?.photos;
  if (!photos) return;
  const idx = currentPhotoIndex.value;
  lightboxPhoto.value = photos[(idx + 1) % photos.length];
  lockCode.value  = '';
  lockError.value = false;
}
</script>

<style scoped>
.gallery-app {
  display: flex;
  height: 460px;
  font-family: 'Segoe UI', sans-serif;
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
  transition: background 0.15s, color 0.15s;
}
.album-item:hover  { background: #1a1a1a; color: #bbb; }
.album-item.active { background: #1a3a5c; color: #fff; }

.album-icon  { font-size: 14px; }
.album-label { flex: 1; }
.album-count {
  font-size: 10px;
  background: #1e1e1e;
  color: #555;
  padding: 1px 5px;
  border-radius: 8px;
}
.album-item.active .album-count { background: #0f2a40; color: #4a9eff; }

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

.toolbar-title { font-size: 12px; color: #888; font-weight: 600; }
.toolbar-right  { display: flex; gap: 2px; }

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
.view-btn:hover  { color: #aaa; background: #1a1a1a; }
.view-btn.active { color: #4a9eff; border-color: #1a3a5c; background: #0f2030; }

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
  transition: border-color 0.15s, transform 0.1s;
}
.photo-thumb:hover    { border-color: #333; transform: scale(1.02); }
.photo-thumb.selected { border-color: #4a9eff; }
.photo-thumb.corrupted { opacity: 0.6; }
.photo-thumb.locked { opacity: 0.75; }

.thumb-img {
  width: 90px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.thumb-icon { font-size: 28px; }

.corrupted-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(180,30,30,0.12) 0px,
    rgba(180,30,30,0.12) 2px,
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

.locked-overlay {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(80,80,80,0.10) 0px,
    rgba(80,80,80,0.10) 2px,
    transparent 2px,
    transparent 8px
  );
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 3px 4px;
  font-size: 8px;
  color: #888;
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
.photo-list { flex: 1; overflow-y: auto; }

.photo-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  cursor: pointer;
  border-bottom: 1px solid #111;
  transition: background 0.15s;
}
.photo-row:hover    { background: #141414; }
.photo-row.selected { background: #0f2030; }
.photo-row.corrupted { opacity: 0.6; }
.photo-row.locked { opacity: 0.75; }

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

.row-info { flex: 1; overflow: hidden; }
.row-name { font-size: 12px; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-meta { font-size: 10px; color: #444; margin-top: 2px; }

.row-badge {
  font-size: 10px;
  color: #cc4444;
  background: #1a0808;
  border: 1px solid #3a1010;
  padding: 2px 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

.row-badge-lock {
  color: #888;
  background: #141414;
  border-color: #2a2a2a;
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
  background: rgba(0,0,0,0.85);
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
  box-shadow: 0 0 60px rgba(0,0,0,0.9);
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
.lb-close:hover { color: #ff4444; }

.lightbox-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Panel de bloqueo */
.lb-lock-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #080808;
  padding: 24px;
  min-height: 260px;
}

.lb-lock-icon  { font-size: 40px; opacity: 0.4; }
.lb-lock-title { font-size: 14px; color: #cc4444; font-weight: bold; }
.lb-lock-sub   { font-size: 11px; color: #555; margin-bottom: 4px; }

.lb-lock-input {
  background: #0a0a0a;
  border: 1px solid #333;
  color: #ccc;
  padding: 10px 14px;
  border-radius: 4px;
  font-size: 20px;
  letter-spacing: 8px;
  text-align: center;
  outline: none;
  width: 130px;
  font-family: 'Courier New', monospace;
  transition: border-color 0.15s;
}
.lb-lock-input:focus { border-color: #555; }

.lb-lock-error {
  color: #cc4444;
  font-size: 11px;
  margin: 0;
  font-family: 'Courier New', monospace;
}

.lb-lock-btn {
  background: #1a3a5c;
  border: 1px solid #2a5a8c;
  color: #7ab8e0;
  padding: 7px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Segoe UI', sans-serif;
  transition: background 0.15s;
  margin-top: 4px;
}
.lb-lock-btn:hover { background: #1f4a7a; }

/* Foto desbloqueada */
.lb-unlocked-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100%;
}
.lb-unlocked-icon { font-size: 56px; opacity: 0.5; }
.lb-unlocked-desc { font-size: 13px; color: #888; text-align: center; font-family: 'Courier New', monospace; }
.lb-unlocked-sub  { font-size: 11px; color: #444; text-align: center; }

/* Foto normal */
.lightbox-img {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  position: relative;
}

.lb-emoji { font-size: 64px; opacity: 0.3; }

.lb-corrupted {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: repeating-linear-gradient(
    45deg,
    rgba(180,30,30,0.08) 0px,
    rgba(180,30,30,0.08) 2px,
    transparent 2px,
    transparent 10px
  );
  gap: 6px;
}

.lbc-title { font-size: 14px; color: #cc4444; font-weight: bold; }
.lbc-sub   { font-size: 11px; color: #555; text-align: center; line-height: 1.6; }

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

.meta-row { display: flex; flex-direction: column; gap: 1px; }
.meta-key { font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 0.5px; }
.meta-val { font-size: 12px; color: #888; font-family: 'Courier New', monospace; word-break: break-all; }

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
  white-space: pre-line;
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
  font-family: 'Segoe UI', sans-serif;
  transition: background 0.15s, color 0.15s;
}
.lb-nav:hover { background: #222; color: #ccc; }

.lb-counter { font-size: 11px; color: #444; }
</style>