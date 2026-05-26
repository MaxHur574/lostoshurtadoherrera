import { defineStore } from "pinia";
import { ref } from "vue";

export const useMinigames = defineStore("minigames", () => {
  const unlocked = ref({
    Pista_1: false,
    Pista_2: false,
    Pista_3: false,
  });

  function unlock(key) {
    if (key in unlocked.value) unlocked.value[key] = true;
  }

  return { unlocked, unlock };
});
