import { useEffect, useRef, useState } from "react";
import { Application, Container, Graphics } from "pixi.js";
import type { Spine } from "@esotericsoftware/spine-pixi-v8";
import { fitBottom, loadRig, makeSpine } from "../spine/runtime";

/**
 * Dev page for the character rig (?qa=character). Live view with animation buttons, or a frame
 * sheet (?qa=character&sheet=idle_01&fps=6&n=24&cols=8&from=0&cell=240) stepped at 60 Hz so physics
 * matches the game, for side-by-side checks against frames of the reference recording.
 */

export default function CharacterQA() {
  const q = new URLSearchParams(location.search);
  const sheet = q.get("sheet");
  const rig = q.get("rig") ?? "character";
  const host = useRef<HTMLDivElement>(null);
  const live = useRef<Spine | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [now, setNow] = useState("idle_01");

  useEffect(() => {
    let app: Application | null = null;
    let cancelled = false;
    (async () => {
      await loadRig(rig);
      if (cancelled || !host.current) return;
      app = new Application();
      const cols = Number(q.get("cols") ?? 8);
      const n = Number(q.get("n") ?? 24);
      const cell = Number(q.get("cell") ?? 240);
      const probe = makeSpine(rig);
      const cellH = Math.round(cell * (probe.skeleton.data.height / probe.skeleton.data.width));
      probe.destroy();
      const sheetMode = !!sheet;
      await app.init({
        background: "#8fb4e8",
        antialias: true,
        width: sheetMode ? cols * cell : window.innerWidth,
        height: sheetMode ? Math.ceil(n / cols) * cellH : window.innerHeight,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });
      if (cancelled) return app.destroy(true);
      host.current.appendChild(app.canvas);
      if (sheetMode) {
        const fps = Number(q.get("fps") ?? 6);
        const from = Number(q.get("from") ?? 0);
        for (let i = 0; i < n; i++) {
          const s = makeSpine(rig);
          s.autoUpdate = false;
          s.state.setAnimation(0, sheet!, true);
          const target = from + i / fps;
          for (let t = 0; t < target - 1e-6; t += 1 / 60) s.update(1 / 60);
          s.update(0);
          fitBottom(s, cell, cellH * 0.78); // room above for the bird and sparks
          s.x += (i % cols) * cell;
          s.y += Math.floor(i / cols) * cellH + cellH * 0.22;
          const frame = new Container();
          frame.addChild(new Graphics().rect((i % cols) * cell, Math.floor(i / cols) * cellH, cell, cellH).stroke({ color: 0xffffff, alpha: 0.4, width: 1 }));
          app.stage.addChild(s, frame);
        }
        app.render();
        app.ticker.stop();
        document.title = "sheet ready";
        return;
      }
      const s = makeSpine(rig);
      live.current = s;
      fitBottom(s, app.screen.width, app.screen.height - 60);
      s.y += 60;
      app.stage.addChild(s);
      s.state.setAnimation(0, q.get("anim") ?? "idle_01", true);
      setNames(s.skeleton.data.animations.map((a) => a.name));
      (window as unknown as { CharQA: unknown }).CharQA = { spine: s };
    })();
    return () => {
      cancelled = true;
      app?.destroy(true, { children: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const play = (name: string) => {
    const s = live.current;
    if (!s) return;
    setNow(name);
    const loop = /idle/.test(name);
    s.state.setAnimation(0, name, loop);
    if (!loop) s.state.addAnimation(0, "idle_01", true, 0);
  };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "auto", background: "#8fb4e8" }}>
      <div ref={host} />
      {!sheet && (
        <div style={{ position: "fixed", top: 8, left: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {names.map((n) => (
            <button key={n} onClick={() => play(n)} style={{ fontWeight: n === now ? 800 : 400 }}>
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
