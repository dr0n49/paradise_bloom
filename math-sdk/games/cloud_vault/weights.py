"""Calibrate RTP, then remove excessive tail risk without changing round payouts.

Books are simulated per criteria (quota in game_config), so each criteria group
gets its real probability here:

  spin modes   π(fs_k) = s · FEATURE_MIX[k], π(basegame) = 1 − Σ π(fs_k);
               s is solved in closed form so the mode returns RTP.
  mystery      π = MYSTERY_ODDS (50 / 40 / 10, as the rules state).
  single buys  π = 1.

Rounding and sampling leave a tiny residual, removed by a linear tilt inside every
group (group totals stay fixed, so trigger odds are untouched):
    w_i = π_c / n_c · (1 + ε (t_i − mean_c t)),  t_i = min(payout_i / cost, T_CAP)

The risk-v2 pass preserves criteria and zero/nonzero probabilities, redistributes
large wins into medium wins, checks the conservative risk
targets in risk_weights.py and corrects integer weights to exactly 96% RTP.

    python weights.py
"""

import csv
import os
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from game_config import FEATURE_MIX, MODE_COST, MYSTERY_ODDS, RTP, WINCAP  # noqa: E402
from risk_weights import rebalance  # noqa: E402

LIB = os.path.join(HERE, "library")
TOTAL = 10**15
T_CAP = 8.0
MAX_TILT = 0.25


def _read_mode(mode: str):
    lut = os.path.join(LIB, "lookup_tables", f"lookUpTable_{mode}.csv")
    seg = os.path.join(LIB, "lookup_tables", f"lookUpTableSegmented_{mode}.csv")
    with open(seg, newline="") as f:
        crit = {int(r[0]): r[1] for r in csv.reader(f) if r}
    with open(lut, newline="") as f:
        rows = [(int(r[0]), int(r[2])) for r in csv.reader(f) if r]
    groups = defaultdict(list)
    for book_id, pay in rows:
        groups[crit[book_id]].append((book_id, pay))
    return rows, groups


def group_probs(mode: str, groups: dict) -> dict:
    cost = MODE_COST[mode]
    mean = {c: sum(p for _, p in g) / len(g) / 100 for c, g in groups.items()}
    if mode in FEATURE_MIX:
        mix = FEATURE_MIX[mode]
        e_b = mean["basegame"]
        s = (RTP * cost - e_b) / sum(r * (mean[c] - e_b) for c, r in mix.items())
        probs = {c: s * r for c, r in mix.items()}
        probs["basegame"] = 1 - sum(probs.values())
        if not 0 < probs["basegame"] < 1:
            raise RuntimeError(f"{mode}: infeasible feature scale s={s}")
        return probs
    if mode == "mystery":
        return dict(MYSTERY_ODDS)
    assert len(groups) == 1, f"{mode}: expected one criteria group"
    return {next(iter(groups)): 1.0}


def baseline_solve(mode: str):
    cost = MODE_COST[mode]
    rows, groups = _read_mode(mode)
    probs = group_probs(mode, groups)
    base_rtp, slope = 0.0, 0.0
    stats = {}
    for c, g in groups.items():
        y = [p / 100 / cost for _, p in g]
        t = [min(v, T_CAP) for v in y]
        n = len(g)
        t_bar, y_bar = sum(t) / n, sum(y) / n
        cov = sum((ti - t_bar) * yi for ti, yi in zip(t, y)) / n
        base_rtp += probs[c] * y_bar
        slope += probs[c] * cov
        stats[c] = (t, t_bar)
    eps = (RTP - base_rtp) / slope if abs(slope) > 1e-15 else 0.0

    weight = {}
    worst = 0.0
    for c, g in groups.items():
        t, t_bar = stats[c]
        per = probs[c] / len(g)
        for (book_id, _), ti in zip(g, t):
            k = 1 + eps * (ti - t_bar)
            worst = max(worst, abs(k - 1))
            weight[book_id] = max(1, int(round(TOTAL * per * k)))
    if worst > MAX_TILT:
        raise RuntimeError(f"{mode}: tilt {worst:.3f} too large — recalibrate instead")
    return rows, weight, probs, eps, worst


def solve(mode: str):
    rows, weight, probs, eps, worst = baseline_solve(mode)
    _, groups = _read_mode(mode)
    weight, risk_report = rebalance(rows, weight, groups, MODE_COST[mode], mode)
    return rows, weight, probs, eps, worst, risk_report


def write_and_report(mode: str) -> dict:
    cost = MODE_COST[mode]
    rows, weight, probs, eps, worst, risk_report = solve(mode)
    out = [(i, weight[i], p) for i, p in rows]
    for path in (
        os.path.join(LIB, "lookup_tables", f"lookUpTable_{mode}.csv"),
        os.path.join(LIB, "publish_files", f"lookUpTable_{mode}_0.csv"),
    ):
        with open(path, "w", newline="") as f:
            csv.writer(f, lineterminator="\n").writerows(out)

    wsum = sum(w for _, w, _ in out)
    rtp = sum(w * p for _, w, p in out) / wsum / 100 / cost
    hit = sum(w for _, w, p in out if p > 0) / wsum
    cap = sum(w for _, w, p in out if p >= WINCAP * 100) / wsum
    top = max(p for _, _, p in out) / 100
    rep = {"rtp": rtp, "hit": hit, "maxWinInBooks": top, "pWincap": cap, "eps": eps, "tilt": worst}
    rep.update({f"p_{c}": v for c, v in probs.items()})
    rep["risk_v2"] = risk_report
    line = f"{mode:13} RTP={rtp * 100:.5f}%  hit={hit:.3f}  max={top:,.0f}x  tilt=±{worst:.4f}"
    for c in ("fs_bonus", "fs_super", "fs_epic"):
        if c in probs and mode in FEATURE_MIX:
            line += f"  {c[3:]} 1/{1 / probs[c]:,.0f}"
    line += f"  STD/cost={risk_report['after']['std_per_cost']:.3f}  CVaR/cost={risk_report['after']['cvar_per_cost']:.3f}  risk-v2 alpha={risk_report['alpha']:.6f}"
    print(line, flush=True)
    return rep


def main() -> dict:
    report = {}
    for mode in MODE_COST:
        if os.path.exists(os.path.join(LIB, "lookup_tables", f"lookUpTable_{mode}.csv")):
            report[mode] = write_and_report(mode)
    return report


if __name__ == "__main__":
    main()
