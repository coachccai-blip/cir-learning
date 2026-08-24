import { useMemo, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { caseForClient, stepForDossier } from '../state/dossier';
import { computeBreakdown } from '../engine/cir/calculator';
import { scoreAssiette } from '../engine/cir/scoring';
import { Icon } from '../ui/Icon';
import { ManagerAssist } from '../components/ManagerAssist';
import ruleset from '../data/rules/ruleset-2026.json';
import type { AssietteInput, Ruleset } from '../engine/types';

const RULESET = ruleset as Ruleset;

/** Montant en euros, chasse fixe : les colonnes de chiffres s'alignent. */
function euros(n: number): string {
  return `${n.toLocaleString('fr-FR')} €`;
}

/**
 * Note d'indice. Le texte reste en encre courante et c'est le pictogramme qui
 * porte le sens : une phrase entière en vert ou en rouge, posée sur un panneau
 * déjà teinté, se lit mal — surtout en phase Technique.
 */
function Hint({ tone, children }: { tone: 'warn' | 'ok' | 'locked' | 'info'; children: React.ReactNode }) {
  const icon = tone === 'ok' ? 'check' : tone === 'locked' ? 'lock' : tone === 'info' ? 'info' : 'alert';
  const cls = tone === 'ok' ? 'note-ok' : tone === 'locked' ? 'note-locked' : tone === 'info' ? 'note-info' : 'note-warn';
  return (
    <div className={`note ${cls}`}>
      <Icon name={icon} size={16} />
      <span>{children}</span>
    </div>
  );
}

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
      { label: STR.base.rowOperating, player: playerBd.operatingAllowance, truth: trueBd.operatingAllowance },
      { label: STR.base.subcontracting, player: playerBd.subcontractingRetained, truth: trueBd.subcontractingRetained },
      { label: STR.base.rowDecoysIncluded, player: playerBd.decoysIncluded, truth: 0 },
      { label: STR.base.rowDeductions, player: -playerBd.grantsDeducted, truth: -trueBd.grantsDeducted },
    ].filter((r) => r.player !== 0 || r.truth !== 0);
    const maxAbs = Math.max(...compareRows.map((r) => Math.max(Math.abs(r.player), Math.abs(r.truth))), 1);
    const exact = score.deviations.length === 0;
    return (
      <div className="container">
        <h1>{STR.base.result}</h1>
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-label">
                <Icon name="target" size={15} /> {STR.base.precision}
              </span>
              <span className="assiette-total">{Math.round(score.precision * 100)} %</span>
            </div>
            <div className="stat">
              <span className="stat-label">
                <Icon name="euro" size={15} /> {STR.base.cirRetained}
              </span>
              <span className="stat-value">{euros(score.playerCir)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">
                <Icon name="scale" size={15} /> {STR.base.cirTrue}
              </span>
              <span className="stat-value">{euros(score.trueCir)}</span>
            </div>
          </div>

          <div className="panel-title" style={{ marginTop: 24 }}>
            <Icon name="trend" size={19} />
            <h3>{STR.base.compareTitle}</h3>
          </div>
          <div>
            {compareRows.map((r) => {
              const match = Math.abs(r.player - r.truth) < Math.max(1, r.truth * 0.01);
              const pw = (Math.abs(r.player) / maxAbs) * 100;
              const tw = (Math.abs(r.truth) / maxAbs) * 100;
              return (
                <div className="compare-row" key={r.label}>
                  <div className="labels">
                    <span>{r.label}</span>
                    <span className="num">
                      <strong className={match ? 'delta-pos' : 'delta-neg'}>{euros(r.player)}</strong>
                      <span className="muted"> / {euros(r.truth)}</span>
                    </span>
                  </div>
                  <div className="compare-track">
                    <div
                      className="compare-fill"
                      style={{
                        width: `${pw}%`,
                        background: match ? 'var(--pos)' : 'var(--neg)',
                        opacity: 0.85,
                      }}
                    />
                    <div className="compare-marker" style={{ left: `calc(${tw}% - 1px)` }} />
                  </div>
                </div>
              );
            })}
            <p className="muted" style={{ fontSize: '0.76rem', marginTop: 8 }}>
              {STR.base.compareLegend}
            </p>
          </div>

          <div className="panel-title" style={{ marginTop: 24 }}>
            <Icon name={exact ? 'check' : 'alert'} size={19} />
            <h3>{STR.base.deviations}</h3>
          </div>
          {exact ? (
            <div className="note note-ok">
              <Icon name="check" size={16} />
              <span>{STR.base.noDeviation}</span>
            </div>
          ) : (
            <ul className="verdict-list">
              {score.deviations.map((d, i) => (
                <li key={i} className={d.delta > 0 ? 'verdict-bad' : 'verdict-mid'}>
                  <Icon name={d.delta > 0 ? 'trend' : 'trendDown'} size={16} />
                  <span>
                    <strong>
                      {d.label} ({d.delta > 0 ? '+' : ''}
                      {euros(d.delta)})
                    </strong>{' '}
                    — {d.cause}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => go('night')}>
            <Icon name="arrowLeft" size={17} /> {STR.common.back}
          </button>
        </div>
      </div>
    );
  }

  // Tous les indices sont à l'écran : le joueur doit pouvoir construire
  // l'assiette juste sans deviner, la difficulté venant de la tolérance et des
  // pièges, jamais d'une information cachée.
  const collected = cs.piecesCollected;


  return (
    <div className="container">
      <div className="row">
        <div style={{ flex: '1 1 340px' }}>
          <h1>{STR.base.title}</h1>
          {/* La narration d'un dossier commence par le nom de l'entreprise ;
              le répéter en préfixe donnait « Ovalis — Ovalis cherche à… ». */}
          <p className="muted lede">
            {theCase.narrative.startsWith(c.name) ? (
              theCase.narrative
            ) : (
              <>
                <strong>{c.name}</strong> — {theCase.narrative}
              </>
            )}
          </p>
        </div>
        <div className="panel-flat cir-readout">
          <span className="stat-label">
            <Icon name="euro" size={15} /> {STR.base.computedCir}
          </span>
          <span className="assiette-total">{euros(breakdown?.cir ?? 0)}</span>
          <span className="muted" style={{ fontSize: '0.8rem' }}>
            {STR.base.baseTotal} {euros(breakdown?.base ?? 0)}
          </span>
        </div>
      </div>

      <div className="panel-flat progress-banner" style={{ marginTop: 16 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className="tag tag-accent">
            <Icon name="ladder" size={14} /> {STR.base.dossierNo(step.index)}
          </span>
          <span className="tag">
            <Icon name="target" size={14} /> {STR.base.toleranceTag(step.tolerance)}
          </span>
          {step.postes.map((poste) => {
            const isNew = step.introduces.includes(poste);
            return (
              <span key={poste} className={`tag${isNew ? ' tag-accent' : ''}`}>
                {isNew && <Icon name="sparkle" size={14} />}
                {STR.base.postes[poste]}
              </span>
            );
          })}
        </div>
        {step.introduces.length > 0 && (
          <div className="note note-info" style={{ marginTop: 12 }}>
            <Icon name="sparkle" size={16} />
            <span>
              <strong>{STR.base.newPoste}</strong> —{' '}
              {step.introduces.map((poste) => STR.base.posteIntro[poste]).join(' ')}
            </span>
          </div>
        )}
      </div>

      {/* La manager lit la méthode réellement affichée : une seule source, et
          le joueur peut écouter la consigne en travaillant sur le tableau. */}
      <ManagerAssist
        text={[
          STR.manager.brief.base,
          ...step.postes.map((poste) => `${STR.base.postes[poste]} : ${STR.base.methode[poste]}`),
        ].join(' ')}
      />

      <div className="panel-flat method-card" style={{ marginTop: 16 }}>
        <div className="panel-title">
          <Icon name="bulb" size={19} />
          <h3>{STR.base.methodTitle(step.postes.length)}</h3>
        </div>
        <ol className="method-list">
          {step.postes.map((poste) => (
            <li key={poste}>
              <strong>{STR.base.postes[poste]}</strong> — {STR.base.methode[poste]}
            </li>
          ))}
        </ol>
        <p className="muted" style={{ fontSize: '0.82rem', marginTop: 10 }}>
          {STR.base.methodHelp}
        </p>
      </div>

      {breakdown && breakdown.warnings.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {breakdown.warnings.map((w, i) => (
            <div className="note note-bad" key={i}>
              <Icon name="alert" size={16} />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="panel-title">
          <Icon name="users" size={19} />
          <h3>{STR.base.personnel}</h3>
        </div>
        <table className="assiette-table">
          <thead>
            <tr>
              <th>{STR.base.colPerson}</th>
              <th className="num">{STR.base.colPayroll}</th>
              <th>{STR.base.ratio}</th>
              <th className="hint-cell">{STR.base.colEvidence}</th>
            </tr>
          </thead>
          <tbody>
            {theCase.personnel.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="who">{p.name}</div>
                  <div className="muted" style={{ fontSize: '0.78rem' }}>
                    {p.role}
                  </div>
                </td>
                <td className="num">{euros(p.grossCost)}</td>
                <td>
                  <span className="ratio-field">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={Math.round((input.personnelRatios[p.id] ?? 0) * 100)}
                      onChange={(e) => setRatio(p.id, (parseInt(e.target.value, 10) || 0) / 100)}
                      aria-label={`${STR.base.ratio} — ${p.name}`}
                    />
                    <span>%</span>
                  </span>
                  <div className="muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                    {STR.base.hintClaimed} {Math.round(p.claimedRdRatio * 100)} %
                  </div>
                </td>
                <td className="hint-cell">
                  {p.trap ? (
                    <>
                      <Hint tone="warn">{p.trap}</Hint>
                      {/* Le taux justifiable est donné : le joueur doit pouvoir
                          construire l'assiette juste sans deviner. */}
                      {true ? (
                        <Hint tone="ok">
                          <strong>
                            {STR.base.hintDefensible} {Math.round(p.trueRdRatio * 100)} %
                          </strong>
                        </Hint>
                      ) : (
                        <Hint tone="locked">{STR.base.hintLocked}</Hint>
                      )}
                      {p.evidence && !collected.includes(p.evidence) && (
                        <p className="muted" style={{ fontSize: '0.78rem', marginTop: 6 }}>
                          {STR.base.hintMissingPiece}
                        </p>
                      )}
                    </>
                  ) : (
                    <Hint tone="ok">{STR.base.hintConsistent}</Hint>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {theCase.amortization.length > 0 && (
        <div className="panel" style={{ marginTop: 20 }}>
          <div className="panel-title">
            <Icon name="building" size={19} />
            <h3>{STR.base.amortization}</h3>
          </div>
          <table className="assiette-table">
            <thead>
              <tr>
                <th>{STR.base.colAsset}</th>
                <th className="num">{STR.base.colAmount}</th>
                <th>{STR.base.colDecision}</th>
                <th className="hint-cell">{STR.base.colEvidence}</th>
              </tr>
            </thead>
            <tbody>
              {theCase.amortization.map((a) => (
                <tr key={a.id}>
                  <td className="who">{a.asset}</td>
                  <td className="num">{euros(a.annualDepreciation)}</td>
                  <td>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={input.amortizationIncluded[a.id] ?? false}
                        onChange={() => toggle('amortizationIncluded', a.id)}
                      />
                      {STR.base.include}
                    </label>
                  </td>
                  <td className="hint-cell">
                    {a.trap ? <Hint tone="warn">{a.trap}</Hint> : <Hint tone="ok">{STR.base.hintAssetOk}</Hint>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {theCase.subcontracting.length > 0 && (
        <div className="panel" style={{ marginTop: 20 }}>
          <div className="panel-title">
            <Icon name="link" size={19} />
            <h3>{STR.base.subcontracting}</h3>
          </div>
          <table className="assiette-table">
            <thead>
              <tr>
                <th>{STR.base.colProvider}</th>
                <th className="num">{STR.base.colAmount}</th>
                <th>{STR.base.colDecision}</th>
                <th className="hint-cell">{STR.base.colEvidence}</th>
              </tr>
            </thead>
            <tbody>
              {theCase.subcontracting.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="who">{s.provider}</div>
                    <div className="muted" style={{ fontSize: '0.75rem' }}>
                      {s.hasMesrAgreement ? STR.base.subAgreed : STR.base.subNotAgreed} · {STR.base.subTier(s.tier)}
                      {s.related ? ` · ${STR.base.subRelated}` : ''}
                    </div>
                  </td>
                  <td className="num">{euros(s.amount)}</td>
                  <td>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={input.subcontractingIncluded[s.id] ?? false}
                        onChange={() => toggle('subcontractingIncluded', s.id)}
                      />
                      {STR.base.include}
                    </label>
                  </td>
                  <td className="hint-cell">
                    {s.trap ? <Hint tone="warn">{s.trap}</Hint> : <Hint tone="ok">{STR.base.hintSubOk(s.tier)}</Hint>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {theCase.grants.length > 0 && (
        <div className="panel" style={{ marginTop: 20 }}>
          <div className="panel-title">
            <Icon name="scale" size={19} />
            <h3>{STR.base.grants}</h3>
          </div>
          <table className="assiette-table">
            <thead>
              <tr>
                <th>{STR.base.colSource}</th>
                <th className="num">{STR.base.colAmount}</th>
                <th>{STR.base.colDecision}</th>
                <th className="hint-cell">{STR.base.colEvidence}</th>
              </tr>
            </thead>
            <tbody>
              {theCase.grants.map((g) => (
                <tr key={g.id}>
                  <td>
                    <div className="who">{g.source}</div>
                    <div className="muted" style={{ fontSize: '0.75rem' }}>
                      {STR.base.grantKind[g.type]} · {STR.base.grantShare(Math.round(g.rdAllocationRatio * 100))}
                    </div>
                  </td>
                  <td className="num">{euros(g.amount)}</td>
                  <td>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={input.grantsDeducted[g.id] ?? false}
                        onChange={() => toggle('grantsDeducted', g.id)}
                      />
                      {STR.base.deduct}
                    </label>
                  </td>
                  <td className="hint-cell">
                    <Hint tone="warn">{g.trap ?? STR.base.hintGrantDefault}</Hint>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {theCase.decoys.length > 0 && (
        <div className="panel" style={{ marginTop: 20 }}>
          <div className="panel-title">
            <Icon name="alert" size={19} />
            <h3>{STR.base.decoys}</h3>
          </div>
          <table className="assiette-table">
            <thead>
              <tr>
                <th>{STR.base.colItem}</th>
                <th className="num">{STR.base.colAmount}</th>
                <th>{STR.base.colDecision}</th>
                <th className="hint-cell">{STR.base.colEvidence}</th>
              </tr>
            </thead>
            <tbody>
              {theCase.decoys.map((d) => (
                <tr key={d.id}>
                  <td className="who">{d.label}</td>
                  <td className="num">{euros(d.amount)}</td>
                  <td>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={input.decoysIncluded[d.id] ?? false}
                        onChange={() => toggle('decoysIncluded', d.id)}
                      />
                      {STR.base.include}
                    </label>
                  </td>
                  <td className="hint-cell">
                    <Hint tone="warn">{d.reason}</Hint>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="row" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => go('night')}>
          <Icon name="arrowLeft" size={17} /> {STR.common.back}
        </button>
        <button className="btn btn-primary" data-sfx="validate" onClick={validate}>
          <Icon name="check" size={17} /> {STR.base.validate}
        </button>
      </div>
    </div>
  );
}
