import type React from "react";
/**
 * Original symbol art (vector), painted-badge style: thick dark outline, bevelled gold
 * rim, faceted glossy gem, specular highlights and a soft drop shadow.
 * Subjects are this game's own: sun crown, crescent moon, comet orb, sky bell, four
 * crystal cuts and a halo ring. PNGs in public/symbols/<NAME>.png override these.
 */
import { useState } from "react";

const OUT = "#170d24";

const grad = (id: string, a: string, b: string, c?: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor={a} />
    <stop offset={c ? ".55" : "1"} stopColor={b} />
    {c && <stop offset="1" stopColor={c} />}
  </linearGradient>
);

/** Shared defs: gold bevel, shadow, white shine. */
const Defs = () => (
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#fff6b8" />
      <stop offset=".35" stopColor="#ffd040" />
      <stop offset=".7" stopColor="#e39a12" />
      <stop offset="1" stopColor="#9c5a06" />
    </linearGradient>
    <linearGradient id="goldEdge" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stopColor="#7a4300" />
      <stop offset="1" stopColor="#c47c08" />
    </linearGradient>
    <radialGradient id="shine" cx=".35" cy=".28" r=".5">
      <stop offset="0" stopColor="#fff" stopOpacity=".95" />
      <stop offset="1" stopColor="#fff" stopOpacity="0" />
    </radialGradient>
    <filter id="drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodColor="#000" floodOpacity=".45" />
    </filter>
  </defs>
);

const inset = (k: number, cx = 50, cy = 50) => `translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`;

/** Faceted polygon gem in a gold rim. */
function CutGem({ pts, id, light, mid, dark, cy = 50 }: { pts: [number, number][]; id: string; light: string; mid: string; dark: string; cy?: number }) {
  const poly = pts.map((p) => p.join(",")).join(" ");
  const cx = 50;
  const facets = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    return (
      <polygon
        key={i}
        points={`${cx},${cy} ${p.join(",")} ${q.join(",")}`}
        fill={i % 2 ? "#000" : "#fff"}
        opacity={i % 2 ? 0.16 : 0.2}
      />
    );
  });
  return (
    <svg viewBox="0 0 100 100">
      <Defs />
      <defs>{grad(id, light, mid, dark)}</defs>
      <g filter="url(#drop)">
        <polygon points={poly} fill={OUT} stroke={OUT} strokeWidth="11" strokeLinejoin="round" />
        <polygon points={poly} fill="url(#gold)" stroke="url(#goldEdge)" strokeWidth="2" strokeLinejoin="round" />
        <g transform={inset(0.8, cx, cy)}>
          <polygon points={poly} fill={`url(#${id})`} stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
          {facets}
          <polygon points={poly} transform={inset(0.45, cx, cy)} fill={light} opacity=".55" />
        </g>
        <ellipse cx="38" cy={cy - 16} rx="10" ry="5" fill="url(#shine)" transform={`rotate(-28 38 ${cy - 16})`} />
        <circle cx="64" cy={cy - 20} r="2.4" fill="#fff" />
      </g>
    </svg>
  );
}

/** Smooth cabochon gem (round or teardrop) in a gold rim. */
function Cabochon({ d, id, light, mid, dark }: { d: string; id: string; light: string; mid: string; dark: string }) {
  return (
    <svg viewBox="0 0 100 100">
      <Defs />
      <defs>
        <radialGradient id={id} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor={light} />
          <stop offset=".55" stopColor={mid} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
      </defs>
      <g filter="url(#drop)">
        <path d={d} fill={OUT} stroke={OUT} strokeWidth="11" strokeLinejoin="round" />
        <path d={d} fill="url(#gold)" stroke="url(#goldEdge)" strokeWidth="2" />
        <path d={d} transform={inset(0.8, 50, 56)} fill={`url(#${id})`} stroke={OUT} strokeWidth="3" />
        <path d={d} transform={inset(0.4, 46, 46)} fill="#fff" opacity=".18" />
        <ellipse cx="40" cy="36" rx="11" ry="6" fill="url(#shine)" transform="rotate(-30 40 36)" />
        <circle cx="62" cy="34" r="2.4" fill="#fff" />
      </g>
    </svg>
  );
}

const hex: [number, number][] = [[50, 7], [88, 28], [88, 72], [50, 93], [12, 72], [12, 28]];
const tri: [number, number][] = [[50, 8], [92, 86], [8, 86]];
const oct: [number, number][] = [[35, 8], [65, 8], [92, 35], [92, 65], [65, 92], [35, 92], [8, 65], [8, 35]];
const drop = "M50 6 C68 24 84 42 84 60 C84 80 68 93 50 93 C32 93 16 80 16 60 C16 42 32 24 50 6Z";

const ART: Record<string, () => React.ReactElement> = {
  // Low symbols — four crystal cuts.
  L1: () => <CutGem id="gL1" pts={hex} light="#c9fff6" mid="#2fd0c4" dark="#0b6f78" />,
  L2: () => <Cabochon id="gL2" d={drop} light="#fff0b8" mid="#ff9c2a" dark="#a8420a" />,
  L3: () => <CutGem id="gL3" pts={tri} cy={62} light="#f1d6ff" mid="#a45cf2" dark="#4a1a8f" />,
  L4: () => <CutGem id="gL4" pts={oct} light="#dcffc4" mid="#4ccf3c" dark="#16661c" />,

  // H4 — sky bell: gold bell, blue enamel band, gem clapper.
  H4: () => (
    <svg viewBox="0 0 100 100">
      <Defs />
      <defs>{grad("gH4", "#bfe6ff", "#3c8ef0", "#163f9c")}</defs>
      <g filter="url(#drop)">
        <path d="M50 10 C30 12 24 30 24 50 C24 64 18 70 12 76 L88 76 C82 70 76 64 76 50 C76 30 70 12 50 10Z" fill={OUT} stroke={OUT} strokeWidth="11" strokeLinejoin="round" />
        <circle cx="50" cy="84" r="9" fill={OUT} stroke={OUT} strokeWidth="9" />
        <circle cx="50" cy="8" r="6" fill="url(#gold)" stroke={OUT} strokeWidth="3.5" />
        <path d="M50 10 C30 12 24 30 24 50 C24 64 18 70 12 76 L88 76 C82 70 76 64 76 50 C76 30 70 12 50 10Z" fill="url(#gold)" stroke="url(#goldEdge)" strokeWidth="2" />
        <path d="M22 56 C40 61 60 61 78 56 L80 66 C60 71 40 71 20 66Z" fill="url(#gH4)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M12 76 L88 76" stroke={OUT} strokeWidth="4" />
        <circle cx="50" cy="84" r="8" fill="#ff5a7a" stroke={OUT} strokeWidth="3" />
        <circle cx="47" cy="81" r="2.5" fill="#fff" />
        <path d="M36 22 C32 30 31 40 31 50" fill="none" stroke="#fffbe0" strokeWidth="5" strokeLinecap="round" opacity=".85" />
      </g>
    </svg>
  ),

  // H3 — comet orb: pink gem orb in a gold band with a flowing tail.
  H3: () => (
    <svg viewBox="0 0 100 100">
      <Defs />
      <defs>
        <radialGradient id="gH3" cx=".38" cy=".35" r=".7">
          <stop offset="0" stopColor="#ffe0f0" />
          <stop offset=".5" stopColor="#ff4f9e" />
          <stop offset="1" stopColor="#8a0f4c" />
        </radialGradient>
        <linearGradient id="tH3" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd2ea" />
          <stop offset="1" stopColor="#ff78b8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g filter="url(#drop)">
        <path d="M44 52 C30 34 18 22 4 14 C20 16 34 22 52 36 C40 22 34 12 30 4 C46 14 58 28 66 40Z" fill="url(#tH3)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="62" cy="62" r="29" fill={OUT} />
        <circle cx="62" cy="62" r="26" fill="url(#gold)" stroke="url(#goldEdge)" strokeWidth="2" />
        <circle cx="62" cy="62" r="19" fill="url(#gH3)" stroke={OUT} strokeWidth="3" />
        <ellipse cx="55" cy="54" rx="7" ry="4" fill="url(#shine)" transform="rotate(-30 55 54)" />
        <circle cx="70" cy="52" r="2.2" fill="#fff" />
      </g>
    </svg>
  ),

  // H2 — crescent moon: silver-blue enamel inside a gold rim.
  H2: () => (
    <svg viewBox="0 0 100 100">
      <Defs />
      <defs>{grad("gH2", "#f2f7ff", "#8eb0ff", "#3a4fc2")}</defs>
      <g filter="url(#drop)">
        <path d="M60 8 A42 42 0 1 0 92 66 A34 34 0 1 1 60 8Z" fill={OUT} stroke={OUT} strokeWidth="11" strokeLinejoin="round" />
        <path d="M60 8 A42 42 0 1 0 92 66 A34 34 0 1 1 60 8Z" fill="url(#gold)" stroke="url(#goldEdge)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M54 17 A33 33 0 1 0 82 70 A40 40 0 0 1 54 17Z" fill="url(#gH2)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M34 34 C28 44 28 58 34 68" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" opacity=".75" />
        <circle cx="76" cy="26" r="5" fill="#fff6c0" stroke={OUT} strokeWidth="2.5" />
        <circle cx="86" cy="42" r="3" fill="#fff6c0" stroke={OUT} strokeWidth="2" />
      </g>
    </svg>
  ),

  // H1 — sun crown: rayed gold sun with a ruby heart-stone (round) and a small crown.
  H1: () => (
    <svg viewBox="0 0 100 100">
      <Defs />
      <defs>
        <radialGradient id="gH1" cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#ffe3c2" />
          <stop offset=".5" stopColor="#ff3d2e" />
          <stop offset="1" stopColor="#7a0a0a" />
        </radialGradient>
      </defs>
      <g filter="url(#drop)">
        {Array.from({ length: 10 }, (_, i) => (
          <polygon key={i} points="50,4 57,26 43,26" fill="url(#gold)" stroke={OUT} strokeWidth="3.5" strokeLinejoin="round" transform={`rotate(${i * 36} 50 54)`} />
        ))}
        <circle cx="50" cy="54" r="27" fill={OUT} />
        <circle cx="50" cy="54" r="24" fill="url(#gold)" stroke="url(#goldEdge)" strokeWidth="2" />
        <circle cx="50" cy="56" r="15" fill="url(#gH1)" stroke={OUT} strokeWidth="3" />
        <path d="M36 34 L40 22 L46 30 L50 18 L54 30 L60 22 L64 34 Z" fill="url(#gold)" stroke={OUT} strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="45" cy="50" rx="5" ry="3" fill="url(#shine)" transform="rotate(-30 45 50)" />
        <circle cx="50" cy="18" r="2.6" fill="#7fe0ff" stroke={OUT} strokeWidth="1.5" />
      </g>
    </svg>
  ),

  // S — halo: glowing gold ring seen in perspective with a light core.
  S: () => (
    <svg viewBox="0 0 100 100">
      <Defs />
      <defs>
        <radialGradient id="gS" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
          <stop offset=".45" stopColor="#fff2a8" stopOpacity=".7" />
          <stop offset="1" stopColor="#ffb400" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#gS)" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M50 6 L53 22 L47 22Z" fill="#fff7cc" opacity=".8" transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <g filter="url(#drop)">
        <ellipse cx="50" cy="54" rx="38" ry="17" fill="none" stroke={OUT} strokeWidth="17" />
        <ellipse cx="50" cy="54" rx="38" ry="17" fill="none" stroke="url(#gold)" strokeWidth="10" />
        <ellipse cx="50" cy="51" rx="35" ry="14" fill="none" stroke="#fffbe0" strokeWidth="2.5" opacity=".9" />
        <circle cx="50" cy="44" r="9" fill="#fff" opacity=".95" />
        <circle cx="50" cy="44" r="15" fill="#fff6c2" opacity=".35" />
      </g>
    </svg>
  ),
};

export function SymbolArt({ sym }: { sym: string }) {
  const [png, setPng] = useState(true);
  return png ? (
    <img className="sym-img" src={`./symbols/${sym}.png`} alt="" draggable={false} onError={() => setPng(false)} />
  ) : (
    (ART[sym] ?? ART.L1)()
  );
}

/** Golden raid key: winged crescent bow, tilted shaft with two bits. */
export function KeyArt() {
  return <img className="key-art" src="./art/ui/key.png" alt="" draggable={false} />;
}

/** Generated flowering lotus used by the Total Win screen. */
export function CrestArt() {
  return <img src="./art/ui/win_lotus_v3.png" alt="" draggable={false} />;
}
