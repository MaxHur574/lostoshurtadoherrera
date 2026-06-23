import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue'
import App from './App.vue'
import { auth0Config } from './auth0Config.js'

const app = createApp(App)

// 1. Crear Pinia PRIMERO
const pinia = createPinia()
app.use(pinia)

// 2. Luego Auth0
app.use(
  createAuth0({
    domain: auth0Config.domain,
    clientId: auth0Config.clientId,
    authorizationParams: {
      redirect_uri: auth0Config.redirectUri,
      audience: auth0Config.audience
    }
  })
)

// 3. Finalmente montar
app.mount('#app')