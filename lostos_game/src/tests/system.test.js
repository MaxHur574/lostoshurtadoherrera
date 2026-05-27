import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSystem, PASSWORDS } from "../src/store/system.js";

describe("useSystem — store principal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // ── Window Manager ────────────────────────────────────────────────────────
  describe("openApp", () => {
    it("agrega una app nueva a openApps", () => {
      const system = useSystem();
      system.openApp("mail", "Correo", "📧");
      expect(system.openApps).toHaveLength(1);
      expect(system.openApps[0].id).toBe("mail");
    });

    it("no duplica una app ya abierta", () => {
      const system = useSystem();
      system.openApp("mail", "Correo", "📧");
      system.openApp("mail", "Correo", "📧");
      expect(system.openApps).toHaveLength(1);
    });

    it("reactiva una app minimizada al volver a abrirla", () => {
      const system = useSystem();
      system.openApp("mail", "Correo", "📧");
      system.openApps[0].minimized = true;
      system.openApp("mail", "Correo", "📧");
      expect(system.openApps[0].minimized).toBe(false);
    });
  });

  describe("focusApp", () => {
    it("marca solo la app enfocada como active", () => {
      const system = useSystem();
      system.openApp("mail", "Correo", "📧");
      system.openApp("browser", "Navegador", "🌐");
      system.focusApp("mail");
      expect(system.openApps.find((a) => a.id === "mail").active).toBe(true);
      expect(system.openApps.find((a) => a.id === "browser").active).toBe(
        false,
      );
    });

    it("incrementa globalZ en cada llamada", () => {
      const system = useSystem();
      system.openApp("mail", "Correo", "📧");
      const z1 = system.focusApp("mail");
      const z2 = system.focusApp("mail");
      expect(z2).toBeGreaterThan(z1);
    });
  });

  // ── Flags narrativos ──────────────────────────────────────────────────────
  describe("setFlag", () => {
    it("activa un flag existente", () => {
      const system = useSystem();
      expect(system.flags.readUrgenteLeer).toBe(false);
      system.setFlag("readUrgenteLeer");
      expect(system.flags.readUrgenteLeer).toBe(true);
    });

    it("no crea flags desconocidos", () => {
      const system = useSystem();
      system.setFlag("flagInexistente");
      expect("flagInexistente" in system.flags).toBe(false);
    });
  });

  describe("level1Progress", () => {
    it("empieza en 0", () => {
      const system = useSystem();
      expect(system.level1Progress).toBe(0);
    });

    it("incrementa al activar flags del nivel 1", () => {
      const system = useSystem();
      system.setFlag("readUrgenteLeer");
      system.setFlag("readNotaAlMargen");
      expect(system.level1Progress).toBe(2);
    });

    it("llega a 5 con todos los flags del nivel 1", () => {
      const system = useSystem();
      [
        "readUrgenteLeer",
        "readNotaAlMargen",
        "readEntrevistaPendiente",
        "readNoMires",
        "foundOctubreTxt",
      ].forEach((f) => system.setFlag(f));
      expect(system.level1Progress).toBe(5);
    });
  });

  // ── Contraseñas ───────────────────────────────────────────────────────────
  describe("PASSWORDS", () => {
    it('la contraseña de investigacion_privada es "luna"', () => {
      expect(PASSWORDS.investigacion_privada).toBe("luna");
    });

    it('la contraseña de privado es "0514"', () => {
      expect(PASSWORDS.privado).toBe("0514");
    });
  });

  // ── triggerEvent ──────────────────────────────────────────────────────────
  describe("triggerEvent", () => {
    it("agrega un evento a la cola", () => {
      const system = useSystem();
      system.triggerEvent("glitch", { intensity: "low" });
      expect(system.atmosphereEvents).toHaveLength(1);
      expect(system.atmosphereEvents[0].type).toBe("glitch");
    });

    it("cada evento tiene un id único", () => {
      const system = useSystem();
      system.triggerEvent("glitch");
      system.triggerEvent("flicker");
      const ids = system.atmosphereEvents.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
