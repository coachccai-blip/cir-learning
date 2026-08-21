import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { Avatar } from '../avatars/Avatar';
import { codexById } from '../data/codex';

// Scène de règlement de la promesse (§6.3) — le climax émotionnel du bilan.
export function SettlementScreen() {
  const settlement = useStore((s) => s.settlement);
  const save = useStore((s) => s.save);
  const closeSettlement = useStore((s) => s.closeSettlement);
  if (!settlement || !save) return null;

  const client = clientById(settlement.clientId);
  const cs = save.portfolio.find((p) => p.clientId === settlement.clientId);
  const mood = cs?.mood ?? 50;
  const negative = settlement.relation < 0;
  const lesson = codexById('cdx_estimer');

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <h1 style={{ marginBottom: 4 }}>Le moment de vérité</h1>
      <p className="muted">
        {client.name} — promesse : {settlement.promiseMin.toLocaleString('fr-FR')}
        {settlement.promiseMax !== settlement.promiseMin
          ? `–${settlement.promiseMax.toLocaleString('fr-FR')}`
          : ''}{' '}
        € · CIR réel : <strong>{settlement.realCir.toLocaleString('fr-FR')} €</strong>
      </p>

      <div className="dialogue-wrap" style={{ marginTop: 20 }}>
        <div className="panel speaker-card">
          <div className={`avatar${settlement.churn ? ' shake' : ''}`}>
            <Avatar
              seed={client.contact.avatarSeed}
              expression={settlement.churn ? 'ferme' : negative ? 'agace' : 'satisfait'}
              mood={mood}
            />
          </div>
          <strong>{client.contact.name}</strong>
          <div className="muted" style={{ fontSize: '0.8rem' }}>
            {client.contact.role}
          </div>
        </div>

        <div>
          <div className="bubble" style={settlement.churn ? { borderColor: 'var(--gauge-security-bad)' } : undefined}>
            {settlement.reproach}
          </div>

          <div className="feedback" style={{ borderLeftColor: negative ? 'var(--gauge-security-bad)' : 'var(--gauge-security-good)' }}>
            <div className="deltas">
              <span className={settlement.relation >= 0 ? 'delta-pos' : 'delta-neg'}>
                {STR.gauges.relation} {settlement.relation >= 0 ? '+' : ''}
                {settlement.relation}
              </span>
              {settlement.profitability !== 0 && (
                <span className={settlement.profitability >= 0 ? 'delta-pos' : 'delta-neg'}>
                  {STR.gauges.profitability} {settlement.profitability >= 0 ? '+' : ''}
                  {settlement.profitability}
                </span>
              )}
            </div>
            <div>
              <strong>{settlement.label}.</strong>{' '}
              {settlement.churn
                ? 'La confiance est durablement entamée : ce client risque de ne pas reconduire la mission.'
                : negative
                  ? 'Un écart expliqué pièces à l’appui limite la casse — mais la promesse initiale reste dans les mémoires.'
                  : 'Une fourchette prudente tenue vaut toutes les surenchères.'}
            </div>
            {lesson && <div className="rule">💡 {lesson.body}</div>}
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={closeSettlement} autoFocus>
              {STR.dialogue.continue}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
