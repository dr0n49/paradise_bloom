import { cloudCollapseAt, groupTiming, tumbleDelay, tumbleDuration } from "./presentation";
/** Plays one book's events onto the view. Amounts in books are × bet × 100. */
import { applyTumble, dropOut, markWins, popWins, settle, type Reel } from "./board";
import { revealPlan } from "./reveal";
import type { BookEvent } from "./rgs";

export type FeatureState = {
  feature: string;
  rows: number[];
  minChest: number;
  banked: boolean[][];
  unlocked: boolean[];
  values: (number | null)[];
  fs: number;
  totalFs: number;
  freeSpins: boolean;
  entryWin: number; // paid before this feature; excluded from its lotus multiplier
  keys: boolean; // raid keys have landed on the chests
  done?: boolean; // round over: keep chest values, drop the feature look
};

export type WinLabel = { key: number; reel: number; row: number; x: number; ms?: number };
export type Plus = { key: number; reel: number; row: number };
/** Centre-of-board win panel; `mult` shows the chest product while chests open. */
export type Panel = { x: number; mult?: number; final?: boolean } | null;

export type Overlay =
  | { kind: "cloud" } // cloud wipe between the base world and the bonus world
  | { kind: "intro"; feature: string; totalFs: number; minChest: number }
  | { kind: "keys"; feature: string }
  | { kind: "total"; feature: string; x: number }
  | { kind: "bigwin"; x: number }
  | { kind: "maxwin"; x: number };

export type View = {
  reels: () => Reel[];
  setReels: (r: Reel[]) => void;
  feature: () => FeatureState | null;
  setFeature: (f: FeatureState | null) => void;
  setRoundWin: (x: number) => void;
  setPanel: (p: Panel) => void;
  setLabels: (l: WinLabel[]) => void;
  setHalos: (p: { reel: number; row: number }[]) => void;
  setPlus: (p: Plus[]) => void;
  setAnticipation: (reel: number | null) => void;
  setOverlay: (o: Overlay | null) => void;
  motionScale?: () => number;
  sleep: (ms: number, scale?: number) => Promise<void>;
  tap: (ms: number) => Promise<void>; // waits for a tap or ms (auto-continue); Infinity = only a tap
  sound: (name: string) => void;
};

const x100 = (v: unknown) => Number(v ?? 0) / 100;
/** The bonus HUD and lotus reveal use feature winnings, excluding the trigger spin. */
export function featureWin(roundWin: number, feature: FeatureState): number {
  return Math.max(0, Math.round(roundWin * 100) - Math.round(feature.entryWin * 100)) / 100;
}

export const BIG_WIN_X = 20;
let labelKey = 1;

const isFreeSpins = (f: string) => f !== "raid" && f !== "storm";

async function cloudWipe(view: View, during: () => void) {
  view.setOverlay({ kind: "cloud" });
  view.sound("transition");
  await view.sleep(650);
  during();
  await view.sleep(650);
}

export async function playBook(events: BookEvent[], view: View, cost: number): Promise<number> {
  let roundWin = 0;
  for (const ev of events) {
    switch (ev.type) {
      case "mysteryReveal":
        // The actual featureStart (if any) introduces the result directly.
        break;
      case "featureStart": {
        const feature = String(ev.feature);
        const freeSpins = isFreeSpins(feature);
        const minChest = Number(ev.minChest);
        const state: FeatureState = {
          feature,
          rows: ev.rowsRequired as number[],
          minChest,
          banked: Array.from({ length: 5 }, () => Array(5).fill(false)),
          unlocked: Array(5).fill(false),
          values: Array(5).fill(null),
          fs: 0,
          totalFs: freeSpins ? Number(ev.totalFs) : 0,
          freeSpins,
          entryWin: roundWin,
          keys: false,
        };
        if (freeSpins) {
          // Clouds sweep in, the bonus world appears behind them, then the intro card.
          await cloudWipe(view, () => {
            view.setFeature(state);
            view.setHalos([]);
            view.setLabels([]);
            view.setPanel(null);
          });
          view.setOverlay({ kind: "intro", feature, totalFs: Number(ev.totalFs), minChest });
          view.sound("feature");
          await view.tap(Infinity); // the bonus intro waits for the player
          view.setOverlay(null);
        } else {
          // Raid: the board empties and golden keys drop into every chest.
          view.setFeature(state);
          view.setReels(dropOut(view.reels()));
          view.setOverlay({ kind: "keys", feature });
          view.sound("feature");
          await view.sleep(1500);
          view.setFeature({ ...state, keys: true });
          view.setOverlay(null);
          await view.sleep(300);
        }
        break;
      }
      case "updateFreeSpin": {
        const f = view.feature();
        if (f) view.setFeature({ ...f, fs: Number(ev.amount), totalFs: Number(ev.total) });
        view.setPanel(null);
        break;
      }
      case "reveal": {
        view.setHalos([]);
        view.setPlus([]);
        view.setLabels([]);
        view.setPanel(null);
        // Freeze this reveal's tempo: toggling turbo cannot cut off a scheduled landing.
        const speed = view.motionScale?.() ?? 1;
        view.setAnticipation(null);
        view.setReels(dropOut(view.reels(), speed));
        view.sound("spin");
        await view.sleep(380 * speed, 1);
        const plan = revealPlan(ev.board as { name: string }[][], !view.feature()?.freeSpins, speed);
        view.setReels(plan.reels);
        view.sound("drop");
        let elapsed = 0;
        let lit: number | null = null;
        let haloCount = 0;
        for (const step of plan.steps) {
          await view.sleep(step.at - elapsed, 1);
          elapsed = step.at;
          if (step.halos.length !== haloCount) {
            haloCount = step.halos.length;
            view.setHalos(step.halos);
            view.sound("halo");
          }
          if (step.reel !== lit) {
            lit = step.reel;
            view.setAnticipation(lit);
            if (lit !== null) view.sound("anticipation");
          }
          if (step.landed) view.sound("drop");
        }
        await view.sleep(plan.duration - elapsed, 1);
        view.setAnticipation(null);
        view.setReels(settle(view.reels()));
        break;
      }
      case "winInfo": {
        view.setPanel(null);
        const wins = ev.wins as {
          win: number;
          positions: { reel: number; row: number }[];
          meta: { overlay: { reel: number; row: number } };
        }[];
        const speed = view.motionScale?.() ?? 1;
        const timing = groupTiming(speed);
        view.setReels(markWins(view.reels(), wins.flatMap((w) => w.positions), speed));
        view.sound("win");
        await view.sleep(timing.lead, 1);
        const labels: WinLabel[] = [];
        for (let i = 0; i < wins.length; i++) {
          const w = wins[i];
          labels.push({ key: labelKey++, reel: w.meta.overlay.reel, row: w.meta.overlay.row - 1, x: x100(w.win), ms: timing.count });
          view.setLabels([...labels]);
          if (i < wins.length - 1) await view.sleep(timing.gap, 1);
        }
        await view.sleep(timing.hold, 1);
        break;
      }
      case "updateTumbleWin": {
        // This is the current spin's cascade subtotal; roundWin is the total
        // from completed spins. Keep ordinary payouts in the HUD, off the board.
        view.setPanel(null);
        view.setRoundWin(roundWin + x100(ev.amount));
        break;
      }
      case "rowsBanked": {
        const f = view.feature();
        if (f) view.setFeature({ ...f, banked: ev.banked as boolean[][] });
        view.sound("bank");
        await view.sleep(240);
        break;
      }
      case "chestsUnlocked": {
        const f = view.feature();
        if (f) view.setFeature({ ...f, unlocked: ev.unlocked as boolean[] });
        view.sound("unlock");
        await view.sleep(800);
        break;
      }
      case "tumbleBoard": {
        const exploding = ev.explodingSymbols as { reel: number; row: number }[];
        view.setPanel(null);
        // Cloud peak covers the cut; surviving cells and incoming symbols then land together.
        const speed = view.motionScale?.() ?? 1;
        view.setReels(popWins(view.reels(), exploding, speed));
        view.sound("pop");
        await view.sleep(cloudCollapseAt(exploding.length, speed), 1);
        view.setLabels([]);
        let fallEnds = 0;
        const next = applyTumble(view.reels(), exploding, ev.newSymbols as { name: string }[][]).map((reel, r) => ({
          ...reel,
          cells: reel.cells.map((c, row) => {
            if (!c.drop) return c;
            const delay = tumbleDelay(r, row, speed);
            const duration = tumbleDuration(c.drop, speed);
            fallEnds = Math.max(fallEnds, delay + duration);
            return { ...c, delay, duration };
          }),
        }));
        view.setReels(next);
        await view.sleep(fallEnds, 1);
        view.sound("drop");
        await view.sleep(55 * speed, 1);
        view.setReels(settle(view.reels()));
        break;
      }
      case "haloExtraSpins": {
        const f = view.feature();
        if (f) view.setFeature({ ...f, totalFs: Number(ev.totalFs) });
        const pos = ev.positions as { reel: number; row: number }[];
        view.setHalos(pos);
        view.setPlus(pos.slice(-Number(ev.count)).map((p) => ({ key: labelKey++, ...p })));
        view.sound("plusone");
        await view.sleep(1300);
        view.setPlus([]);
        break;
      }
      case "freeSpinTrigger": {
        const pos = (ev.positions as { reel: number; row: number }[]).map((p) => ({ reel: p.reel, row: p.row - 1 }));
        view.setHalos(pos);
        view.sound("trigger");
        await view.sleep(1600);
        break;
      }
      case "setWin":
        break;
      case "setTotalWin": {
        roundWin = x100(ev.amount);
        view.setRoundWin(roundWin);
        break;
      }
      case "chestsOpen": {
        // Chests open one by one; the centre panel shows the win and the growing product.
        const chests = ev.chests as { reel: number; mult: number }[];
        const before = x100(ev.winBefore);
        const after = x100(ev.winAfter);
        view.setLabels([]);
        view.setPanel({ x: before, mult: 1 });
        await view.sleep(500);
        let product = 1;
        for (const c of chests) {
          const f = view.feature()!;
          const values = [...f.values];
          values[c.reel] = c.mult;
          view.setFeature({ ...f, values });
          product *= c.mult;
          view.setPanel({ x: before, mult: product });
          view.sound("chest");
          await view.sleep(950);
        }
        view.setPanel({ x: after, final: true });
        view.sound("multiply");
        await view.sleep(1500);
        break;
      }
      case "wincap": {
        view.setOverlay({ kind: "maxwin", x: x100(ev.amount) });
        view.sound("maxwin");
        await view.tap(4500);
        view.setOverlay(null);
        break;
      }
      case "freeSpinEnd": {
        const f = view.feature();
        view.setOverlay({ kind: "total", feature: f?.feature ?? "bonus", x: x100(ev.amount) });
        view.sound("summary");
        await view.tap(Infinity); // Total Win waits for the player
        // Clouds carry the player back to the base world.
        await cloudWipe(view, () => {
          const g = view.feature();
          if (g) view.setFeature({ ...g, done: true });
          view.setPanel(null);
        });
        view.setOverlay(null);
        break;
      }
      case "finalWin": {
        roundWin = x100(ev.amount);
        view.setRoundWin(roundWin);
        const f = view.feature();
        // Free spins end on the Total Win screen; big wins celebrate base and raid rounds.
        if (!f?.freeSpins && roundWin >= BIG_WIN_X && roundWin < 25000 && cost < 100) {
          view.setOverlay({ kind: "bigwin", x: roundWin });
          view.sound("bigwin");
          await view.tap(4200);
          view.setOverlay(null);
        } else if (!f?.freeSpins && cost >= 100 && roundWin >= cost * 0.5 && roundWin < 25000) {
          view.setOverlay({ kind: "bigwin", x: roundWin });
          view.sound("bigwin");
          await view.tap(4200);
          view.setOverlay(null);
        }
        break;
      }
      default:
        break;
    }
  }
  view.setHalos([]);
  view.setPlus([]);
  view.setLabels([]);
  return roundWin;
}
