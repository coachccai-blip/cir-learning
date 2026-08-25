import { STR } from '../i18n/fr';
import { Icon } from '../ui/Icon';
import { useStore, nextMilestone } from '../state/store';
import { GaugesBar } from '../components/Gauges';
import { Sparkline } from '../components/Sparkline';
import { codexById } from '../data/codex';
import { gradeForXp, nextGrade } from '../engine/economy';
import { SEASON_LENGTH } from '../data/calendar';
import { finalAuditDue } from '../engine/auditgate';
import balance from '../data/balance.json';

export function BilanScreen() {
  const save = useStore((s) => s.save);
  const advanceCycle = useStore((s) => s.advanceCycle);
  if (!save) return null;

  const gaugeChanges = save.cycleLog.filter((l) => l.gauge === 'relation' || l.gauge === 'security' || l.gauge === 'profitability');
  const codexNew = save.codexUnlocked;
  const grade = gradeForXp(save.xp);
  const next = nextGrade(save.xp);
  const ms = nextMilestone(save.cycle + 1);
  const isLast = save.cycle >= SEASON_LENGTH;
  // Le bouton annonçait « Contrôle fiscal » à toutes les fins de saison, même
  // quand aucun contrôle n'était dû : il promettait une scène qui n'arrivait
  // pas. Il dit maintenant où l'on va vraiment.
  const endLabel = finalAuditDue(
    save.gauges.security,
    balance.auditSecurityThreshold,
    save.portfolio,
  )
    ? STR.audit.title
    : STR.end.title;

  return (
    <div className="container">
      <h1>{STR.bilan.title}</h1>
      <p className="muted">
        {STR.hud.cycle} {save.cycle} {STR.common.of} {SEASON_LENGTH}
      </p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', marginTop: 16 }}>
        <div className="panel">
          <div className="panel-title">
            <Icon name="trend" size={19} />
            <h3>{STR.bilan.gaugeChanges}</h3>
          </div>
          <GaugesBar gauges={save.gauges} />
          {save.gaugeHistory.length >= 1 && (
            <div className="stack" style={{ gap: 8, marginTop: 14 }}>
              <Sparkline
                label={STR.gauges.relation}
                color="var(--gauge-relation)"
                values={[...save.gaugeHistory.map((g) => g.relation), save.gauges.relation]}
              />
              <Sparkline
                label={STR.gauges.security}
                color="var(--gauge-security-good)"
                values={[...save.gaugeHistory.map((g) => g.security), save.gauges.security]}
              />
              <Sparkline
                label={STR.gauges.profitability}
                color="var(--gauge-profitability)"
                values={[...save.gaugeHistory.map((g) => g.profitability), save.gauges.profitability]}
              />
            </div>
          )}
          <ul style={{ marginTop: 12, fontSize: '0.85rem' }}>
            {gaugeChanges.length === 0 && <li className="muted">{STR.bilan.noChange}</li>}
            {gaugeChanges.slice(-6).map((l, i) => (
              <li key={i}>
                <strong className={l.delta > 0 ? 'delta-pos' : 'delta-neg'}>
                  {l.delta > 0 ? '+' : ''}
                  {l.delta} {STR.gauges[l.gauge as 'relation' | 'security' | 'profitability']}
                </strong>{' '}
                : {l.cause}
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <div className="panel-title">
            <Icon name="euro" size={19} />
            <h3>{STR.bilan.revenue}</h3>
          </div>
          <p className="assiette-total">{save.revenue.signed.toLocaleString('fr-FR')} €</p>
          <p className="muted">CA signé cette saison</p>

          <h3 style={{ marginTop: 16 }}>{STR.bilan.xp}</h3>
          <p>
            {grade.label} — {save.xp} XP
          </p>
          {next && (
            <div className="progress-line">
              <div className="bar">
                <div style={{ width: `${Math.min(100, (save.xp / next.xp) * 100)}%` }} />
              </div>
              <span className="muted" style={{ fontSize: '0.8rem' }}>
                {next.xp} XP <Icon name="arrowRight" size={14} /> {next.label}
              </span>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-title">
            <Icon name="book" size={19} />
            <h3>{STR.bilan.codex}</h3>
          </div>
          {codexNew.length === 0 ? (
            <p className="muted">—</p>
          ) : (
            <ul style={{ fontSize: '0.85rem' }}>
              {codexNew.slice(-6).map((id) => (
                <li key={id}>
                <Icon name="doc" size={15} /> {codexById(id)?.title ?? id}
              </li>
              ))}
            </ul>
          )}
          {ms && (
            <>
              <h3 style={{ marginTop: 16 }}>{STR.bilan.deadline}</h3>
              <p style={{ fontSize: '0.88rem' }}>
                <strong>
                  {ms.date} (S{ms.cycle})
                </strong>{' '}
                — {ms.label}
              </p>
              {ms.consequence && (
                <p className="muted" style={{ fontSize: '0.8rem' }}>
                  Si raté : {ms.consequence}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="row" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
        {/* Le cycle repart en phase Relation client : la bascule s'entend. */}
        <button className="btn btn-primary" data-sfx="phase-relation" onClick={advanceCycle}>
          {isLast ? endLabel : STR.bilan.next} <Icon name="arrowRight" size={17} />
        </button>
      </div>
    </div>
  );
}
