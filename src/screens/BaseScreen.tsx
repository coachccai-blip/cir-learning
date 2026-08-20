import { useMemo, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { caseById } from '../data/cases';
import { computeBreakdown } from '../engine/cir/calculator';
import { scoreAssiette } from '../engine/cir/scoring';
import { toleranceForMode } from '../engine/economy';
import ruleset from '../data/rules/ruleset-2026.json';
import type { AssietteInput, Ruleset } from '../engine/types';

const RULESET = ruleset as Ruleset;

export function BaseScreen() {
  const clientId = useStore((s) => s.activeClientId);
  const save = useStore((s) => s.save);
  const commit = useStore((s) => s.commitBase);
  const go = useStore((s) => s.go);

  const c = clientId ? clientById(clientId) : null;
  const theCase = c ? caseById(c.caseId) : null;
  const cs = save?.portfolio.find((p) => p.clientId === clientId);

  const [input, setInput] = useState<AssietteInput>(() => ({
    personnelRatios: theCase ? Object.fromEntries(theCase.personnel.map((p) => [p.id, p.claimedRdRatio])) : {},
    amortizationIncluded: theCase ? Object.fromEntries(theCase.amortization.map((a) => [a.id, true])) : {},
    subcontractingIncluded: theCase ? Object.fromEntries(theCase.subcontracting.map((s) => [s.id, true])) : {},
    grantsDeducted: theCase ? Object.fromEntries(theCase.grants.map((g) => [g.id, false])) : {},
    decoysIncluded: theCase ? Object.fromEntries(theCase.decoys.map((d) => [d.id, false])) : {},
  }));
  const [done, setDone] = useState(false);

  const breakdown = useMemo(
    () => (theCase ? computeBreakdown(theCase, input, RULESET, { legal: false }) : null),
    [theCase, input],
  );

  if (!clientId || !c || !theCase || !save || !cs) return null;

  function setRatio(id: string, v: number) {
    setInput((i) => ({ ...i, personnelRatios: { ...i.personnelRatios, [id]: Math.max(0, Math.min(1, v)) } }));
  }
  function toggle(kind: keyof AssietteInput, id: string) {
    setInput((i) => {
      const rec = i[kind] as Record<string, boolean>;
      return { ...i, [kind]: { ...rec, [id]: !rec[id] } };
    });
  }

  function validate() {
    commit(clientId!, input);
    setDone(true);
  }

  if (done) {
    const score = scoreAssiette(theCase, input, RULESET, toleranceForMode(save.mode));
    return (
      <div className="container">
        <h1>{STR.base.result}</h1>
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="row">
            <div>
              <div className="muted">{STR.base.precision}</div>
              <div className="assiette-total">{Math.round(score.precision * 100)}%</div>
            </div>
            <span className="spacer" />
            <div className="center">
              <div className="muted">CIR retenu</div>
              <strong>{score.playerCir.toLocaleString('fr-FR')} €</strong>
              <div className="muted" style={{ fontSize: '0.8rem' }}>
                juste : {score.trueCir.toLocaleString('fr-FR')} €
              </div>
            </div>
          </div>
          <h3 style={{ marginTop: 16 }}>{STR.base.deviations}</h3>
          {score.deviations.length === 0 ? (
            <p className="delta-pos">{STR.base.noDeviation}</p>
          ) : (
            <ul>
              {score.deviations.map((d, i) => (
                <li key={i} style={{ marginBottom: 6 }}>
                  <strong className={d.delta > 0 ? 'delta-neg' : 'delta-pos'}>
                    {d.label} ({d.delta > 0 ? '+' : ''}
                    {d.delta.toLocaleString('fr-FR')} €)
                  </strong>{' '}
                  — {d.cause}
                </li>
              ))}
            </ul>
          )}
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => go('night')}>
            {STR.common.back}
          </button>
        </div>
      </div>
    );
  }

  const showHints = save.mode === 'discovery';

  return (
    <div className="container">
      <div className="row">
        <div>
          <h1>{STR.base.title}</h1>
          <p className="muted">
            {c.name} — {theCase.narrative}
          </p>
        </div>
        <span className="spacer" />
        <div className="panel-flat center">
          <div className="muted">{STR.base.computedCir}</div>
          <div className="assiette-total">{breakdown?.cir.toLocaleString('fr-FR')} €</div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>
            {STR.base.baseTotal} {breakdown?.base.toLocaleString('fr-FR')} €
          </div>
        </div>
      </div>

      {breakdown && breakdown.warnings.length > 0 && (
        <div className="feedback" style={{ marginTop: 12, borderColor: 'var(--gauge-security-bad)' }}>
          {breakdown.warnings.map((w, i) => (
            <div key={i}>⚠️ {w}</div>
          ))}
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <h3>{STR.base.personnel}</h3>
        <table className="assiette-table">
          <thead>
            <tr>
              <th>Personne</th>
              <th>Coût chargé</th>
              <th>{STR.base.ratio}</th>
              {showHints && <th>Indice</th>}
            </tr>
          </thead>
          <tbody>
            {theCase.personnel.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.name}
                  <div className="muted" style={{ fontSize: '0.75rem' }}>
                    {p.role}
                  </div>
                </td>
                <td>{p.grossCost.toLocaleString('fr-FR')} €</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={Math.round((input.personnelRatios[p.id] ?? 0) * 100)}
                    onChange={(e) => setRatio(p.id, (parseInt(e.target.value, 10) || 0) / 100)}
                    aria-label={`Taux R&D de ${p.name}`}
                  />{' '}
                  %
                  <div className="muted" style={{ fontSize: '0.72rem' }}>
                    {STR.base.hintClaimed} {Math.round(p.claimedRdRatio * 100)}%
                  </div>
                </td>
                {showHints && <td className="muted" style={{ fontSize: '0.78rem' }}>{p.trap ?? '—'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {theCase.amortization.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3>{STR.base.amortization}</h3>
          <table className="assiette-table">
            <tbody>
              {theCase.amortization.map((a) => (
                <tr key={a.id}>
                  <td>{a.asset}</td>
                  <td>{a.annualDepreciation.toLocaleString('fr-FR')} €</td>
                  <td>
                    <label className="row" style={{ gap: 6 }}>
                      <input type="checkbox" checked={input.amortizationIncluded[a.id] ?? false} onChange={() => toggle('amortizationIncluded', a.id)} />
                      {STR.base.include}
                    </label>
                  </td>
                  {showHints && <td className="muted" style={{ fontSize: '0.78rem' }}>{a.trap ?? '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {theCase.subcontracting.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3>{STR.base.subcontracting}</h3>
          <table className="assiette-table">
            <tbody>
              {theCase.subcontracting.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.provider}
                    <div className="muted" style={{ fontSize: '0.72rem' }}>
                      {s.hasMesrAgreement ? 'Agréé MESR' : 'Non agréé'} · rang {s.tier}
                      {s.related ? ' · entité liée' : ''}
                    </div>
                  </td>
                  <td>{s.amount.toLocaleString('fr-FR')} €</td>
                  <td>
                    <label className="row" style={{ gap: 6 }}>
                      <input type="checkbox" checked={input.subcontractingIncluded[s.id] ?? false} onChange={() => toggle('subcontractingIncluded', s.id)} />
                      {STR.base.include}
                    </label>
                  </td>
                  {showHints && <td className="muted" style={{ fontSize: '0.78rem' }}>{s.trap ?? '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {theCase.grants.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3>{STR.base.grants}</h3>
          <table className="assiette-table">
            <tbody>
              {theCase.grants.map((g) => (
                <tr key={g.id}>
                  <td>
                    {g.source}
                    <div className="muted" style={{ fontSize: '0.72rem' }}>
                      {g.type === 'grant' ? 'Subvention' : 'Avance remboursable'} · part R&D {Math.round(g.rdAllocationRatio * 100)}%
                    </div>
                  </td>
                  <td>{g.amount.toLocaleString('fr-FR')} €</td>
                  <td>
                    <label className="row" style={{ gap: 6 }}>
                      <input type="checkbox" checked={input.grantsDeducted[g.id] ?? false} onChange={() => toggle('grantsDeducted', g.id)} />
                      {STR.base.deduct}
                    </label>
                  </td>
                  {showHints && <td className="muted" style={{ fontSize: '0.78rem' }}>{g.trap ?? '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {theCase.decoys.length > 0 && (
        <div className="panel" style={{ marginTop: 16 }}>
          <h3>{STR.base.decoys}</h3>
          <table className="assiette-table">
            <tbody>
              {theCase.decoys.map((d) => (
                <tr key={d.id}>
                  <td>{d.label}</td>
                  <td>{d.amount.toLocaleString('fr-FR')} €</td>
                  <td>
                    <label className="row" style={{ gap: 6 }}>
                      <input type="checkbox" checked={input.decoysIncluded[d.id] ?? false} onChange={() => toggle('decoysIncluded', d.id)} />
                      {STR.base.include}
                    </label>
                  </td>
                  {showHints && <td className="muted" style={{ fontSize: '0.78rem' }}>{d.reason}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => go('night')}>
          {STR.common.back}
        </button>
        <button className="btn btn-primary" onClick={validate}>
          {STR.base.validate}
        </button>
      </div>
    </div>
  );
}
