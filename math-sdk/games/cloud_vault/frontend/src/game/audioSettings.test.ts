import { describe, expect, it } from "vitest";
import { AudioSettings } from "./audioSettings";

function storage() {
  const values = new Map<string, string>();
  return { getItem: (k: string) => values.get(k) ?? null, setItem: (k: string, v: string) => { values.set(k, v); } };
}

describe("independent audio controls", () => {
  it("restores a custom music level after mute without changing effects", () => {
    const s = new AudioSettings(); s.set("music", 0.35); s.set("fx", 0.65);
    expect(s.toggle("music")).toBe(0); expect(s.snapshot().fx).toBe(0.65);
    expect(s.toggle("music")).toBe(0.35); expect(s.snapshot()).toEqual({ fx: 0.65, music: 0.35 });
  });
  it("remembers zero from a slider and its last audible value after a reload", () => {
    const store = storage(), first = new AudioSettings(store);
    first.set("fx", 0.25); first.set("fx", 0);
    const reloaded = new AudioSettings(store);
    expect(reloaded.snapshot().fx).toBe(0); expect(reloaded.toggle("fx")).toBe(0.25);
  });
  it("starts ?mute silent without overwriting existing preferences", () => {
    const store = storage(); store.setItem("sd-music", "0.7");
    const s = new AudioSettings(store, true);
    expect(s.snapshot()).toEqual({ fx: 0, music: 0 }); expect(store.getItem("sd-music")).toBe("0.7");
    expect(s.toggle("music")).toBe(0.7);
  });
  it("clamps invalid levels and still works when browser storage throws", () => {
    const s = new AudioSettings({ getItem: () => { throw Error(); }, setItem: () => { throw Error(); } });
    expect(s.set("music", 2)).toBe(1); expect(s.set("fx", -1)).toBe(0);
    expect(s.set("music", NaN)).toBe(0); expect(s.toggle("music")).toBe(1);
  });
  it("does not expose its mutable internal state through snapshots", () => {
    const s = new AudioSettings(), v = s.snapshot(); v.fx = 0;
    expect(s.snapshot().fx).toBe(0.8);
  });
});
