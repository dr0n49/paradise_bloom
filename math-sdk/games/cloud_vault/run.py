"""Generate Cloud Vault books, weight the lookup tables to RTP and write RGS configs.

From math-sdk root:
  ~/slot/.venv/bin/python games/cloud_vault/run.py            # full set
  QUICK=1 ~/slot/.venv/bin/python games/cloud_vault/run.py    # 1/10 size, for iteration

Chest tables must be calibrated first (python games/cloud_vault/calibrate.py).
"""

import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.abspath(os.path.join(HERE, "..", "..")))

from game_config import GameConfig  # noqa: E402
from gamestate import GameState  # noqa: E402
from src.state.run_sims import create_books  # noqa: E402
from src.write_data.write_configs import generate_configs  # noqa: E402
import weights  # noqa: E402

THREADS = 8
BATCH = 2500  # sims per mode must be a multiple of THREADS * BATCH

NUM_SIMS = {
    "base": 80_000,
    "extra_chance": 80_000,
    "super_chance": 80_000,
    "bonus": 20_000,
    "raid": 40_000,
    "super": 20_000,
    "mystery": 20_000,
    "storm": 40_000,
}

if __name__ == "__main__":
    quick = os.environ.get("QUICK", "").strip() in ("1", "true", "yes")
    num_sims = {m: (n // 10 if quick else n) for m, n in NUM_SIMS.items()}
    batch = BATCH // 10 if quick else BATCH

    config = GameConfig()
    gamestate = GameState(config)
    create_books(gamestate, config, num_sims, batch, THREADS, True, False)

    print("\nWeighting lookup tables to RTP:")
    report = weights.main()
    generate_configs(gamestate)

    with open(os.path.join(HERE, "library", "rtp_report.json"), "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    ok = all(abs(r["rtp"] - config.rtp) < 5e-6 for r in report.values())
    print("\nAll modes at RTP:", "OK" if ok else "FAIL")
    raise SystemExit(0 if ok else 1)
