import { STR } from '../i18n/fr';
import { useStore } from '../state/store';

/**
 * Rejouer. Learn CIR est un parcours complet en une partie : pas de défi
 * quotidien, pas de contenu qui se renouvelle jour après jour. Cet écran sert
 * uniquement à relancer une saison entière avec un portefeuille différent.
 */
export function FreeModeScreen() {
  const go = useStore((s) => s.go);
  const newGame = useStore((s) => s.newGame);

  return (
    <div className="container">
      <div className="row">
        <h1>{STR.freeMode.title}</h1>
        <span className="spacer" />
        <button className="btn" onClick={() => go('home')}>
          {STR.common.back}
        </button>
      </div>
      <div className="panel" style={{ marginTop: 16, maxWidth: 640 }}>
        <h3>{STR.freeMode.season}</h3>
        <p className="muted">{STR.freeMode.seasonDesc}</p>
        <p className="muted" style={{ marginTop: 8 }}>{STR.freeMode.replayNote}</p>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => newGame('onboarding')}>
          {STR.common.play}
        </button>
      </div>
    </div>
  );
}
