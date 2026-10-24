"""Chest multiplier weights per feature, read from chest_tables.json (written by calibrate.py).

Weights follow w(v) = v ** -alpha over the allowed values (2..100, or 5..100 for
min-5x features); alpha is solved per feature so each buy price returns 96%.
"""

import json
from pathlib import Path

from game_config import CHEST_MIN5, CHEST_VALUES

PATH = Path(__file__).resolve().parent / "chest_tables.json"
RESOLUTION = 1_000_000


def allowed_values(feature: str) -> tuple:
    return tuple(v for v in CHEST_VALUES if feature not in CHEST_MIN5 or v >= 5)


def weights_for_alpha(feature: str, alpha: float) -> dict:
    vals = allowed_values(feature)
    raw = [v ** -alpha for v in vals]
    total = sum(raw)
    return {v: max(1, int(round(RESOLUTION * r / total))) for v, r in zip(vals, raw)}


def load_tables() -> dict:
    """{feature: {value: weight}}; falls back to alpha=1.5 when not calibrated yet."""
    if PATH.exists():
        data = json.loads(PATH.read_text(encoding="utf-8"))
        return {f: {int(v): int(w) for v, w in t["weights"].items()} for f, t in data.items()}
    return {f: weights_for_alpha(f, 1.5) for f in ("bonus", "super", "epic", "raid", "storm")}
