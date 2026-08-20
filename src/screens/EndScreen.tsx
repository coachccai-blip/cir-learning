import { useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { computeFinalScore } from '../engine/economy';
import { BADGES } from '../engine/badges';

export function EndScreen() {
  const save = useStore((s) => s.save);
  const saveLeaderboard = useStore((s) => s.saveLeaderboard);
  const resetSave = useStore((s) => s.resetSave);
  const go = useStore((s) => s.go);
  const newGame = useStore((s) => s.newGame);
  const [pseudo, setPseudo] = useState('');
  const [saved, setSaved] = useState(false);

  if (!save) return null;

  const reassessments = save.portfolio.filter((c) => c.auditOutcome === 'partial' || c.auditOutcome === 'total').length;
  const auditPassed = save.portfolio.some((c) => c.auditOutcome === 'validated') || (save.mode !== 'expert' && reassessments === 0);
  const final = computeFinalScore(save, auditPassed, reassessments);

  const strengths = final.parts.filter((p) => p.value >= 65).map((p) => p.label);
  const improvements = final.parts.filter((p) => p.value < 50).map((p) => p.label);
  const earnedBadges = BADGES.filter((b) => save.badges.includes(b.id));

  return (
    <div className="home" style={{ alignItems: 'flex-start', overflowY: 'auto' }}>
      <div className="container" style={{ width: 'min(900px,100%)', color: '#fff' }}>
        <div className="center">
          <p style={{ opacity: 0.8 }}>{STR.end.grade}</p>
          <div className="score-hero" style={{ color: 'var(--leyton-orange-main)' }}>
            {final.grade}
          </div>
          <p style={{ fontSize: '1.4rem' }}>{final.total} / 100</p>
        </div>

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
