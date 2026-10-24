"""Game-specific book events. Positions here are UNPADDED: row 0..4 = visible rows top→bottom."""

FEATURE_START = "featureStart"
MYSTERY_REVEAL = "mysteryReveal"
ROWS_BANKED = "rowsBanked"
CHESTS_UNLOCKED = "chestsUnlocked"
HALO_SPINS = "haloExtraSpins"
CHESTS_OPEN = "chestsOpen"


def _add(gamestate, event: dict) -> None:
    event = {"index": len(gamestate.book.events), **event}
    gamestate.book.add_event(event)


def feature_start_event(gamestate) -> None:
    _add(
        gamestate,
        {
            "type": FEATURE_START,
            "feature": gamestate.feature,
            "rowsRequired": list(gamestate.feature_rows),
            "minChest": gamestate.chest_min,
            "totalFs": int(gamestate.tot_fs),
        },
    )


def mystery_reveal_event(gamestate, outcome: str) -> None:
    _add(gamestate, {"type": MYSTERY_REVEAL, "outcome": outcome})


def rows_banked_event(gamestate, new_cells: list) -> None:
    _add(
        gamestate,
        {
            "type": ROWS_BANKED,
            "newCells": [{"reel": r, "row": w} for r, w in new_cells],
            "banked": [[bool(x) for x in reel] for reel in gamestate.banked],
        },
    )


def chests_unlocked_event(gamestate, reels: list) -> None:
    _add(
        gamestate,
        {"type": CHESTS_UNLOCKED, "reels": reels, "unlocked": [bool(x) for x in gamestate.unlocked]},
    )


def halo_spins_event(gamestate, count: int, positions: list) -> None:
    _add(
        gamestate,
        {
            "type": HALO_SPINS,
            "count": int(count),
            "positions": positions,
            "totalFs": int(gamestate.tot_fs),
        },
    )


def chests_open_event(gamestate, chests: list, product: int, before: float, after: float) -> None:
    _add(
        gamestate,
        {
            "type": CHESTS_OPEN,
            "chests": chests,
            "product": int(product),
            "winBefore": int(round(before * 100)),
            "winAfter": int(round(after * 100)),
        },
    )
