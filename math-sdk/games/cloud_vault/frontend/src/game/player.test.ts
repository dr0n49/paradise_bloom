import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { Reel } from "./board";
import type { BookEvent } from "./rgs";
import { featureWin, playBook, type FeatureState, type Panel, type View, type WinLabel } from "./player";

function harness(initialFeature: FeatureState | null = null) {
  let reels: Reel[] = [];
  let feature = initialFeature;
  let labels: WinLabel[] = [];
  const panels: Panel[] = [];
  const payouts: number[] = [];
  const bonusPayouts: number[] = [];
  const groups: number[][] = [];
  const popLabels: number[][] = [];
  const view: View = {
    reels: () => reels,
    setReels: (next) => { reels = next; },
    feature: () => feature,
    setFeature: (next) => { feature = next; if (next?.freeSpins) bonusPayouts.push(featureWin(payouts.at(-1) ?? 0, next)); },
    setRoundWin: (value) => { payouts.push(value); if (feature?.freeSpins) bonusPayouts.push(featureWin(value, feature)); },
    setPanel: (value) => { panels.push(value); },
    setLabels: (next) => { labels = next; if (next.length) groups.push(next.map((l) => l.x)); },
    setHalos: () => {}, setPlus: () => {}, setAnticipation: () => {}, setOverlay: () => {},
    sleep: async () => {}, tap: async () => {},
    sound: (name) => { if (name === "pop") popLabels.push(labels.map((l) => l.x)); },
  };
  return { view, panels, payouts, bonusPayouts, groups, popLabels };
}

describe("payout presentation", () => {
  it("keeps both cluster payouts visible, updates the HUD and leaves the board clear through another cascade", async () => {
    const books = JSON.parse(readFileSync(join(__dirname, '../../public/demo/books_base.json'), 'utf8')).books;
    const book = books.find((b: { events: BookEvent[] }) =>
      b.events.some((e) => e.type === 'winInfo' && (e.wins as unknown[]).length > 1) &&
      b.events.filter((e) => e.type === 'winInfo').length > 1,
    );
    const h = harness();
    const payout = await playBook(book.events, h.view, 1);
    const expectedGroups = book.events.filter((e: BookEvent) => e.type === 'winInfo').map((e: BookEvent) =>
      (e.wins as { win: number }[]).map((w) => w.win / 100),
    );
    expect(h.groups).toEqual(expectedGroups.flatMap((group: number[]) => group.map((_, i) => group.slice(0, i + 1))));
    expect(h.popLabels).toEqual(expectedGroups);
    expect(h.panels.filter(Boolean)).toEqual([]);
    const subtotals = book.events.filter((e: BookEvent) => e.type === 'updateTumbleWin').map((e: BookEvent) => Number(e.amount) / 100);
    expect(h.payouts.slice(0, subtotals.length)).toEqual(subtotals);
    expect(payout).toBe(book.payoutMultiplier / 100);
  });

  it("adds each free spin subtotal to completed spins without double counting cascades", async () => {
    const h = harness();
    const events: BookEvent[] = [
      { type: 'setTotalWin', amount: 100 },
      { type: 'updateTumbleWin', amount: 20 },
      { type: 'updateTumbleWin', amount: 50 },
      { type: 'setTotalWin', amount: 150 },
      { type: 'updateTumbleWin', amount: 30 },
      { type: 'setTotalWin', amount: 180 },
      { type: 'finalWin', amount: 180 },
    ].map((event, index) => ({ index, ...event }));
    expect(await playBook(events, h.view, 1)).toBe(1.8);
    expect(h.payouts).toEqual([1, 1.2, 1.5, 1.5, 1.8, 1.8, 1.8]);
    expect(h.panels.filter(Boolean)).toEqual([]);
  });

  it("retains the centre panel for the final lotus multiplier reveal", async () => {
    const feature: FeatureState = {
      feature:'raid', rows:[0,1,2,3,4], minChest:2,
      banked:Array.from({length:5},()=>Array(5).fill(true)), unlocked:Array(5).fill(true),
      values:Array(5).fill(null), fs:0, totalFs:0, freeSpins:false, entryWin:0, keys:true,
    };
    const h = harness(feature);
    await playBook([{index:0,type:'chestsOpen',chests:[{reel:0,mult:2},{reel:1,mult:3}],winBefore:100,winAfter:600}],h.view,250);
    expect(h.panels.filter(Boolean)).toEqual([
      {x:1,mult:1}, {x:1,mult:2}, {x:1,mult:6}, {x:6,final:true},
    ]);
  });
});


describe("free-spin total excludes the trigger-spin win", () => {
  it.each([431, 461])("includes the final 0.20 before lotuses in real Super book %s", async (index) => {
    const { books } = JSON.parse(readFileSync(join(__dirname, '../../public/demo/books_super.json'), 'utf8'));
    const book = books[index];
    const h = harness();
    const result = await playBook(book.events, h.view, 300);
    const open = book.events.find((e: BookEvent) => e.type === 'chestsOpen');
    const start = book.events.findIndex((e: BookEvent) => e.type === 'featureStart');
    const spins = book.events.slice(start).filter((e: BookEvent) => e.type === 'setWin');
    expect(spins.at(-1).amount).toBe(20);
    expect(spins.reduce((sum: number, e: BookEvent) => sum + Number(e.amount), 0)).toBe(190);
    expect(h.view.feature()?.entryWin).toBe(.2);
    expect(h.bonusPayouts[0]).toBe(0);
    expect(h.bonusPayouts).toContain(1.7);
    expect(h.bonusPayouts).toContain(1.9);
    expect(h.payouts).toContain(2.1); // the complete round still includes the trigger .20
    const first = h.panels.find((p) => p?.mult === 1);
    expect(first?.x).toBe(1.9);
    expect(open.winBefore).toBe(190);
    expect(h.bonusPayouts.at(-1)).toBe(open.winAfter / 100);
    expect(result).toBe(book.payoutMultiplier / 100);
    expect(Math.round(result * 100)).toBe(open.winAfter + 20);
  });

  it("keeps the HUD and lotus base equal when the trigger pays zero", async () => {
    const { books } = JSON.parse(readFileSync(join(__dirname, '../../public/demo/books_bonus.json'), 'utf8'));
    const book = books.find((b: { events: BookEvent[] }) => {
      const i = b.events.findIndex((e) => e.type === 'featureStart');
      const open = b.events.find((e) => e.type === 'chestsOpen');
      return i >= 0 && open && !b.events.slice(0, i).some((e) => e.type === 'setWin' && Number(e.amount) > 0);
    });
    const h = harness();
    const result = await playBook(book.events, h.view, 100);
    expect(h.view.feature()?.entryWin).toBe(0);
    const before = book.events.find((e: BookEvent) => e.type === 'chestsOpen').winBefore / 100;
    expect(h.panels.find((p) => p?.mult === 1)?.x).toBe(before);
    expect(h.bonusPayouts).toContain(before);
    expect(h.bonusPayouts.at(-1)).toBe(result);
  });
});
