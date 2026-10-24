import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";

/** A brief provider ident; it never starts a round or skips unfinished artwork preparation. */
export function ProviderIntro({ ready, error, onComplete }: { ready: boolean; error: string | null; onComplete: () => void }) {
  const [logoReady, setLogoReady] = useState(false);
  const [seen, setSeen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (!logoReady) return;
    const timer = setTimeout(() => setSeen(true), reduced ? 180 : 1800);
    return () => clearTimeout(timer);
  }, [logoReady, reduced]);

  useEffect(() => {
    if (!ready || !seen || error) { setExiting(false); return; }
    setExiting(true);
    const timer = setTimeout(() => complete.current(), reduced ? 120 : 280);
    return () => clearTimeout(timer);
  }, [ready, seen, error, reduced]);

  return (
    <div className={`provider-intro ${exiting ? "exiting" : ""}`}>
      <div className="provider-content">
        <div className={`provider-mark ${logoReady ? "revealed" : ""}`} role="img" aria-label="Ruby Games">
          <span className="provider-fallback" aria-hidden>RUBY<small>GAMES</small></span>
          <img src="./art/provider/ruby_games.png" alt="" onLoad={(e) => { void e.currentTarget.decode().then(() => setLogoReady(true)).catch(() => {}); }} />
          <span className="provider-shine" aria-hidden style={{ maskImage: 'url("./art/provider/ruby_games.png")', WebkitMaskImage: 'url("./art/provider/ruby_games.png")' }}><i /></span>
        </div>
        {error && <div className="provider-error" role="alert"><p>{error}</p><button onClick={() => location.reload()}>{t.recovery.reload}</button></div>}
      </div>
    </div>
  );
}
