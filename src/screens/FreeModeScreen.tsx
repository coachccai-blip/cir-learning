import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { JOURNEY } from '../engine/journey';

/**
 * Rejouer. Learn CIR est un parcours complet : pas de défi quotidien, pas de
 * contenu qui se renouvelle jour après jour. Cet écran sert à relancer une
 * saison déjà ouverte — les montants et les pièges changent à chaque partie,
 * le dossier n'est jamais tout à fait le même.
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
        <div className="row" style={{ marginTop: 12, gap: 10, flexWrap: 'wrap' }}>
          {JOURNEY.map((m) => (
            <button key={m} className="btn btn-primary" onClick={() => newGame(m)}>
              {STR.modes[m].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
