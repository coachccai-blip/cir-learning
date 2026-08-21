import { useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { isUnlocked, JOURNEY, requiredBefore } from '../engine/journey';
import { Icon } from '../ui/Icon';
import type { GameMode } from '../engine/types';

/**
 * Choix de la saison. Ce n'est plus un curseur de difficulté : les deux
 * saisons n'ont ni les mêmes clients, ni les mêmes mécaniques, et l'ordre est
 * imposé — on ne défend pas un dossier avant de savoir en monter un.
 */
export function ModeScreen() {
  const progress = useStore((s) => s.progress);
  const newGame = useStore((s) => s.newGame);
  const go = useStore((s) => s.go);
  // La sélection s'ouvre sur la première saison encore à jouer.
  const [selected, setSelected] = useState<GameMode>(
    JOURNEY.find((m) => !progress.completed.includes(m) && isUnlocked(m, progress)) ?? 'onboarding',
  );
  const selectable = isUnlocked(selected, progress);

  return (
    <div className="home">
      <div className="container" style={{ width: 'min(900px,100%)' }}>
        <div className="center" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '2rem', color: '#fff' }}>{STR.modeSelect.title}</h1>
          <p style={{ opacity: 0.8, color: '#fff' }}>{STR.modeSelect.subtitle}</p>
          <p style={{ opacity: 0.7, color: '#fff', fontSize: '0.85rem', marginTop: 6 }}>
            {STR.journey.progressLabel(progress.completed.length, JOURNEY.length)}
          </p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {JOURNEY.map((m, i) => {
            const meta = STR.modes[m];
            const unlocked = isUnlocked(m, progress);
            const done = progress.completed.includes(m);
            const active = selected === m;
            const required = requiredBefore(m);
            return (
              <button
                key={m}
                className="panel"
                onClick={() => setSelected(m)}
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  border: active ? '2px solid var(--brand-orange-main)' : '1px solid var(--border)',
                  outline: 'none',
                  opacity: unlocked ? 1 : 0.72,
                }}
                aria-pressed={active}
              >
                <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <h3>{meta.label}</h3>
                  <span className={`tag${done ? ' tag-ok' : ''}`}>
                    <Icon name={done ? 'check' : unlocked ? 'flag' : 'lock'} size={14} />
                    {done ? STR.modeSelect.doneTag : unlocked ? STR.modeSelect.seasonTag(i + 1) : STR.modeSelect.lockedTag}
                  </span>
                </div>
                <p className="muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
                  {meta.audience}
                </p>
                <p style={{ fontSize: '0.9rem', marginTop: 8 }}>{meta.desc}</p>
                {!unlocked && required && (
                  <div className="note note-locked" style={{ marginTop: 12 }}>
                    <Icon name="lock" size={16} />
                    <span>{STR.modeSelect.locked(STR.modes[required].label)}</span>
                  </div>
                )}
                {done && progress.best[m] !== undefined && (
                  <div className="note note-ok" style={{ marginTop: 12 }}>
                    <Icon name="trophy" size={16} />
                    <span>{STR.modeSelect.bestScore(progress.best[m] ?? 0)}</span>
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
          <button className="btn btn-primary" disabled={!selectable} onClick={() => newGame(selected)}>
            <Icon name="play" size={17} /> {STR.modeSelect.start}
          </button>
        </div>
      </div>
    </div>
  );
}
