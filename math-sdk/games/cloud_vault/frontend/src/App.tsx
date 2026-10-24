import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SymbolArt } from "./art/Symbols";
import { AutoplayIcon } from "./art/AutoplayIcon";
import { Board } from "./components/Board";
import { WinAmount } from "./components/WinAmount";
import { AutoplayPanel, BuyMenu, ConfirmCard, InfoPage, Logo, MenuPopover, OverlayView } from "./components/Overlays";
import { Splash } from "./components/Splash";
import { ProviderIntro } from "./components/ProviderIntro";
import { preloadVisuals } from "./game/preload";
import { characterBus } from "./spine/runtime";
import { SpineCharacter } from "./spine/SpineCharacter";
import { SpineScreens } from "./spine/SpineScreens";
import { fromReveal, type Reel } from "./game/board";
import { formatCurrency, formatPlain } from "./game/currency";
import { demoRound } from "./game/demo";
import { modeById, type ModeId, type ModeInfo } from "./game/modes";
import { featureWin, playBook, type FeatureState, type Overlay, type Panel, type Plus, type View, type WinLabel } from "./game/player";
import * as rgs from "./game/rgs";
import { setFxVolume, setMusicVolume, setMusicScene, sound, startMusic, toggleFx, toggleMusic, volumes } from "./game/sound";
import { setSocial, t } from "./i18n";

const VERSION = "1.0.22";
/** Game sounds that also drive the character rig. */
const CUES: Record<string, Parameters<typeof characterBus.emit>[0]> = {
  spin: "spin",
  win: "win",
  anticipation: "anticipation",
  trigger: "trigger",
  summary: "featureEnd",
  bigwin: "bigwin",
  maxwin: "bigwin",
};
const ANTES = ["extra_chance", "super_chance"];
/** Buys (incl. raids and mystery) and antes that a jurisdiction may switch off. */
const modeHidden = (j: rgs.Jurisdiction) => (m: { id: string; kind: string }) =>
  m.kind !== "spin" && (ANTES.includes(m.id) ? !!j.disabledAnte : !!j.disabledBuyFeature);
const DEMO_LEVELS = [0.1, 0.2, 0.4, 0.6, 1, 2, 4, 6, 10, 20, 50, 100];
const IDLE_BOARD = ["H1", "L3", "L1", "H2", "L4", "L2", "H3", "L4", "L3", "L1", "H4", "L1", "S", "H1", "L2", "L3", "H2", "L2", "L4", "H3", "L4", "L1", "H4", "L2", "H1"];
const idleReels = (): Reel[] =>
  fromReveal(
    Array.from({ length: 5 }, (_, r) => ["L1", ...IDLE_BOARD.slice(r * 5, r * 5 + 5), "L2"].map((name) => ({ name }))),
    false,
  );
const urlParam = (k: string) => new URLSearchParams(location.search).get(k);

type Menu = null | "buy" | "info" | "auto" | "pop" | { confirm: ModeInfo };

export default function App() {
  const replay = rgs.isReplay();
  const live = !replay && rgs.isRgsSession();
  const [ready, setReady] = useState(!live && !replay);
  const [started, setStarted] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [assets, setAssets] = useState({ ready: false, progress: 0, failed: false });
  useEffect(() => {
    let cancelled = false;
    void preloadVisuals((done, total) => {
      if (!cancelled) setAssets({ ready: false, progress: done / total, failed: false });
    }).then(() => {
      if (!cancelled) setAssets({ ready: true, progress: 1, failed: false });
    }).catch(() => {
      cancelled = true; // Late completions cannot replace the error with fake progress.
      setAssets((a) => ({ ...a, failed: true }));
    });
    return () => { cancelled = true; };
  }, []);
  const launchReady = ready && assets.ready;
  const [error, setError] = useState<string | null>(null);
  const [juris, setJuris] = useState<rgs.Jurisdiction>({});
  const [replayData, setReplayData] = useState<rgs.ReplayData | null>(null);
  const [replayDone, setReplayDone] = useState(false);
  const [currency, setCurrency] = useState((urlParam("currency") ?? "USD").toUpperCase());
  const [balance, setBalance] = useState(1000);
  const [levels, setLevels] = useState(DEMO_LEVELS);
  const [betIdx, setBetIdx] = useState(4);
  const [restoredBet, setRestoredBet] = useState<number | null>(null);
  const bet = restoredBet ?? levels[betIdx] ?? levels[0];
  const [mode, setMode] = useState<ModeId>("base");
  const [busy, setBusy] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [auto, setAuto] = useState(0);
  const [menu, setMenu] = useState<Menu>(null);
  const [vol, setVol] = useState(volumes());
  const [, setSocialTick] = useState(0);

  const [reels, setReelsState] = useState<Reel[]>(idleReels);
  const [feature, setFeatureState] = useState<FeatureState | null>(null);
  const [labels, setLabels] = useState<WinLabel[]>([]);
  const [halos, setHalos] = useState<{ reel: number; row: number }[]>([]);
  const [plus, setPlus] = useState<Plus[]>([]);
  const [panel, setPanel] = useState<Panel>(null);
  const [anticipation, setAnticipation] = useState<number | null>(null);
  useEffect(() => { setMusicScene(feature && !feature.done && feature.freeSpins ? "bonus" : "base"); }, [feature]);
  const [screensLive, setScreensLive] = useState(false);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [roundWin, setRoundWin] = useState(0);
  // The stake the shown round was played at: the win stays in that stake when the bet changes.
  const [roundBet, setRoundBet] = useState(bet);

  const reelsRef = useRef(reels);
  const featureRef = useRef(feature);
  const turboRef = useRef(turbo);
  const tapRef = useRef<(() => void) | null>(null);
  const resumeRef = useRef<rgs.RgsRound | null>(null);
  // React state alone does not stop two clicks in the same event-loop turn.
  const roundLock = useRef(false);
  const walletUncertain = useRef(false);
  const [pendingResume, setPendingResume] = useState(false);
  const [recoveryRequired, setRecoveryRequired] = useState(false);
  const walletBlocked = pendingResume || recoveryRequired;
  const requireRecovery = () => {
    walletUncertain.current = true;
    setRecoveryRequired(true);
    setAuto(0);
  };
  turboRef.current = turbo;

  const fmtCash = useCallback((v: number) => formatCurrency(v, currency), [currency]);
  const fmtX = useCallback((x: number, reference = x) => formatCurrency(x * roundBet, currency, 'en-US', reference * roundBet), [currency, roundBet]);
  const plainX = useCallback((x: number, reference = x) => formatPlain(x * roundBet, currency, reference * roundBet), [currency, roundBet]);

  // ---- launch: replay, live RGS, or demo
  useEffect(() => {
    if (urlParam("social") === "true") setSocial(true);
    if (!replay) return;
    rgs
      .fetchReplay()
      .then((d) => {
        setReplayData(d);
        setLevels([d.amount]);
        setBetIdx(0);
        if (d.mode in { extra_chance: 1, super_chance: 1, raid: 1, storm: 1, bonus: 1, super: 1, mystery: 1 }) setMode(d.mode as ModeId);
        setReady(true);
      })
      .catch((e) => setError(e instanceof rgs.ReplayError ? t.replayErrors[e.kind] : t.replayErrors.unavailable));
  }, [replay]);

  useEffect(() => {
    if (!live) return;
    rgs
      .authenticate()
      .then(async (a) => {
        const j = rgs.jurisdictionOf(a);
        setJuris(j);
        if (j.socialCasino) {
          setSocial(true);
          setSocialTick((n) => n + 1);
        }
        setCurrency(a.balance.currency);
        setBalance(rgs.fromApi(a.balance.amount));
        const lv = rgs.betLevelsOf(a);
        const use = lv.length ? lv : DEMO_LEVELS;
        setLevels(use);
        const opening = rgs.openingBet(a, use);
        setBetIdx(Math.max(0, opening.index));
        // A retired level belongs to the old round, never to the new allowed list.
        setRestoredBet(opening.index < 0 ? opening.amount : null);
        setReady(true);
        if (a.round?.active === true) {
          if (rgs.roundEvents(a.round).length) {
            resumeRef.current = a.round;
            setPendingResume(true);
          } else {
            // Never allow a new debit when the server reports an unreadable open round.
            requireRecovery();
          }
        }
      })
      .catch((e) =>
        setError(
          e instanceof rgs.RgsError && e.kind === "session" ? t.sessionExpired : t.connectFail,
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const view: View = useMemo(
    () => ({
      reels: () => reelsRef.current,
      setReels: (r) => {
        reelsRef.current = r;
        setReelsState(r);
      },
      feature: () => featureRef.current,
      setFeature: (f) => {
        featureRef.current = f;
        setFeatureState(f);
      },
      setRoundWin,
      setPanel,
      setLabels,
      setHalos,
      setPlus,
      setAnticipation,
      setOverlay,
      motionScale: () => turboRef.current ? 0.45 : 1,
      sleep: (ms, scale) => new Promise((res) => setTimeout(res, ms * (scale ?? (turboRef.current ? 0.45 : 1)))),
      tap: (ms) =>
        new Promise<void>((res) => {
          const timer = Number.isFinite(ms) ? setTimeout(done, turboRef.current ? ms * 0.5 : ms) : undefined;
          function done() {
            clearTimeout(timer);
            tapRef.current = null;
            res();
          }
          tapRef.current = done;
        }),
      sound: (name) => {
        sound(name);
        const cue = CUES[name];
        if (cue) characterBus.emit(cue);
      },
    }),
    [],
  );

  async function runEvents(events: rgs.BookEvent[], cost: number) {
    view.setAnticipation(null);
    view.setHalos([]);
    view.setFeature(null);
    view.setPanel(null);
    view.setLabels([]);
    setRoundWin(0);
    return playBook(events, view, cost);
  }

  // QA: ?screen=intro|super|epic|total|big|mega|epicwin|max|cloud holds that screen (demo only).
  useEffect(() => {
    const q = urlParam("screen");
    if (!import.meta.env.DEV || !started || !q || live || replay) return;
    const map: Record<string, Overlay> = {
      intro: { kind: "intro", feature: "bonus", totalFs: 10, minChest: 2 },
      super: { kind: "intro", feature: "super", totalFs: 10, minChest: 5 },
      epic: { kind: "intro", feature: "epic", totalFs: 10, minChest: 5 },
      total: { kind: "total", feature: "bonus", x: 136.8 },
      big: { kind: "bigwin", x: 24.6 },
      mega: { kind: "bigwin", x: 47.34 },
      epicwin: { kind: "bigwin", x: 81.25 },
      max: { kind: "maxwin", x: 25000 },
      cloud: { kind: "cloud" },
    };
    if (map[q]) setOverlay(map[q]);
  }, [started, live]);

  // Development-only art fixture: renders charge/reveal states without a wallet or a round.
  useEffect(() => {
    if (!import.meta.env.DEV || !started || live || replay) return;
    const review = urlParam("artReview");
    if (review !== "symbols" && review !== "bonus") return;
    setStarted(true);
    setBusy(true);
    if (review === "bonus") {
      setFeatureState({
        feature: "bonus", rows: [0, 1, 2, 3, 4], minChest: 2,
        banked: [Array(5).fill(false), [true, false, true, false, false], Array(5).fill(true), Array(5).fill(true), Array(5).fill(true)],
        unlocked: [false, false, true, true, true], values: [null, null, null, 5, 100],
        fs: 3, totalFs: 10, freeSpins: true, entryWin: 0, keys: false,
      });
    }
  }, [live, replay, started]);

  // A restored round has already been charged. Only explicit Continue starts its visuals.
  async function resumeRound() {
    const r = resumeRef.current;
    if (!started || !r || roundLock.current || walletUncertain.current) return;
    roundLock.current = true;
    setRoundBet(rgs.fromApi(r.amount ?? rgs.toApi(bet)));
    setBusy(true);
    try {
      await runEvents(rgs.roundEvents(r), modeById((r.mode as ModeId) ?? "base").cost);
      const end = await rgs.endRound();
      setBalance(rgs.fromApi(end.balance.amount));
      resumeRef.current = null;
      setPendingResume(false);
    } catch (e) {
      requireRecovery();
      setError(e instanceof rgs.RgsError && e.kind === "session" ? t.sessionExpired : t.connection);
    } finally {
      roundLock.current = false;
      setBusy(false);
    }
  }

  const spin = useCallback(
    async (m: ModeId = mode) => {
      if (!started || !assets.ready || busy || roundLock.current || resumeRef.current || walletUncertain.current || !ready || replay) return;
      // Resume historical amounts exactly, but never submit a retired amount as a new play.
      if (live && rgs.betLevelIndex(bet, levels) < 0) {
        setError(t.amountUnavailable);
        setAuto(0);
        return;
      }
      const info = modeById(m);
      const before = rgs.toApi(balance);
      const cost = rgs.toApi(bet) * info.cost;
      // Never send a play the balance cannot cover (space bar, autoplay and buys all land here).
      if (cost > before) {
        setError(t.insufficient);
        setAuto(0);
        return;
      }
      roundLock.current = true;
      setError(null);
      setRoundBet(bet);
      setBusy(true);
      const t0 = Date.now();
      try {
        if (live) {
          const res = await rgs.play(m, bet);
          setBalance(rgs.fromApi(res.balance.amount));
          await runEvents(rgs.roundEvents(res.round), info.cost);
          if (rgs.needsEndRound(res.round)) {
            const end = await rgs.endRound();
            setBalance(rgs.fromApi(end.balance.amount));
          }
        } else {
          // Load before debiting; a missing local fixture is not a played round.
          const book = await demoRound(m);
          setBalance(rgs.fromApi(before - cost));
          const x = await runEvents(book.events, info.cost);
          setBalance(rgs.fromApi(before - cost + rgs.toApi(x * bet)));
        }
        const min = juris.minimumRoundDuration ?? 0;
        if (Date.now() - t0 < min) await new Promise((r) => setTimeout(r, min - (Date.now() - t0)));
      } catch (e) {
        // A lost response may still represent a server-accepted debit or settlement.
        // Re-authenticate on reload before permitting another play; never retry a play here.
        if (live) requireRecovery();
        else setBalance(rgs.fromApi(before));
        setAuto(0);
        setError(
          e instanceof rgs.RgsError
            ? e.kind === "funds"
              ? t.insufficient
              : e.kind === "limits"
                ? t.limits
                : e.kind === "session"
                  ? t.sessionExpired
                  : t.connection
            : String((e as Error).message ?? e),
        );
      } finally {
        roundLock.current = false;
        setBusy(false);
      }
    },
    [started, assets.ready, busy, ready, replay, mode, bet, levels, balance, live, view, juris],
  );

  const playReplay = useCallback(async () => {
    if (!replayData || busy || roundLock.current) return;
    roundLock.current = true;
    setBusy(true);
    setReplayDone(false);
    setRoundBet(bet);
    try {
      await runEvents(replayData.events, replayData.costMultiplier || modeById(replayData.mode as ModeId).cost);
    } finally {
      roundLock.current = false;
      setBusy(false);
      setReplayDone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayData, busy]);

  // ---- autoplay loop (only after the player confirmed the autoplay panel)
  useEffect(() => {
    if (auto > 0 && !busy && !walletBlocked && !overlay && ready && started && !menu) {
      const timer = setTimeout(() => {
        setAuto((n) => n - 1);
        void spin();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [auto, busy, walletBlocked, overlay, ready, started, menu, spin]);

  const primary = useCallback(() => {
    if (tapRef.current) return tapRef.current();
    if (auto > 0) return setAuto(0);
    if (replay) return void playReplay();
    void spin();
  }, [auto, replay, playReplay, spin]);

  // ---- keyboard: space / enter = the spin button; nothing happens behind menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" && menu) {
        e.preventDefault(); setMenu(menu === "info" ? "pop" : null);
        if (menu === "info" || menu === "pop") requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(menu === "info" ? ".info-row" : ".hud-menu")?.focus());
        return;
      }
      if (e.repeat || (e.code !== "Space" && e.code !== "Enter")) return;
      if (menu || (e.target instanceof HTMLElement && e.target.closest("button, input, a, select, textarea"))) return;
      if (tapRef.current) {
        e.preventDefault();
        tapRef.current();
        return;
      }
      if (!started || menu) return;
      e.preventDefault();
      primary();
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [started, menu, primary]);

  // Jurisdiction restrictions also clear any state they forbid.
  useEffect(() => {
    if (juris.disabledTurbo) setTurbo(false);
    if (juris.disabledAutoplay) setAuto(0);
    if (modeHidden(juris)(modeById(mode))) setMode("base");
  }, [juris, mode]);

  const hidden = modeHidden(juris);
  const anyFeature = !replay && [...ANTES, "raid", "storm", "bonus", "super", "mystery"].some((id) => !hidden({ id, kind: "x" }));
  const activeInfo = modeById(mode);
  const inFs = !!feature && !feature.done && feature.freeSpins;
  const fsWorld = !!feature && !feature.done && feature.freeSpins;
  const spinCost = bet * activeInfo.cost;
  const canDecrease = levels.some((v) => rgs.toApi(v) < rgs.toApi(bet));
  const canIncrease = levels.some((v) => rgs.toApi(v) > rgs.toApi(bet));
  const stepBet = (dir: -1 | 1) => {
    sound("click");
    setBetIdx(rgs.steppedBetIndex(bet, levels, dir));
    setRestoredBet(null);
    setError(null);
  };

  const pickMode = (m: ModeInfo) => {
    if (mode === m.id) {
      setMode("base");
      setMenu(null);
      return;
    }
    setMenu({ confirm: m });
  };
  const confirmMode = (m: ModeInfo) => {
    setMenu(null);
    if (m.kind === "buy") void spin(m.id);
    else setMode(m.id);
  };

  return (
    <div className={`viewport ${replay ? "replay-mode" : ""} ${fsWorld ? "fs-world" : ""} ${feature && !feature.done ? feature.feature : ""}`}>
      <picture>
        <source media="(max-aspect-ratio: 3/4)" srcSet="./art/bg_portrait.jpg" />
        <img className="sky" src="./art/bg.jpg" alt="" aria-hidden draggable={false} />
      </picture>
      <picture className="fs-bg" aria-hidden>
        <source media="(max-aspect-ratio: 3/4)" srcSet="./art/ui/bg_bonus_portrait.jpg" />
        <img src="./art/ui/bg_bonus.jpg" alt="" draggable={false} />
      </picture>
      <div className="fs-tint" aria-hidden />
      <div className={`stage ${anticipation !== null ? "anticipating" : ""}`} inert={!started} onClick={() => menu === "pop" && setMenu(null)}>
        <Logo className="game-logo" />
        <SpineCharacter className={`character ${inFs ? "excited" : ""}`} />
        <Board
          reels={reels}
          labels={labels}
          halos={halos}
          plus={plus}
          panel={panel}
          feature={feature}
          keys={overlay?.kind === "keys"}
          anticipation={anticipation}
          fmt={plainX}
        />

        {/* ---------------- HUD ---------------- */}
        {!inFs && anyFeature && (
          mode !== "base" ? (
            <button className="hud-feature disable" disabled={busy || walletBlocked} onClick={() => setMode("base")}>
              {t.disable}
            </button>
          ) : (
            <button className="hud-feature" disabled={busy || walletBlocked} onClick={() => setMenu("buy")} aria-label={t.features}>
              <img src="./art/ui/bonus_ruby.png" alt="" draggable={false} />
            </button>
          )
        )}
        <div className={`hud-bar ${inFs ? "fs" : ""}`} />
        <button
          className={`hud-menu ${menu === "pop" || menu === "info" ? "open" : ""} ${inFs ? "fs" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setMenu(menu === "pop" ? null : "pop");
          }}
          aria-expanded={menu === "pop" || menu === "info"}
          aria-controls="audio-menu"
          aria-label={t.menu}
        >
          {menu === "pop" || menu === "info" ? <span className="x">✕</span> : <><i /><i /><i /></>}
        </button>
        {(menu === "pop" || menu === "info") && (
          <MenuPopover
            fx={vol.fx}
            music={vol.music}
            onFx={(v) => {
              setFxVolume(v);
              setVol(volumes());
            }}
            onMusic={(v) => {
              setMusicVolume(v);
              setVol(volumes());
            }}
            onToggleFx={() => { toggleFx(); setVol(volumes()); }}
            onToggleMusic={() => { toggleMusic(); setVol(volumes()); }}
            onInfo={() => setMenu("info")}
          />
        )}
        <div className={`hud-stats ${inFs ? "fs" : ""}`}>
        {!replay && (
          <div className="hud-stat balance">
            <small>{t.balance}</small>
            <b>{fmtCash(balance)}</b>
          </div>
        )}
        {inFs && (
          <div className="hud-stat stake">
            <small>{t.bet}</small>
            <b>{fmtCash(bet)}</b>
          </div>
        )}
        {(roundWin > 0 || inFs) && (
          <div className="hud-stat win">
            <small>{t.win}</small>
            <b><WinAmount x={roundWin} fmt={fmtX} /></b>
          </div>
        )}
        </div>

        {inFs && feature ? (
          <>
            <div className="fs-total" onClick={() => tapRef.current?.()}>
              <small>{t.totalWin}</small>
              <b><WinAmount x={featureWin(roundWin, feature)} fmt={fmtX} /></b>
            </div>
            <div className="fs-count">
              <small>{t.freeSpins}</small>
              <b>{Math.max(0, feature.totalFs - feature.fs)}</b>
            </div>
          </>
        ) : (
          <>
            <div className={`hud-bet ${mode !== "base" ? "mode" : ""}`}>
              <small>{replay ? `${activeInfo.kind === "spin" ? t.bet : activeInfo.title}` : mode === "base" ? t.bet : activeInfo.title}</small>
              <b>{fmtCash(replay ? bet : spinCost)}</b>
              <i className="meter" style={{ ["--lv" as string]: (betIdx + 1) / levels.length }} />
            </div>
            {!replay && <div className="hud-arrows">
              <button disabled={busy || walletBlocked || auto > 0 || !canIncrease} onClick={() => stepBet(1)} aria-label={t.increaseAmount}>
                <i className="up" />
              </button>
              <button disabled={busy || walletBlocked || auto > 0 || !canDecrease} onClick={() => stepBet(-1)} aria-label={t.decreaseAmount}>
                <i className="down" />
              </button>
            </div>}
            {!replay && <button className={`spin ${busy ? "spinning" : ""} ${auto > 0 ? "auto" : ""}`} onClick={primary} disabled={!started || walletBlocked} aria-label={auto > 0 ? t.autoStop : t.spin}>
              {auto > 0 ? (
                <span className="auto-count">{auto}</span>
              ) : (
                <svg viewBox="0 0 100 100" aria-hidden>
                  <path d="M25 31A33 33 0 0 1 78 36" />
                  <path d="M79 20v22H57" />
                  <path d="M75 69A33 33 0 0 1 22 64" />
                  <path d="M21 80V58h22" />
                </svg>
              )}
            </button>}
            {!replay && !juris.disabledAutoplay && (
              <button className="round-btn auto" disabled={walletBlocked || (busy && auto === 0)} onClick={() => (auto > 0 ? setAuto(0) : setMenu("auto"))} aria-label={t.autoplay} aria-pressed={auto > 0}>
                <AutoplayIcon />
              </button>
            )}
          </>
        )}
        {!juris.disabledTurbo && (
          <button className={`round-btn turbo ${turbo ? "on" : ""} ${inFs ? "fs" : ""}`} onClick={() => setTurbo((v) => !v)} aria-label={t.turbo} aria-pressed={turbo}>
            <svg viewBox="0 0 100 100" aria-hidden>
              <path d="M58 6 L22 56 H48 L40 94 L78 40 H52 Z" className="fill" />
            </svg>
          </button>
        )}

        {replay && replayData && (
          <div className="replay-bar">
            <b className="replay-tag">{t.replay}</b>
            <span className="replay-stake">
              <small>{activeInfo.kind === "spin" ? t.bet : activeInfo.title}</small>
              <strong>{fmtCash(bet)}</strong>
            </span>
            {replayData.costMultiplier > 1 && (
              <span className="replay-cost">
                <small>×{replayData.costMultiplier} · {t.realCost}</small>
                <strong>{fmtCash(bet * replayData.costMultiplier)}</strong>
              </span>
            )}
            <span className="replay-win">
              <small>{t.win}</small>
              <strong><WinAmount x={roundWin} fmt={fmtX} /></strong>
            </span>
            {started && (
              <button onClick={() => void playReplay()} disabled={busy || walletBlocked}>
                {busy ? t.playing : replayDone ? t.replayAgain : t.playReplay}
              </button>
            )}
          </div>
        )}
      </div>

      {error && started && (
        <div className="error" role="alert" onClick={() => setError(null)}>
          {error}
        </div>
      )}
      {overlay && overlay.kind !== "keys" && <div className={`screen-dim ${overlay.kind}`} aria-hidden />}
      <SpineScreens overlay={overlay} onLive={setScreensLive} />
      {overlay && <OverlayView o={overlay} fmtX={plainX} onTap={() => tapRef.current?.()} spineArt={screensLive} />}
      {menu === "buy" && (
        <BuyMenu
          active={mode}
          bet={bet}
          balance={balance}
          canStep={[canDecrease, canIncrease]}
          fmtCash={fmtCash}
          hidden={hidden}
          onPick={pickMode}
          onBet={stepBet}
          onClose={() => setMenu(null)}
        />
      )}
      {menu && typeof menu === "object" && (
        <ConfirmCard m={menu.confirm} price={fmtCash(bet * menu.confirm.cost)} onConfirm={() => confirmMode(menu.confirm)} onClose={() => setMenu("buy")} />
      )}
      {menu === "auto" && (
        <AutoplayPanel
          onClose={() => setMenu(null)}
          onStart={(n) => {
            setMenu(null);
            setAuto(n);
          }}
        />
      )}
      {menu === "info" && <InfoPage onClose={() => setMenu("pop")} Sym={SymbolArt} version={VERSION} />}
      {started && (recoveryRequired || (pendingResume && !busy)) && (
        <div className="wallet-recovery">
          <section role="dialog" aria-modal="true" aria-labelledby="recovery-title" className="recovery-card">
            <h2 id="recovery-title">{recoveryRequired ? t.recovery.errorTitle : t.recovery.title}</h2>
            <p>{recoveryRequired ? t.recovery.error : t.recovery.message}</p>
            {recoveryRequired && error && <p role="alert">{error}</p>}
            <button autoFocus onClick={() => recoveryRequired ? location.reload() : void resumeRound()}>
              {recoveryRequired ? t.recovery.reload : t.recovery.resume}
            </button>
          </section>
        </div>
      )}
      {!started && !introDone && (
        <ProviderIntro ready={launchReady} error={error ?? (assets.failed ? t.connection : null)} onComplete={() => setIntroDone(true)} />
      )}
      {!started && introDone && launchReady && (
        <Splash
          replay={replay}
          ready={launchReady && !error}
          error={error}
          onStart={() => {
            setStarted(true);
            startMusic();
            sound("feature");
            if (replay) void playReplay();
          }}
        />
      )}
    </div>
  );
}
