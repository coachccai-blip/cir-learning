import { useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { QUIZ } from '../data/quiz';

export function QuizScreen() {
  const phase = useStore((s) => s.quizPhase);
  const commitQuiz = useStore((s) => s.commitQuiz);
  const [answers, setAnswers] = useState<number[]>(() => QUIZ.map(() => -1));

  const allAnswered = answers.every((a) => a >= 0);

  return (
    <div className="home" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
      <div className="container" style={{ width: 'min(760px,100%)', color: '#fff' }}>
        <div className="center" style={{ marginBottom: 20 }}>
          <h1 style={{ color: '#fff' }}>{phase === 'pre' ? STR.quiz.titlePre : STR.quiz.titlePost}</h1>
          <p style={{ opacity: 0.82 }}>{phase === 'pre' ? STR.quiz.introPre : STR.quiz.introPost}</p>
        </div>

        <div className="stack">
          {QUIZ.map((q, qi) => (
            <div className="panel" key={q.id} style={{ color: 'var(--text)' }}>
              <div className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {STR.quiz.question} {qi + 1}
              </div>
              <h3 style={{ marginTop: 4 }}>{q.question}</h3>
              <div className="choices" style={{ marginTop: 10 }}>
                {q.options.map((opt, oi) => {
                  const chosen = answers[qi] === oi;
                  return (
                    <button
                      key={oi}
                      className="choice"
                      onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                      aria-pressed={chosen}
                      style={{
                        borderColor: chosen ? 'var(--accent)' : undefined,
                        background: chosen ? 'var(--surface-accent)' : undefined,
                      }}
                    >
                      <span className="choice-key">{String.fromCharCode(65 + oi)}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="row center" style={{ justifyContent: 'center', marginTop: 20, gap: 12 }}>
          {phase === 'pre' && (
            <button className="btn" onClick={() => commitQuiz('pre', answers.map((a) => (a < 0 ? -1 : a)))}>
              {STR.quiz.skip}
            </button>
          )}
          <button
            className="btn btn-primary"
            disabled={!allAnswered}
            onClick={() => commitQuiz(phase, answers)}
          >
            {phase === 'pre' ? STR.quiz.validate : STR.quiz.seeResults}
          </button>
        </div>
      </div>
    </div>
  );
}
