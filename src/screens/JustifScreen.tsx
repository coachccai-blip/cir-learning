import { useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { GENERIC_JUSTIF } from '../data/justif';
import { ROLE_SCORE } from '../engine/dialogue/runner';

export function JustifScreen() {
  const clientId = useStore((s) => s.activeClientId);
  const commit = useStore((s) => s.commitJustif);
  const go = useStore((s) => s.go);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  if (!clientId) return null;
  const c = clientById(clientId);
  const blocks = GENERIC_JUSTIF.blocks;
  const allChosen = blocks.every((b) => choices[b.id]);

  function scoreOf(): number {
    let sum = 0;
    for (const b of blocks) {
      const opt = b.options.find((o) => o.id === choices[b.id]);
      if (opt) sum += ROLE_SCORE[opt.role];
    }
    return Math.round(sum / blocks.length);
  }

  function validate() {
    commit(clientId!, choices, scoreOf());
    setDone(true);
  }

  if (done) {
    const sc = scoreOf();
    return (
      <div className="container">
        <h1>{STR.justif.result}</h1>
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="assiette-total">{sc}/100</div>
          <h3 style={{ marginTop: 12 }}>{STR.justif.preview}</h3>
          {blocks.map((b) => {
            const opt = b.options.find((o) => o.id === choices[b.id]);
            return (
              <div key={b.id} style={{ marginBottom: 12 }}>
                <strong>{b.title}</strong>
                <p style={{ margin: '4px 0' }}>{opt?.text}</p>
                <p className="muted" style={{ fontSize: '0.82rem', fontStyle: 'italic' }}>
                  {opt?.critique}
                </p>
              </div>
            );
          })}
          <button className="btn btn-primary" onClick={() => go('night')}>
            {STR.common.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>{STR.justif.title}</h1>
      <p className="muted">
        {c.name} — {STR.justif.intro}
      </p>
      <div className="stack" style={{ marginTop: 16 }}>
        {blocks.map((b) => (
          <div className="panel" key={b.id}>
            <h3>{b.title}</h3>
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              {b.hint}
            </p>
            <div className="choices">
              {b.options.map((o) => (
                <button
                  key={o.id}
                  className="choice"
                  onClick={() => setChoices((ch) => ({ ...ch, [b.id]: o.id }))}
                  style={{
                    borderColor: choices[b.id] === o.id ? 'var(--accent)' : undefined,
                    background: choices[b.id] === o.id ? 'var(--surface-accent)' : undefined,
                  }}
                  aria-pressed={choices[b.id] === o.id}
                >
                  <span>{o.text}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => go('night')}>
          {STR.common.back}
        </button>
        <button className="btn btn-primary" onClick={validate} disabled={!allChosen}>
          {STR.justif.validate}
        </button>
      </div>
    </div>
  );
}
