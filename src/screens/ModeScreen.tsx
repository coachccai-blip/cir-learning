import { useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import type { GameMode } from '../engine/types';

const MODES: GameMode[] = ['onboarding', 'expert'];

export function ModeScreen() {
  const [selected, setSelected] = useState<GameMode>('onboarding');
  const newGame = useStore((s) => s.newGame);
  const go = useStore((s) => s.go);

  return (
    <div className="home">
      <div className="container" style={{ width: 'min(900px,100%)' }}>
        <div className="center" style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '2rem', color: '#fff' }}>{STR.modeSelect.title}</h1>
          <p style={{ opacity: 0.8, color: '#fff' }}>{STR.modeSelect.subtitle}</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
          {MODES.map((m) => {
            const meta = STR.modes[m];
            const active = selected === m;
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
                }}
                aria-pressed={active}
              >
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <h3>{meta.label}</h3>
                  {m === 'onboarding' && <span className="tag tag-accent">défaut</span>}
                </div>
                <p className="muted" style={{ fontSize: '0.82rem', marginTop: 4 }}>
                  {meta.audience}
                </p>
                <p style={{ fontSize: '0.9rem', marginTop: 8 }}>{meta.desc}</p>
              </button>
            );
          })}
        </div>
        <div className="row center" style={{ justifyContent: 'center', marginTop: 28, gap: 12 }}>
          <button className="btn" onClick={() => go('home')}>
            {STR.common.back}
          </button>
          <button className="btn btn-primary" onClick={() => newGame(selected)}>
            {STR.modeSelect.start}
          </button>
        </div>
      </div>
    </div>
  );
}
