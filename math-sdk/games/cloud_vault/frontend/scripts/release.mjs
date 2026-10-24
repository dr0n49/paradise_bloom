/**
 * Release package for Stake Engine: builds the frontend, drops the bundled demo books
 * (Stake plays real rounds through the RGS) and zips dist/ into ../release/.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const out = join(root, "..", "release");
const version = JSON.parse(execSync("npm pkg get version", { cwd: root }).toString()).replace?.(/"/g, "") ?? "0.0.0";

execSync("npx tsc --noEmit && npx vite build", { cwd: root, stdio: "inherit" });
rmSync(join(dist, "demo"), { recursive: true, force: true });

const size = (p) => (statSync(p).isDirectory() ? readdirSync(p).reduce((s, f) => s + size(join(p, f)), 0) : statSync(p).size);
mkdirSync(out, { recursive: true });
const zip = join(out, `paradise_bloom_frontend_${version}.zip`);
if (existsSync(zip)) rmSync(zip);
execSync(`zip -qr "${zip}" .`, { cwd: dist });
console.log(`dist ${(size(dist) / 1e6).toFixed(1)} MB → ${zip} (${(statSync(zip).size / 1e6).toFixed(1)} MB)`);
