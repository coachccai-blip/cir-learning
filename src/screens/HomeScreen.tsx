import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { ALL_PORTRAITS } from '../avatars/portraits';
import { journeyComplete, JOURNEY } from '../engine/journey';
import { Icon } from '../ui/Icon';

/**
 * Scène d'accueil. Les visages des clients et prospects flottent autour du
 * menu : le jeu annonce d'emblée qu'il parle de gens, pas de formulaires.
 *
 * La composition est écrite à la main plutôt que tirée au hasard — les bulles
 * restent hors de la colonne centrale, où vit le texte, et le placement ne
 * change pas d'un chargement à l'autre. `prefers-reduced-motion` fige tout.
 */
interface Bubble {
  /** Position en % du conteneur (centre de la bulle). */
  x: number;
  y: number;
  /** Diamètre en px sur grand écran. */
  size: number;
  /** Durée du flottement, en secondes : les grosses bulles dérivent plus lentement. */
  dur: number;
  delay: number;
  /** Amplitude verticale de la dérive, en px. */
  drift: number;
  /** Masquée sous 900 px de large : on garde les plus grosses. */
  wide?: boolean;
}

const BUBBLES: Bubble[] = [
  { x: 8, y: 18, size: 152, dur: 17, delay: 0, drift: 22 },
  { x: 20, y: 47, size: 84, dur: 13, delay: 2.5, drift: 16, wide: true },
  { x: 11, y: 74, size: 118, dur: 19, delay: 1.2, drift: 20 },
  { x: 26, y: 12, size: 62, dur: 11, delay: 3.4, drift: 13, wide: true },
  { x: 25, y: 86, size: 58, dur: 12, delay: 0.8, drift: 12, wide: true },
  { x: 4, y: 43, size: 52, dur: 14, delay: 4.1, drift: 11, wide: true },
  { x: 33, y: 68, size: 44, dur: 10, delay: 1.9, drift: 9, wide: true },
  { x: 92, y: 22, size: 138, dur: 18, delay: 0.6, drift: 21 },
  { x: 80, y: 52, size: 90, dur: 14, delay: 3, drift: 17, wide: true },
  { x: 89, y: 78, size: 110, dur: 16, delay: 2, drift: 19 },
  { x: 74, y: 14, size: 58, dur: 12, delay: 4.6, drift: 12, wide: true },
  { x: 96, y: 50, size: 50, dur: 13, delay: 1.4, drift: 10, wide: true },
  { x: 76, y: 88, size: 66, dur: 15, delay: 3.8, drift: 14, wide: true },
  { x: 67, y: 70, size: 42, dur: 10, delay: 0.3, drift: 9, wide: true },
  { x: 50, y: 5, size: 54, dur: 13, delay: 2.2, drift: 11, wide: true },
  { x: 44, y: 95, size: 48, dur: 11, delay: 4.9, drift: 10, wide: true },
];

export function HomeScreen() {
  const go = useStore((s) => s.go);
  const save = useStore((s) => s.save);
  const progress = useStore((s) => s.progress);

  return (
    <div className="home">
      <div className="home-aurora" aria-hidden />
      <div className="home-bubbles" aria-hidden>
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className={`home-bubble${b.wide ? ' is-wide-only' : ''}`}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              '--size': `${b.size}px`,
              '--dur': `${b.dur}s`,
              '--delay': `${b.delay}s`,
              '--drift': `${b.drift}px`,
            } as React.CSSProperties}
          >
            <img src={ALL_PORTRAITS[i % ALL_PORTRAITS.length]} alt="" loading="lazy" />
          </span>
        ))}
      </div>

      <div className="home-card">
        <div className="home-logo">{STR.appTitle.toUpperCase()}</div>
        <div className="home-sub">{STR.appTagline}</div>
        <p className="home-pitch">{STR.appPitch}</p>
        <div className="home-menu">
          <button className="btn btn-primary" onClick={() => go('mode')}>
            <Icon name="play" size={18} /> {STR.menu.newGame}
          </button>
          {save && (
            <button className="btn" onClick={() => go(save.finished ? 'end' : save.phase === 'DAY' ? 'day' : 'night')}>
              <Icon name="arrowRight" size={17} /> {STR.menu.continue} — {STR.hud.cycle} {save.cycle}
            </button>
          )}
          <button className="btn" onClick={() => go('freemode')}>
            <Icon name="history" size={17} /> {STR.menu.freeMode}
          </button>
          <div className="home-menu-row">
            <button className="btn" data-sfx="nav" onClick={() => go('codex')}>
              <Icon name="book" size={17} /> {STR.menu.codex}
            </button>
            <button className="btn" data-sfx="nav" onClick={() => go('leaderboard')}>
              <Icon name="trophy" size={17} /> {STR.menu.leaderboard}
            </button>
            <button className="btn" data-sfx="nav" onClick={() => go('options')}>
              <Icon name="sliders" size={17} /> {STR.menu.options}
            </button>
          </div>
        </div>
        {/* Le parcours se joue dans l'ordre : l'accueil annonce où l'on en est. */}
        <div className="home-journey" aria-label={STR.journey.title}>
          {JOURNEY.map((m, i) => {
            const done = progress.completed.includes(m);
            return (
              <span key={m} className={`journey-pill${done ? ' is-done' : ''}`}>
                <span className="journey-pill-mark">
                  {done ? <Icon name="check" size={13} /> : i + 1}
                </span>
                {STR.modes[m].label}
              </span>
            );
          })}
          {journeyComplete(progress) && (
            <span className="journey-pill is-done">
              <Icon name="flag" size={14} /> {STR.journey.complete}
            </span>
          )}
        </div>
        <p className="disclaimer">
          <Icon name="info" size={14} /> {STR.disclaimer}
        </p>
      </div>
    </div>
  );
}
