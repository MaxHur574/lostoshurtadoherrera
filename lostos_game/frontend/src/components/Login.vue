<template>
  <div class="login-container">
    <div class="login-box">
      <h1>LostOS</h1>
      <p class="subtitle">Acceso restringido</p>

      <div v-if="isLoading" class="loading">
        <p>Cargando...</p>
      </div>

      <template v-else>
        <button
          v-if="!isAuthenticated"
          @click="loginWithRedirect"
          class="btn-login"
        >
          Iniciar sesión
        </button>

        <!-- Autenticado con Auth0 pero sin username propio -->
        <div v-else-if="needsUsername" class="username-form">
          <p>¡Bienvenido!</p>
          <p class="user-email">{{ user?.email }}</p>
          <p class="username-prompt">Elige un nombre de usuario para tu partida:</p>

          <input
            v-model="usernameInput"
            class="username-input"
            type="text"
            placeholder="nombre_usuario"
            maxlength="20"
            spellcheck="false"
            autocomplete="off"
            @keyup.enter="submitUsername"
          />

          <p v-if="usernameError" class="username-error">{{ usernameError }}</p>

          <button
            class="btn-login"
            @click="submitUsername"
            :disabled="savingUsername"
          >
            {{ savingUsername ? "Guardando..." : "Confirmar" }}
          </button>
        </div>

        <!-- Ya tiene username, sesión lista -->
        <div v-else class="user-info">
          <p>¡Bienvenido, {{ savedUsername }}!</p>
          <p class="user-email">{{ user?.email }}</p>
          <button @click="logout" class="btn-logout">Cerrar sesión</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useAuth0 } from "@auth0/auth0-vue";

const emit = defineEmits(["authenticated"]);

const {
  loginWithRedirect,
  logout,
  isAuthenticated,
  user,
  isLoading,
  getAccessTokenSilently,
} = useAuth0();

const needsUsername = ref(false);
const usernameInput = ref("");
const usernameError = ref("");
const savingUsername = ref(false);
const savedUsername = ref("");

async function notifyBackendLogin() {
  try {
    const token = await getAccessTokenSilently();

    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("✅ Respuesta del backend:", data);

    if (data.needsUsername) {
      needsUsername.value = true;
    } else {
      savedUsername.value = data.user?.username || "";
      emit("authenticated");
    }
  } catch (error) {
    console.error("❌ Error al notificar login al backend:", error);
  }
}

async function submitUsername() {
  const clean = usernameInput.value.trim();

  if (clean.length < 3 || clean.length > 20) {
    usernameError.value = "Debe tener entre 3 y 20 caracteres.";
    return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    usernameError.value = "Solo letras, números y guiones bajos.";
    return;
  }

  savingUsername.value = true;
  usernameError.value = "";

  try {
    const token = await getAccessTokenSilently();

    const res = await fetch("http://localhost:3000/api/username", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: clean }),
    });

    const data = await res.json();

    if (!res.ok) {
      usernameError.value = data.error || "No se pudo guardar el nombre de usuario.";
      savingUsername.value = false;
      return;
    }

    savedUsername.value = data.user.username;
    needsUsername.value = false;
    savingUsername.value = false;
    emit("authenticated");
  } catch (error) {
    console.error("❌ Error al guardar username:", error);
    usernameError.value = "Error de conexión. Intenta de nuevo.";
    savingUsername.value = false;
  }
}

watch(
  [isAuthenticated, isLoading],
  async ([authenticated, loading]) => {
    if (!loading && authenticated && !needsUsername.value && !savedUsername.value) {
      await notifyBackendLogin();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: "Courier New", monospace;
}

.login-box {
  background: #0f3460;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  text-align: center;
  border: 1px solid #e94560;
  max-width: 400px;
  width: 100%;
}

h1 {
  color: #e94560;
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
}

.subtitle {
  color: #00d4ff;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.btn-login,
.btn-logout {
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-login:hover:not(:disabled) {
  background: #ff5a7a;
  box-shadow: 0 0 20px rgba(233, 69, 96, 0.8);
}

.btn-login:disabled {
  opacity: 0.5;
  cursor: default;
}

.btn-logout {
  background: #ff6b6b;
  margin-top: 0.5rem;
}

.btn-logout:hover {
  background: #ff8787;
}

.user-info {
  color: #00d4ff;
  margin-top: 1rem;
}

.user-email {
  color: #e94560;
  font-size: 0.9rem;
  margin: 0.5rem 0 1rem 0;
}

.loading {
  color: #00d4ff;
  margin-top: 1rem;
}

/* ── Formulario de username ── */
.username-form {
  color: #00d4ff;
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username-prompt {
  font-size: 0.85rem;
  color: #ccc;
  margin: 0.75rem 0 0.5rem;
}

.username-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.65rem 0.8rem;
  background: #0a1628;
  border: 1px solid #e94560;
  border-radius: 4px;
  color: #fff;
  font-size: 1rem;
  font-family: "Courier New", monospace;
  outline: none;
  text-align: center;
  letter-spacing: 1px;
}

.username-input:focus {
  box-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
}

.username-error {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin: 0.4rem 0 0;
}
</style>