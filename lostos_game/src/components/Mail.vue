<template>
  <Window title="📧 Correo" @close="$emit('close')" @minimize="$emit('minimize')">
    <div class="mail-app">

      <!-- Sidebar -->
      <div class="mail-sidebar">
        <div class="compose-btn" @click="composeOpen = true">✏️ Redactar</div>
        <div class="mail-folders">
          <div
            v-for="folder in folders"
            :key="folder.id"
            class="mail-folder"
            :class="{ active: currentFolder === folder.id }"
            @click="currentFolder = folder.id; selectedMail = null"
          >
            <span>{{ folder.icon }}</span>
            <span>{{ folder.label }}</span>
            <span v-if="folder.unread" class="unread-badge">{{ folder.unread }}</span>
          </div>
        </div>
      </div>

      <!-- Lista de correos -->
      <div class="mail-list">
        <div
          v-for="mail in currentMails"
          :key="mail.id"
          class="mail-item"
          :class="{ selected: selectedMail?.id === mail.id, unread: mail.unread }"
          @click="openMail(mail)"
        >
          <div class="mail-from">{{ mail.from }}</div>
          <div class="mail-subject">{{ mail.subject }}</div>
          <div class="mail-preview">{{ mail.preview }}</div>
          <div class="mail-date">{{ mail.date }}</div>
        </div>
        <div v-if="currentMails.length === 0" class="mail-empty">Sin mensajes</div>
      </div>

      <!-- Vista del correo -->
      <div class="mail-view">
        <div v-if="selectedMail" class="mail-content">
          <div class="mail-header">
            <div class="mail-view-subject">{{ selectedMail.subject }}</div>
            <div class="mail-view-meta">
              <span>De: <b>{{ selectedMail.from }}</b></span>
              <span>Para: <b>{{ selectedMail.to }}</b></span>
              <span>{{ selectedMail.date }}</span>
            </div>
          </div>
          <div class="mail-body">{{ selectedMail.body }}</div>
        </div>
        <div v-else class="mail-placeholder">
          Selecciona un mensaje para leerlo
        </div>
      </div>
    </div>

    <!-- Dialog: Redactar -->
    <Teleport to="body">
      <div v-if="composeOpen" class="dialog-overlay" @click.self="composeOpen = false">
        <div class="dialog compose-dialog">
          <div class="dialog-title">
            ✏️ Nuevo mensaje
            <button class="dialog-close" @click="composeOpen = false">✕</button>
          </div>
          <div class="compose-body">
            <input class="compose-input" placeholder="Para:" />
            <input class="compose-input" placeholder="Asunto:" />
            <textarea class="compose-textarea" placeholder="Escribe tu mensaje..."></textarea>
            <div class="compose-actions">
              <button class="compose-send" @click="composeOpen = false">Enviar</button>
              <button class="compose-cancel" @click="composeOpen = false">Cancelar</button>
            </div>
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

const currentFolder = ref("inbox");
const selectedMail = ref(null);
const composeOpen = ref(false);

const folders = [
  { id: "inbox",   icon: "📥", label: "Bandeja de entrada", unread: 2 },
  { id: "sent",    icon: "📤", label: "Enviados",            unread: 0 },
  { id: "drafts",  icon: "📝", label: "Borradores",          unread: 1 },
  { id: "trash",   icon: "🗑️", label: "Papelera",            unread: 0 },
];

const mails = {
  inbox: [
    {
      id: 1,
      from: "sistema@lost.sys",
      to: "ev_local",
      subject: "Aviso de integridad del sistema",
      preview: "Se han detectado 3 archivos modificados externamente...",
      date: "14/05/2024 02:31",
      unread: true,
      body:
`Aviso automático del sistema.

Se han detectado 3 archivos modificados externamente durante el último arranque.
Los archivos afectados no han podido ser verificados por el módulo de integridad.

Si no reconoces esta actividad, es posible que el sistema haya sido comprometido.

No respondas a este correo. Este es un mensaje automático.

— Sistema de monitorización v2.1`,
    },
    {
      id: 2,
      from: "remitentedesconocido@[redactado]",
      to: "ev_local",
      subject: "Sé lo que encontraste",
      preview: "No sigas buscando. Por tu bien.",
      date: "13/05/2024 23:47",
      unread: true,
      body:
`No sigas buscando.

Ya saben que tienes el informe.
Ya saben dónde estás.

Borra todo y desaparece.
Por tu bien.

Si publicas lo que encontraste, no habrá nadie que pueda ayudarte.

Esto no es una amenaza.
Es un consejo.

— [Remitente eliminado]`,
    },
    {
      id: 3,
      from: "d.alsina@fiscalia.gob",
      to: "ev_local",
      subject: "Re: Solicitud de reunión — Caso 0047",
      preview: "Estimada E.V., lamentablemente no podemos continuar con esta línea de inve...",
      date: "10/03/2022 09:15",
      unread: false,
      body:
`Estimada E.V.,

Lamentablemente no podemos continuar con esta línea de investigación.
El caso 0047 fue archivado el 07/03/2022 por falta de evidencia suficiente.

Le recomiendo que no continúe por su cuenta.
Algunos asuntos es mejor dejarlos cerrados.

Atentamente,
D. Alsina
Fiscal de distrito — Unidad de Delitos Informáticos`,
    },
  ],
  sent: [
    {
      id: 4,
      from: "ev_local",
      to: "prensa@periodico.cl",
      subject: "URGENTE — Documentación adjunta caso Vortex",
      preview: "Si estás recibiendo esto, algo me ha pasado. Adjunto todo lo que tengo...",
      date: "14/05/2024 03:41",
      unread: false,
      body:
`Si estás recibiendo esto, algo me ha pasado.

Adjunto todo lo que tengo sobre Vortex Data Sol y su relación con el caso 0047.
El fiscal Alsina está involucrado. Hay registros.

No sé si este correo llegará. La conexión está siendo intervenida.

Publica todo.

— E.V.

[Adjunto: informe_caso_0047_completo.pdf — 4.2 MB]
[Estado del envío: DESCONOCIDO]`,
    },
  ],
  drafts: [
    {
      id: 5,
      from: "ev_local",
      to: "",
      subject: "(sin asunto)",
      preview: "No sé quién leerá esto. Quizás nadie. Quizás alguien que no debería...",
      date: "14/05/2024 03:55",
      unread: true,
      body:
`No sé quién leerá esto.
Quizás nadie.
Quizás alguien que no debería.

Si estás en este sistema es porque algo salió mal.
O porque eres tú, y encontraste la forma de volver.

La contraseña es lo que siempre recordamos juntos.
El año en que todo empezó. Al revés.

— E.V.

[BORRADOR — No enviado]`,
    },
  ],
  trash: [],
};

const currentMails = computed(() => mails[currentFolder.value] || []);

function openMail(mail) {
  selectedMail.value = mail;
  mail.unread = false;
  const folder = folders.find(f => f.id === currentFolder.value);
  if (folder && folder.unread > 0) folder.unread--;
}
</script>

<style scoped>
.mail-app {
  display: flex;
  height: 460px;
  font-family: 'Segoe UI', sans-serif;
  font-size: 13px;
}

.mail-sidebar {
  width: 160px;
  background: #111;
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 8px 0;
}

.compose-btn {
  margin: 0 8px 8px;
  padding: 6px 10px;
  background: #1a3a5c;
  border: 1px solid #2a5a8c;
  border-radius: 4px;
  color: #aac4e0;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  transition: background 0.15s;
}
.compose-btn:hover { background: #1f4a7a; }

.mail-folders { display: flex; flex-direction: column; gap: 1px; }

.mail-folder {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 4px;
  transition: background 0.15s;
  font-size: 12px;
}
.mail-folder:hover  { background: #1a1a1a; color: #ccc; }
.mail-folder.active { background: #1a3a5c; color: #fff; }

.unread-badge {
  margin-left: auto;
  background: #4a9eff;
  color: #000;
  font-size: 10px;
  font-weight: bold;
  border-radius: 8px;
  padding: 1px 6px;
}

.mail-list {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #222;
  overflow-y: auto;
  background: #0f0f0f;
}

.mail-item {
  padding: 10px 12px;
  border-bottom: 1px solid #1a1a1a;
  cursor: pointer;
  transition: background 0.15s;
}
.mail-item:hover    { background: #1a1a1a; }
.mail-item.selected { background: #1a3a5c; }
.mail-item.unread .mail-subject { color: #fff; font-weight: bold; }
.mail-item.unread .mail-from    { color: #4a9eff; }

.mail-from    { font-size: 11px; color: #777; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mail-subject { font-size: 12px; color: #ccc; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mail-preview { font-size: 11px; color: #555; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mail-date    { font-size: 10px; color: #444; margin-top: 4px; }

.mail-empty { padding: 20px; color: #444; text-align: center; font-size: 12px; }

.mail-view {
  flex: 1;
  overflow-y: auto;
  background: #0d0d0d;
}

.mail-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #333;
  font-size: 13px;
}

.mail-content { display: flex; flex-direction: column; height: 100%; }

.mail-header {
  padding: 16px;
  border-bottom: 1px solid #1a1a1a;
  background: #111;
}

.mail-view-subject {
  font-size: 15px;
  font-weight: bold;
  color: #ddd;
  margin-bottom: 8px;
}

.mail-view-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mail-view-meta span {
  font-size: 11px;
  color: #555;
}

.mail-view-meta b { color: #888; font-weight: normal; }

.mail-body {
  padding: 16px;
  color: #aaa;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  line-height: 1.7;
}

/* Dialogs */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.dialog {
  background: #111;
  border: 1px solid #444;
  border-radius: 6px;
  box-shadow: 0 0 30px rgba(0,0,0,0.8);
  overflow: hidden;
}

.dialog-title {
  background: #1a1a1a;
  padding: 8px 12px;
  color: #ccc;
  font-size: 13px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-close { background: none; border: none; color: #666; cursor: pointer; font-size: 12px; transition: color 0.2s; }
.dialog-close:hover { color: #ff4444; }

.compose-dialog { width: 440px; }

.compose-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.compose-input {
  background: #0d0d0d;
  border: 1px solid #333;
  color: #ccc;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  font-family: 'Segoe UI', sans-serif;
}
.compose-input:focus { border-color: #555; }

.compose-textarea {
  background: #0d0d0d;
  border: 1px solid #333;
  color: #ccc;
  padding: 8px 10px;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  font-family: 'Courier New', monospace;
  resize: vertical;
  min-height: 120px;
}
.compose-textarea:focus { border-color: #555; }

.compose-actions { display: flex; gap: 8px; justify-content: flex-end; }

.compose-send {
  background: #1a3a5c;
  border: 1px solid #2a5a8c;
  color: #aac4e0;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}
.compose-send:hover { background: #1f4a7a; }

.compose-cancel {
  background: #1a1a1a;
  border: 1px solid #333;
  color: #888;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}
.compose-cancel:hover { background: #222; color: #ccc; }
</style>