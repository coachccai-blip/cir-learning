import { useEffect, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { computeFinalScore } from '../engine/economy';
import { BADGES } from '../engine/badges';
import { QUIZ, QUIZ_POST } from '../data/quiz';
import { journeyComplete, nextSeason } from '../engine/journey';

export function EndScreen() {
  const save = useStore((s) => s.save);
  const saveLeaderboard = useStore((s) => s.saveLeaderboard);
  const resetSave = useStore((s) => s.resetSave);
  const go = useStore((s) => s.go);
  const newGame = useStore((s) => s.newGame);
  const progress = useStore((s) => s.progress);
  const markSeasonDone = useStore((s) => s.completeSeason);
  const [pseudo, setPseudo] = useState('');
  const [saved, setSaved] = useState(false);

  const reassessments = save
    ? save.portfolio.filter((c) => c.auditOutcome === 'partial' || c.auditOutcome === 'total').length
    : 0;
  const auditPassed = save
    ? save.portfolio.some((c) => c.auditOutcome === 'validated') ||
      (save.mode !== 'expert' && reassessments === 0)
    : false;
  const final = save ? computeFinalScore(save, auditPassed, reassessments) : null;

  // Atteindre cet écran valide la saison : c'est ce qui ouvre la suivante.
  // Déclaré avant tout retour conditionnel pour que l'ordre des hooks tienne.
  const doneMode = save?.mode;
  const doneScore = final?.total;
  useEffect(() => {
    if (doneMode && doneScore !== undefined) markSeasonDone(doneMode, doneScore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneMode, doneScore]);

  if (!save || !final) return null;

  const strengths = final.parts.filter((p) => p.value >= 65).map((p) => p.label);
  const improvements = final.parts.filter((p) => p.value < 50).map((p) => p.label);
  const earnedBadges = BADGES.filter((b) => save.badges.includes(b.id));

  const preScore = QUIZ.reduce((n, q, i) => n + (save.quizPre[i] === q.correct ? 1 : 0), 0);
  const postScore = QUIZ_POST.reduce((n, q, i) => n + (save.quizPost[i] === q.correct ? 1 : 0), 0);
  const hasQuiz = save.quizPre.length === QUIZ.length && save.quizPost.length === QUIZ_POST.length;

  // Débrief nominatif : les décisions qui ont le plus coûté (impact négatif cumulé).
  const upcoming = nextSeason(save.mode);
  const justUnlocked = upcoming !== null && !progress.completed.includes(upcoming);
  const allDone = journeyComplete(progress);

  const costly = save.history
    .filter((h) => h.impact < 0 && h.text)
    .sort((a, b) => a.impact - b.impact)
    .slice(0, 3);
  const bestMoves = save.history
    .filter((h) => h.role === 'optimal' && h.impact >= 12 && h.text)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 2);

  return (
    <div className="home" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
      <div className="container" style={{ width: 'min(900px,100%)', color: '#fff' }}>
        <div className="center">
          <p style={{ opacity: 0.8 }}>{STR.end.grade}</p>
          <div className="score-hero" style={{ color: 'var(--brand-orange-main)' }}>
            {final.grade}
          </div>
          <p style={{ fontSize: '1.4rem' }}>{final.total} / 100</p>
        </div>

        {(justUnlocked || allDone) && (
          <div className="panel journey-banner" style={{ marginTop: 24, color: 'var(--text)' }}>
            <h3>{allDone ? `🏁 ${STR.journey.complete}` : `🔓 ${STR.journey.unlocked(STR.modes[upcoming!].label)}`}</h3>
            <p style={{ fontSize: '0.92rem' }}>
              {allDone ? STR.journey.completeSub : STR.modes[upcoming!].desc}
            </p>
            {!allDone && upcoming && (
              <button
                className="btn btn-primary"
                style={{ marginTop: 10 }}
                onClick={() => {
                  resetSave();
                  newGame(upcoming);
                }}
              >
                {STR.journey.startNext(STR.modes[upcoming].label)}
              </button>
            )}
          </div>
        )}

        <div className="panel" style={{ marginTop: 24, color: 'var(--text)' }}>
          <h3>{STR.end.breakdown}</h3>
          {final.parts.map((p) => (
            <div className="progress-line" key={p.label} style={{ marginTop: 8 }}>
              <span style={{ width: 180, fontSize: '0.85rem' }}>{p.label}</span>
              <div className="bar">
                <div style={{ width: `${Math.min(100, p.value)}%` }} />
              </div>
              <span style={{ fontSize: '0.8rem', width: 90 }} className="muted">
                {p.value} × {p.weight}
              </span>
            </div>
          ))}
          {final.penalties.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong>{STR.end.penalties}</strong>
              <ul>
                {final.penalties.map((p, i) => (
                  <li key={i} className="delta-neg">
                    −{p.value} : {p.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
          <div className="panel" style={{ color: 'var(--text)' }}>
            <h3>{STR.end.strengths}</h3>
            <ul>
              {strengths.length ? strengths.map((s) => <li key={s} className="delta-pos">{s}</li>) : <li className="muted">—</li>}
            </ul>
          </div>
          <div className="panel" style={{ color: 'var(--text)' }}>
            <h3>{STR.end.improvements}</h3>
            <ul>
              {improvements.length ? improvements.map((s) => <li key={s} className="delta-neg">{s}</li>) : <li className="muted">—</li>}
            </ul>
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16, color: 'var(--text)' }}>
          <h3>
            {STR.end.badges} ({earnedBadges.length}/{BADGES.length})
          </h3>
          <div className="row">
            {earnedBadges.length === 0 && <span className="muted">—</span>}
            {earnedBadges.map((b) => (
              <span className="tag tag-accent" key={b.id} title={b.description}>
                🏅 {b.label}
              </span>
            ))}
          </div>
        </div>

        {(costly.length > 0 || bestMoves.length > 0) && (
          <div className="panel" style={{ marginTop: 16, color: 'var(--text)' }}>
            <h3>Votre saison, décision par décision</h3>
            {costly.length > 0 && (
              <>
                <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 6 }}>
                  Les décisions qui vous ont le plus coûté :
                </p>
                {costly.map((h) => (
                  <div key={`${h.scenarioId}-${h.nodeId}-${h.choiceId}`} style={{ marginBottom: 10, fontSize: '0.9rem' }}>
                    <span className="delta-neg" style={{ fontWeight: 700 }}>
                      Semaine {h.cycle} ({h.impact})
                    </span>{' '}
                    — « {h.text} »
                    <div className="muted" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>
                      💡 {h.rule}
                    </div>
                  </div>
                ))}
              </>
            )}
            {bestMoves.length > 0 && (
              <>
                <p className="muted" style={{ fontSize: '0.85rem', margin: '10px 0 6px' }}>
                  Vos meilleurs réflexes :
                </p>
                {bestMoves.map((h) => (
                  <div key={`${h.scenarioId}-${h.nodeId}-${h.choiceId}`} style={{ marginBottom: 8, fontSize: '0.9rem' }}>
                    <span className="delta-pos" style={{ fontWeight: 700 }}>
                      Semaine {h.cycle} (+{h.impact})
                    </span>{' '}
                    — « {h.text} »
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {hasQuiz && (
          <div className="panel" style={{ marginTop: 16, color: 'var(--text)' }}>
            <h3>{STR.quiz.titlePost}</h3>
            <div className="row" style={{ gap: 24, alignItems: 'baseline', marginBottom: 12 }}>
              <div>
                <div className="muted">{STR.quiz.before}</div>
                <strong style={{ fontSize: '1.4rem' }}>
                  {preScore}/{QUIZ.length}
                </strong>
              </div>
              <div style={{ fontSize: '1.4rem' }} className="muted">
                →
              </div>
              <div>
                <div className="muted">{STR.quiz.after}</div>
                <strong style={{ fontSize: '1.4rem' }} className={postScore >= preScore ? 'delta-pos' : ''}>
                  {postScore}/{QUIZ_POST.length}
                </strong>
              </div>
              {postScore > preScore && (
                <span className="tag tag-accent">
                  +{postScore - preScore} {STR.quiz.progress}
                </span>
              )}
            </div>
            <ul style={{ fontSize: '0.85rem' }}>
              {QUIZ_POST.map((q, i) => {
                // Question jumelle : même notion qu'à l'entrée, cas différent.
                const wasWrong = save.quizPre[i] !== QUIZ[i].correct;
                const nowRight = save.quizPost[i] === q.correct;
                return (
                  <li key={q.id} className={nowRight ? 'delta-pos' : 'delta-neg'} style={{ marginBottom: 4 }}>
                    {nowRight ? '✓ ' : '✗ '}
                    {q.question}
                    {wasWrong && nowRight && <span className="muted"> — acquis pendant la partie</span>}
                    {!nowRight && <span className="muted"> — {q.explanation}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="panel" style={{ marginTop: 16, color: 'var(--text)' }}>
          {!saved ? (
            <>
              <label htmlFor="pseudo">
                <strong>{STR.end.pseudo}</strong>
              </label>
              <div className="row" style={{ marginTop: 8 }}>
                <input
                  id="pseudo"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  maxLength={24}
                  style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border-strong)', flex: 1 }}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    saveLeaderboard(pseudo, final.total, final.grade);
                    setSaved(true);
                  }}
                >
                  {STR.end.save}
                </button>
              </div>
            </>
          ) : (
            <p className="delta-pos">Score enregistré au classement local.</p>
          )}
        </div>

        <div className="row center" style={{ justifyContent: 'center', marginTop: 20, gap: 12 }}>
          <button className="btn" onClick={() => go('leaderboard')}>
            {STR.menu.leaderboard}
          </button>
          <button
            className="btn"
            onClick={() => {
              resetSave();
              newGame(save.mode);
            }}
          >
            {STR.end.replay}
          </button>
          <button
            className="btn"
            onClick={() => {
              go('home');
            }}
          >
            {STR.end.home}
          </button>
        </div>
      </div>
    </div>
  );
}
