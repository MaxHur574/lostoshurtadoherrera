import { defineStore } from "pinia";
import { Howl, Howler } from "howler";

export const useAudio = defineStore("audio", () => {
  // Volumen global (lo controla el slider de Opciones en TitleScreen)
  let masterVolume = 0.7;

  // Catálogo de sonidos del juego
  // Coloca los archivos en /src/assets/audio/
  const sounds = {
    // Música de fondo del escritorio (loop)
    desktop_music: new Howl({
      src: ["/src/assets/audio/desktop_ambient.mp3"],
      loop: true,
      volume: 0.25,
    }),

    // SFX narrativos
    static_noise: new Howl({
      src: ["/src/assets/audio/static_noise.mp3"],
      volume: 0.3,
    }),
    heartbeat: new Howl({
      src: ["/src/assets/audio/heartbeat.mp3"],
      volume: 0.2,
    }),
    unlock_horror: new Howl({
      src: ["/src/assets/audio/unlock_horror.mp3"],
      volume: 0.5,
    }),
    glitch_hit: new Howl({
      src: ["/src/assets/audio/glitch_hit.mp3"],
      volume: 0.4,
    }),
    key_error: new Howl({
      src: ["/src/assets/audio/key_error.mp3"],
      volume: 0.5,
    }),
    vault_open: new Howl({
      src: ["/src/assets/audio/vault_open.mp3"],
      volume: 0.6,
    }),
    transmission: new Howl({
      src: ["/src/assets/audio/transmission.mp3"],
      volume: 0.8,
    }),
  };

  // ── API pública ───────────────────────────────────────────────────────────

  function play(clip, volume) {
    const sound = sounds[clip];
    if (!sound) {
      console.warn(`[audio] Clip desconocido: "${clip}"`);
      return;
    }
    if (volume !== undefined) sound.volume(volume * masterVolume);
    sound.play();
  }

  function stop(clip) {
    sounds[clip]?.stop();
  }

  function stopAll() {
    Object.values(sounds).forEach((s) => s.stop());
  }

  function setVolume(vol) {
    // vol viene del slider (0–100) → convertir a 0–1
    masterVolume = vol / 100;
    Howler.volume(masterVolume);
  }

  function startDesktopMusic() {
    if (!sounds.desktop_music.playing()) {
      sounds.desktop_music.play();
    }
  }

  function stopDesktopMusic() {
    sounds.desktop_music.stop();
  }

  return { play, stop, stopAll, setVolume, startDesktopMusic, stopDesktopMusic };
});