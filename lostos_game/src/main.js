import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

// Importante: No importes el archivo CSS por defecto de Vite (style.css)
// para que no te rompa los estilos de tu escritorio.

const app = createApp(App);

app.use(createPinia());
app.mount("#app");
