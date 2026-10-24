import { useEffect, useRef, useState } from "react";
import type { Application } from "pixi.js";
import type { Spine } from "@esotericsoftware/spine-pixi-v8";
import { characterBus, fitBottom, loadRig, makeApp, makeSpine, spineDisabled, type CharacterCue } from "./runtime";

/** Extra canvas around the character's box, as fractions of the box (keep in sync with .spine-overflow). */
const PAD_X = 0.2;
const PAD_TOP = 0.35;

const MIX: [string, string, number][] = [
  ["idle_01", "spin_ack", 0.13],
  ["idle_02", "spin_ack", 0.13],
  ["idle_01", "small_win", 0.15],
  ["small_win", "idle_01", 0.23],
  ["idle_01", "anticipation", 0.24],
  ["anticipation", "feature_trigger", 0.11],
  ["feature_trigger", "feature_idle", 0.28],
  ["big_win", "idle_01", 0.32],
  ["big_win", "feature_idle", 0.32],
  ["settle_to_idle", "idle_01", 0.2],
];

/**
 * The character as a live Spine skeleton. Falls back to the static PNG when WebGL or the
 * rig is unavailable (or with ?nospine).
 */
export function SpineCharacter({ className }: { className: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const overflow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spineDisabled()) return;
    let app: Application | null = null;
    let off: (() => void) | null = null;
    let cancelled = false;
    (async () => {
      try {
        await loadRig("character");
        if (cancelled || !host.current) return;
        // The canvas is larger than the character's box (see .spine-overflow) so the bird, sparks and
        // hops are not cut at the box edges; the character itself still fits the box.
        app = await makeApp(overflow.current!);
        if (cancelled) return app.destroy(true);
        const s: Spine = makeSpine("character");
        app.stage.addChild(s);
        const fit = () => {
          const w = app!.screen.width / (1 + 2 * PAD_X);
          const h = app!.screen.height / (1 + PAD_TOP);
          fitBottom(s, w, h);
          s.x += PAD_X * w;
          s.y += PAD_TOP * h;
        };
        fit();
        app.renderer.on("resize", fit);

        const st = s.state;
        st.data.defaultMix = 0.2;
        for (const [a, b, d] of MIX) st.data.setMix(a, b, d);

        // Idle: idle_01 loops, idle_02 now and then (3, 4, 3, 5 loops — deterministic).
        const pattern = [3, 4, 3, 5];
        let loops = 0;
        let step = 0;
        let inFeature = false;
        let firstWin = true;
        let holding = false;
        const rest = () => (inFeature ? "feature_idle" : "idle_01");
        const toRest = (after?: string) => {
          if (after) {
            st.setAnimation(0, after, false);
            st.addAnimation(0, rest(), true, 0);
          } else st.setAnimation(0, rest(), true);
        };
        // Win reactions play on track 1 over the running idle, so the idle cycle (bird on the finger,
        // a short flutter now and then) keeps its own rhythm instead of restarting on every round.
        const overlay = (name: string) => {
          st.setEmptyAnimation(1, 0);
          st.addAnimation(1, name, false, 0).mixDuration = 0.15;
          st.addEmptyAnimation(1, 0.25, 0);
        };
        st.addListener({
          complete: (e) => {
            if (e.animation?.name !== "idle_01" || inFeature) return;
            if (++loops >= pattern[step % pattern.length]) {
              loops = 0;
              step++;
              st.setAnimation(0, "idle_02", false);
              st.addAnimation(0, "idle_01", true, 0);
            }
          },
        });
        toRest();

        const react = (cue: CharacterCue) => {
          switch (cue) {
            case "spin":
              // As in the reference, a spin alone does not interrupt her (base game or bonus).
              firstWin = true;
              break;
            case "win":
              if (holding) break;
              overlay(firstWin ? "small_win" : "cascade_continue");
              firstWin = false;
              break;
            case "anticipation":
              holding = true;
              st.setAnimation(0, "anticipation", false); // holds its last pose
              setTimeout(() => {
                if (holding) {
                  holding = false;
                  toRest();
                }
              }, 2600);
              break;
            case "trigger":
              holding = false;
              inFeature = true;
              st.setAnimation(0, "feature_trigger", false);
              st.addAnimation(0, "feature_idle", true, 0);
              break;
            case "featureEnd":
              inFeature = false;
              holding = false;
              toRest("settle_to_idle");
              break;
            case "bigwin":
              holding = false;
              toRest("big_win");
              break;
            case "settle":
              // Only releases a held pose (anticipation); otherwise the idle cycle just continues.
              if (holding) {
                holding = false;
                toRest();
              }
              break;
          }
        };
        off = characterBus.on(react);
        // QA hook (same idea as V28): SkyCharacterQA.now(), .names(), .play(name), .log
        const log: string[] = [];
        st.addListener({ start: (e) => log.push(e.animation?.name ?? "?") });
        (window as unknown as { SkyCharacterQA: unknown }).SkyCharacterQA = {
          now: () => st.tracks[0]?.animation?.name,
          names: () => s.skeleton.data.animations.map((a) => a.name),
          play: (n: string) => toRest(n),
          log,
        };
        setLive(true);
      } catch (e) {
        console.warn("Character Spine unavailable, using the PNG", e);
        setLive(false);
      }
    })();
    return () => {
      cancelled = true;
      off?.();
      app?.destroy(true, { children: true });
    };
  }, []);

  return (
    <div ref={host} className={`${className} ${live ? "spine-live" : ""}`} aria-hidden>
      <div ref={overflow} className="spine-overflow" />
      {!live && <img src="./character/char_painterly.png" alt="" draggable={false} />}
    </div>
  );
}
