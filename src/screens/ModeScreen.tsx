import { useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { advisedBefore, followsAdvice, JOURNEY } from '../engine/journey';
import { Icon } from '../ui/Icon';
import type { GameMode } from '../engine/types';

/**
 * Choix de la saison. Les deux ne sont pas deux crans d'un même curseur : ni
 * les mêmes clients, ni les mêmes mécaniques. L'ordre est conseillé — la
 * seconde suppose les réflexes de la première — mais rien n'est fermé : un
 * consultant déjà en poste peut entrer directement par l'Expert.
 */
export function ModeScreen() {
  const progress = useStore((s) => s.progress);
  const newGame = useStore((s) => s.newGame);
  const go = useStore((s) => s.go);
  // La sélection s'ouvre sur la première saison encore à jouer.
  const [selected, setSelected] = useState<GameMode>(
    JOURNEY.find((m) => !progress.completed.includes(m)) ?? 'onboarding',
  );

  return (
    <div className="home">
      <div className="container" style={{ width: 'min(900px,100%)' }}>
        <div className="center" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '2rem', color: '#fff' }}>{STR.modeSelect.title}</h1>
          <p style={{ opacity: 0.88, color: '#fff' }}>{STR.modeSelect.subtitle}</p>
          <p style={{ opacity: 0.75, color: '#fff', fontSize: '0.85rem', marginTop: 6 }}>
            {STR.journey.progressLabel(progress.completed.length, JOURNEY.length)}
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {JOURNEY.map((m, i) => {
            const meta = STR.modes[m];
            const done = progress.completed.includes(m);
            const active = selected === m;
            const advised = advisedBefore(m);
            // Recommandation, pas interdiction : on signale ce qui manque et on
            // laisse partir.
            const showAdvice = advised !== null && !followsAdvice(m, progress);
            const best = progress.best[m];
            return (
              <button
                key={m}
                className="panel season-card"
                onClick={() => setSelected(m)}
                style={{
                  border: active ? '2px solid var(--brand-orange-main)' : '1px solid var(--border)',
                }}
                aria-pressed={active}
              >
                <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <h3>{meta.label}</h3>
                  <span className={`tag${done ? ' tag-ok' : ''}`}>
                    <Icon name={done ? 'check' : 'flag'} size={14} />
                    {done ? STR.modeSelect.doneTag : STR.modeSelect.seasonTag(i + 1)}
                  </span>
                </div>
                <p className="muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
                  {meta.audience}
                </p>
                <p style={{ fontSize: '0.9rem', marginTop: 8 }}>{meta.desc}</p>
                {showAdvice && (
                  <div className="note note-info" style={{ marginTop: 12 }}>
                    <Icon name="bulb" size={16} />
                    <span>{STR.modeSelect.advised(STR.modes[advised].label)}</span>
                  </div>
                )}
                {done && best !== undefined && (
                  <div className="note note-ok" style={{ marginTop: 12 }}>
                    <Icon name="trophy" size={16} />
                    <span>{STR.modeSelect.bestScore(best)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="row center" style={{ justifyContent: 'center', marginTop: 28, gap: 12 }}>
          <button className="btn" onClick={() => go('home')}>
            <Icon name="arrowLeft" size={17} /> {STR.common.back}
          </button>
          <button className="btn btn-primary" onClick={() => newGame(selected)}>
            <Icon name="play" size={17} /> {STR.modeSelect.start}
          </button>
        </div>
      </div>
    </div>
  );
}
