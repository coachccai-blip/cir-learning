import { useMemo, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { QUIZ, QUIZ_POST } from '../data/quiz';
import { shuffleForDisplay } from '../engine/rng';
import { Icon } from '../ui/Icon';

export function QuizScreen() {
  const phase = useStore((s) => s.quizPhase);
  const mode = useStore((s) => s.save?.mode ?? 'onboarding');
  const seed = useStore((s) => s.save?.seed ?? 'x');
  const commitQuiz = useStore((s) => s.commitQuiz);
  // Deux jeux jumeaux : mêmes notions, cas différents. Reposer les mêmes
  // questions mesurerait la mémoire, pas ce que le joueur a appris.
  const questions = phase === 'pre' ? QUIZ : QUIZ_POST;
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  /**
   * Le quiz de positionnement renvoyait le joueur en partie sans lui dire ce
   * qu'il avait manqué : on mesurait sans rien enseigner. La correction
   * s'affiche maintenant avant d'entrer, explication comprise.
   */
  const [reviewing, setReviewing] = useState(false);

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
  const score = questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0);

  function review() {
    setReviewing(true);
    window.scrollTo({ top: 0 });
  }

  if (reviewing) {
    return (
      <div className="home" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
        <div className="container" style={{ width: 'min(760px,100%)', color: '#fff' }}>
          <div className="center" style={{ marginBottom: 20 }}>
            <h1 style={{ color: '#fff' }}>{STR.quiz.reviewTitle}</h1>
            <p style={{ opacity: 0.9 }}>{STR.quiz.reviewIntro(score, questions.length)}</p>
          </div>

          <div className="stack">
            {questions.map((q, qi) => {
              const given = answers[qi];
              const right = given === q.correct;
              return (
                <div className="panel" key={q.id} style={{ color: 'var(--text)' }}>
                  <div className="panel-title">
                    <Icon name={right ? 'check' : 'cross'} size={19} className={right ? 'ink-ok' : 'ink-bad'} />
                    <h3>{q.question}</h3>
                  </div>

                  <ul className="verdict-list">
                    <li className={right ? 'verdict-ok' : 'verdict-bad'}>
                      <Icon name={right ? 'check' : 'cross'} size={16} />
                      <span>
                        <strong>{STR.quiz.your}</strong> —{' '}
                        {given >= 0 ? q.options[given] : STR.quiz.noAnswer}
                      </span>
                    </li>
                    {!right && (
                      <li className="verdict-ok">
                        <Icon name="check" size={16} />
                        <span>
                          <strong>{STR.quiz.correct}</strong> — {q.options[q.correct]}
                        </span>
                      </li>
                    )}
                  </ul>

                  <div className="note note-info" style={{ marginTop: 10 }}>
                    <Icon name="bulb" size={16} />
                    <span>
                      <strong>{STR.quiz.explanation}</strong> — {q.explanation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="row center" style={{ justifyContent: 'center', marginTop: 20, gap: 12 }}>
            <button className="btn" onClick={() => setReviewing(false)}>
              <Icon name="arrowLeft" size={17} /> {STR.quiz.reviewAgain}
            </button>
            <button className="btn btn-primary" onClick={() => commitQuiz(phase, answers)}>
              <Icon name="play" size={17} />{' '}
              {phase === 'pre' ? STR.quiz.startSeason : STR.quiz.seeResults}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <button className="btn btn-primary" disabled={!allAnswered} onClick={review}>
            <Icon name="check" size={17} /> {STR.quiz.validate}
          </button>
        </div>
      </div>
    </div>
  );
}
