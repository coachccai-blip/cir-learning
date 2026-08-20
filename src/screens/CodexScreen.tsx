import { useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { CODEX, CODEX_CATEGORIES } from '../data/codex';
import type { CodexEntry } from '../engine/types';

export function CodexScreen() {
  const go = useStore((s) => s.go);
  const save = useStore((s) => s.save);
  const readPersistent = useStore((s) => s.codexReadPersistent);
  const markCodexRead = useStore((s) => s.markCodexRead);
  const [cat, setCat] = useState<CodexEntry['category'] | 'all'>('all');
  const [q, setQ] = useState('');

  const read = new Set([...(save?.codexRead ?? []), ...readPersistent]);
  const filtered = CODEX.filter((e) => {
    if (cat !== 'all' && e.category !== cat) return false;
    if (q && !(`${e.title} ${e.body}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="container">
      <div className="row">
        <h1>{STR.codex.title}</h1>
        <span className="spacer" />
        <button className="btn" onClick={() => go(save ? (save.phase === 'DAY' ? 'day' : 'night') : 'home')}>
          {STR.common.back}
        </button>
      </div>
      <input
        placeholder={STR.codex.search}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{ width: '100%', padding: 12, borderRadius: 12, border: '1px solid var(--border-strong)', margin: '12px 0' }}
      />
      <div className="codex-layout">
        <div className="codex-cats panel-flat">
          <button className={cat === 'all' ? 'active' : ''} onClick={() => setCat('all')}>
            {STR.codex.all} ({CODEX.length})
          </button>
          {CODEX_CATEGORIES.map((c) => (
            <button key={c.id} className={cat === c.id ? 'active' : ''} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div>
          {filtered.length === 0 && <p className="muted">{STR.codex.empty}</p>}
          {filtered.map((e) => {
            const isRead = read.has(e.id);
            return (
              <div className={`codex-entry${isRead ? '' : ' unread'}`} key={e.id} onClick={() => markCodexRead(e.id)}>
                <div className="row">
                  <h3>{e.title}</h3>
                  <span className="spacer" />
                  <span className="tag">{isRead ? STR.codex.read : STR.codex.unread}</span>
                </div>
                <p>{e.body}</p>
                <p style={{ fontSize: '0.85rem' }}>
                  <strong>{STR.codex.example} :</strong> {e.example}
                </p>
                <p className="muted" style={{ fontSize: '0.78rem' }}>
                  {STR.codex.source} : {e.source}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
