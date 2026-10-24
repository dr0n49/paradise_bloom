# Paradise Bloom / cloud_vault

Frontend 1.0.22; mathematics 0.2.0. Internal mode/event identifiers retain the original `cloud_vault`, `chest` and `epic` names for server compatibility; the frontend presents Paradise Bloom and lotus vessels.

## Game model

5×5 cluster pays, at least five orthogonally connected matching symbols, with tumbles. All winning clusters pay before the next tumble. There are no wilds. Three/four/five scatter cards trigger Bloom Bonus/Super/Epic with 10 free spins; scatters landing during free spins add spins. Won rows accumulate per reel. Unlocked lotus vessels reveal multipliers whose product is applied to that feature's own accumulated win. Maximum round win is 25,000× the base amount.

Modes and costs: base 1×; extra_chance 3×; super_chance 6×; bonus 100×; raid 250×; super 300×; mystery 500×; storm 1000×. Mystery retains its 50/40/10 outcome mix. Current integer lookup weights return exactly 96% relative to each mode cost. The risk update redistributes existing payout probabilities; event-book payouts, costs and cap are unchanged.

## Frontend

```sh
cd frontend
npm ci
npm run dev
npm test
npm run release
```

Demo fixtures are included in `frontend/public/demo/` for local play and model tests. `npm run demo-books` rebuilds those fixtures from the published books and lookup tables. Release builds exclude demo books and output `release/paradise_bloom_frontend_1.0.22.zip` with `index.html` at the archive root.

Supported text locales: ar, da, de, en, es, fi, fr, hi, id, ja, ko, pl, pt, ru, tr, vi, zh. Rendered title artwork and bonus names remain unchanged. Rules contain the required Engine disclaimer. Financial settlement uses the RGS response; local/demo fixtures do not connect to real wallets.

Development visual checks: `?screen=intro|super|epic|total|big|mega|epicwin|max|cloud`, `?nospine`, `?artReview=bonus`. The held-screen fixtures are disabled in production sessions. `?qa=character` previews character animations.

## Mathematics reproduction

Python 3.12+ and dependencies from `../../requirements.txt` are required. From the containing `math-sdk/` directory:

```sh
python games/cloud_vault/make_reels.py   # only when changing reel strips
python games/cloud_vault/calibrate.py    # only when recalibrating multiplier tables
python games/cloud_vault/run.py          # regenerate books, weights and RGS metadata
```

Full regeneration replaces the current publish set. For the delivered model, upload the existing complete `library/publish_files/` directory. Do not mix it with different event books. `python -m unittest test_risk_weights.py` from this directory checks CVaR atom boundaries and tail probabilities. See repository `docs/math/` for the independent verification and fixed current checksums.

## Source art and animation

`frontend/public/` contains the actual runtime art, music, fonts and exported rigs. `spine/` retains editable source projects/masters/tools. `art-in/paradise*` contains generated Paradise Bloom source art. Use the committed runtime exports for an ordinary frontend build; re-exporting Spine projects is a separate editing workflow and requires the appropriate Spine editor.

The active frame is `frame-v6`, copied byte-for-byte from the supplied frontend 1.0.14. Ray rotation is continued from unwrapped track time in `SpineScreens.tsx`; the short backdrop loop still drives glow, sparkles and particle timing. This override is intentionally applied after Spine pose evaluation and before world transforms.
