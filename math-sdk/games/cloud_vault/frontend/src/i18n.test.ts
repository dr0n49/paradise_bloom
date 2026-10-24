import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

const restricted = /\b(?:win\s+feature|pay\s+out|paid\s+out|pays\s+out|total\s+bet|at\s+the\s+cost\s+of|cost\s+of|buy\s+bonus|bonus\s+buy|be\s+awarded\s+to\s+player['’]s\s+accounts|place\s+your\s+bets|bet\/s|bet|bets|betting|buy|bought|cash|credit|currency|deposit|fund|gamble|gambling|money|paid|pay|payer|pays|purchase|rebet|stake|withdraw|wager|paytable)\b|\bpay\s+table\b/i;
function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "function") return textOf(value(10));
  if (value && typeof value === "object") return Object.keys(value).map((key) => textOf((value as Record<string, unknown>)[key])).join("\n");
  return "";
}

describe("complete social wording", () => {
  it.each(["en", "ru", "zz"])("keeps all social text English and free of restricted words with lang=%s", async (lang) => {
    vi.stubGlobal("location", { search: `?lang=${lang}&social=true` });
    const { t } = await import("./i18n");
    const text = textOf(t);
    expect(text).not.toMatch(restricted);
    expect(text).not.toMatch(/[А-Яа-яЁё]/);
    expect(t.increaseAmount).not.toBe(t.decreaseAmount);
  });

  it("switches the complete text set when authentication enables social mode", async () => {
    vi.stubGlobal("location", { search: "?lang=ru" });
    const { t, setSocial } = await import("./i18n");
    expect(t.balance).toMatch(/[А-Яа-я]/);
    setSocial(true);
    expect(textOf(t)).not.toMatch(restricted);
    expect(textOf(t)).not.toMatch(/[А-Яа-яЁё]/);
  });
});


describe("all requested interface languages", () => {
  const languages = ["ar", "de", "en", "es", "fi", "fr", "hi", "id", "ja", "ko", "pl", "pt", "ru", "tr", "zh", "vi", "da"];
  const protectedTitles = { totalWin: "Total win", bigWin: "Big win", megaWin: "Mega win", epicWin: "Epic win", maxWin: "Max win", mysteryResult: "Mystery" };
  it.each(languages)("loads a complete dictionary and preserves branded titles for %s", async (lang) => {
    vi.stubGlobal("location", { search: `?lang=${lang}` });
    const { t, uiLanguage, SUPPORTED_LANGUAGES } = await import("./i18n");
    expect(uiLanguage()).toBe(lang);
    expect([...SUPPORTED_LANGUAGES].sort()).toEqual([...languages].sort());
    const text = textOf(t);
    expect(text).not.toMatch(/undefined|NaN|\{n\}/);
    expect(t.balance.length).toBeGreaterThan(0);
    expect(t.bet.length).toBeGreaterThan(0);
    if (lang !== "en" && lang !== "ru") {
      expect(t.balance).not.toBe("Balance");
      expect(t.rules.title).not.toBe("Game rules");
      for (const [key, value] of Object.entries(protectedTitles)) expect(t[key as keyof typeof t]).toBe(value);
    }
    expect(t.intro.epic[0]).toBe("Epic Bloom Bonus");
    expect(t.intro.chest[0]).toBe("Lotus Multipliers");
    expect(t.intro.max[0]).toBe("Max Win");
    expect(t.rules.chests).toHaveLength(4);
    expect(t.rules.controls).toHaveLength(10);
    expect(t.rules.general).toHaveLength(lang === "en" ? 2 : 7);
    expect(t.rules.intro).toMatch(/96[.,]00%/);
    expect(t.rules.chests[2]).toContain("100x");
    expect(t.rules.chests[2]).toContain("30x");
    expect(Object.keys(t.modeText).sort()).toEqual(["bonus", "extra_chance", "mystery", "raid", "storm", "super", "super_chance"]);
    for (const message of Object.values(t.replayErrors)) expect(message.length).toBeGreaterThan(0);
  });

  it.each(["ar", "de", "es", "fi", "fr", "hi", "id", "ja", "ko", "pl", "pt", "tr", "zh", "vi", "da"])("keeps the existing complete social wording for %s", async (lang) => {
    vi.stubGlobal("location", { search: `?lang=${lang}&social=true` });
    const { t, uiLanguage } = await import("./i18n");
    expect(uiLanguage()).toBe("en");
    expect(t.balance).toBe("Balance");
    expect(t.bet).toBe("Play amount");
    expect(textOf(t)).not.toMatch(restricted);
  });

  it("accepts regional codes while unknown codes fall back to English", async () => {
    vi.stubGlobal("location", { search: "?lang=zz" });
    const { t, uiLanguage, resolveLanguage } = await import("./i18n");
    expect(uiLanguage()).toBe("en");
    expect(t.balance).toBe("Balance");
    for (const [code, expected] of [["pt-BR", "pt"], ["zh-CN", "zh"], ["AR_sa", "ar"], ["en-US", "en"], ["tr-TR", "tr"], ["arbitrary", "en"]]) expect(resolveLanguage(code)).toBe(expected);
  });
});


describe("mandatory Engine disclaimer", () => {
  const required = "Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.";
  it.each([false, true])("retains the entire required paragraph verbatim with social=%s", async (social) => {
    vi.stubGlobal("location", { search: `?lang=en&social=${social}` });
    const { t } = await import("./i18n");
    const { GENERAL_GAME_DISCLAIMER } = await import("./game/disclaimer");
    expect(GENERAL_GAME_DISCLAIMER).toBe(required);
    expect(t.rules.general.filter((p) => p === required)).toHaveLength(1);
    if (social) {
      expect(t.limits).toBe("Play limit reached.");
      expect(t.modeText.extra_chance).toContain("for 3x");
      expect(t.modeText.super_chance).toContain("for 6x");
      expect(textOf(t)).not.toMatch(restricted);
    }
  });
});
