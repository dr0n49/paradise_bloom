from src.events.events import fs_trigger_event

from game_config import CRITERIA_FEATURE, FREE_SPINS, HALOS_TO_FEATURE
from game_events import feature_start_event, mystery_reveal_event
from game_executables import GameExecutables

MYSTERY_OUTCOME = {"mystery_none": "none", "fs_super": "super", "fs_epic": "epic"}


class GameState(GameExecutables):
    """One betting round per book."""

    def assign_special_sym_function(self):
        pass

    def reset_book(self):
        super().reset_book()
        self.reset_feature(None)

    def run_spin(self, sim, simulation_seed=None):
        self.reset_seed(sim)
        self.repeat = True
        while self.repeat:
            self.reset_book()
            if self.criteria in ("raid", "storm"):
                self.run_raid(self.criteria)
            else:
                if self.betmode == "mystery":
                    mystery_reveal_event(self, MYSTERY_OUTCOME[self.criteria])
                self.draw_board()
                self.play_tumbles()
                halos = self.count_special_symbols("scatter")
                if halos >= 3:
                    feature = HALOS_TO_FEATURE[min(halos, 5)]
                    if feature != CRITERIA_FEATURE.get(self.criteria):
                        # Tumbles brought in halos this criteria does not allow: redraw.
                        self.repeat = True
                        continue
                    self.record({"kind": halos, "symbol": "scatter", "gametype": self.gametype})
                    self.run_feature_from_base(feature)
            self.evaluate_finalwin()
            self.check_repeat()
        self.imprint_wins()

    # ---- raid: one spin with chests live ----------------------------------
    def run_raid(self, feature: str) -> None:
        self.reset_feature(feature)
        feature_start_event(self)
        self.draw_board()
        self.play_tumbles()
        self.open_chests()

    # ---- free spins -----------------------------------------------------
    def run_feature_from_base(self, feature: str) -> None:
        self.tot_fs = FREE_SPINS
        fs_trigger_event(self, basegame_trigger=True, freegame_trigger=False)
        self.reset_feature(feature)
        self.run_freespin()

    def run_freespin(self):
        self.reset_fs_spin()
        feature_start_event(self)
        while self.fs < self.tot_fs and not self.wincap_triggered:
            self.update_freespin()
            self.draw_board()
            self.play_tumbles(halos_count_spins=True)
        self.open_chests()
        self.end_freespin()

    def check_repeat(self) -> None:
        if not self.repeat:
            want = CRITERIA_FEATURE.get(self.criteria)
            if want in ("raid", "storm"):
                pass
            elif want is None:
                self.repeat = self.triggered_freegame
            else:
                self.repeat = self.feature != want
        self.repeat_count += 1
        self.check_current_repeat_count()
