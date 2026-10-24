"""Solve chest weight tables so every buy feature returns RTP × price.

Chest values are drawn once, at the end of a round, independently of the board.
So we simulate rounds once, keep (feature win, other win, unlocked chests) and
evaluate any chest table exactly:  E = mean_i Σ_P p(P | k_i) · min(cap, other_i + win_i · P).

Targets (× bet):
  bonus = 0.96·100, super = 0.96·300, raid = 0.96·250, storm = 0.96·1000
  epic from mystery: 0.5·E[no feature] + 0.4·E[super] + 0.1·E[epic] = 0.96·500

    python calibrate.py     # writes chest_tables.json
"""

import json
import os
import sys
from collections import defaultdict

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.abspath(os.path.join(HERE, "..", "..")))

from chest_tables import PATH, allowed_values, weights_for_alpha  # noqa: E402
from game_config import MODE_COST, RTP, WINCAP, GameConfig  # noqa: E402
from src.wins.win_manager import WinManager  # noqa: E402

SAMPLES = {"bonus": 3000, "super": 3000, "epic": 3000, "raid": 30000, "storm": 0}
FEATURE_SOURCE = {  # (mode, criteria) used to simulate each feature
    "bonus": ("bonus", "fs_bonus"),
    "super": ("super", "fs_super"),
    "epic": ("mystery", "fs_epic"),
    "raid": ("raid", "raid"),
}


def simulate(mode: str, criteria: str, n: int, seed0: int = 10_000_000):
    from gamestate import GameState

    gs = GameState(GameConfig())
    gs.betmode = mode
    gs.win_manager = WinManager("basegame", "freegame", WINCAP)
    rows = []
    for s in range(n):
        gs.criteria = criteria
        gs.run_spin(seed0 + s)
        info = gs.chest_info
        rows.append((info["featureWin"], info["otherWin"], info["unlocked"]))
    return np.array(rows, dtype=float)


def mean_base_spin(n: int = 20000) -> float:
    from gamestate import GameState

    gs = GameState(GameConfig())
    gs.betmode = "mystery"
    gs.win_manager = WinManager("basegame", "freegame", WINCAP)
    tot = 0.0
    for s in range(n):
        gs.criteria = "mystery_none"
        gs.run_spin(20_000_000 + s)
        tot += gs.final_win
    return tot / n


def product_dist(weights: dict, k: int):
    vals = np.array(list(weights.keys()), dtype=float)
    p = np.array(list(weights.values()), dtype=float)
    p /= p.sum()
    dist = {1.0: 1.0}
    for _ in range(k):
        nxt = defaultdict(float)
        for prod, pp in dist.items():
            for v, pv in zip(vals, p):
                nxt[min(prod * v, 1e9)] += pp * pv
        dist = nxt
    return np.array(list(dist.keys())), np.array(list(dist.values()))


def expected(samples: np.ndarray, weights: dict) -> float:
    total = 0.0
    for k in range(6):
        sel = samples[samples[:, 2] == k]
        if not len(sel):
            continue
        P, pr = product_dist(weights, k)
        win, other = sel[:, 0:1], sel[:, 1:2]
        total += np.minimum(WINCAP, other + win * P[None, :]).dot(pr).sum()
    return total / len(samples)


def solve_alpha(feature: str, samples: np.ndarray, target: float) -> tuple[float, float]:
    lo, hi = -4.0, 8.0
    e_lo = expected(samples, weights_for_alpha(feature, lo))
    e_hi = expected(samples, weights_for_alpha(feature, hi))
    if not (e_hi <= target <= e_lo):
        raise RuntimeError(f"{feature}: target {target:.2f} outside reachable [{e_hi:.2f}, {e_lo:.2f}]")
    for _ in range(60):
        mid = (lo + hi) / 2
        if expected(samples, weights_for_alpha(feature, mid)) > target:
            lo = mid
        else:
            hi = mid
    a = (lo + hi) / 2
    return a, expected(samples, weights_for_alpha(feature, a))


def main() -> None:
    data = {}
    for feature, (mode, crit) in FEATURE_SOURCE.items():
        data[feature] = simulate(mode, crit, SAMPLES[feature])
        s = data[feature]
        print(
            f"{feature:6} rounds={len(s)} raw={s[:, 0].mean():.3f} other={s[:, 1].mean():.3f} "
            f"unlocked={s[:, 2].mean():.2f}",
            flush=True,
        )
    data["storm"] = data["raid"]  # same board and unlock rule, only the chest table differs
    e_none = mean_base_spin()
    print(f"mystery no-feature mean = {e_none:.4f}")

    targets = {f: RTP * MODE_COST[f] for f in ("bonus", "super", "raid", "storm")}
    out = {}
    for f in ("bonus", "super", "raid", "storm"):
        a, e = solve_alpha(f, data[f], targets[f])
        out[f] = {"alpha": a, "expected": e, "target": targets[f]}
    targets["epic"] = (RTP * MODE_COST["mystery"] - 0.5 * e_none - 0.4 * out["super"]["expected"]) / 0.1
    a, e = solve_alpha("epic", data["epic"], targets["epic"])
    out["epic"] = {"alpha": a, "expected": e, "target": targets["epic"]}

    result = {}
    for f, info in out.items():
        w = weights_for_alpha(f, info["alpha"])
        tot = sum(w.values())
        print(
            f"{f:6} alpha={info['alpha']:+.4f} E={info['expected']:9.3f} target={info['target']:9.3f}  "
            + " ".join(f"{v}x:{100 * c / tot:.2f}%" for v, c in w.items())
        )
        result[f] = {
            "alpha": round(info["alpha"], 6),
            "values": list(allowed_values(f)),
            "weights": {str(v): c for v, c in w.items()},
        }
    PATH.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print("written", PATH)


if __name__ == "__main__":
    main()
