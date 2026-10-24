# Paradise Bloom

Current frontend: **1.0.22**. Math: **0.2.0**, target RTP **96% in every mode**.

The game and editable assets are in `math-sdk/games/cloud_vault/`. The required SDK core and its MIT license are retained in `math-sdk/`; unrelated games and local credentials are excluded.

## Run locally

```sh
cd math-sdk/games/cloud_vault/frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5190/?lang=ru . Local demo books are included. A new installation does not need a wallet or API key for local demo play.

## Verify and build

```sh
cd math-sdk/games/cloud_vault/frontend
npm test
npm run release
```

The ready upload archive is `math-sdk/games/cloud_vault/release/paradise_bloom_frontend_1.0.22.zip`; `index.html` and assets are at its root. Production builds remove the local demo fixtures. Engine supplies authenticated rounds via `sessionID` and `rgs_url`.

## Mathematics

The complete current upload set is in `math-sdk/games/cloud_vault/library/publish_files/`: index, all eight event books and all eight weighted lookup tables. Configuration, reports, original reels, weighting code and tests are included. See the game README and `docs/math/` for reproduction and validation details.

## Latest visual fix

Background rays now continue rotating across the short Spine animation loops, including bonus intros and win screens. Version 1.0.22 retains the exact frame supplied from version 1.0.14, blue board, rounded board corners and yellow win amounts.

## Included assets and local cleanup

Editable Spine projects, current runtime textures, generated Paradise Bloom art, fonts, music and effects are retained. Reference HTML captures, dependencies, cache directories and obsolete frontend archives are excluded. The local originals are outside this repository. No API keys are required to run the included audio assets. The owner confirmed commercial rights for the retained ElevenLabs tracks during development.

## Validation

115 frontend tests, six native Spine background-motion checks, TypeScript/Vite production build, and archive CRC/content checks passed for 1.0.22. Engine approval remains a separate platform review.
