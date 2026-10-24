"""Cloud Vault — 5x5 cluster pays, tumbles, reel chests that multiply together.

Modes (cost × bet):
  base 1 · extra_chance 3 · super_chance 6 · bonus 100 · raid 250 · super 300 · mystery 500 · storm 1000
"""

import os

from src.config.betmode import BetMode
from src.config.config import Config
from src.config.distributions import Distribution

WINCAP = 25000.0
RTP = 0.96

# Criteria → chest feature they lead to. "basegame"/"mystery_none" never open a feature.
CRITERIA_FEATURE = {
    "fs_bonus": "bonus",
    "fs_super": "super",
    "fs_epic": "epic",
    "raid": "raid",
    "storm": "storm",
}
HALOS_TO_FEATURE = {3: "bonus", 4: "super", 5: "epic"}
FEATURE_TO_HALOS = {v: k for k, v in HALOS_TO_FEATURE.items()}

# Rows a reel must have won to unlock its chest (0 = top row).
FEATURE_ROWS = {
    "bonus": (0, 1, 2, 3, 4),
    "super": (0, 1, 2, 3, 4),
    "epic": (1, 2, 3),
    "raid": (2,),
    "storm": (2,),
}
CHEST_VALUES = (2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 100)
CHEST_MIN5 = {"super", "epic", "storm"}
FREE_SPINS = 10

MODE_COST = {
    "base": 1.0,
    "extra_chance": 3.0,
    "super_chance": 6.0,
    "bonus": 100.0,
    "raid": 250.0,
    "super": 300.0,
    "mystery": 500.0,
    "storm": 1000.0,
}


# Relative trigger odds (3 : 4 : 5 halos) for spin modes. weights.py scales the total so the
# mode lands on RTP exactly; ante modes simply carry a larger total.
FEATURE_MIX = {
    "base": {"fs_bonus": 1.0, "fs_super": 0.12, "fs_epic": 0.01},
    "extra_chance": {"fs_bonus": 1.0, "fs_super": 0.12, "fs_epic": 0.01},
    "super_chance": {"fs_bonus": 1.0, "fs_super": 0.35, "fs_epic": 0.05},
}
MYSTERY_ODDS = {"mystery_none": 0.5, "fs_super": 0.4, "fs_epic": 0.1}


def _base_reels():
    return {"basegame": {"BR0": 1}}


# Free-spin strip per feature: Super's 5x-minimum chests need a leaner strip to price at 300x.
FS_STRIP = {"bonus": "FR0", "super": "FR1", "epic": "FR0"}


def _fs_reels(feature: str):
    return {"basegame": {"BR0": 1}, "freegame": {FS_STRIP[feature]: 1}}


def _feature_dist(criteria: str, quota: float) -> Distribution:
    return Distribution(
        criteria=criteria,
        quota=quota,
        conditions={
            "reel_weights": _fs_reels(CRITERIA_FEATURE[criteria]),
            "scatter_triggers": {FEATURE_TO_HALOS[CRITERIA_FEATURE[criteria]]: 1},
            "force_wincap": False,
            "force_freegame": True,
        },
    )


def _plain_dist(criteria: str, quota: float) -> Distribution:
    return Distribution(
        criteria=criteria,
        quota=quota,
        conditions={"reel_weights": _base_reels(), "force_wincap": False, "force_freegame": False},
    )


def _raid_dist(criteria: str) -> Distribution:
    return Distribution(
        criteria=criteria,
        quota=1.0,
        conditions={"reel_weights": {"basegame": {"RR0": 1}}, "force_wincap": False, "force_freegame": False},
    )


def _spin_modes():
    """Base and ante modes share one set of books layout; LUT weights set the real trigger odds."""
    return [
        _plain_dist("basegame", 0.70),
        _feature_dist("fs_bonus", 0.15),
        _feature_dist("fs_super", 0.10),
        _feature_dist("fs_epic", 0.05),
    ]


class GameConfig(Config):
    """Singleton game configuration."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        super().__init__()
        self.game_id = "cloud_vault"
        self.provider_number = 0
        self.working_name = "Cloud Vault"
        self.wincap = WINCAP
        self.win_type = "cluster"
        self.rtp = RTP
        self.construct_paths()

        self.num_reels = 5
        self.num_rows = [5] * self.num_reels

        sizes = [(5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11), (12, 25)]
        pays = {
            "H1": [2, 3.5, 6, 10, 16, 28, 45, 75],
            "H2": [1.2, 2, 3, 5, 8, 14, 22, 35],
            "H3": [0.8, 1.2, 2, 3, 5, 8, 12, 20],
            "H4": [0.5, 0.8, 1.2, 2, 3, 5, 8, 12],
            "L1": [0.3, 0.5, 0.8, 1.3, 2, 3.5, 5.5, 9],
            "L2": [0.3, 0.5, 0.8, 1.3, 2, 3.5, 5.5, 9],
            "L3": [0.2, 0.3, 0.5, 0.8, 1.2, 2, 3, 5],
            "L4": [0.2, 0.3, 0.5, 0.8, 1.2, 2, 3, 5],
        }
        pay_group = {(size, sym): pay for sym, row in pays.items() for size, pay in zip(sizes, row)}
        self.paytable = self.convert_range_table(pay_group)

        self.include_padding = True
        self.special_symbols = {"scatter": ["S"]}

        self.freespin_triggers = {
            self.basegame_type: {k: FREE_SPINS for k in range(3, 26)},
            self.freegame_type: {k: k for k in range(1, 26)},
        }
        self.anticipation_triggers = {self.basegame_type: 2, self.freegame_type: 99}

        self.reels = {}
        for r in ("BR0", "FR0", "FR1", "RR0"):
            self.reels[r] = self.read_reels_csv(os.path.join(self.reels_path, f"{r}.csv"))

        def mode(name, dists, feature, buy):
            return BetMode(
                name=name,
                cost=MODE_COST[name],
                rtp=self.rtp,
                max_win=self.wincap,
                auto_close_disabled=False,
                is_feature=feature,
                is_buybonus=buy,
                distributions=dists,
            )

        self.bet_modes = [
            mode("base", _spin_modes(), False, False),
            mode("extra_chance", _spin_modes(), True, False),
            mode("super_chance", _spin_modes(), True, False),
            mode("bonus", [_feature_dist("fs_bonus", 1.0)], True, True),
            mode("raid", [_raid_dist("raid")], True, True),
            mode("super", [_feature_dist("fs_super", 1.0)], True, True),
            mode(
                "mystery",
                [
                    _plain_dist("mystery_none", 0.30),
                    _feature_dist("fs_super", 0.35),
                    _feature_dist("fs_epic", 0.35),
                ],
                True,
                True,
            ),
            mode("storm", [_raid_dist("storm")], True, True),
        ]
