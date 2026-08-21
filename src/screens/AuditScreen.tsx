import { useMemo, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { caseForClient } from '../state/dossier';
import { cardsetById } from '../data/cards';
import { Avatar } from '../avatars/Avatar';
import { buildAuditFindings, resolveAudit } from '../engine/audit';
import { shuffleForDisplay } from '../engine/rng';
import ruleset from '../data/rules/ruleset-2026.json';
import balance from '../data/balance.json';
import type { Ruleset } from '../engine/types';

const RULESET = ruleset as Ruleset;

export function AuditScreen() {
  const save = useStore((s) => s.save);
  const go = useStore((s) => s.go);
  const runAudit = useStore((s) => s.runAudit);
  const auditMode = useStore((s) => s.auditMode);
  const closeInterimAudit = useStore((s) => s.closeInterimAudit);
  // Le contrôle de mi-saison est une simple demande d'information : deux points,
  // et le joueur repart avec un cycle pour corriger les autres dossiers.
  const interim = auditMode === 'interim';

  // Sélection du dossier contrôlé selon le mode.
  const target = useMemo(() => {
    if (!save) return null;
    const dossiers = save.portfolio.filter((c) => c.assietteInput !== null);
    if (dossiers.length === 0) return null;
    if (interim) {
      return dossiers.slice().sort((a, b) => (a.scores.base ?? 1) - (b.scores.base ?? 1))[0];
    }
    if (save.mode === 'onboarding' && save.gauges.security >= balance.auditSecurityThreshold) {
      // pas de contrôle si sécurité suffisante
      return null;
    }
    // le plus faible (précision d'assiette la plus basse)
    return dossiers.slice().sort((a, b) => (a.scores.base ?? 1) - (b.scores.base ?? 1))[0];
  }, [save, interim]);

  const [idx, setIdx] = useState(0);
  const [defended, setDefended] = useState<string[]>([]);
  // Constats reconnus et rectifiés en séance contradictoire : le rappel est
  // atténué, pas effacé.
  const [mitigated, setMitigated] = useState<string[]>([]);
  // Tour de parole sur le constat courant : le vérificateur relance une fois.
  const [round, setRound] = useState<'constat' | 'relance'>('constat');
  const [finished, setFinished] = useState(false);

  // Fin de saison → quiz de sortie (mesure de l'apprentissage) puis écran de fin.
  const toEnd = () => {
    if (interim) {
      closeInterimAudit();
      return;
    }
    useStore.setState({ quizPhase: 'post' });
    go('quiz');
  };

  if (!save) return null;

  if (!target) {
    return (
      <div className="container">
        <div className="panel center" style={{ marginTop: 40 }}>
          <h1>{STR.audit.title}</h1>
          <p className="muted">
            {interim ? STR.audit.noInterim : STR.audit.noAudit}
          </p>
          <button className="btn btn-primary" onClick={toEnd}>
            {STR.end.title} →
          </button>
        </div>
      </div>
    );
  }

  const c = clientById(target.clientId);
  // Le contrôle porte sur le dossier tel qu'il a été instruit : mêmes postes
  // ouverts, même variante. Sans cela, le vérificateur reprocherait une aide
  // publique que le joueur n'a jamais vue à l'écran.
  const theCase = caseForClient(save, target.clientId);
  const cardset = cardsetById(c.cardsetId);
  // Deuxième saison : séance contradictoire, le vérificateur relance.
  const contradictoire = save.mode === 'expert' && !interim;
  const allFindings = buildAuditFindings(target, theCase, cardset, RULESET, { contradictoire });
  const findings = interim ? allFindings.slice(0, 2) : allFindings;

  // Flashbacks : le vérificateur a « relu vos échanges » — il cite vos propres
  // décisions risquées, mot pour mot, avec leur date.
  const flashbacks = save.history
    .filter((h) => h.clientId === target.clientId && (h.role === 'tempting' || h.role === 'poor') && h.text)
    .slice(0, 2);

  if (findings.length === 0 || finished) {
    const result = resolveAudit(
      findings,
      defended,
      target.scores.justification ?? 0,
      target.playerCir ?? 0,
      target.feeRate,
      mitigated,
      balance.audit.remedyRelief,
    );
    return (
      <div className="container">
        <h1>{interim ? STR.audit.interimResult : STR.audit.result}</h1>
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
              <li
                key={f.finding.id}
                className={f.defended ? 'delta-pos' : f.mitigated ? '' : 'delta-neg'}
              >
                {f.defended ? '✓ ' : f.mitigated ? '~ ' : '✗ '}
                {f.finding.label}
                {f.mitigated && <span className="muted"> — {STR.audit.mitigated}</span>}
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => {
              runAudit(target.clientId, result.outcome, result.reassessedAmount);
              toEnd();
            }}
          >
            {interim ? STR.audit.backToWork : STR.end.title} →
          </button>
        </div>
      </div>
    );
  }

  const finding = findings[idx];
  const relance = round === 'relance' ? finding.followUp : null;
  const prompt = relance ? relance.question : finding.question;
  const canDefend = relance ? true : finding.defensible;
  const goodAnswer = relance ? relance.goodAnswer : finding.goodAnswer;
  const weakAnswers = relance ? relance.weakAnswers : finding.weakAnswers;

  // La bonne réponse est mélangée aux réponses faibles : le joueur doit la
  // reconnaître, pas la repérer à sa position.
  const answerOptions = shuffleForDisplay(
    [
      ...(canDefend ? [{ text: goodAnswer, good: true }] : []),
      ...weakAnswers.map((w) => ({ text: w, good: false })),
    ],
    `${save.seed}:audit:${finding.id}:${round}`,
  );

  function nextFinding() {
    setRound('constat');
    if (idx + 1 >= findings.length) setFinished(true);
    else setIdx((i) => i + 1);
  }

  function answer(good: boolean) {
    if (round === 'relance') {
      // Rectifier ne défend pas le constat : cela limite le rappel.
      if (good) setMitigated((m) => [...m, finding.id]);
      nextFinding();
      return;
    }
    if (good && finding.defensible) {
      setDefended((d) => [...d, finding.id]);
      nextFinding();
      return;
    }
    // Séance contradictoire : le vérificateur ne clôt pas sur un aveu, il
    // demande ce que le conseil propose.
    if (finding.followUp) setRound('relance');
    else nextFinding();
  }

  return (
    <div className="container">
      <h1>{STR.audit.title}</h1>
      <p className="muted">{STR.audit.intro}</p>

      {idx === 0 && flashbacks.length > 0 && (
        <div className="feedback" style={{ marginTop: 12, borderLeftColor: 'var(--gauge-security-bad)' }}>
          <strong>Le vérificateur a relu vos échanges.</strong>
          {flashbacks.map((f) => (
            <div key={`${f.scenarioId}-${f.choiceId}`} style={{ marginTop: 8, fontSize: '0.9rem' }}>
              <span className="muted">Semaine {f.cycle}, vous aviez déclaré :</span>
              <div style={{ fontStyle: 'italic', marginTop: 2 }}>« {f.text} »</div>
            </div>
          ))}
        </div>
      )}

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
            {STR.audit.question} {idx + 1} / {findings.length}
            {relance && <div className="tag tag-accent" style={{ marginTop: 6 }}>{STR.audit.relance}</div>}
          </div>
        </div>
        <div>
          <div className="bubble">{prompt}</div>
          <div className="choices">
            {answerOptions.map((opt, i) => (
              <button key={opt.text} className="choice" onClick={() => answer(opt.good)}>
                <span className="choice-key">{i + 1}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
