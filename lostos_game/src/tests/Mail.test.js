import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import Mail from "../src/components/Mail.vue";

// Mock de Window.vue para aislar el componente
vi.mock("../src/components/Window.vue", () => ({
  default: {
    name: "Window",
    template: "<div><slot /></div>",
    props: ["title"],
    emits: ["close", "minimize"],
  },
}));

describe("Mail.vue — pantalla de login", () => {
  function mountMail() {
    return mount(Mail, {
      global: { plugins: [createPinia()] },
    });
  }

  it("muestra la pantalla de login al iniciar", () => {
    const wrapper = mountMail();
    expect(wrapper.find(".login-screen").exists()).toBe(true);
    expect(wrapper.find(".mail-app").exists()).toBe(false);
  });

  it("el botón de login está deshabilitado sin credenciales", () => {
    const wrapper = mountMail();
    const btn = wrapper.find(".login-btn");
    expect(btn.attributes("disabled")).toBeDefined();
  });

  it("muestra error con credenciales incorrectas", async () => {
    const wrapper = mountMail();
    await wrapper.find('input[type="text"]').setValue("usuario_malo");
    await wrapper.find('input[type="password"]').setValue("pass_mala");
    await wrapper.find(".login-btn").trigger("click");
    expect(wrapper.find(".login-error").exists()).toBe(true);
  });

  it("entra al correo con credenciales correctas", async () => {
    const wrapper = mountMail();
    await wrapper.find('input[type="text"]').setValue("vherrera.mail");
    await wrapper.find('input[type="password"]').setValue("Luna104");
    await wrapper.find(".login-btn").trigger("click");
    expect(wrapper.find(".mail-app").exists()).toBe(true);
    expect(wrapper.find(".login-screen").exists()).toBe(false);
  });

  it("muestra la pista después de 3 intentos fallidos", async () => {
    const wrapper = mountMail();
    for (let i = 0; i < 3; i++) {
      await wrapper.find('input[type="text"]').setValue("mal");
      await wrapper.find('input[type="password"]').setValue("mal");
      await wrapper.find(".login-btn").trigger("click");
    }
    expect(wrapper.find(".login-hint").exists()).toBe(true);
  });
});

describe("Mail.vue — bandeja de entrada", () => {
  async function mountLoggedIn() {
    const wrapper = mount(Mail, {
      global: { plugins: [createPinia()] },
    });
    await wrapper.find('input[type="text"]').setValue("vherrera.mail");
    await wrapper.find('input[type="password"]').setValue("Luna104");
    await wrapper.find(".login-btn").trigger("click");
    return wrapper;
  }

  it("muestra la carpeta Bandeja de entrada por defecto", async () => {
    const wrapper = await mountLoggedIn();
    const active = wrapper.find(".mail-folder.active");
    expect(active.text()).toContain("Bandeja de entrada");
  });

  it("muestra los correos de la bandeja de entrada", async () => {
    const wrapper = await mountLoggedIn();
    const items = wrapper.findAll(".mail-item");
    expect(items.length).toBeGreaterThan(0);
  });

  it("abre un correo al hacer clic", async () => {
    const wrapper = await mountLoggedIn();
    await wrapper.find(".mail-item").trigger("click");
    expect(wrapper.find(".mail-content").exists()).toBe(true);
  });

  it("cierra sesión con el botón de logout", async () => {
    const wrapper = await mountLoggedIn();
    await wrapper.find(".mub-logout").trigger("click");
    expect(wrapper.find(".login-screen").exists()).toBe(true);
  });
});
