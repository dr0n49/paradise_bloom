import { useEffect, useRef, useState } from "react";

/** Counts between displayed payouts; fresh cluster labels start at zero. */
export function WinAmount({ x, fmt, ms = 700 }: { x: number; fmt: (x: number, reference?: number) => string; ms?: number }) {
  const [shown, setShown] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    const from = current.current;
    if (x <= from || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = x;
      setShown(x);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / ms);
      const value = from + (x - from) * (1 - Math.pow(1 - progress, 3));
      current.current = value;
      setShown(value);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [x, ms]);
  return <span aria-label={fmt(x)}>{fmt(shown, x)}</span>;
}
