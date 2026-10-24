export type AudioBus = "fx" | "music";
export type AudioLevels = Record<AudioBus, number>;
type Store = Pick<Storage, "getItem" | "setItem">;
const DEFAULTS: AudioLevels = { fx: 0.8, music: 0.5 };
export const clampVolume = (v: number) => Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;

/** Preserve both the slider level and the last audible value across mute/reload. */
export class AudioSettings {
  private levels: AudioLevels;
  private remembered: AudioLevels;
  constructor(private store?: Store, muted = false) {
    const read = (key: string, fallback: number) => {
      try {
        const v = store?.getItem(key);
        return v == null || !Number.isFinite(Number(v)) ? fallback : clampVolume(Number(v));
      } catch { return fallback; }
    };
    const saved = { fx: read("sd-fx", DEFAULTS.fx), music: read("sd-music", DEFAULTS.music) };
    this.levels = muted ? { fx: 0, music: 0 } : saved;
    this.remembered = {
      fx: read("pb-fx-last", saved.fx || DEFAULTS.fx) || DEFAULTS.fx,
      music: read("pb-music-last", saved.music || DEFAULTS.music) || DEFAULTS.music,
    };
  }
  snapshot(): AudioLevels { return { ...this.levels }; }
  set(bus: AudioBus, value: number) {
    const v = clampVolume(value);
    this.levels[bus] = v;
    if (v > 0) this.remembered[bus] = v;
    try {
      this.store?.setItem(`sd-${bus}`, String(v));
      if (v > 0) this.store?.setItem(`pb-${bus}-last`, String(v));
    } catch { /* Sound controls also work with storage disabled. */ }
    return v;
  }
  toggle(bus: AudioBus) {
    return this.set(bus, this.levels[bus] > 0 ? 0 : this.remembered[bus]);
  }
}
