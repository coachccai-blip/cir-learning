import { useMemo, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { caseById } from '../data/cases';
import { cardsetById } from '../data/cards';
import { Avatar } from '../avatars/Avatar';
import { buildAuditFindings, resolveAudit } from '../engine/audit';
import ruleset from '../data/rules/ruleset-2026.json';
import balance from '../data/balance.json';
import type { Ruleset } from '../engine/types';

const RULESET = ruleset as Ruleset;

export function AuditScreen() {
  const save = useStore((s) => s.save);
  const go = useStore((s) => s.go);
  const runAudit = useStore((s) => s.runAudit);

  // Sélection du dossier contrôlé selon le mode.
  const target = useMemo(() => {
    if (!save) return null;
    if (save.mode === 'discovery') return null;
    const dossiers = save.portfolio.filter((c) => c.assietteInput !== null);
    if (dossiers.length === 0) return null;
    if (save.mode === 'onboarding' && save.gauges.security >= balance.auditSecurityThreshold) {
      // pas de contrôle si sécurité suffisante
      return null;
    }
    // le plus faible (précision d'assiette la plus basse)
    return dossiers.slice().sort((a, b) => (a.scores.base ?? 1) - (b.scores.base ?? 1))[0];
  }, [save]);

  const [idx, setIdx] = useState(0);
  const [defended, setDefended] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  if (!save) return null;

  if (!target) {
    return (
      <div className="container">
        <div className="panel center" style={{ marginTop: 40 }}>
          <h1>{STR.audit.title}</h1>
          <p className="muted">
            {save.mode === 'discovery'
              ? 'Mode découverte : pas de contrôle fiscal. Direction le bilan de saison.'
              : 'Vos dossiers sont suffisamment solides : pas de rappel cette saison.'}
          </p>
          <button className="btn btn-primary" onClick={() => go('end')}>
            {STR.end.title} →
          </button>
        </div>
      </div>
    );
  }

  const c = clientById(target.clientId);
  const theCase = caseById(c.caseId);
  const cardset = cardsetById(c.cardsetId);
  const findings = buildAuditFindings(target, theCase, cardset, RULESET);

  if (findings.length === 0 || finished) {
    const result = resolveAudit(
      findings,
      defended,
      target.scores.justification ?? 0,
      target.playerCir ?? 0,
      target.feeRate,
    );
    return (
      <div className="container">
        <h1>{STR.audit.result}</h1>
        <div className="panel" style={{ marginTop: 16 }}>
          <h2
            className={
              result.outcome === 'validated' ? 'delta-pos' : result.outcome === 'partial' ? '' : 'delta-neg'
            }
          >
            {STR.audit[result.outcome]}
          </h2>
          {result.reassessedAmount > 0 && (
            <p>
              {STR.audit.reassessed} : <strong>{result.reassessedAmount.toLocaleString('fr-FR')} €</strong> · honoraires
              remboursés {result.feesRefunded.toLocaleString('fr-FR')} €
            </p>
          )}
          <ul style={{ marginTop: 12 }}>
            {result.findings.map((f) => (
              <li key={f.finding.id} className={f.defended ? 'delta-pos' : 'delta-neg'}>
                {f.defended ? '✓ ' : '✗ '}
                {f.finding.label}
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => {
              runAudit(target.clientId, result.outcome, result.reassessedAmount);
              go('end');
            }}
          >
            {STR.end.title} →
          </button>
        </div>
      </div>
    );
  }

  const finding = findings[idx];

  function answer(defend: boolean) {
    if (defend) setDefended((d) => [...d, finding.id]);
    if (idx + 1 >= findings.length) setFinished(true);
    else setIdx((i) => i + 1);
  }

  return (
    <div className="container">
      <h1>{STR.audit.title}</h1>
      <p className="muted">{STR.audit.intro}</p>

      <div className="panel" style={{ marginTop: 12 }}>
        <strong>{STR.audit.pieces} :</strong>{' '}
        {target.piecesCollected.length === 0 ? (
          <span className="muted">{STR.audit.noPieces}</span>
        ) : (
          target.piecesCollected.map((p) => (
            <span className="tag tag-accent" key={p} style={{ marginRight: 6 }}>
              {p.replace('piece_', '').replace(/_/g, ' ')}
            </span>
          ))
        )}
      </div>

      <div className="dialogue-wrap" style={{ marginTop: 16 }}>
        <div className="panel speaker-card">
          <div className="avatar">
            <Avatar seed="verificateur-dgfip" expression="ferme" />
          </div>
          <strong>Le vérificateur</strong>
          <div className="muted" style={{ fontSize: '0.8rem' }}>
            DGFiP · dossier {c.name}
          </div>
          <div className="muted" style={{ marginTop: 8, fontSize: '0.8rem' }}>
            Question {idx + 1} / {findings.length}
          </div>
        </div>
        <div>
          <div className="bubble">{finding.question}</div>
          <div className="choices">
            {finding.defensible && (
              <button className="choice" onClick={() => answer(true)}>
                <span className="choice-key">✓</span>
                <span>{finding.goodAnswer}</span>
              </button>
            )}
            {finding.weakAnswers.map((w, i) => (
              <button key={i} className="choice" onClick={() => answer(false)}>
                <span className="choice-key">{i + 1}</span>
                <span>{w}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
