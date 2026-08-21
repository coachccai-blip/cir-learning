import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { Avatar } from '../avatars/Avatar';
import { ARCHETYPE_LABEL, expressionForMood } from '../engine/dialogue/mood';

export function ClientScreen() {
  const clientId = useStore((s) => s.activeClientId);
  const save = useStore((s) => s.save);
  const go = useStore((s) => s.go);
  if (!clientId || !save) return null;

  const c = clientById(clientId);
  const cs = save.portfolio.find((p) => p.clientId === clientId);
  if (!cs) return null;

  return (
    <div className="container">
      <div className="row">
        <h1>{c.name}</h1>
        <span className="spacer" />
        <button className="btn" onClick={() => go(save.phase === 'DAY' ? 'day' : 'night')}>
          {STR.common.back}
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '260px 1fr', marginTop: 16 }}>
        <div className="panel center">
          <div className="avatar" style={{ width: 150, height: 150, margin: '0 auto 12px' }}>
            <Avatar seed={c.contact.avatarSeed} expression={expressionForMood(cs.mood)} mood={cs.mood} />
          </div>
          <strong>{c.contact.name}</strong>
          <div className="muted">{c.contact.role}</div>
          <div className="tag" style={{ marginTop: 8 }}>
            {ARCHETYPE_LABEL[c.contact.archetype]}
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <p>{c.pitch}</p>
            <div className="row" style={{ marginTop: 8 }}>
              <span className="tag">
                {STR.common.sector} : {c.sectorLabel}
              </span>
              <span className="tag">
                {STR.common.difficulty} : {'★'.repeat(c.profileDifficulty)}
              </span>
              <span className="tag">{c.headcount} salariés</span>
            </div>
          </div>

          <div className="panel">
            <div className="row">
              <div>
                <div className="muted">{STR.common.mood}</div>
                <strong>{Math.round(cs.mood)}</strong>
              </div>
              <span className="spacer" />
              <div>
                <div className="muted">{STR.common.trust}</div>
                <strong>{Math.round(cs.trust)}</strong>
              </div>
            </div>
            {cs.promise && (
              <p style={{ marginTop: 12, color: 'var(--accent-text)' }}>
                {STR.common.promise} : {cs.promise.min.toLocaleString('fr-FR')}–{cs.promise.max.toLocaleString('fr-FR')} €
                {cs.promise.kind === 'precise' ? ' (chiffre précis engagé)' : ' (fourchette)'}
              </p>
            )}
          </div>

          <div className="panel">
            <h3>{STR.common.pieces}</h3>
            {cs.piecesCollected.length === 0 ? (
              <p className="muted">Aucune pièce collectée pour l’instant.</p>
            ) : (
              <div className="row">
                {cs.piecesCollected.map((p) => (
                  <span className="tag tag-accent" key={p}>
                    {p.replace('piece_', '').replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
            <div className="row" style={{ marginTop: 12 }}>
              {cs.scores.discovery !== null && <span className="tag">Découverte {cs.scores.discovery}</span>}
              {cs.scores.kickoff !== null && <span className="tag">Kick-off {cs.scores.kickoff}</span>}
              {cs.scores.qualification !== null && <span className="tag">Qualif {cs.scores.qualification}%</span>}
              {cs.scores.base !== null && <span className="tag">Assiette {Math.round(cs.scores.base * 100)}%</span>}
              {cs.scores.justification !== null && <span className="tag">Justif {cs.scores.justification}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
