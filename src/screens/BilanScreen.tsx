import { STR } from '../i18n/fr';
import { useStore, nextMilestone } from '../state/store';
import { GaugesBar } from '../components/Gauges';
import { codexById } from '../data/codex';
import { gradeForXp, nextGrade } from '../engine/economy';
import { SEASON_LENGTH } from '../data/calendar';

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

  return (
    <div className="container">
      <h1>{STR.bilan.title}</h1>
      <p className="muted">
        {STR.hud.cycle} {save.cycle} {STR.common.of} {SEASON_LENGTH}
      </p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', marginTop: 16 }}>
        <div className="panel">
          <h3>{STR.bilan.gaugeChanges}</h3>
          <GaugesBar gauges={save.gauges} />
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
          <h3>{STR.bilan.revenue}</h3>
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
                {next.xp} XP → {next.label}
              </span>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>{STR.bilan.codex}</h3>
          {codexNew.length === 0 ? (
            <p className="muted">—</p>
          ) : (
            <ul style={{ fontSize: '0.85rem' }}>
              {codexNew.slice(-6).map((id) => (
                <li key={id}>📄 {codexById(id)?.title ?? id}</li>
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
        <button className="btn btn-primary" onClick={advanceCycle}>
          {isLast ? STR.audit.title : STR.bilan.next} →
        </button>
      </div>
    </div>
  );
}
