import { afterEach, expect, it, vi } from "vitest";
vi.mock("../spine/runtime", () => ({ loadRig: vi.fn().mockResolvedValue(undefined), spineDisabled: vi.fn(() => false) }));
import { loadRig, spineDisabled } from "../spine/runtime";
import { preloadVisuals, VISUAL_IMAGES } from "./preload";

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); vi.mocked(spineDisabled).mockReturnValue(false); vi.mocked(loadRig).mockResolvedValue(undefined); });
function images(failure: "network" | "decode" | null = null) {
  const decoded: string[] = [];
  class ImageStub {
    srcValue = "";
    onload?: () => void;
    onerror?: () => void;
    set src(value: string) { this.srcValue = value; queueMicrotask(() => failure === "network" && value.includes("card_frame") ? this.onerror?.() : this.onload?.()); }
    decode() { decoded.push(this.srcValue); return failure === "decode" && this.srcValue.includes("card_frame") ? Promise.reject(new Error("decode failed")) : Promise.resolve(); }
  }
  vi.stubGlobal("Image", ImageStub);
  vi.stubGlobal("document", { fonts: { ready: Promise.resolve() } });
  return decoded;
}
it("does not finish while a welcome card is downloaded but not decoded", async () => {
  images();
  let release!: () => void;
  vi.stubGlobal("document", { fonts: { ready: new Promise<void>((resolve) => { release = resolve; }) } });
  const progress: number[] = [];
  let ready = false;
  const loading = preloadVisuals((done, total) => progress.push(done / total)).then(() => { ready = true; });
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(ready).toBe(false);
  expect(progress.at(-1)).toBeLessThan(1);
  release(); await loading;
  expect(ready).toBe(true); expect(progress.at(-1)).toBe(1);
});
it.each(["network", "decode"] as const)("rejects a broken welcome frame (%s) instead of exposing empty cards", async (failure) => {
  images(failure);
  await expect(preloadVisuals(() => {})).rejects.toThrow();
});
it("decodes the complete fallback artwork when Spine is unavailable", async () => {
  const decoded = images();vi.mocked(loadRig).mockRejectedValue(new Error("no WebGL"));
  await preloadVisuals(() => {});
  expect(decoded.sort()).toEqual([...VISUAL_IMAGES].sort());
  expect(new Set(decoded).size).toBe(VISUAL_IMAGES.length);
});
