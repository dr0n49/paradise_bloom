import { CLOUD } from "../game/presentation";
import { useEffect, useRef } from "react";
import { Container, Graphics, type Application } from "pixi.js";
import type { Spine } from "@esotericsoftware/spine-pixi-v8";
import type { Reel } from "../game/board";
import type { FeatureState } from "../game/player";
import { loadRig, makeApp, makeSpine, spineDisabled } from "./runtime";

/** Book symbol → attachment in the symbols rig (symbol_slot). */
const ATTACH: Record<string, string> = {
  H1: "wand",
  H2: "harp",
  H3: "chalice",
  H4: "scroll_feather",
  L1: "heart",
  L2: "purple_gem",
  L3: "blue_gem",
  L4: "green_gem",
  S: "halo_card",
};
const ART = 512; // symbol attachment size in rig units
const FILL = 0.9; // symbol size relative to the cell
const FRAME_W = 835;
const FRAME_H = 790;
const CHEST_W = 360;
const CHEST_H = 352;

type Mode = "idle" | "win" | "halo" | "pop";
type Tween = { from: number; to: number; start: number; dur: number; ease: (k: number) => number };
type Entry = { s: Spine; reel: number; row: number; pos: number; mode: Mode | null; out: boolean; tween?: Tween; dieAt?: number };
type ChestMode = "idle" | "unlocked" | "opened";

const easeOutBack = (k: number) => {
  const c = 0.7;
  return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
};
const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
const easeIn = (k: number) => k * k * k;

type Props = {
  reels: Reel[];
  halos: { reel: number; row: number }[];
  feature: FeatureState | null;
  anticipation: number | null;
  winKey: number; // changes when a new win is shown (frame flash)
  onLive: (live: boolean) => void;
};

type Ctx = {
  app: Application;
  symbols: Container;
  mask: Graphics;
  frame: Spine;
  chests: Spine[];
  chestMode: (ChestMode | null)[];
  cells: Map<number, Entry>;
  frameMode: string;
  winKey: number;
  board: { x: number; y: number; w: number; h: number };
};

/**
 * The whole board in Spine on one canvas over the frame box: symbols (masked to the board),
 * the frame, and the five chests. Layout is read from the DOM (.board, .chest), so CSS stays
 * the single source of positions; the DOM keeps gold squares, labels and chest values.
 */
export function SpineBoard(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const ctx = useRef<Ctx | null>(null);

  useEffect(() => {
    if (spineDisabled()) return;
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([loadRig("symbols"), loadRig("frame")]);
        if (cancelled || !host.current) return;
        const app = await makeApp(host.current);
        if (cancelled) return app.destroy(true);
        const symbols = new Container();
        symbols.sortableChildren = true;
        const mask = new Graphics();
        symbols.mask = mask;
        const frame = makeSpine("frame");
        frame.state.setAnimation(0, "idle", true);
        // Lotus devices use the same DOM slots as their progress and value labels.
        const chests: Spine[] = [];
        app.stage.addChild(symbols, mask, frame, ...chests);
        ctx.current = {
          app,
          symbols,
          mask,
          frame,
          chests,
          chestMode: Array(5).fill(null),
          cells: new Map(),
          frameMode: "idle",
          winKey: 0,
          board: { x: 0, y: 0, w: 0, h: 0 },
        };
        app.ticker.add(() => tick());
        sync();
        latest.current.onLive(true);
      } catch (e) {
        console.warn("Board Spine unavailable, using DOM art", e);
        latest.current.onLive(false);
      }
    })();
    return () => {
      cancelled = true;
      ctx.current?.app.destroy(true, { children: true });
      ctx.current = null;
    };
  }, []);

  useEffect(() => sync());

  function setMode(e: Entry, m: Mode, delay = 0) {
    if (e.mode === m) return;
    e.mode = m;
    const st = e.s.state;
    if (m === "idle") {
      const t = st.setAnimation(0, "idle", true);
      t.trackTime = (e.reel * 0.53 + e.row * 0.37) % 2; // spread the idle phase across the board
    } else if (m === "win") st.setAnimation(0, "win_pulse", false);
    else if (m === "halo") st.setAnimation(0, "halo_anticipation", true);
    else {
      const variant = (e.row * 5 + e.reel) % 4;
      st.setAnimation(0, variant ? `destroy_cloud_v${variant}` : "destroy_cloud", false).delay = delay / 1000;
    }
  }

  function sync() {
    const c = ctx.current;
    if (!c) return;
    const { reels, halos, feature, anticipation, winKey } = latest.current;
    const haloSet = new Set(halos.map((h) => `${h.reel}:${h.row}`));
    const now = performance.now();
    const seen = new Set<number>();

    /* ---------------------------------------------------------- symbols */
    reels.forEach((reel, r) =>
      reel.cells.forEach((cell, w) => {
        seen.add(cell.id);
        let e = c.cells.get(cell.id);
        if (!e) {
          const s = makeSpine("symbols");
          s.skeleton.setAttachment("symbol_slot", ATTACH[cell.sym] ?? "heart");
          c.symbols.addChild(s);
          e = { s, reel: r, row: w, pos: w, mode: null, out: false };
          if (cell.drop > 0) {
            e.pos = w - cell.drop;
            e.tween = { from: w - cell.drop, to: w, start: now + (cell.delay ?? 0), dur: cell.duration ?? 140 + cell.drop * 65, ease: matchMedia("(prefers-reduced-motion: reduce)").matches ? easeOut : easeOutBack };
          }
          c.cells.set(cell.id, e);
        } else if (e.row !== w && !e.out) {
          // Survivor falling into the gap left by a tumble.
          e.tween = { from: e.pos, to: w, start: now + (cell.delay ?? 0), dur: cell.duration ?? 140 + Math.max(1, w - e.row) * 65, ease: matchMedia("(prefers-reduced-motion: reduce)").matches ? easeOut : easeOutBack };
        }
        e.reel = r;
        e.row = w;
        if (cell.out && !e.out) {
          e.out = true;
          const delay = cell.outDelay ?? r * 40 + (4 - w) * 16;
          const duration = cell.outDuration ?? 340;
          e.tween = { from: e.pos, to: e.pos + 5.6, start: now + delay, dur: duration, ease: easeIn };
          e.dieAt = now + delay + duration + 20;
        }
        e.s.state.timeScale = 1 / (cell.fxScale ?? 1);
        e.s.zIndex = cell.pop ? 2 : cell.win ? 1 : 0;
        if (cell.pop) {
          setMode(e, "pop", cell.fxDelay);
          if (e.dieAt === undefined) e.dieAt = now + (CLOUD.finish + (cell.fxDelay ?? 0)) * (cell.fxScale ?? 1);
        } else if (cell.win) setMode(e, "win");
        else if (haloSet.has(`${r}:${w}`)) setMode(e, "halo");
        else if (!e.out) setMode(e, "idle");
        const anticipatingDim = anticipation !== null && anticipation !== r && cell.sym !== "S";
        const k = cell.dim || anticipatingDim ? 0.38 : 1;
        e.s.skeleton.color.set(k, k, k, 1);
      }),
    );
    // Cells that left the model: falling-out and bursting ones finish their motion first.
    for (const [id, e] of c.cells) if (!seen.has(id) && e.dieAt === undefined) e.dieAt = now;

    /* ---------------------------------------------------------- frame */
    const live = !!feature && !feature.done;
    const frameMode = live && feature!.freeSpins ? "feature" : "idle";
    if (frameMode !== c.frameMode) {
      c.frameMode = frameMode;
      c.frame.state.setAnimation(0, frameMode, true);
    }
    if (winKey && winKey !== c.winKey) {
      c.winKey = winKey;
      c.frame.state.setAnimation(1, "win", false);
      c.frame.state.addEmptyAnimation(1, 0.1, 0);
    }

    /* ---------------------------------------------------------- chests */
    c.chests.forEach((sp, r) => {
      if (!feature) {
        sp.visible = false;
        c.chestMode[r] = null;
        return;
      }
      sp.visible = true;
      const mode: ChestMode = feature.values[r] != null ? "opened" : feature.unlocked[r] ? "unlocked" : "idle";
      if (mode === c.chestMode[r]) return;
      const prev = c.chestMode[r];
      c.chestMode[r] = mode;
      const st = sp.state;
      if (mode === "opened") {
        st.setAnimation(0, "open", false);
        st.addAnimation(0, "opened", true, 0);
      } else if (mode === "unlocked" && prev !== null) {
        st.setAnimation(0, "unlock", false);
        st.addAnimation(0, "unlocked", true, 0);
      } else st.setAnimation(0, mode, true);
    });
  }

  function tick() {
    const c = ctx.current;
    const el = host.current;
    if (!c || !el) return;
    const base = el.getBoundingClientRect();
    const { width: W, height: H } = c.app.screen;
    // DOM rects are in viewport pixels; map them to the canvas' own units.
    const sx = base.width ? W / base.width : 1;
    const sy = base.height ? H / base.height : 1;
    const parent = el.parentElement;
    const boardEl = parent?.querySelector(".board");
    if (boardEl) {
      const b = boardEl.getBoundingClientRect();
      const r = { x: (b.left - base.left) * sx, y: (b.top - base.top) * sy, w: b.width * sx, h: b.height * sy };
      if (r.x !== c.board.x || r.y !== c.board.y || r.w !== c.board.w || r.h !== c.board.h) {
        c.board = r;
        // Share the blue board's corner radius; labels remain outside the clipping mask.
        const radius = Number.parseFloat(getComputedStyle(boardEl).borderTopLeftRadius) * Math.min(sx, sy);
        c.mask.clear().roundRect(r.x, r.y, r.w, r.h, radius).fill(0xffffff);
      }
    }
    const { x: bx, y: by, w: bw, h: bh } = c.board;
    const cw = bw / 5;
    const ch = bh / 5;
    const scale = (FILL * Math.min(cw, ch)) / ART;
    const now = performance.now();
    for (const [id, e] of c.cells) {
      if (e.dieAt !== undefined && now >= e.dieAt) {
        e.s.destroy();
        c.cells.delete(id);
        continue;
      }
      const t = e.tween;
      if (t) {
        const k = Math.min(1, Math.max(0, (now - t.start) / t.dur));
        e.pos = t.from + (t.to - t.from) * (now < t.start ? 0 : t.ease(k));
        if (k >= 1) e.tween = undefined;
      }
      e.s.scale.set(scale);
      e.s.x = bx + (e.reel + 0.5) * cw;
      e.s.y = by + (e.pos + 0.5) * ch;
    }
    // The box keeps the original aspect ratio; one scale preserves carved flower proportions.
    c.frame.x = W / 2;
    c.frame.y = H / 2;
    c.frame.scale.set(Math.min(W / FRAME_W, H / FRAME_H));
    // Chests sit on their DOM slots, anchored bottom-centre.
    const slots = parent?.querySelectorAll(".chest");
    c.chests.forEach((sp, i) => {
      const s = slots?.[i]?.getBoundingClientRect();
      if (!s || !sp.visible) return;
      const w = s.width * sx;
      const h = s.height * sy;
      sp.scale.set(Math.min(w / CHEST_W, h / CHEST_H));
      sp.x = (s.left - base.left) * sx + w / 2;
      sp.y = (s.top - base.top) * sy + h;
    });
  }

  return <div ref={host} className="spine-board" aria-hidden />;
}
