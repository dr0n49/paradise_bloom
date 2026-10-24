/** Original recorded music/effects. Local assets only; no generation credentials in the client. */
import { AudioSettings, type AudioBus } from "./audioSettings";

let store: Storage | undefined;
try { store = localStorage; } catch { /* Private/restricted storage. */ }
const settings = new AudioSettings(store, new URLSearchParams(location.search).has("mute"));
export const volumes = () => settings.snapshot();

const ASSETS = "./audio/v9/";
type Scene = "base" | "bonus";
type Cue = { file: string; gain: number; cooldown: number; voices: number; duck?: number };
const CUES: Record<string, Cue> = {
  click: { file: "ui_click_v9", gain: 0.8, cooldown: 70, voices: 2 },
  spin: { file: "spin_v9", gain: 0.9, cooldown: 150, voices: 1 },
  drop: { file: "land_v9", gain: 0.75, cooldown: 45, voices: 3 },
  pop: { file: "pop_v9", gain: 0.75, cooldown: 90, voices: 2 },
  win: { file: "cluster_win_v9", gain: 0.85, cooldown: 260, voices: 2 },
  halo: { file: "scatter_v9", gain: 0.9, cooldown: 100, voices: 2 },
  anticipation: { file: "anticipation_v9", gain: 0.7, cooldown: 1000, voices: 1 },
  bank: { file: "bank_v9", gain: 0.8, cooldown: 100, voices: 2 },
  unlock: { file: "unlock_v9", gain: 0.85, cooldown: 180, voices: 2 },
  plusone: { file: "extra_spin_v9", gain: 0.9, cooldown: 300, voices: 1 },
  trigger: { file: "trigger_v9", gain: 0.95, cooldown: 900, voices: 1, duck: 3200 },
  transition: { file: "transition_v9", gain: 0.8, cooldown: 500, voices: 1 },
  chest: { file: "lotus_open_v9", gain: 0.9, cooldown: 300, voices: 2 },
  multiply: { file: "multiply_v9", gain: 0.9, cooldown: 700, voices: 1, duck: 2200 },
  feature: { file: "feature_v9", gain: 0.9, cooldown: 900, voices: 1, duck: 4200 },
  mystery: { file: "feature_v9", gain: 0.8, cooldown: 900, voices: 1, duck: 2400 },
  summary: { file: "summary_v9", gain: 0.95, cooldown: 1000, voices: 1, duck: 5200 },
  bigwin: { file: "bigwin_v9", gain: 0.95, cooldown: 1000, voices: 1, duck: 5200 },
  maxwin: { file: "maxwin_v9", gain: 0.95, cooldown: 1000, voices: 1, duck: 7200 },
};

type Track = { element: HTMLAudioElement; gain: GainNode; pauseTimer?: ReturnType<typeof setTimeout> };
type Voice = { name: string; source: AudioBufferSourceNode; gain: GainNode };
let ctx: AudioContext | null = null;
let fxGain: GainNode;
let musicGain: GainNode;
let duckGain: GainNode;
let masterGain: GainNode;
let musicRequested = false;
let scene: Scene = "base";
let lifecycleBound = false;
const lifecycleAbort = new AbortController();
let duckUntil = 0;
let duckTimer: ReturnType<typeof setTimeout> | undefined;
let variation = 0;
let effectEpoch = 0;
const tracks = new Map<Scene, Track>();
const voices = new Set<Voice>();
const buffers = new Map<string, Promise<AudioBuffer | null>>();
const lastPlayed = new Map<string, number>();

function stopVoice(v: Voice) {
  try {
    if (ctx) { v.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.01); v.source.stop(ctx.currentTime + 0.06); }
    else v.source.stop();
  } catch { /* Already ended. */ }
  voices.delete(v);
}
function stopEffects() { effectEpoch++; for (const v of [...voices]) stopVoice(v); }
function pauseTracks() {
  for (const t of tracks.values()) { clearTimeout(t.pauseTimer); t.element.pause(); }
}
function resume() {
  if (document.hidden) return;
  if (ctx?.state === "suspended") void ctx.resume().catch(() => {});
  if (musicRequested) startMusic();
}
function bindLifecycle() {
  if (lifecycleBound) return;
  lifecycleBound = true;
  const suspend = () => {
    pauseTracks(); stopEffects();
    if (ctx?.state === "running") void ctx.suspend().catch(() => {});
  };
  document.addEventListener("visibilitychange", () => document.hidden ? suspend() : resume(), { signal: lifecycleAbort.signal });
  window.addEventListener("pagehide", suspend, { signal: lifecycleAbort.signal });
  window.addEventListener("pageshow", resume, { signal: lifecycleAbort.signal });
}
function audio(): AudioContext | null {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      masterGain = ctx.createGain(); masterGain.gain.value = 0.9;
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -4; limiter.knee.value = 4; limiter.ratio.value = 12;
      limiter.attack.value = 0.003; limiter.release.value = 0.15;
      masterGain.connect(limiter).connect(ctx.destination);
      fxGain = ctx.createGain(); fxGain.gain.value = volumes().fx; fxGain.connect(masterGain);
      musicGain = ctx.createGain(); musicGain.gain.value = volumes().music * 0.8;
      duckGain = ctx.createGain(); duckGain.gain.value = 1;
      musicGain.connect(duckGain).connect(masterGain);
      bindLifecycle();
    }
    if (!document.hidden && ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}
function level(bus: AudioBus, value: number) {
  const v = settings.set(bus, value);
  if (bus === "fx") {
    if (ctx && fxGain) fxGain.gain.setTargetAtTime(v, ctx.currentTime, 0.015);
    if (!v) {
      stopEffects(); clearTimeout(duckTimer); duckUntil = 0;
      if (ctx && duckGain) duckGain.gain.setTargetAtTime(1, ctx.currentTime, 0.1);
    }
    else if (musicRequested) { audio(); preloadEffects(); }
  } else {
    if (ctx && musicGain) musicGain.gain.setTargetAtTime(v * 0.8, ctx.currentTime, 0.08);
    if (v > 0) startMusic(); else pauseTracks();
  }
}
export function setFxVolume(v: number) { level("fx", v); }
export function setMusicVolume(v: number) { level("music", v); }
export function toggleFx() { const v = settings.toggle("fx"); level("fx", v); }
export function toggleMusic() { const v = settings.toggle("music"); level("music", v); }

function loadEffect(file: string): Promise<AudioBuffer | null> {
  if (!buffers.has(file)) {
    const c = audio();
    if (!c) return Promise.resolve(null);
    buffers.set(file, fetch(`${ASSETS}${file}.mp3`)
      .then((r) => { if (!r.ok) throw Error("Sound asset unavailable"); return r.arrayBuffer(); })
      .then((b) => c.decodeAudioData(b))
      .catch(() => { console.warn("Sound asset unavailable:", file); return null; }));
  }
  return buffers.get(file)!;
}
function preloadEffects() {
  if (volumes().fx <= 0 || document.hidden) return;
  for (const file of new Set(Object.values(CUES).map((cue) => cue.file))) void loadEffect(file);
}
function duckMusic(ms: number) {
  if (!ctx || !duckGain) return;
  duckUntil = Math.max(duckUntil, performance.now() + ms);
  duckGain.gain.setTargetAtTime(0.38, ctx.currentTime, 0.07);
  clearTimeout(duckTimer);
  duckTimer = setTimeout(() => {
    if (ctx) duckGain.gain.setTargetAtTime(1, ctx.currentTime, 0.45);
  }, Math.max(0, duckUntil - performance.now()));
}
export function sound(name: string) {
  const cue = CUES[name];
  if (!cue || volumes().fx <= 0 || document.hidden) return;
  const c = audio(); if (!c) return;
  if (name === "spin") {
    stopEffects(); clearTimeout(duckTimer); duckUntil = 0;
    duckGain.gain.setTargetAtTime(1, c.currentTime, 0.1);
  } else if (name === "transition") {
    for (const v of [...voices]) if (["summary", "bigwin", "maxwin"].includes(v.name)) stopVoice(v);
    clearTimeout(duckTimer); duckUntil = 0; duckGain.gain.setTargetAtTime(1, c.currentTime, 0.1);
  }
  const requested = performance.now(), epoch = effectEpoch;
  if (requested - (lastPlayed.get(name) ?? -Infinity) < cue.cooldown) return;
  lastPlayed.set(name, requested);
  void loadEffect(cue.file).then((buffer) => {
    if (epoch !== effectEpoch || !buffer || volumes().fx <= 0 || document.hidden || performance.now() - requested > 1000) return;
    const same = [...voices].filter((v) => v.name === name);
    while (same.length >= cue.voices) stopVoice(same.shift()!);
    while (voices.size >= 10) stopVoice(voices.values().next().value!);
    const source = c.createBufferSource(), gain = c.createGain(); source.buffer = buffer;
    gain.gain.value = cue.gain;
    if (name === "drop" || name === "pop") source.playbackRate.value = [0.98, 1, 1.02, 1.01][variation++ % 4];
    source.connect(gain).connect(fxGain);
    const v: Voice = { name, source, gain }; voices.add(v);
    source.onended = () => { voices.delete(v); source.disconnect(); gain.disconnect(); };
    if (cue.duck) duckMusic(cue.duck);
    source.start();
  });
}
function getTrack(which: Scene): Track | null {
  const c = audio(); if (!c) return null;
  if (!tracks.has(which)) {
    const element = new Audio(`${ASSETS}music_${which}_v9.mp3`);
    element.loop = true; element.preload = "auto";
    const gain = c.createGain(); gain.gain.value = 0;
    c.createMediaElementSource(element).connect(gain).connect(musicGain);
    tracks.set(which, { element, gain });
  }
  return tracks.get(which)!;
}
/** Streamed tracks keep mobile memory bounded; scene changes crossfade over 1.2 seconds. */
export function startMusic() {
  musicRequested = true;
  if (document.hidden) return;
  if (volumes().fx > 0) { audio(); preloadEffects(); }
  if (volumes().music <= 0) return;
  const c = audio(), target = getTrack(scene); if (!c || !target) return;
  musicGain.gain.setTargetAtTime(volumes().music * 0.8, c.currentTime, 0.1);
  for (const [which, t] of tracks) {
    clearTimeout(t.pauseTimer);
    t.gain.gain.cancelScheduledValues(c.currentTime);
    t.gain.gain.setTargetAtTime(which === scene ? 1 : 0, c.currentTime, 0.3);
    if (which !== scene) t.pauseTimer = setTimeout(() => t.element.pause(), 1400);
  }
  if (target.element.paused) void target.element.play().catch(() => {
    // The next explicit user gesture can resume playback after browser suspension.
  });
}
export function setMusicScene(next: Scene) {
  if (scene === next) return;
  scene = next;
  if (musicRequested) startMusic();
}

if (import.meta.hot) import.meta.hot.dispose(() => {
  musicRequested = false; lifecycleAbort.abort(); pauseTracks(); stopEffects(); clearTimeout(duckTimer);
  if (ctx && ctx.state !== "closed") void ctx.close().catch(() => {});
});
