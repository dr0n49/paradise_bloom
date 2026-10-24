import { afterEach, describe, expect, it, vi } from "vitest";
import { betLevelIndex, betLevelsOf, fetchReplay, openingBet, steppedBetIndex, toApi, type AuthResponse } from "./rgs";

afterEach(() => vi.unstubAllGlobals());

function launch(frontend: string, rgs: string) {
  const params = new URLSearchParams({ replay: "true", game: "cloud_vault", version: "1", mode: "base", event: "1", rgs_url: rgs });
  vi.stubGlobal("window", { location: { hostname: frontend, search: `?${params}` } });
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ state: [{ index: 0, type: "finalWin", amount: 0 }], costMultiplier: 1, payoutMultiplier: 0 }) });
  vi.stubGlobal("fetch", fetcher);
  return fetcher;
}

describe("replay transport", () => {
  it("can test the packaged frontend against an explicit loopback mock", async () => {
    const fetcher = launch("127.0.0.1", "http://127.0.0.1:5191");
    await fetchReplay();
    expect(fetcher.mock.calls[0][0]).toBe("http://127.0.0.1:5191/bet/replay/cloud_vault/1/base/1");
  });
  it.each([
    ["team.live.engine.io", "http://127.0.0.1:5191"],
    ["127.0.0.1", "http://rgs.example.com"],
  ])("rejects insecure transport from %s to %s before fetching", async (frontend, rgs) => {
    const fetcher = launch(frontend, rgs);
    await expect(fetchReplay()).rejects.toThrow("HTTPS");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("normalizes the supplied bare production host and uses it for replay", async () => {
    const fetcher = launch("team.live.engine.io", "rgs.example.com");
    await fetchReplay();
    expect(fetcher.mock.calls[0][0]).toBe("https://rgs.example.com/bet/replay/cloud_vault/1/base/1");
  });
});

describe("stake restoration and current RGS limits", () => {
  const levels = [1, 1.25, 1.5, 2];
  const auth = (amount?: number, active = true): AuthResponse => ({
    balance: { amount: 100_000_000, currency: "USD" },
    config: { betLevels: levels.map(toApi), defaultBetLevel: toApi(1.5) },
    ...(amount === undefined ? {} : { round: { active, amount: toApi(amount) } }),
  });

  it("uses the supplied default when there is no active round", () => {
    expect(openingBet(auth(), levels)).toEqual({ amount: 1.5, index: 2 });
    expect(openingBet(auth(1.25, false), levels)).toEqual({ amount: 1.5, index: 2 });
  });

  it("keeps an active non-default stake for both replaying the round and the next play", () => {
    const restored = openingBet(auth(1.25), levels);
    expect(restored).toEqual({ amount: 1.25, index: 1 });
    expect(toApi(restored.amount)).toBe(1_250_000);
  });

  it.each([0.875, 1.375, 2.125, 1.000001])("preserves retired stake %s without adding it to allowed new plays", (amount) => {
    const before = [...levels];
    const restored = openingBet(auth(amount), levels);
    expect(restored).toEqual({ amount, index: -1 });
    expect(betLevelIndex(restored.amount, levels)).toBe(-1);
    expect(levels).toEqual(before);
    expect(toApi(restored.amount)).toBe(toApi(amount));
  });

  it.each([
    [1.375, -1, 1.25], [1.375, 1, 1.5],
    [0.875, 1, 1], [2.125, -1, 2],
    [1.25, -1, 1], [1.25, 1, 1.5],
    [1, -1, 1], [2, 1, 2],
  ] as const)("moves %s in direction %s to permitted amount %s on an explicit arrow action", (amount, dir, expected) => {
    const next = steppedBetIndex(amount, levels, dir);
    expect(levels[next]).toBe(expected);
    expect(betLevelIndex(levels[next], levels)).toBe(next);
  });

  it("uses the current min/max-filtered RGS levels rather than permitting a historical stake", () => {
    const a = auth(1.25);
    a.config = { ...a.config, minBet: toApi(1.5), maxBet: toApi(2) };
    const current = betLevelsOf(a);
    expect(current).toEqual([1.5, 2]);
    expect(openingBet(a, current)).toEqual({ amount: 1.25, index: -1 });
  });
});


describe("wallet amount contract", () => {
  it.each(["base", "extra_chance", "super_chance", "bonus", "super", "raid", "storm", "mystery"])("sends only the exact base amount in %s; mode cost is applied once by the RGS", async (mode) => {
    vi.stubGlobal("window", { location: { search: "?sessionID=wallet-qa&rgs_url=http://127.0.0.1:5191" } });
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ balance: { amount: 1, currency: "USD" }, round: { active: false } }) });
    vi.stubGlobal("fetch", fetcher);
    const { play } = await import("./rgs");
    await play(mode, 1.375001);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ sessionID: "wallet-qa", mode, amount: 1375001 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([false, "false", "true", 1, null, undefined])("never restores a historical amount for non-boolean active=%s", (active) => {
    const response = { balance: { amount: 100000000, currency: "USD" }, config: { defaultBetLevel: toApi(2) }, round: { active, amount: toApi(1) } } as unknown as AuthResponse;
    expect(openingBet(response, [1, 2])).toEqual({ amount: 2, index: 1 });
  });
});
