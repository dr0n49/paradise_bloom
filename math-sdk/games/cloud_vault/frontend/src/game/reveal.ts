import { fromReveal, type Reel } from "./board";

type Position = { reel: number; row: number };
type Step = { at: number; reel: number | null; halos: Position[]; landed: boolean };
export type RevealPlan = { reels: Reel[]; steps: Step[]; duration: number };

/** Presentation only: the book's visible symbols, padding and order stay intact. */
export function revealPlan(board: { name: string }[][], allowAnticipation = true, speed = 1): RevealPlan {
  const reels = fromReveal(board, false);
  let scatters = 0;
  const trigger = allowAnticipation ? reels.findIndex((reel) => {
    scatters += reel.cells.filter((c) => c.sym === "S").length;
    return scatters >= 2;
  }) : -1;
  const slowAfter = trigger >= 0 && trigger < reels.length - 1 ? trigger : -1;
  const arrivals: { at: number; pos: Position; sym: string; slow: boolean }[] = [];
  const lights: { at: number; reel: number }[] = [];
  let end = 0;
  reels.forEach((reel, r) => {
    const slow = slowAfter >= 0 && r > slowAfter;
    const start = slow ? end + 80 : r * 90;
    const duration = slow ? 570 : 530;
    // Bottom first. Each later reel has a slightly more deliberate cadence.
    const gap = slow ? 180 + (r - slowAfter - 1) * 20 : 0;
    if (slow) lights.push({ at: start * speed, reel: r });
    reel.cells.forEach((c, row) => {
      c.drop = 6;
      c.delay = (start + (reel.cells.length - 1 - row) * gap) * speed;
      c.duration = duration * speed;
      arrivals.push({ at: c.delay + c.duration, pos: { reel: r, row }, sym: c.sym, slow });
    });
    end = Math.max(end, start + (reel.cells.length - 1) * gap + duration);
  });
  // Allow one rendered frame after the tween before halo/anticipation state changes.
  const moments = [...new Set([...lights.map((l) => l.at), ...arrivals.map((a) => a.at + 24 * speed)])].sort((a, b) => a - b);
  const steps = moments.map((at): Step => ({
    at,
    reel: lights.filter((l) => l.at <= at).at(-1)?.reel ?? null,
    halos: arrivals.filter((a) => a.sym === "S" && a.at + 24 * speed <= at).map((a) => a.pos),
    landed: arrivals.some((a) => a.slow && a.at + 24 * speed === at),
  }));
  return { reels, steps, duration: (end + 140) * speed };
}
