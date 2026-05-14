<template>
  <Window title="💬 Mensajes" @close="$emit('close')" @minimize="$emit('minimize')">
    <div class="chat-app">

      <!-- Sidebar: lista de conversaciones -->
      <div class="chat-sidebar">
        <div class="chat-search">
          <span class="search-icon">🔍</span>
          <input class="search-input" placeholder="Buscar..." v-model="searchQuery" />
        </div>
        <div class="chat-list">
          <div
            v-for="conv in filteredConvs"
            :key="conv.id"
            class="chat-conv"
            :class="{ active: selectedConv?.id === conv.id }"
            @click="selectConv(conv)"
          >
            <div class="conv-avatar" :class="{ online: conv.online, away: conv.away }">
              {{ conv.avatar }}
            </div>
            <div class="conv-info">
              <div class="conv-header">
                <span class="conv-name">{{ conv.name }}</span>
                <span class="conv-time">{{ conv.lastTime }}</span>
              </div>
              <div class="conv-preview-row">
                <span class="conv-preview" :class="{ unread: conv.unread > 0 }">{{ conv.lastMsg }}</span>
                <span v-if="conv.unread > 0" class="conv-badge">{{ conv.unread }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel de mensajes -->
      <div class="chat-main">
        <template v-if="selectedConv">
          <!-- Header del chat -->
          <div class="chat-header">
            <div class="chat-avatar-lg" :class="{ online: selectedConv.online }">
              {{ selectedConv.avatar }}
            </div>
            <div class="chat-header-info">
              <div class="chat-header-name">{{ selectedConv.name }}</div>
              <div class="chat-header-status">
                <span class="status-dot" :class="{ online: selectedConv.online, away: selectedConv.away }"></span>
                {{ selectedConv.online ? 'En línea' : selectedConv.away ? 'Ausente' : 'Desconectado' }}
              </div>
            </div>
            <div class="chat-header-actions">
              <button class="hdr-btn" title="Llamar">📞</button>
              <button class="hdr-btn" title="Video">📹</button>
              <button class="hdr-btn" title="Info">ℹ️</button>
            </div>
          </div>

          <!-- Mensajes -->
          <div class="messages-area" ref="messagesArea">
            <div
              v-for="(msg, i) in selectedConv.messages"
              :key="i"
              class="msg-wrapper"
              :class="{ mine: msg.mine, system: msg.system }"
            >
              <div v-if="msg.system" class="msg-system">{{ msg.text }}</div>
              <template v-else>
                <div class="msg-bubble" :class="{ mine: msg.mine, deleted: msg.deleted }">
                  <span v-if="msg.deleted" class="msg-deleted">🚫 Mensaje eliminado</span>
                  <span v-else>{{ msg.text }}</span>
                  <div class="msg-meta">
                    <span class="msg-time">{{ msg.time }}</span>
                    <span v-if="msg.mine" class="msg-check">{{ msg.read ? '✓✓' : '✓' }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input-area">
            <button class="input-btn">📎</button>
            <input
              class="chat-input"
              placeholder="Escribe un mensaje..."
              v-model="inputText"
              @keyup.enter="sendMessage"
            />
            <button class="input-btn">😊</button>
            <button class="send-btn" @click="sendMessage" :disabled="!inputText.trim()">
              ➤
            </button>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else class="chat-empty">
          <div class="empty-icon">💬</div>
          <div class="empty-title">Mensajes</div>
          <div class="empty-sub">Selecciona una conversación para leerla</div>
        </div>
      </div>

    </div>
  </Window>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import Window from "./Window.vue";

const emit = defineEmits(["close", "minimize"]);

const searchQuery = ref("");
const inputText = ref("");
const messagesArea = ref(null);
const selectedConv = ref(null);

const conversations = ref([
  {
    id: 1,
    name: "M.H.",
    avatar: "👤",
    online: false,
    away: false,
    lastMsg: "No contestes este número.",
    lastTime: "03:58",
    unread: 0,
    messages: [
      { text: "Conexión cifrada establecida", system: true },
      { text: "Sé que estás buscando.", time: "03:21", mine: false, read: true },
      { text: "Para. Todavía estás a tiempo.", time: "03:22", mine: false, read: true },
      { text: "¿Quién eres?", time: "03:24", mine: true, read: true },
      { text: "Alguien que también lo supo.", time: "03:25", mine: false, read: true },
      { text: "¿Qué le pasó a E.V.?", time: "03:31", mine: true, read: true },
      { deleted: true, time: "03:33", mine: false, read: true },
      { text: "No contestes este número.", time: "03:58", mine: false, read: false },
    ],
  },
  {
    id: 2,
    name: "Grupo — Caso 0047",
    avatar: "👥",
    online: false,
    away: false,
    lastMsg: "ev_local: adjunto el log completo",
    lastTime: "03/03",
    unread: 0,
    messages: [
      { text: "Grupo creado por ev_local", system: true },
      { text: "adjunto el log completo. hay actividad en los servidores de VDS desde enero.", time: "11/03", mine: true, read: true },
      { text: "confirmado desde mi lado. los timestamps coinciden.", time: "11/03", mine: false, read: true },
      { text: "voy a llevar esto a Alsina mañana.", time: "12/03", mine: true, read: true },
      { text: "ev_local abandonó el grupo", system: true },
    ],
  },
  {
    id: 3,
    name: "Sistema",
    avatar: "🤖",
    online: true,
    away: false,
    lastMsg: "Actividad inusual detectada en tu sesión.",
    lastTime: "14/05",
    unread: 1,
    messages: [
      { text: "Bienvenido al sistema de mensajería segura.", system: true },
      { text: "Actividad inusual detectada en tu sesión. Se han registrado 3 intentos de acceso a archivos protegidos.", time: "02:31", mine: false, read: false },
    ],
  },
]);

const filteredConvs = computed(() => {
  if (!searchQuery.value) return conversations.value;
  return conversations.value.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

function selectConv(conv) {
  selectedConv.value = conv;
  conv.unread = 0;
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
  });
}

function sendMessage() {
  if (!inputText.value.trim() || !selectedConv.value) return;
  const now = new Date();
  const time = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  selectedConv.value.messages.push({
    text: inputText.value.trim(),
    time,
    mine: true,
    read: false,
  });
  selectedConv.value.lastMsg = inputText.value.trim();
  selectedConv.value.lastTime = time;
  inputText.value = "";
  nextTick(() => {
    if (messagesArea.value) {
      messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
    }
  });
}
</script>

<style scoped>
.chat-app {
  display: flex;
  height: 480px;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
}

/* Sidebar */
.chat-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #0f0f0f;
  border-right: 1px solid #1e1e1e;
  display: flex;
  flex-direction: column;
}

.chat-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #111;
  border-bottom: 1px solid #1e1e1e;
}

.search-icon { font-size: 11px; opacity: 0.4; }

.search-input {
  flex: 1;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  color: #aaa;
  font-size: 12px;
  padding: 4px 10px;
  outline: none;
}
.search-input::placeholder { color: #444; }
.search-input:focus { border-color: #3a3a3a; }

.chat-list { flex: 1; overflow-y: auto; }

.chat-conv {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #141414;
  transition: background 0.15s;
}
.chat-conv:hover { background: #161616; }
.chat-conv.active { background: #1a2a3a; }

.conv-avatar {
  font-size: 24px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #1a1a1a;
  border: 2px solid #2a2a2a;
  flex-shrink: 0;
  position: relative;
}
.conv-avatar.online { border-color: #2a6a2a; }
.conv-avatar.away   { border-color: #6a5a2a; }

.conv-info { flex: 1; overflow: hidden; }

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 2px;
}
.conv-name { font-size: 12px; color: #ccc; font-weight: 600; }
.conv-time { font-size: 10px; color: #444; }

.conv-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.conv-preview { font-size: 11px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.conv-preview.unread { color: #888; }

.conv-badge {
  background: #4a9eff;
  color: #000;
  font-size: 9px;
  font-weight: bold;
  border-radius: 8px;
  padding: 1px 5px;
  margin-left: 4px;
  flex-shrink: 0;
}

/* Main chat */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0d0d0d;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #111;
  border-bottom: 1px solid #1e1e1e;
  flex-shrink: 0;
}

.chat-avatar-lg {
  font-size: 22px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #1a1a1a;
  border: 2px solid #2a2a2a;
  flex-shrink: 0;
}
.chat-avatar-lg.online { border-color: #2a6a2a; }

.chat-header-info { flex: 1; }
.chat-header-name { font-size: 13px; color: #ddd; font-weight: 600; }
.chat-header-status { font-size: 11px; color: #555; display: flex; align-items: center; gap: 4px; }

.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #444;
}
.status-dot.online { background: #3a8a3a; }
.status-dot.away   { background: #8a7a2a; }

.chat-header-actions { display: flex; gap: 4px; }

.hdr-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  opacity: 0.4;
  transition: opacity 0.15s, background 0.15s;
}
.hdr-btn:hover { opacity: 0.8; background: #1a1a1a; }

/* Messages */
.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.msg-wrapper { display: flex; }
.msg-wrapper.mine { justify-content: flex-end; }
.msg-wrapper.system { justify-content: center; }

.msg-system {
  font-size: 11px;
  color: #333;
  background: #111;
  border: 1px solid #1e1e1e;
  border-radius: 10px;
  padding: 3px 10px;
  margin: 6px 0;
}

.msg-bubble {
  max-width: 65%;
  background: #1a1a1a;
  border: 1px solid #252525;
  border-radius: 12px 12px 12px 3px;
  padding: 7px 10px 4px;
  color: #bbb;
  font-size: 12px;
  line-height: 1.5;
  position: relative;
}

.msg-bubble.mine {
  background: #0f2a3f;
  border-color: #1a3a55;
  border-radius: 12px 12px 3px 12px;
  color: #aac8e0;
}

.msg-bubble.deleted { opacity: 0.5; }
.msg-deleted { font-style: italic; color: #555; }

.msg-meta {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}
.msg-time  { font-size: 10px; color: #444; }
.msg-check { font-size: 10px; color: #3a6a8a; }

/* Input */
.chat-input-area {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #111;
  border-top: 1px solid #1e1e1e;
  flex-shrink: 0;
}

.input-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.15s;
  flex-shrink: 0;
  padding: 2px;
}
.input-btn:hover { opacity: 0.7; }

.chat-input {
  flex: 1;
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 18px;
  color: #ccc;
  font-size: 12px;
  padding: 6px 14px;
  outline: none;
  font-family: 'Segoe UI', sans-serif;
}
.chat-input::placeholder { color: #444; }
.chat-input:focus { border-color: #3a3a3a; }

.send-btn {
  background: #1a3a5c;
  border: 1px solid #2a5a8c;
  color: #4a9eff;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) { background: #1f4a7a; }
.send-btn:disabled { opacity: 0.3; cursor: default; }

/* Empty */
.chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #333;
}
.empty-icon  { font-size: 40px; opacity: 0.3; }
.empty-title { font-size: 15px; color: #444; }
.empty-sub   { font-size: 12px; color: #333; }
</style>