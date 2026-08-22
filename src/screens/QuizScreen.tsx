import { useMemo, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { QUIZ, QUIZ_POST } from '../data/quiz';
import { shuffleForDisplay } from '../engine/rng';

export function QuizScreen() {
  const phase = useStore((s) => s.quizPhase);
  const mode = useStore((s) => s.save?.mode ?? 'onboarding');
  const seed = useStore((s) => s.save?.seed ?? 'x');
  const commitQuiz = useStore((s) => s.commitQuiz);
  // Deux jeux jumeaux : mêmes notions, cas différents. Reposer les mêmes
  // questions mesurerait la mémoire, pas ce que le joueur a appris.
  const questions = phase === 'pre' ? QUIZ : QUIZ_POST;
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));

  // Ordre d'affichage mélangé : la bonne réponse n'est jamais toujours en A.
  // On conserve l'index d'origine pour que le score reste comparable pre/post.
  const shuffled = useMemo(
    () =>
      questions.map((q) =>
        shuffleForDisplay(
          q.options.map((text, originalIndex) => ({ text, originalIndex })),
          `${seed}:quiz:${q.id}`,
        ),
      ),
    [seed, questions],
  );

  const allAnswered = answers.every((a) => a >= 0);

  return (
    <div className="home" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
      <div className="container" style={{ width: 'min(760px,100%)', color: '#fff' }}>
        <div className="center" style={{ marginBottom: 20 }}>
          <h1 style={{ color: '#fff' }}>
            {phase === 'pre' ? STR.season[mode].quizTitle : STR.quiz.titlePost}
          </h1>
          <p style={{ opacity: 0.9 }}>
            {phase === 'pre' ? STR.season[mode].quizIntro : STR.quiz.introPost}
          </p>
        </div>

        <div className="stack">
          {questions.map((q, qi) => (
            <div className="panel" key={q.id} style={{ color: 'var(--text)' }}>
              <div className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {STR.quiz.question} {qi + 1}
              </div>
              <h3 style={{ marginTop: 4 }}>{q.question}</h3>
              <div className="choices" style={{ marginTop: 10 }}>
                {shuffled[qi].map((opt, displayIndex) => {
                  const chosen = answers[qi] === opt.originalIndex;
                  return (
                    <button
                      key={opt.originalIndex}
                      className="choice"
                      onClick={() =>
                        setAnswers((a) => a.map((v, i) => (i === qi ? opt.originalIndex : v)))
                      }
                      aria-pressed={chosen}
                      style={{
                        borderColor: chosen ? 'var(--accent)' : undefined,
                        background: chosen ? 'var(--surface-accent)' : undefined,
                      }}
                    >
                      <span className="choice-key">{String.fromCharCode(65 + displayIndex)}</span>
                      <span>{opt.text}</span>
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
