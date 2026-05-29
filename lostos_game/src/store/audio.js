import { defineStore } from "pinia";
import { Howl, Howler } from "howler";

export const useAudio = defineStore("audio", () => {
  let masterVolume = 0.7;

  const sounds = {
    desktop_music: new Howl({
      src: ["/src/assets/audio/desktop_ambient.mp3"],
      loop: true,
      volume: 0.25,
    }),
    unlock_horror: new Howl({
      src: ["/src/assets/audio/unlock_horror.mp3"],
      volume: 0.5,
    }),
    transmission: new Howl({
      src: ["/src/assets/audio/transmission.mp3"],
      loop: true,
      volume: 0.5,
    }),
  };

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
    masterVolume = vol / 100;
    Howler.volume(masterVolume);
  }

  function startDesktopMusic() {
    if (!sounds.desktop_music.playing()) {
      sounds.desktop_music.play();
    }
  }

  function stopDesktopMusic() {
    sounds.desktop_music.fade(0.25, 0, 1500);
    setTimeout(() => sounds.desktop_music.stop(), 1600);
  }

  function startEndgameMusic() {
    stopDesktopMusic();
    setTimeout(() => {
      sounds.transmission.play();
    }, 1800);
  }

  function stopEndgameMusic() {
    sounds.transmission.fade(0.5, 0, 1000);
    setTimeout(() => sounds.transmission.stop(), 1100);
  }

  return {
    play,
    stop,
    stopAll,
    setVolume,
    startDesktopMusic,
    stopDesktopMusic,
    startEndgameMusic,
    stopEndgameMusic,
  };
});
