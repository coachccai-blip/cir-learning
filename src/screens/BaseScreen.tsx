import { useMemo, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { caseForClient, stepForDossier } from '../state/dossier';
import { computeBreakdown } from '../engine/cir/calculator';
import { scoreAssiette } from '../engine/cir/scoring';
import ruleset from '../data/rules/ruleset-2026.json';
import type { AssietteInput, Ruleset } from '../engine/types';

const RULESET = ruleset as Ruleset;

export function BaseScreen() {
  const clientId = useStore((s) => s.activeClientId);
  const save = useStore((s) => s.save);
  const commit = useStore((s) => s.commitBase);
  const go = useStore((s) => s.go);

  const c = clientId ? clientById(clientId) : null;
  // Le dossier servi, pas le dossier écrit : variante de la partie en cours,
  // restreinte aux postes que la courbe d'apprentissage a déjà introduits.
  const step = save && clientId ? stepForDossier(save, clientId) : null;
  const theCase = save && clientId ? caseForClient(save, clientId) : null;
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

  if (!clientId || !c || !theCase || !save || !cs || !step) return null;

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
    const score = scoreAssiette(theCase, input, RULESET, step.tolerance);
    const playerBd = computeBreakdown(theCase, input, RULESET, { legal: false });
    const trueBd = computeBreakdown(theCase, null, RULESET, { legal: true });
    const compareRows = [
      { label: STR.base.personnel, player: playerBd.personnel, truth: trueBd.personnel },
      { label: STR.base.amortization, player: playerBd.amortization, truth: trueBd.amortization },
      { label: 'Forfait de fonctionnement', player: playerBd.operatingAllowance, truth: trueBd.operatingAllowance },
      { label: STR.base.subcontracting, player: playerBd.subcontractingRetained, truth: trueBd.subcontractingRetained },
      { label: 'Postes supprimés inclus', player: playerBd.decoysIncluded, truth: 0 },
      { label: 'Déductions (aides)', player: -playerBd.grantsDeducted, truth: -trueBd.grantsDeducted },
    ].filter((r) => r.player !== 0 || r.truth !== 0);
    const maxAbs = Math.max(...compareRows.map((r) => Math.max(Math.abs(r.player), Math.abs(r.truth))), 1);
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

          <h3 style={{ marginTop: 16 }}>Votre assiette vs l’assiette juste</h3>
          <div style={{ marginTop: 10 }}>
            {compareRows.map((r) => {
              const match = Math.abs(r.player - r.truth) < Math.max(1, r.truth * 0.01);
              const pw = (Math.abs(r.player) / maxAbs) * 100;
              const tw = (Math.abs(r.truth) / maxAbs) * 100;
              return (
                <div className="compare-row" key={r.label}>
                  <div className="labels">
                    <span>{r.label}</span>
                    <span>
                      <strong className={match ? 'delta-pos' : 'delta-neg'}>
                        {r.player.toLocaleString('fr-FR')} €
                      </strong>
                      <span className="muted"> / juste {r.truth.toLocaleString('fr-FR')} €</span>
                    </span>
                  </div>
                  <div className="compare-track">
                    <div
                      className="compare-fill"
                      style={{
                        width: `${pw}%`,
                        background: match ? 'var(--gauge-security-good)' : 'var(--gauge-security-bad)',
                        opacity: 0.85,
                      }}
                    />
                    <div className="compare-marker" style={{ left: `calc(${tw}% - 1px)` }} title="valeur juste" />
                  </div>
                </div>
              );
            })}
            <p className="muted" style={{ fontSize: '0.72rem', marginTop: 4 }}>
              Barre = votre montant retenu · trait vertical = le montant juste. Vert = poste exact, rouge = écart.
            </p>
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

  // En Onboarding, tous les indices sont à l'écran : le joueur doit pouvoir
  // construire l'assiette juste sans deviner, la difficulté venant de la
  // tolérance et des pièges. En Expert, le taux opposable se gagne sur le
  // terrain (cf. `revealsTruth`).
  const collected = cs.piecesCollected;

  /**
   * Le taux réellement opposable est-il visible ? En deuxième saison, le
   * dirigeant embellit sciemment : seul le consultant qui a rapporté la pièce
   * connaît le chiffre. Sans elle, il faut trancher au jugement.
   */
  function revealsTruth(evidence: string | undefined): boolean {
    if (save!.mode !== 'expert') return true;
    return !evidence || collected.includes(evidence);
  }

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

      <div className="panel-flat progress-banner" style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <span className="tag tag-accent">{STR.base.dossierNo(step.index)}</span>
          <span className="tag">{STR.base.toleranceTag(step.tolerance)}</span>
          {step.postes.map((poste) => (
            <span key={poste} className={`tag${step.introduces.includes(poste) ? ' tag-accent' : ''}`}>
              {step.introduces.includes(poste) ? '✨ ' : ''}
              {STR.base.postes[poste]}
            </span>
          ))}
        </div>
        {step.introduces.length > 0 && (
          <p style={{ marginTop: 8, fontSize: '0.88rem' }}>
            <strong>{STR.base.newPoste}</strong> —{' '}
            {step.introduces.map((poste) => STR.base.posteIntro[poste]).join(' ')}
          </p>
        )}
      </div>

      <div className="panel-flat" style={{ marginTop: 12, borderLeft: '4px solid var(--accent)' }}>
        <strong>{STR.base.methodTitle(step.postes.length)}</strong>
        <ol style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: '0.9rem', lineHeight: 1.65 }}>
          {step.postes.map((poste) => (
            <li key={poste}>
              <strong>{STR.base.postes[poste]}</strong> — {STR.base.methode[poste]}
            </li>
          ))}
        </ol>
        <p className="muted" style={{ fontSize: '0.82rem', marginTop: 6 }}>
          La colonne « Ce que disent les pièces » vous donne l’information nécessaire ligne par ligne.
          Le CIR se recalcule en direct à chaque modification.
        </p>
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
              <th>Ce que disent les pièces</th>
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
                <td style={{ fontSize: '0.82rem' }}>
                  {p.trap ? (
                    <>
                      <span className="delta-neg">⚠ {p.trap}</span>
                      {/* En Onboarding, le taux justifiable est donné : le joueur doit
                          pouvoir construire l'assiette juste sans deviner. En Expert, il
                          ne s'obtient qu'en rapportant la pièce du terrain — c'est tout
                          l'intérêt d'avoir mené les entretiens. */}
                      {revealsTruth(p.evidence) ? (
                        <div className="delta-pos" style={{ marginTop: 4, fontWeight: 700 }}>
                          → {STR.base.hintDefensible} {Math.round(p.trueRdRatio * 100)} %
                        </div>
                      ) : (
                        <div className="muted" style={{ marginTop: 4, fontWeight: 700 }}>
                          🔒 {STR.base.hintLocked}
                        </div>
                      )}
                      {p.evidence && !collected.includes(p.evidence) && (
                        <div className="muted" style={{ marginTop: 4 }}>
                          {STR.base.hintMissingPiece}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="delta-pos">✓ Taux cohérent avec les pièces</span>
                  )}
                </td>
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
                  <td style={{ fontSize: '0.82rem' }}>
                    {a.trap ? <span className="delta-neg">⚠ {a.trap}</span> : <span className="delta-pos">✓ Affecté à la R&D</span>}
                  </td>
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
                  <td style={{ fontSize: '0.82rem' }}>
                    {s.trap ? (
                      <span className="delta-neg">⚠ {s.trap}</span>
                    ) : (
                      <span className="delta-pos">✓ Agréé MESR, rang {s.tier} — éligible</span>
                    )}
                  </td>
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
                  <td style={{ fontSize: '0.82rem' }}>
                    <span className="delta-neg">
                      ⚠ {g.trap ?? 'Financement public : à déduire de l’assiette.'}
                    </span>
                  </td>
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
                  <td style={{ fontSize: '0.82rem' }}>
                    <span className="delta-neg">⚠ {d.reason}</span>
                  </td>
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
