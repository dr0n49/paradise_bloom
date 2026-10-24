import { t } from "../i18n";
import { Logo } from "./Overlays";

/** Start screen: logo and three framed feature cards; press to continue (also unlocks audio). */
export function Splash({ ready, error, onStart, replay = false }: { ready: boolean; error: string | null; onStart: () => void; replay?: boolean }) {
  if (replay) {
    return (
      <div className="splash replay-splash">
        <picture>
          <source media="(max-aspect-ratio: 3/4)" srcSet="./art/bg_portrait.jpg" />
          <img className="sky" src="./art/bg.jpg" alt="" aria-hidden draggable={false} />
        </picture>
        <div className="replay-welcome">
          <Logo />
          <h1>{t.replay}</h1>
          {error ? <p className="replay-status" role="alert">{error}</p> : ready ? (
            <button className="start-replay" onClick={onStart}>{t.playReplay}</button>
          ) : <p className="replay-status" role="status">{t.loading}</p>}
        </div>
      </div>
    );
  }
  return (
    <div className={`splash ${ready ? "ready" : ""}`} onClick={() => ready && onStart()}>
      <picture>
        <source media="(max-aspect-ratio: 3/4)" srcSet="./art/bg_portrait.jpg" />
        <img className="sky" src="./art/bg.jpg" alt="" aria-hidden draggable={false} />
      </picture>
      <div className="splash-cards">
        <div className="s-card side" style={{ ["--i" as string]: 0 }}>
          <div className="s-card-face">
            <div className="s-art">
              <img src="./art/ui/card_epic_bonus.png" alt="" />
            </div>
            <h3>{t.intro.epic[0]}</h3>
            <p>{t.intro.epic[1]}</p>
            <img className="s-frame" src="./art/ui/card_frame.png" alt="" />
          </div>
        </div>
        <div className="s-card mid" style={{ ["--i" as string]: 1 }}>
          <div className="s-card-face">
            <div className="s-art">
              <img src="./art/ui/card_chest_multis.png" alt="" />
            </div>
            <h3>{t.intro.chest[0]}</h3>
            <p>{t.intro.chest[1]}</p>
            <img className="s-frame" src="./art/ui/card_frame.png" alt="" />
          </div>
        </div>
        <div className="s-card side" style={{ ["--i" as string]: 2 }}>
          <div className="s-card-face">
            <div className="s-art">
              <img src="./art/ui/card_max_win.png" alt="" />
            </div>
            <h3>{t.intro.max[0]}</h3>
            <p>{t.intro.max[1]}</p>
            <img className="s-frame" src="./art/ui/card_frame.png" alt="" />
          </div>
        </div>
        <Logo className="splash-logo" />
      </div>
      {error ? (
        <p className="splash-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="press">{ready ? t.tapToContinue : t.loading}</p>
      )}
    </div>
  );
}
