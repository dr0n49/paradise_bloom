import { useEffect, useRef } from "react";
import type { Application } from "pixi.js";
import type { Spine } from "@esotericsoftware/spine-pixi-v8";
import type { Overlay } from "../game/player";
import { loadRig, makeApp, makeSpine, spineDisabled } from "./runtime";

/** Design sizes of each part of the screens rig (see spine/tools/make_rigs.py). */
const BACK = { w: 1920, h: 1080 };
const PART = { title: 1400, hero: 900, crest: 900, banner: 1200 } as const;
type Part = keyof typeof PART;

/** Which DOM element each part sits on (the DOM keeps the layout and the live numbers). */
const ANCHOR: Record<Part, string> = {
  title: ".overlay .title-img",
  hero: ".overlay .win-hero",
  crest: ".overlay .win-emblem",
  banner: ".overlay .intro-banner",
};

export const bigWinTier = (x: number) => (x >= 75 ? "epic" : x >= 40 ? "mega" : "big");

/** Title attachment for an overlay (null = no title). */
export function titleOf(o: Overlay): string | null {
  switch (o.kind) {
    case "bigwin":
      return `title_${bigWinTier(o.x)}_win`;
    case "maxwin":
      return "title_max_win";
    case "total":
      return "title_total_win";
    case "intro":
      return `title_bloom_${o.feature === "super" ? "super" : o.feature === "epic" ? "epic" : "bonus"}`;
    default:
      return null;
  }
}

/**
 * Full-screen Spine layer for the win screens, the bonus intro, Total Win and the cloud
 * transition. It sits between the dim layer and the DOM text of the overlay.
 */
export function SpineScreens({ overlay, onLive }: { overlay: Overlay | null; onLive: (live: boolean) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(overlay);
  latest.current = overlay;
  const ctx = useRef<{ app: Application; back: Spine; clouds: Spine; parts: Record<Part, Spine>; key: string } | null>(null);

  useEffect(() => {
    if (spineDisabled()) return;
    let cancelled = false;
    (async () => {
      try {
        await loadRig("screens");
        if (cancelled || !host.current) return;
        const app = await makeApp(host.current);
        if (cancelled) return app.destroy(true);
        const mk = () => {
          const s = makeSpine("screens");
          s.visible = false;
          return s;
        };
        const back = mk();
        const rays = back.skeleton.findBone("b_rays");
        // Glow, sparkles and particles have short loops. Rays keep turning on the
        // unwrapped track clock, after the pose is applied and before rendering.
        // Using getAnimationTime() here would jump back 24 degrees every loop.
        back.beforeUpdateWorldTransforms = () => {
          const track = back.state.tracks[0];
          const duration = track ? track.animationEnd - track.animationStart : 0;
          if (rays && track && duration > 0) {
            rays.pose.rotation = rays.data.setupPose.rotation - 24 * track.trackTime / duration;
          }
        };
        const parts = { banner: mk(), crest: mk(), hero: mk(), title: mk() };
        const clouds = mk();
        app.stage.addChild(back, parts.banner, parts.crest, parts.hero, parts.title, clouds);
        ctx.current = { app, back, clouds, parts, key: "" };
        app.ticker.add(() => layout());
        apply();
        onLive(true);
      } catch (e) {
        console.warn("Screens Spine unavailable, using DOM art", e);
        onLive(false);
      }
    })();
    return () => {
      cancelled = true;
      ctx.current?.app.destroy(true, { children: true });
      ctx.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => apply());

  function play(s: Spine, intro: string | null, loop: string | null, attach?: [string, string]) {
    s.visible = true;
    s.state.clearTracks();
    s.skeleton.setupPose();
    if (attach) s.skeleton.setAttachment(attach[0], attach[1]);
    if (intro) s.state.setAnimation(0, intro, false);
    if (loop) {
      if (intro) s.state.addAnimation(0, loop, true, 0);
      else s.state.setAnimation(0, loop, true);
    }
  }
  const hide = (s: Spine) => {
    s.state.clearTracks();
    s.visible = false;
  };

  function apply() {
    const c = ctx.current;
    if (!c) return;
    const o = latest.current;
    const key = o ? `${o.kind}:${"feature" in o ? o.feature : ""}:${"x" in o ? Math.round(o.x * 100) : ""}` : "";
    if (key === c.key) return;
    c.key = key;
    const { back, clouds, parts } = c;
    // The cloud sweep runs to its end even when the next screen is already up.
    if (o?.kind === "cloud") play(clouds, "clouds_sweep", null);
    if (!o || o.kind === "cloud" || o.kind === "keys") {
      [back, ...Object.values(parts)].forEach(hide);
      return;
    }
    const title = titleOf(o);
    const backAnim =
      o.kind === "bigwin" ? `back_${bigWinTier(o.x)}` : o.kind === "maxwin" ? "back_max" : o.kind === "total" ? "back_total" : "back_intro";
    play(back, null, backAnim);
    back.state.setAnimation(1, "back_burst", false);
    if (title) {
      play(parts.title, "title_in", "title_loop", ["t_title", title]);
    } else hide(parts.title);
    const hero = o.kind === "maxwin" || (o.kind === "bigwin" && bigWinTier(o.x) === "epic");
    if (hero) play(parts.hero, "hero_in", "hero_loop");
    else hide(parts.hero);
    if (o.kind === "total") play(parts.crest, "crest_in", "crest_loop");
    else hide(parts.crest);
    if (o.kind === "intro") {
      play(parts.banner, "banner_in", "banner_loop");
      if (o.minChest > 2) parts.banner.state.setAnimation(1, "ribbon_in", false);
    } else hide(parts.banner);
  }

  function layout() {
    const c = ctx.current;
    if (!c) return;
    const { width: W, height: H } = c.app.screen;
    const cover = Math.max(W / BACK.w, H / BACK.h);
    for (const s of [c.back, c.clouds]) {
      s.x = W / 2;
      s.y = H / 2;
      s.scale.set(cover);
    }
    (Object.keys(PART) as Part[]).forEach((p) => {
      const s = c.parts[p];
      if (!s.visible) return;
      const el = document.querySelector(ANCHOR[p]);
      if (!el) return;
      const r = el.getBoundingClientRect();
      s.x = r.left + r.width / 2;
      s.y = r.top + r.height / 2;
      s.scale.set(r.width / PART[p]);
    });
  }

  return <div ref={host} className="spine-screens" aria-hidden />;
}
