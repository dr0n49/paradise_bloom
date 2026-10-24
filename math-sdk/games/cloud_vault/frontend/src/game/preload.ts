import { loadRig, spineDisabled } from "../spine/runtime";

/** Decode the actual game artwork before exposing the welcome cards or play controls. */
export const VISUAL_IMAGES = [
  "./art/provider/ruby_games.png", "./art/ui/logo.png", "./art/bg.jpg", "./art/bg_portrait.jpg",
  "./art/ui/card_epic_bonus.png", "./art/ui/card_chest_multis.png", "./art/ui/card_max_win.png", "./art/ui/card_frame.png",
  "./art/frame_v6.png", "./fx/reference_cloud/puff_center.png", "./character/char_painterly.png", "./art/ui/bonus_ruby.png",
  ...["H1", "H2", "H3", "H4", "L1", "L2", "L3", "L4", "S"].map((s) => `./symbols/${s}.png`),
  "./art/ui/bg_bonus.jpg", "./art/ui/bg_bonus_portrait.jpg",
  ...["closed", "ready", "open"].map((s) => `./art/bloom/lotus_${s}.png`),
  ...["extra_chance", "super_chance", "raid", "storm", "bonus", "super", "mystery"].map((s) => `./art/modes/mode_${s}_v4.webp`),
  "./art/ui/key.png", "./art/ui/ribbon_5x_minimum.png", "./art/ui/banner_plaque.png", "./art/ui/win_lotus_v3.png",
  ...["big", "mega", "epic", "max", "total"].map((s) => `./art/ui/title_${s}_win.png`),
  ...["bonus", "super", "epic"].map((s) => `./art/ui/title_bloom_${s}.png`),
  "./art/ui/title_free_spins.png",
  ...["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "dot", "comma", "x"].map((s) => `./art/ui/digit_${s}.png`),
  ...[1, 2, 3, 4, 5].map((n) => `./fx/cloud${n}.png`),
] as const;

function decodedImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => img.decode().then(() => resolve(), reject);
    img.onerror = () => reject(new Error(`Artwork unavailable: ${src}`));
    img.src = src;
  });
}

export async function preloadVisuals(progress: (done: number, total: number) => void): Promise<void> {
  // Spine may fall back to the decoded PNGs on devices without WebGL.
  const rigs = spineDisabled() ? [] : ["symbols", "frame", "character", "screens"];
  const tasks: (() => Promise<unknown>)[] = [
    ...VISUAL_IMAGES.map((src) => () => decodedImage(src)),
    ...rigs.map((name) => () => loadRig(name).catch(() => undefined)),
    () => document.fonts.ready,
  ];
  let done = 0;
  progress(done, tasks.length);
  await Promise.all(tasks.map(async (task) => {
    await task();
    progress(++done, tasks.length);
  }));
}
