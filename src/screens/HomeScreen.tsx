import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { ALL_PORTRAITS } from '../avatars/portraits';
import { Icon } from '../ui/Icon';

/**
 * Scène d'accueil. Les visages des clients et prospects flottent autour du
 * menu : le jeu annonce d'emblée qu'il parle de gens, pas de formulaires.
 *
 * La composition est écrite à la main plutôt que tirée au hasard — les bulles
 * restent hors de la colonne centrale, où vit le texte, et le placement ne
 * change pas d'un chargement à l'autre. `prefers-reduced-motion` fige tout.
 *
 * Six visages, pas seize : au-delà, l'accueil se lisait comme un trombinoscope
 * et le regard ne trouvait plus le menu.
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
  { x: 8, y: 20, size: 152, dur: 17, delay: 0, drift: 22 },
  { x: 12, y: 74, size: 118, dur: 19, delay: 1.2, drift: 20 },
  { x: 92, y: 22, size: 138, dur: 18, delay: 0.6, drift: 21 },
  { x: 89, y: 76, size: 110, dur: 16, delay: 2, drift: 19 },
  { x: 21, y: 46, size: 84, dur: 13, delay: 2.5, drift: 16, wide: true },
  { x: 80, y: 50, size: 90, dur: 14, delay: 3, drift: 17, wide: true },
];

export function HomeScreen() {
  const go = useStore((s) => s.go);
  const newGame = useStore((s) => s.newGame);
  const save = useStore((s) => s.save);

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
          <button className="btn btn-primary" onClick={() => newGame()}>
            <Icon name="play" size={18} /> {STR.menu.newGame}
          </button>
          {save && (
            <button className="btn" onClick={() => go(save.finished ? 'end' : save.phase === 'DAY' ? 'day' : 'night')}>
              <Icon name="arrowRight" size={17} /> {STR.menu.continue} — {STR.hud.cycle} {save.cycle}
            </button>
          )}
          <div className="home-menu-row">
            <button className="btn" data-sfx="nav" onClick={() => go('codex')}>
              <Icon name="book" size={17} /> {STR.menu.codex}
            </button>
            <button className="btn" data-sfx="nav" onClick={() => go('options')}>
              <Icon name="sliders" size={17} /> {STR.menu.options}
            </button>
          </div>
        </div>
        <p className="disclaimer">
          <Icon name="info" size={14} /> {STR.disclaimer}
        </p>
      </div>
    </div>
  );
}
