import { cloudDelay } from "./presentation";
/**
 * Board model mirroring the SDK tumble (src/calculations/tumble.py) with padding:
 * each reel is [top padding, row0..row4, bottom padding]. Book positions in reveal /
 * winInfo / tumbleBoard / freeSpinTrigger are PADDED rows (1..5); game events
 * (rowsBanked, haloExtraSpins) use visible rows 0..4.
 */

export type Cell = {
  id: number;
  sym: string;
  drop: number; // rows to fall in from (0 = static)
  delay?: number; // ms before this individual cell starts falling
  duration?: number; // explicit reveal tween duration, shared by Spine and DOM
  outDelay?: number;
  outDuration?: number;
  fxScale?: number; // frozen for the whole pulse / burst, including a Turbo change
  fxDelay?: number; // delay in unscaled animation milliseconds
  win?: boolean;
  dim?: boolean; // non-winning cell while a win is shown
  pop?: boolean;
  out?: boolean; // falling out of the board before a new reveal
};
export type Reel = { top: string; cells: Cell[]; bottom: string };

let nextId = 1;
const cell = (sym: string, drop: number, delay = 0): Cell => ({ id: nextId++, sym, drop, delay });

type SymJson = { name: string };

export function fromReveal(board: SymJson[][], stagger = true, extraDelay: number[] = []): Reel[] {
  return board.map((col, r) => ({
    top: col[0].name,
    bottom: col[col.length - 1].name,
    cells: col.slice(1, -1).map((s) => cell(s.name, stagger ? 6 : 0, stagger ? r * 90 + (extraDelay[r] ?? 0) : 0)),
  }));
}

/** Every cell drops out of the board (start of a new spin). */
export const dropOut = (reels: Reel[], speed = 1): Reel[] =>
  reels.map((reel, r) => ({ ...reel, cells: reel.cells.map((c, w) => ({ ...c, out: true, win: false, dim: false, outDelay: (r * 40 + (4 - w) * 16) * speed, outDuration: 340 * speed })) }));

export function markWins(reels: Reel[], positions: { reel: number; row: number }[], speed = 1): Reel[] {
  const hit = new Set(positions.map((p) => `${p.reel}:${p.row - 1}`));
  return reels.map((reel, r) => ({
    ...reel,
    cells: reel.cells.map((c, w) => {
      const win = hit.has(`${r}:${w}`);
      return { ...c, win, dim: !win, fxScale: speed, fxDelay: 0 };
    }),
  }));
}

export function popWins(reels: Reel[], exploding: { reel: number; row: number }[], speed = 1): Reel[] {
  const ordered = [...exploding].sort((a, b) => a.reel - b.reel || a.row - b.row);
  const hit = new Map(ordered.map((p, i) => [`${p.reel}:${p.row - 1}`, cloudDelay(i)]));
  return reels.map((reel, r) => ({
    ...reel,
    cells: reel.cells.map((c, w) => (hit.has(`${r}:${w}`) ? { ...c, pop: true, win: false, fxScale: speed, fxDelay: hit.get(`${r}:${w}`) } : c)),
  }));
}

/**
 * Apply a tumbleBoard event. For a reel with k exploding cells the SDK emits
 * newSymbols = [new top padding, n_(k-1) … n_1]; the column becomes
 * [n_(k-1) … n_1, old top padding, survivors…].
 */
export function applyTumble(
  reels: Reel[],
  exploding: { reel: number; row: number }[],
  newSymbols: SymJson[][],
): Reel[] {
  return reels.map((reel, r) => {
    const gone = new Set(exploding.filter((p) => p.reel === r).map((p) => p.row - 1));
    const calm = (c: Cell) => ({ ...c, win: false, dim: false, pop: false, fxScale: undefined, fxDelay: undefined, delay: 0, duration: undefined });
    if (!gone.size) return { ...reel, cells: reel.cells.map((c) => ({ ...calm(c), drop: 0 })) };
    const fresh = newSymbols[r] ?? [];
    const k = gone.size;
    const survivors: Cell[] = [];
    reel.cells.forEach((c, w) => {
      if (gone.has(w)) return;
      // Survivors fall by the number of gaps below them.
      const fall = [...gone].filter((g) => g > w).length;
      survivors.push({ ...calm(c), drop: fall });
    });
    const incoming = [...fresh.slice(1).map((s) => s.name), reel.top].map((sym) => cell(sym, k));
    return { top: fresh[0]?.name ?? reel.top, bottom: reel.bottom, cells: [...incoming, ...survivors] };
  });
}

export const settle = (reels: Reel[]): Reel[] =>
  reels.map((reel) => ({
    ...reel,
    cells: reel.cells.map((c) => ({ ...c, drop: 0, delay: 0, duration: undefined, win: false, dim: false, pop: false, fxScale: undefined, fxDelay: undefined })),
  }));
