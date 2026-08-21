import { useEffect, useMemo, useRef, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { scenarioById } from '../data/scenarios/index';
import { CLIENTS } from '../data/clients';
import { codexById } from '../data/codex';
import { Avatar } from '../avatars/Avatar';
import { AnonymousAvatar } from '../avatars/AnonymousAvatar';
import { SpeakButton } from '../components/SpeakButton';
import { genderForSpeaker } from '../data/voices';
import {
  advance,
  displayOrder,
  getNode,
  maskedChoiceIndex,
  resolveChoice,
  sessionScore,
  startSession,
  type DialogueSession,
} from '../engine/dialogue/runner';
import { expressionForMood } from '../engine/dialogue/mood';
import { buildRecalls, clientContext } from '../data/recalls';
import type { DialogueChoice, Expression } from '../engine/types';

export function DialogueScreen() {
  const ctx = useStore((s) => s.dialogue);
  const save = useStore((s) => s.save);
  const applyGauges = useStore((s) => s.applyGauges);
  const applyEnergy = useStore((s) => s.applyEnergy);
  const unlockCodex = useStore((s) => s.unlockCodex);
  const endDialogue = useStore((s) => s.endDialogue);
  const toast = useStore((s) => s.toast);
  const recordChoice = useStore((s) => s.recordChoice);
  const streak = useStore((s) => s.save?.stats.noJargonStreak ?? 0);

  const scenario = useMemo(
    () => (ctx ? (ctx.inlineScenario ?? scenarioById(ctx.scenarioId)) : null),
    [ctx],
  );
  const client = ctx?.clientId ? CLIENTS.find((c) => c.id === ctx.clientId) : undefined;
  const clientState = save?.portfolio.find((p) => p.clientId === ctx?.clientId);

  const [session, setSession] = useState<DialogueSession | null>(null);
  const [mood, setMood] = useState(clientState?.mood ?? client?.contact.initialMood ?? 60);
  const [flags, setFlags] = useState<string[]>([]);
  const [promise, setPromise] = useState<{ min: number; max: number; kind: 'range' | 'precise' } | null>(null);
  const [declined, setDeclined] = useState(false);
  const [feedback, setFeedback] = useState<DialogueChoice | null>(null);
  const [feedbackDeltas, setFeedbackDeltas] = useState<{ relation: number; security: number; profitability: number } | null>(null);
  const [optimalAlt, setOptimalAlt] = useState<string | null>(null);

  const playSfx = useStore((s) => s.playSfx);

  useEffect(() => {
    if (scenario) {
      setSession(startSession(scenario));
      setMood(clientState?.mood ?? client?.contact.initialMood ?? 60);
      setFlags([]);
      setPromise(null);
      setDeclined(false);
      setFeedback(null);
      if (ctx?.kind === 'prospect') playSfx('ring');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.scenarioId]);

  // Mémoire relationnelle : le PNJ cite promesses et flags en ouverture (§8.3).
  const recalls = useMemo(
    () => (clientState && scenario ? buildRecalls(clientState, scenario.type) : []),
    [clientState, scenario],
  );
  const ambiance = useMemo(
    () => (ctx?.clientId && scenario ? clientContext(ctx.clientId, scenario.type) : null),
    [ctx?.clientId, scenario],
  );

  const node = scenario && session?.currentNodeId ? getNode(scenario, session.currentNodeId) : null;

  // Le nœud disparaît dès qu'un choix mène à `next: null`, alors que son
  // feedback reste affiché. Sans mémoire du dernier nœud, l'interlocuteur
  // perdrait son nom et son portrait sur le dernier écran de l'entretien.
  const lastNode = useRef<typeof node>(null);
  if (node) lastNode.current = node;
  const shownNode = node ?? lastNode.current;

  const order = useMemo(() => {
    if (!scenario || !node || !save) return [];
    return displayOrder(save.seed, scenario.id, node);
  }, [scenario, node, save]);

  const maskedIdx = useMemo(() => {
    if (!scenario || !node || !save) return -1;
    return maskedChoiceIndex(save.seed, scenario.id, node.id, save.energy, node.choices.length);
  }, [scenario, node, save]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (feedback) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          proceed();
        }
        return;
      }
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= order.length) pick(order[n - 1], n - 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, feedback]);

  if (!ctx || !scenario || !session) return null;

  const expression: Expression = feedback
    ? (feedback.effects.mood ?? 0) >= 0
      ? 'satisfait'
      : 'agace'
    : expressionForMood(mood);

  function pick(choice: DialogueChoice, idx: number) {
    if (!save || !scenario || !session || feedback || idx === maskedIdx) return;
    const archetype = client?.contact.archetype ?? null;
    const res = resolveChoice(choice, archetype, save.energy);
    applyGauges(res.gauges, choice.feedback.what);
    if (choice.effects.energy) applyEnergy(choice.effects.energy, choice.feedback.what);
    setMood((m) => Math.max(0, Math.min(100, m + res.mood)));
    if (choice.flags) setFlags((f) => Array.from(new Set([...f, ...choice.flags!])));
    if (choice.flags?.includes('a_dit_non')) setDeclined(true);
    if (choice.promise) setPromise({ min: choice.promise.min, max: choice.promise.max, kind: choice.promise.kind });
    if (choice.feedback.codexUnlock) {
      unlockCodex(choice.feedback.codexUnlock);
    }
    // Historique des décisions : chaque choix joué est enregistré (débrief, flashbacks).
    const e = choice.effects;
    recordChoice({
      scenarioId: scenario.id,
      nodeId: node!.id,
      choiceId: choice.id,
      role: choice.role,
      clientId: ctx?.clientId,
      text: choice.text,
      impact: (e.relation ?? 0) + (e.security ?? 0) + (e.profitability ?? 0),
      rule: choice.feedback.rule,
    });
    // Pédagogie : si le joueur n'a pas pris le meilleur choix, on le lui montre.
    if (choice.role !== 'optimal' && node) {
      const best = node.choices.find((c) => c.role === 'optimal');
      setOptimalAlt(best ? best.text : null);
    } else {
      setOptimalAlt(null);
    }
    setFeedback(choice);
    setFeedbackDeltas(res.gauges);
    setSession((s) => (s ? advance(s, choice, res.score) : s));
  }

  function proceed() {
    if (!feedback || !session) return;
    setFeedback(null);
    if (session.currentNodeId === null) {
      finish();
    }
  }

  function finish() {
    if (!session || !ctx) return;
    const score = sessionScore(session);
    endDialogue({
      clientId: ctx.clientId,
      kind: ctx.kind,
      score,
      flags,
      promise,
      prospectId: ctx.prospectId,
      declined,
    });
    if (score >= 80) toast(`${STR.dialogue.scoreLabel} : ${score}/100`);
  }

  const speaker = shownNode?.speaker ?? '';
  const avatarSeed = client?.contact.avatarSeed ?? speaker;
  const prospect = ctx.prospectId ? save?.prospects.find((p) => p.id === ctx.prospectId) : undefined;
  // Voix de lecture : celle du client ou du prospect en face, sinon celle que
  // la table des PNJ attribue au locuteur.
  const voiceGender = genderForSpeaker(speaker, prospect?.gender ?? client?.contact.gender ?? 'M');
  const codexUnlock = feedback?.feedback.codexUnlock ? codexById(feedback.feedback.codexUnlock) : null;
  const finished = session.currentNodeId === null && feedback === null;

  return (
    <div className="container">
      {ctx.kind === 'prospect' && (
        <div className="phone-banner">
          <span className="phone-icon">📞</span> Appel en cours — prospection téléphonique
        </div>
      )}
      <div className="row" style={{ marginBottom: 16 }}>
        <h2>{scenario.title}</h2>
        <span className="spacer" />
        {streak >= 3 && !feedback && (
          <span className="tag tag-accent streak-chip" title="Série de bons choix d'affilée">
            🔥 Série ×{streak}
          </span>
        )}
      </div>

      <div className="dialogue-wrap">
        <div className="panel speaker-card">
          <div className="avatar">
            {ctx.kind === 'prospect' && prospect ? (
              <AnonymousAvatar gender={prospect.gender} phone />
            ) : (
              <Avatar seed={avatarSeed} expression={expression} mood={client ? mood : undefined} />
            )}
          </div>
          <strong>{ctx.kind === 'prospect' && prospect ? `${prospect.contactName} — ${prospect.company}` : speaker}</strong>
          {client && (
            <div
              className="muted"
              style={{ fontSize: '0.8rem' }}
              role="meter"
              aria-valuenow={Math.round(mood)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Humeur de ${client.contact.name} : ${Math.round(mood)} sur 100`}
            >
              {client.contact.role} · {STR.common.mood} {Math.round(mood)}
            </div>
          )}
          {scenario.objectives && (
            <div style={{ marginTop: 16, textAlign: 'left', fontSize: '0.8rem' }}>
              <strong>{STR.dialogue.objectives}</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                {scenario.objectives.map((o, i) => (
                  <li key={i} className="muted">
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          {session.choicesMade === 0 && ambiance && (
            <p className="muted" style={{ fontStyle: 'italic', marginTop: 0 }}>
              {ambiance}
            </p>
          )}
          {session.choicesMade === 0 &&
            recalls.map((r, i) => (
              <div className="bubble bubble-recall" key={i}>
                <span className="tag" style={{ marginBottom: 6 }}>
                  🧠 Il s’en souvient
                </span>
                <div>{r.text}</div>
              </div>
            ))}
          {node && (
            <div className="bubble">
              <span>{node.text}</span>
              <SpeakButton text={node.text} gender={voiceGender} />
            </div>
          )}

          {!feedback && !finished && node && (
            <div className="choices" role="group" aria-label="Vos réponses">
              {order.map((choice, i) => {
                const masked = i === maskedIdx;
                return (
                  <button
                    key={choice.id}
                    className={`choice${masked ? ' choice-masked' : ''}`}
                    onClick={() => pick(choice, i)}
                    disabled={masked}
                  >
                    <span className="choice-key">{i + 1}</span>
                    <span>{masked ? `(${STR.dialogue.masked})` : choice.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {feedback && (
            <div className="feedback">
              {feedbackDeltas && (
                <div className="deltas">
                  <span className={feedbackDeltas.relation >= 0 ? 'delta-pos' : 'delta-neg'}>
                    {STR.gauges.relation} {feedbackDeltas.relation >= 0 ? '+' : ''}
                    {feedbackDeltas.relation}
                  </span>
                  <span className={feedbackDeltas.security >= 0 ? 'delta-pos' : 'delta-neg'}>
                    {STR.gauges.security} {feedbackDeltas.security >= 0 ? '+' : ''}
                    {feedbackDeltas.security}
                  </span>
                  <span className={feedbackDeltas.profitability >= 0 ? 'delta-pos' : 'delta-neg'}>
                    {STR.gauges.profitability} {feedbackDeltas.profitability >= 0 ? '+' : ''}
                    {feedbackDeltas.profitability}
                  </span>
                </div>
              )}
              <div>
                <strong>{feedback.feedback.what}</strong> {feedback.feedback.why}
              </div>
              <div className="rule">💡 {feedback.feedback.rule}</div>
              {optimalAlt && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: '0.85rem',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-sunken)',
                    borderLeft: '3px solid var(--gauge-security-good)',
                  }}
                >
                  <strong className="delta-pos">✓ {STR.dialogue.optimalWas} :</strong> « {optimalAlt} »
                </div>
              )}
              {codexUnlock && (
                <div className="codex-unlock">
                  📄 {STR.dialogue.codexUnlocked} : « {codexUnlock.title} »
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                <button className="btn btn-primary" onClick={proceed} autoFocus>
                  {session.currentNodeId === null ? STR.dialogue.finish : STR.dialogue.continue} (Espace)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
