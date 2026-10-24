/**
 * Spine runtime glue (Pixi 8 + spine-pixi-v8 4.3). Skeletons are exported from the
 * editor projects in games/cloud_vault/spine/*.spine (see spine/README.md).
 */
import { Application, Assets, UPDATE_PRIORITY } from "pixi.js";
import { Spine } from "@esotericsoftware/spine-pixi-v8";

const RIGS = {
  character: { data: "./spine/character/character.json", atlas: "./spine/character/character_painterly.atlas" },
  symbols: { data: "./spine/symbols/symbols_v17.json", atlas: "./spine/symbols/symbols_v17.atlas" },
  chest: { data: "./spine/chest/chest.json", atlas: "./spine/chest/chest.atlas" },
  frame: { data: "./spine/frame-v6/frame.json", atlas: "./spine/frame-v6/frame.atlas" },
  screens: { data: "./spine/screens-v10/screens.json", atlas: "./spine/screens-v10/screens.atlas" },
} as const;
export type RigName = keyof typeof RIGS;

const loaded = new Map<string, Promise<void>>();
// Keep the new celebration textures separate from an older Pixi asset cache.
const rigKey = (name: string) => name === "screens" ? "screens-v10" : name === "frame" ? "frame-v6" : name === "symbols" ? "symbols-v17" : name;

/** Loads a rig from RIGS, or any ./spine/<name>/<name>.json + .atlas (QA previews of candidate rigs). */
export function loadRig(name: RigName | string): Promise<void> {
  if (!loaded.has(name)) {
    const r = RIGS[name as RigName] ?? { data: `./spine/${name}/${name}.json`, atlas: `./spine/${name}/${name}.atlas` };
    const key = rigKey(name);
    Assets.add({ alias: `${key}Data`, src: r.data });
    Assets.add({ alias: `${key}Atlas`, src: r.atlas });
    loaded.set(name, Assets.load([`${key}Data`, `${key}Atlas`]).then(() => undefined));
  }
  return loaded.get(name)!;
}

export const makeSpine = (name: RigName | string) => Spine.from({ skeleton: `${rigKey(name)}Data`, atlas: `${rigKey(name)}Atlas`, scale: 1 });

/** Scale and place a skeleton so its bounds (from the editor/generator) fit w×h, bottom-centred. */
export function fitBottom(s: Spine, w: number, h: number) {
  const d = s.skeleton.data;
  const k = Math.min(w / d.width, h / d.height);
  s.scale.set(k);
  s.x = w / 2 - (d.x + d.width / 2) * k;
  s.y = h + d.y * k;
}

/** A transparent Pixi canvas that fills `host` and follows its size. */
export async function makeApp(host: HTMLElement): Promise<Application> {
  const app = new Application();
  await app.init({
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    width: Math.max(1, host.clientWidth),
    height: Math.max(1, host.clientHeight),
    preference: "webgl",
  });
  app.canvas.style.position = "absolute";
  app.canvas.style.inset = "0";
  app.canvas.style.width = "100%";
  app.canvas.style.height = "100%";
  app.canvas.style.pointerEvents = "none";
  host.appendChild(app.canvas);

  // Pixi's resizeTo listens to window.resize, not host-only changes (e.g. the
  // bonus layout). It also replaces the fluid canvas CSS with fixed pixel sizes.
  // Resize before scene layout/render so frame, symbols and DOM share one box.
  let sizeDirty = true;
  const observer = new ResizeObserver(() => { sizeDirty = true; });
  const syncSize = () => {
    if (!sizeDirty) return;
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    sizeDirty = false;
    if (app.screen.width !== width || app.screen.height !== height) {
      app.renderer.resize(width, height);
    }
    app.canvas.style.width = "100%";
    app.canvas.style.height = "100%";
  };
  observer.observe(host);
  syncSize();
  app.ticker.add(syncSize, undefined, UPDATE_PRIORITY.HIGH);
  app.stage.once("destroyed", () => observer.disconnect());
  return app;
}

/** Spine availability: false if WebGL or loading fails (the DOM art stays as fallback). */
export const spineDisabled = () => new URLSearchParams(location.search).has("nospine");

/* ---------------------------------------------------------------- character reactions */

export type CharacterCue =
  | "spin"
  | "win"
  | "anticipation"
  | "trigger"
  | "featureEnd"
  | "bigwin"
  | "settle";

type Listener = (cue: CharacterCue) => void;
const listeners = new Set<Listener>();
export const characterBus = {
  emit: (cue: CharacterCue) => listeners.forEach((l) => l(cue)),
  on: (l: Listener) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
