/**
 * Replays real books (public/demo, from `npm run demo-books`) through the board model:
 * after every tumble, each winning position must hold that win's symbol. This pins the
 * client's tumble reconstruction to the SDK's.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { applyTumble, fromReveal, type Reel } from "./board";

const dir = join(__dirname, "..", "..", "public", "demo");
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json")) : [];

describe.skipIf(!files.length)("board model replays books", () => {
  for (const f of files) {
    it(f, () => {
      const { books } = JSON.parse(readFileSync(join(dir, f), "utf8"));
      let checked = 0;
      for (const b of books) {
        let reels: Reel[] = [];
        for (const ev of b.events) {
          if (ev.type === "reveal") reels = fromReveal(ev.board, false);
          if (ev.type === "winInfo") {
            for (const w of ev.wins) {
              for (const p of w.positions) {
                expect(reels[p.reel].cells[p.row - 1].sym, `book ${b.criteria}`).toBe(w.symbol);
                checked++;
              }
            }
          }
          if (ev.type === "tumbleBoard") reels = applyTumble(reels, ev.explodingSymbols, ev.newSymbols);
        }
      }
      expect(checked).toBeGreaterThan(0);
    });
  }
});
