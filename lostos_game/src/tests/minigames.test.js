import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useMinigames } from "../src/store/minigames.js";

describe("useMinigames — store de minijuegos", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("todas las pistas empiezan bloqueadas", () => {
    const mg = useMinigames();
    expect(mg.unlocked.Pista_1).toBe(false);
    expect(mg.unlocked.Pista_2).toBe(false);
    expect(mg.unlocked.Pista_3).toBe(false);
  });

  it("unlock desbloquea una pista válida", () => {
    const mg = useMinigames();
    mg.unlock("Pista_1");
    expect(mg.unlocked.Pista_1).toBe(true);
  });

  it("unlock no afecta las otras pistas", () => {
    const mg = useMinigames();
    mg.unlock("Pista_1");
    expect(mg.unlocked.Pista_2).toBe(false);
    expect(mg.unlocked.Pista_3).toBe(false);
  });

  it("unlock con clave inexistente no rompe el store", () => {
    const mg = useMinigames();
    expect(() => mg.unlock("Pista_99")).not.toThrow();
  });

  it("se pueden desbloquear todas las pistas", () => {
    const mg = useMinigames();
    mg.unlock("Pista_1");
    mg.unlock("Pista_2");
    mg.unlock("Pista_3");
    expect(Object.values(mg.unlocked).every((v) => v === true)).toBe(true);
  });
});
