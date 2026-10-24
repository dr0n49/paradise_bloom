import { describe, expect, it } from "vitest";
import { revealPlan } from "./reveal";
import { playBook, type FeatureState, type Overlay, type View } from "./player";
import type { Reel } from "./board";
import type { BookEvent } from "./rgs";

const boardWith = (...positions: [number, number][]) => Array.from({ length: 5 }, (_, reel) =>
  Array.from({ length: 7 }, (_, row) => ({ name: positions.some(([r, w]) => r === reel && w + 1 === row) ? "S" : "L3" })),
);
const feature: FeatureState = {
  feature: "bonus", rows: [0, 1, 2, 3, 4], minChest: 2,
  banked: Array.from({ length: 5 }, () => Array(5).fill(false)), unlocked: Array(5).fill(false),
  values: Array(5).fill(null), fs: 1, totalFs: 10, freeSpins: true, entryWin: 0, keys: false,
};

describe("scatter anticipation", () => {
  it("starts after two cards land and fills each remaining reel bottom to top", () => {
    const board = boardWith([0, 0], [1, 3], [4, 4]);
    const plan = revealPlan(board);
    const lights = plan.steps.filter((s, i) => s.reel !== null && (i === 0 || s.reel !== plan.steps[i - 1].reel));
    expect(lights.map((s) => s.reel)).toEqual([2, 3, 4]);
    expect(lights[0].halos).toHaveLength(2);
    expect(lights[0].at).toBeGreaterThan(plan.reels[1].cells[3].delay! + plan.reels[1].cells[3].duration!);
    for (const r of [2, 3, 4]) {
      const cells = plan.reels[r].cells;
      const arrivals = cells.map((c, row) => ({ at: c.delay! + c.duration!, row })).sort((a, b) => a.at - b.at);
      expect(arrivals.map((a) => a.row)).toEqual([4, 3, 2, 1, 0]);
      expect(new Set(cells.map((c) => c.delay)).size).toBe(5);
      if (r < 4) expect(plan.reels[r + 1].cells[4].delay).toBeGreaterThan(arrivals.at(-1)!.at);
    }
    const lastCard = plan.reels[4].cells[4];
    expect(plan.steps.find((s) => s.halos.length === 3)!.at).toBeGreaterThanOrEqual(lastCard.delay! + lastCard.duration!);
    expect(plan.duration).toBeGreaterThan(Math.max(...plan.reels.flatMap((r) => r.cells.map((c) => c.delay! + c.duration!))));
    expect(plan.reels.map((r) => [r.top, ...r.cells.map((c) => c.sym), r.bottom])).toEqual(board.map((r) => r.map((s) => s.name)));
  });

  it.each([boardWith(), boardWith([0, 0]), boardWith([0, 0], [4, 4])].map((board) => ({ board })))("does not anticipate zero/one cards or a second card on the last reel", ({ board }) => {
    const plan = revealPlan(board);
    expect(plan.steps.every((s) => s.reel === null)).toBe(true);
    expect(plan.duration).toBe(1030);
  });

  it("ignores padding scatters, supports two in one reel and suppresses base anticipation in free spins", () => {
    const padding = boardWith(); padding[0][0].name = "S"; padding[1][6].name = "S";
    expect(revealPlan(padding).steps.every((s) => s.reel === null && !s.halos.length)).toBe(true);
    expect(revealPlan(boardWith([0, 0], [0, 3])).steps.some((s) => s.reel === 1)).toBe(true);
    expect(revealPlan(boardWith([0, 0], [1, 3]), false).steps.every((s) => s.reel === null)).toBe(true);
  });

  it("uses the same turbo scale for every tween, halo, light and final wait", () => {
    const board = boardWith([0, 0], [1, 3]);
    const normal = revealPlan(board), turbo = revealPlan(board, true, 0.45);
    expect(turbo.duration).toBeCloseTo(normal.duration * 0.45);
    normal.reels.forEach((r, i) => r.cells.forEach((c, w) => {
      expect(turbo.reels[i].cells[w].delay).toBeCloseTo(c.delay! * 0.45);
      expect(turbo.reels[i].cells[w].duration).toBeCloseTo(c.duration! * 0.45);
    }));
    expect(turbo.steps).toHaveLength(normal.steps.length);
    turbo.steps.forEach((s, i) => { expect(s.at).toBeCloseTo(normal.steps[i].at * 0.45); expect(s.halos).toEqual(normal.steps[i].halos); });
  });
});

function harness(initial: FeatureState | null = null, scale = 1) {
  let time = 0, reels: Reel[] = [], f = initial;
  const trace: { time: number; kind: string; value: unknown }[] = [];
  const log = (kind: string, value: unknown) => trace.push({ time, kind, value });
  const view: View = {
    reels: () => reels, setReels: (r) => { reels = r; log("reels", r); },
    feature: () => f, setFeature: (v) => { f = v; },
    setAnticipation: (v) => log("light", v), setHalos: (v) => log("halos", v),
    setOverlay: (v: Overlay | null) => log("overlay", v),
    setRoundWin: (v) => log("win", v), setPanel: () => {}, setLabels: () => {}, setPlus: () => {},
    motionScale: () => scale, sleep: async (ms, speed = scale) => { time += ms * speed; },
    tap: async (ms) => { log("tap", ms); }, sound: () => {},
  };
  return { view, trace, now: () => time };
}

describe("reveal playback", () => {
  it.each([1, 0.45])("finishes all falls before the payout at motion scale %s", async (speed) => {
    const board = boardWith([0, 0], [1, 3], [4, 4]), h = harness(null, speed);
    const plan = revealPlan(board, true, speed);
    const events: BookEvent[] = [{ index: 0, type: "reveal", board }, { index: 1, type: "finalWin", amount: 250 }];
    expect(await playBook(events, h.view, 1)).toBe(2.5);
    expect(h.now()).toBeCloseTo(380 * speed + plan.duration);
    const firstLight = h.trace.find((e) => e.kind === "light" && e.value !== null)!;
    expect(firstLight.time).toBeGreaterThan(380 * speed + 620 * speed);
    const priorCards = h.trace.filter((e) => e.kind === "halos" && e.time <= firstLight.time).at(-1)!;
    expect(priorCards.value).toHaveLength(2);
    const paid = h.trace.find((e) => e.kind === "win")!;
    expect(paid.time).toBeCloseTo(380 * speed + plan.duration);
    expect(h.trace.filter((e) => e.kind === "light").at(-1)!.value).toBeNull();
  });

  it("does not light slow reels during free spins", async () => {
    const h = harness(feature);
    await playBook([{ index: 0, type: "reveal", board: boardWith([0, 0], [1, 3]) }], h.view, 1);
    expect(h.trace.filter((e) => e.kind === "light").every((e) => e.value === null)).toBe(true);
  });

  it("goes from Mystery directly to the real intro without questions, caption or a dead delay", async () => {
    const h = harness();
    await playBook([
      { index: 0, type: "mysteryReveal", outcome: "epic" },
      { index: 1, type: "featureStart", feature: "epic", rowsRequired: [0,1,2,3,4], minChest: 5, totalFs: 10 },
    ], h.view, 500);
    expect(h.trace.filter((e) => e.kind === "overlay" && e.value).map((e) => (e.value as Overlay).kind)).toEqual(["cloud", "intro"]);
    expect(h.trace.filter((e) => e.kind === "tap").map((e) => e.value)).toEqual([Infinity]);
    expect(h.now()).toBe(1300);
  });

  it("keeps the zero-result Mystery payout without showing an empty overlay", async () => {
    const h = harness();
    expect(await playBook([{ index: 0, type: "mysteryReveal", outcome: "none" }, { index: 1, type: "finalWin", amount: 0 }], h.view, 500)).toBe(0);
    expect(h.trace.filter((e) => e.kind === "overlay" || e.kind === "tap")).toEqual([]);
    expect(h.now()).toBe(0);
  });
});
