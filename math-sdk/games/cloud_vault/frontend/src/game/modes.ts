/** Bet modes — names and costs must match games/cloud_vault/game_config.py MODE_COST. */

export type ModeId =
  | "base"
  | "extra_chance"
  | "super_chance"
  | "bonus"
  | "raid"
  | "super"
  | "mystery"
  | "storm";

/** toggle = switches the mode on for the next spins (blue ACTIVATE); buy = one bonus round (yellow BUY). */
export type ModeKind = "spin" | "toggle" | "buy";

export type ModeInfo = {
  id: ModeId;
  cost: number;
  kind: ModeKind;
  title: string;
  power: number; // 1..5 lightning pips
  art: "halos" | "halos2" | "key" | "keys" | "chests" | "chests5" | "mystery" | "none";
};

export const MODES: ModeInfo[] = [
  { id: "base", cost: 1, kind: "spin", title: "Normal spin", power: 3, art: "none" },
  { id: "extra_chance", cost: 3, kind: "toggle", title: "Extra Chance", power: 3, art: "halos" },
  { id: "super_chance", cost: 6, kind: "toggle", title: "Super Chance", power: 4, art: "halos2" },
  { id: "raid", cost: 250, kind: "toggle", title: "Bloom Raid", power: 4, art: "key" },
  { id: "storm", cost: 1000, kind: "toggle", title: "Storm Raid", power: 5, art: "keys" },
  { id: "bonus", cost: 100, kind: "buy", title: "Bloom Bonus", power: 4, art: "chests" },
  { id: "super", cost: 300, kind: "buy", title: "Bloom Super", power: 5, art: "chests5" },
  { id: "mystery", cost: 500, kind: "toggle", title: "Mystery", power: 5, art: "mystery" },
];

export const modeById = (id: ModeId) => MODES.find((m) => m.id === id) ?? MODES[0];

export const FEATURE_TITLE: Record<string, string> = {
  bonus: "Bloom Bonus",
  super: "Bloom Super",
  epic: "Bloom Epic",
  raid: "Bloom Raid",
  storm: "Storm Raid",
};

export const MAX_WIN = 25000;
