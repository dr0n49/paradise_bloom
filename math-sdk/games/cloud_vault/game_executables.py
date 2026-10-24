import random

from src.calculations.cluster import Cluster
from src.events.events import update_freespin_event, set_total_event, wincap_event
from src.executables.executables import Executables

from chest_tables import load_tables
from game_config import CHEST_MIN5, FEATURE_ROWS
from game_events import (
    chests_open_event,
    chests_unlocked_event,
    halo_spins_event,
    rows_banked_event,
)

CHEST_TABLES = load_tables()


class GameExecutables(Executables):
    """Clusters, row banking, chests and halo extra spins."""

    # ---- feature state -------------------------------------------------
    def reset_feature(self, feature: str | None = None) -> None:
        self.feature = feature
        self.feature_rows = FEATURE_ROWS.get(feature, ())
        self.chest_min = 5 if feature in CHEST_MIN5 else 2
        self.banked = [[False] * self.config.num_rows[r] for r in range(self.config.num_reels)]
        self.unlocked = [False] * self.config.num_reels
        self.chest_info = None

    @property
    def chests_live(self) -> bool:
        return self.feature is not None

    # ---- wins ----------------------------------------------------------
    def get_clusters_update_wins(self) -> None:
        clusters = Cluster.get_clusters(self.board, "wild")
        self.board, self.win_data, total = Cluster.evaluate_clusters(
            config=self.config,
            board=self.board,
            clusters=clusters,
            global_multiplier=1,
            return_data={"totalWin": 0, "wins": []},
        )
        self.win_data["totalWin"] += total
        Cluster.record_cluster_wins(self)
        self.win_manager.update_spinwin(self.win_data["totalWin"])

    def bank_rows(self) -> None:
        """Every cell of a winning cluster wins its reel's row; unlock chests that are complete."""
        if not self.chests_live or self.win_data["totalWin"] <= 0:
            return
        new_cells = []
        for win in self.win_data["wins"]:
            for p in win["positions"]:
                r, w = p["reel"], p["row"]
                if not self.banked[r][w]:
                    self.banked[r][w] = True
                    new_cells.append((r, w))
        if not new_cells:
            return
        rows_banked_event(self, sorted(new_cells))
        opened = []
        for r in range(self.config.num_reels):
            if not self.unlocked[r] and all(self.banked[r][w] for w in self.feature_rows):
                self.unlocked[r] = True
                opened.append(r)
        if opened:
            chests_unlocked_event(self, opened)

    # ---- halos in free spins --------------------------------------------
    def halo_positions(self) -> list:
        return [{"reel": p["reel"], "row": p["row"]} for p in self.special_syms_on_board["scatter"]]

    def award_halo_spins(self, before: int) -> int:
        """+1 free spin for each halo that landed since `before` halos were on the board."""
        now = self.count_special_symbols("scatter")
        gained = now - before
        if gained > 0:
            self.tot_fs += gained
            halo_spins_event(self, gained, self.halo_positions())
        return now

    # ---- tumble sequence -----------------------------------------------
    def play_tumbles(self, halos_count_spins: bool = False) -> None:
        """Evaluate, bank, tumble until no cluster pays. Optionally award halo spins on landings."""
        halos = self.count_special_symbols("scatter")
        if halos_count_spins:
            halos = self.award_halo_spins(0)
        self.get_clusters_update_wins()
        self.emit_tumble_win_events()
        self.bank_rows()
        while self.win_data["totalWin"] > 0 and not self.wincap_triggered:
            self.tumble_game_board()
            if halos_count_spins:
                halos = self.award_halo_spins(halos)
            self.get_clusters_update_wins()
            self.emit_tumble_win_events()
            self.bank_rows()
        self.set_end_tumble_event()
        self.win_manager.update_gametype_wins(self.gametype)

    def update_freespin(self) -> None:
        self.fs += 1
        update_freespin_event(self)
        self.win_manager.reset_spin_win()
        self.win_data = {"totalWin": 0, "wins": []}

    # ---- chests ----------------------------------------------------------
    def open_chests(self) -> None:
        """Reveal every unlocked chest and multiply the feature win by all of them."""
        table = CHEST_TABLES[self.feature]
        vals, weights = list(table.keys()), list(table.values())
        chests, product = [], 1
        for r in range(self.config.num_reels):
            if self.unlocked[r]:
                v = random.choices(vals, weights)[0]
                chests.append({"reel": r, "mult": v})
                product *= v

        wm = self.win_manager
        feature_win = wm.freegame_wins if self.gametype == self.config.freegame_type else wm.basegame_wins
        before_total = wm.running_bet_win
        self.chest_info = {
            "feature": self.feature,
            "unlocked": len(chests),
            "featureWin": feature_win,
            "otherWin": before_total - feature_win,
        }
        extra = 0.0
        if product > 1 and feature_win > 0:
            extra = min(feature_win * (product - 1), max(0.0, self.config.wincap - before_total))
            extra = round(extra, 2)
        if self.gametype == self.config.freegame_type:
            wm.freegame_wins += extra
        else:
            wm.basegame_wins += extra
        wm.running_bet_win += extra
        if chests:
            chests_open_event(self, chests, product, feature_win, feature_win + extra)
        if extra > 0:
            set_total_event(self)
        if wm.running_bet_win >= self.config.wincap and not self.wincap_triggered:
            self.wincap_triggered = True
            wincap_event(self)
