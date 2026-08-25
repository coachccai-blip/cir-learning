
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { computeFinalScore } from '../engine/economy';
import { BADGES } from '../engine/badges';
import { QUIZ, QUIZ_POST } from '../data/quiz';
import { Icon } from '../ui/Icon';

export function EndScreen() {
  const save = useStore((s) => s.save);
  const resetSave = useStore((s) => s.resetSave);
  const go = useStore((s) => s.go);
  const newGame = useStore((s) => s.newGame);

  const reassessments = save
    ? save.portfolio.filter((c) => c.auditOutcome === 'partial' || c.auditOutcome === 'total').length
    : 0;
  const auditPassed = save
    ? save.portfolio.some((c) => c.auditOutcome === 'validated') ||
      reassessments === 0
    : false;
  const final = save ? computeFinalScore(save, auditPassed, reassessments) : null;


  if (!save || !final) return null;

  const strengths = final.parts.filter((p) => p.value >= 65).map((p) => p.label);
  const improvements = final.parts.filter((p) => p.value < 50).map((p) => p.label);
  const earnedBadges = BADGES.filter((b) => save.badges.includes(b.id));

  const preScore = QUIZ.reduce((n, q, i) => n + (save.quizPre[i] === q.correct ? 1 : 0), 0);
  const postScore = QUIZ_POST.reduce((n, q, i) => n + (save.quizPost[i] === q.correct ? 1 : 0), 0);
  const hasQuiz = save.quizPre.length === QUIZ.length && save.quizPost.length === QUIZ_POST.length;

  // Débrief nominatif : les décisions qui ont le plus coûté (impact négatif cumulé).

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

        <div className="panel" style={{ marginTop: 24, color: 'var(--text)' }}>
          <div className="panel-title">
            <Icon name="scale" size={19} />
            <h3>{STR.end.breakdown}</h3>
          </div>
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
            <div style={{ marginTop: 16 }}>
              <div className="panel-title">
                <Icon name="alert" size={18} />
                <h3>{STR.end.penalties}</h3>
              </div>
              <ul className="verdict-list">
                {final.penalties.map((p, i) => (
                  <li key={i} className="verdict-bad">
                    <Icon name="trendDown" size={16} />
                    <span>
                      <strong className="delta-neg">−{p.value}</strong> · {p.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
          <div className="panel" style={{ color: 'var(--text)' }}>
            <div className="panel-title">
              <Icon name="trend" size={19} />
              <h3>{STR.end.strengths}</h3>
            </div>
            {strengths.length ? (
              <ul className="verdict-list">
                {strengths.map((s) => (
                  <li key={s} className="verdict-ok">
                    <Icon name="check" size={16} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">—</p>
            )}
          </div>
          <div className="panel" style={{ color: 'var(--text)' }}>
            <div className="panel-title">
              <Icon name="target" size={19} />
              <h3>{STR.end.improvements}</h3>
            </div>
            {improvements.length ? (
              <ul className="verdict-list">
                {improvements.map((s) => (
                  <li key={s} className="verdict-mid">
                    <Icon name="alert" size={16} />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">—</p>
            )}
          </div>
        </div>

        <div className="panel" style={{ marginTop: 16, color: 'var(--text)' }}>
          <div className="panel-title">
            <Icon name="medal" size={19} />
            <h3>
              {STR.end.badges} ({earnedBadges.length}/{BADGES.length})
            </h3>
          </div>
          <div className="row">
            {earnedBadges.length === 0 && <span className="muted">—</span>}
            {earnedBadges.map((b) => (
              <span className="tag tag-ok" key={b.id} title={b.description}>
                <Icon name="medal" size={14} /> {b.label}
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
                    <div className="inline-note">
                      <Icon name="bulb" size={14} />
                      <span style={{ fontStyle: 'italic' }}>{h.rule}</span>
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
              <Icon name="arrowRight" size={22} className="muted" />
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
            <ul className="verdict-list" style={{ fontSize: '0.88rem' }}>
              {QUIZ_POST.map((q, i) => {
                // Question jumelle : même notion qu'à l'entrée, cas différent.
                const wasWrong = save.quizPre[i] !== QUIZ[i].correct;
                const nowRight = save.quizPost[i] === q.correct;
                return (
                  <li key={q.id} className={nowRight ? 'verdict-ok' : 'verdict-bad'}>
                    <Icon name={nowRight ? 'check' : 'cross'} size={16} />
                    <span>
                      {q.question}
                      {wasWrong && nowRight && <span className="muted"> — {STR.end.learnedInGame}</span>}
                      {!nowRight && <span className="muted"> — {q.explanation}</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="row center" style={{ justifyContent: 'center', marginTop: 20, gap: 12 }}>
          <button
            className="btn"
            onClick={() => {
              resetSave();
              newGame();
            }}
          >
            <Icon name="history" size={17} /> {STR.end.replay}
          </button>
          <button
            className="btn"
            onClick={() => {
              go('home');
            }}
          >
            <Icon name="arrowLeft" size={17} /> {STR.end.home}
          </button>
        </div>
      </div>
    </div>
  );
}
