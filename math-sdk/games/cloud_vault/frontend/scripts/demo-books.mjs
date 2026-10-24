// Sample real books into public/demo/books_<mode>.json for demo play.
// Weighted draw (true odds) + a few books of every criteria for ?force=<criteria> QA.
//   node scripts/demo-books.mjs [perMode=400] [perCriteria=12]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Decompress } from "fzstd";

const here = dirname(fileURLToPath(import.meta.url));
const lib = join(here, "..", "..", "library");
const out = join(here, "..", "public", "demo");
const perMode = Number(process.argv[2] ?? 400);
const perCriteria = Number(process.argv[3] ?? 12);
mkdirSync(out, { recursive: true });

// Deterministic RNG so the demo set is reproducible.
let seed = 0x9e3779b9;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

const index = JSON.parse(readFileSync(join(lib, "publish_files", "index.json"), "utf8"));
for (const { name, events, weights } of index.modes) {
  const lut = readFileSync(join(lib, "publish_files", weights), "utf8")
    .trim()
    .split("\n")
    .map((l) => l.split(",").map(Number));
  const seg = new Map(
    readFileSync(join(lib, "lookup_tables", `lookUpTableSegmented_${name}.csv`), "utf8")
      .trim()
      .split("\n")
      .map((l) => l.split(","))
      .map(([id, c]) => [Number(id), c]),
  );
  const total = lut.reduce((s, r) => s + r[1], 0);
  const cum = [];
  let acc = 0;
  for (const r of lut) cum.push((acc += r[1]));
  const pick = new Map(); // id -> {count, forced}
  for (let i = 0; i < perMode; i++) {
    const x = rnd() * total;
    let lo = 0, hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    const id = lut[lo][0];
    pick.set(id, { count: (pick.get(id)?.count ?? 0) + 1, forced: false });
  }
  const byCrit = new Map();
  for (const r of lut) {
    const c = seg.get(r[0]);
    if (!byCrit.has(c)) byCrit.set(c, []);
    byCrit.get(c).push(r[0]);
  }
  for (const ids of byCrit.values()) {
    for (let i = 0; i < perCriteria; i++) {
      const id = ids[Math.floor(rnd() * ids.length)];
      if (!pick.has(id)) pick.set(id, { count: 0, forced: true });
    }
  }
  // Max-win showcase books, if any.
  for (const r of lut) if (r[2] >= 2_500_000 && !pick.has(r[0])) pick.set(r[0], { count: 0, forced: true });

  const books = [];
  const onLine = (line) => {
    if (!line) return;
    const idMatch = /"id":\s*(\d+)/.exec(line.slice(0, 40));
    if (!idMatch || !pick.has(Number(idMatch[1]))) return;
    const b = JSON.parse(line);
    const p = pick.get(b.id);
    books.push({
      w: p.count,
      forced: p.count === 0 || undefined,
      criteria: b.criteria,
      payoutMultiplier: b.payoutMultiplier,
      events: b.events,
    });
  };
  // Stream-decompress: full books are larger than a JS string can hold.
  let rest = Buffer.alloc(0);
  const stream = new Decompress((chunk) => {
    let buf = Buffer.concat([rest, Buffer.from(chunk)]);
    let nl;
    while ((nl = buf.indexOf(10)) !== -1) {
      onLine(buf.subarray(0, nl).toString("utf8"));
      buf = buf.subarray(nl + 1);
    }
    rest = Buffer.from(buf);
  });
  const packed = readFileSync(join(lib, "publish_files", events));
  for (let i = 0; i < packed.length; i += 1 << 20) {
    const end = Math.min(i + (1 << 20), packed.length);
    stream.push(packed.subarray(i, end), end === packed.length);
  }
  onLine(rest.toString("utf8"));
  writeFileSync(join(out, `books_${name}.json`), JSON.stringify({ mode: name, books }));
  console.log(`${name}: ${books.length} books (${perMode} weighted draws)`);
}
