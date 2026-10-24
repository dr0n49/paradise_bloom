import { afterEach, expect, it, vi } from "vitest";
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });
it("can retry a missing demo book instead of permanently caching a rejected load", async () => {
  vi.stubGlobal("location", { search: "" });
  const book = { w: 1, criteria: "base", payoutMultiplier: 0, events: [{ index: 0, type: "finalWin", amount: 0 }] };
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce({ ok: true, json: async () => ({ books: [book] }) });
  vi.stubGlobal("fetch", fetcher);
  const { demoRound } = await import("./demo");
  await expect(demoRound("base")).rejects.toThrow("demo books missing");
  expect(await demoRound("base")).toEqual(book);
  expect(fetcher).toHaveBeenCalledTimes(2);
});
