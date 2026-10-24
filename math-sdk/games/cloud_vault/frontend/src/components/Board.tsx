import { t } from "../i18n";
import { useState } from "react";
import { KeyArt, SymbolArt } from "../art/Symbols";
import { SpineBoard } from "../spine/SpineBoard";
import { WinAmount } from "./WinAmount";
import type { Reel } from "../game/board";
import type { FeatureState, Panel, Plus, WinLabel } from "../game/player";

type Props = {
  reels: Reel[];
  labels: WinLabel[];
  halos: { reel: number; row: number }[];
  plus: Plus[];
  panel: Panel;
  feature: FeatureState | null;
  keys: boolean; // raid keys hovering over the empty board
  anticipation: number | null;
  fmt: (x: number, reference?: number) => string; // plain number, no currency symbol
};

/** The framed 5×5 board. Positioned by the stage; the frame art sits on top of the cells. */
export function Board({ reels, labels, halos, plus, panel, feature, keys, anticipation, fmt }: Props) {
  const haloSet = new Set(halos.map((h) => `${h.reel}:${h.row}`));
  const live = feature && !feature.done;
  const [spineOn, setSpineOn] = useState(false);
  return (
    <div className={`frame-box ${spineOn ? "spine-on" : ""} ${feature ? "has-blooms" : ""}`}>
      <SpineBoard
        reels={reels}
        halos={halos}
        feature={feature}
        anticipation={anticipation}
        winKey={labels[0]?.key ?? 0}
        onLive={setSpineOn}
      />
      <div className="board">
        {reels.map((reel, r) => (
          <div className={`reel ${anticipation === r ? "reel-active" : ""}`} data-reel={r} key={r}>
            {live &&
              feature.rows.map((w) => (
                <span key={w} className={`row-gold ${feature.banked[r]?.[w] ? "on" : ""}`} style={{ top: `${w * 20}%` }} />
              ))}
            {reel.cells.map((c, w) => (
              <div
                key={c.id}
                data-symbol={c.sym}
                data-row={w}
                className={[
                  "cell",
                  c.win ? "is-win" : "",
                  c.dim ? "is-dim" : "",
                  c.pop ? "is-pop" : "",
                  c.out ? "is-out" : "",
                  haloSet.has(`${r}:${w}`) ? "is-halo" : "",
                ].join(" ")}
                style={{
                  top: `${w * 20}%`,
                  ["--drop" as string]: c.drop,
                  ["--fx-scale" as string]: c.fxScale ?? 1,
                  ["--fx-delay" as string]: `${(c.fxDelay ?? 0) * (c.fxScale ?? 1)}ms`,
                  ["--delay" as string]: `${c.delay ?? 0}ms`,
                  ["--duration" as string]: `${c.duration ?? 140 + c.drop * 65}ms`,
                  ["--out-duration" as string]: `${c.outDuration ?? 340}ms`,
                  ["--out-delay" as string]: `${c.outDelay ?? r * 40 + (4 - w) * 16}ms`,
                }}
              >
                <div className="sym">
                  <SymbolArt sym={c.sym} />
                </div>
                {c.pop && <img className="puff" src="./fx/reference_cloud/puff_center.png" alt="" />}
              </div>
            ))}
          </div>
        ))}
        {labels.map((l) => (
          <div key={l.key} className="win-label" style={{ left: `${l.reel * 20 + 10}%`, top: `${l.row * 20 + 10}%`, ["--label-enter" as string]: `${Math.min(260, (l.ms ?? 700) * .4)}ms` }}>
            <WinAmount x={l.x} fmt={fmt} ms={l.ms} />
          </div>
        ))}
        {plus.map((p) => (
          <div key={p.key} className="plus-card" style={{ left: `${p.reel * 20 + 10}%`, top: `${p.row * 20 + 10}%` }}>
            <img src="./symbols/S.png" alt="" />
            <b>+1</b>
          </div>
        ))}
        {keys && (
          <div className="raid-keys">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} style={{ ["--i" as string]: i }}>
                <KeyArt />
              </span>
            ))}
          </div>
        )}
        {panel && panel.x > 0 && (
          <div className={`win-panel ${panel.final ? "final" : ""}`}>
            {panel.mult && panel.mult > 1 ? <i className="mult">x{panel.mult.toLocaleString("en-US")}</i> : null}
            <span key={Math.round(panel.x * 100)}>{fmt(panel.x)}</span>
          </div>
        )}
      </div>
      {anticipation !== null && (
        <div className="reel-light" data-anticipation-reel={anticipation} style={{ ["--reel" as string]: anticipation }} aria-hidden>
          <i className="reel-light-shaft" /><i className="reel-light-glints" />
        </div>
      )}
      <img className="frame-art" src="./art/frame_v6.png" alt="" draggable={false} />
      {feature && <Blooms feature={feature} />}
    </div>
  );
}

function Blooms({ feature }: { feature: FeatureState }) {
  return (
    <div className="chests bloom-bank" aria-label={t.rules.chestsTitle}>
      {Array.from({ length: 5 }, (_, r) => {
        const unlocked = !!feature.unlocked[r];
        const value = feature.values[r] ?? null;
        const state = value !== null ? "open" : unlocked ? "ready" : "closed";
        const charged = feature.rows.filter((row) => feature.banked[r]?.[row]).length;
        return (
          <div key={r} data-reel={r} data-bloom-state={state} className={`chest bloom-vessel ${state} ${charged ? "charging" : ""}`}>
            <span className="bloom-channel" aria-hidden />
            <span className="bloom-progress" role="progressbar" aria-label={`Lotus ${r + 1}`} aria-valuemin={0} aria-valuemax={feature.rows.length} aria-valuenow={charged}>
              {feature.rows.map((row) => <i key={row} className={feature.banked[r]?.[row] ? "on" : ""} />)}
            </span>
            <img
              className="chest-art bloom-art"
              src={`./art/bloom/lotus_${state === "open" ? "open" : state === "ready" ? "ready" : "closed"}.png`}
              alt=""
              draggable={false}
            />
            {feature.keys && !feature.done && value === null && (
              <span className="chest-key bloom-key">
                <KeyArt />
              </span>
            )}
            {value !== null ? (
              <span className={`bloom-value ${value >= 100 ? "long" : ""}`}>×{value}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
