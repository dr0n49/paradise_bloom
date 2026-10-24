"""Generate reel strips BR0 (base), FR0 (Bonus/Epic free spins), FR1 (Super free spins), RR0 (raid, no halos).

Strips are built from symbol weights with short same-symbol runs ("stacks") so
vertical clusters form. Halos (S) are spaced so one reel window (5 rows + padding)
never holds two of them — force_special_board relies on that.

    python make_reels.py
"""

import random
from pathlib import Path

REELS = Path(__file__).resolve().parent / "reels"
LENGTH = 120
HALO_GAP = 8

STRIPS = {
    # weights, stack probability, halos per reel
    "BR0": ({"H1": 4, "H2": 5, "H3": 6, "H4": 7, "L1": 9, "L2": 9, "L3": 11, "L4": 11}, 0.20, 4),
    "FR0": ({"H1": 4, "H2": 5, "H3": 6, "H4": 7, "L1": 9, "L2": 9, "L3": 11, "L4": 11}, 0.15, 2),
    "FR1": ({"H1": 4, "H2": 5, "H3": 6, "H4": 7, "L1": 9, "L2": 9, "L3": 11, "L4": 11}, 0.10, 2),
    "RR0": ({"H1": 4, "H2": 5, "H3": 6, "H4": 7, "L1": 9, "L2": 9, "L3": 11, "L4": 11}, 0.45, 0),
}


def build_reel(rng: random.Random, weights: dict, stack: float, halos: int) -> list[str]:
    syms, w = zip(*weights.items())
    strip: list[str] = []
    while len(strip) < LENGTH:
        if strip and rng.random() < stack:
            strip.append(strip[-1])
        else:
            strip.append(rng.choices(syms, w)[0])
    if halos:
        step = LENGTH // halos
        for i in range(halos):
            pos = i * step + rng.randrange(0, step - HALO_GAP)
            strip[pos] = "S"
    return strip


def main() -> None:
    REELS.mkdir(exist_ok=True)
    for name, (weights, stack, halos) in STRIPS.items():
        rng = random.Random(name)
        reels = [build_reel(rng, weights, stack, halos) for _ in range(5)]
        lines = [",".join(reels[r][i] for r in range(5)) for i in range(LENGTH)]
        (REELS / f"{name}.csv").write_text("\n".join(lines) + "\n", encoding="utf-8")
        print(name, "written")


if __name__ == "__main__":
    main()
