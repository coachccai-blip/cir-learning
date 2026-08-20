import { useRef, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { persistLeaderboard } from '../state/persistence';
import type { GameMode, LeaderboardEntry } from '../engine/types';

const MODES: GameMode[] = ['discovery', 'onboarding', 'expert'];

export function LeaderboardScreen() {
  const go = useStore((s) => s.go);
  const save = useStore((s) => s.save);
  const leaderboard = useStore((s) => s.leaderboard);
  const [mode, setMode] = useState<GameMode>(save?.mode ?? 'onboarding');
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = leaderboard.filter((e) => e.mode === mode).sort((a, b) => b.score - a.score);

  function exportJson() {
    const blob = new Blob([JSON.stringify(leaderboard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cirquest-classement.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as LeaderboardEntry[];
        const merged = [...leaderboard, ...data].sort((a, b) => b.score - a.score);
        persistLeaderboard(merged);
        useStore.setState({ leaderboard: merged });
      } catch {
        /* fichier invalide, ignoré */
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="container">
      <div className="row">
        <h1>{STR.leaderboard.title}</h1>
        <span className="spacer" />
        <button className="btn" onClick={() => go('home')}>
          {STR.common.back}
        </button>
      </div>

      <div className="row" style={{ margin: '12px 0' }}>
        <span className="muted">{STR.leaderboard.filterMode} :</span>
        {MODES.map((m) => (
          <button key={m} className={`btn btn-sm${mode === m ? ' btn-primary' : ''}`} onClick={() => setMode(m)}>
            {STR.modes[m].label}
          </button>
        ))}
        <span className="spacer" />
        <button className="btn btn-sm" onClick={exportJson}>
          {STR.leaderboard.export}
        </button>
        <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
          {STR.leaderboard.import}
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={importJson} />
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <p className="muted">{STR.leaderboard.empty}</p>
        ) : (
          <table className="assiette-table">
            <thead>
              <tr>
                <th>{STR.leaderboard.rank}</th>
                <th>{STR.leaderboard.pseudo}</th>
                <th>{STR.leaderboard.score}</th>
                <th>{STR.leaderboard.gradeCol}</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{e.pseudo}</td>
                  <td>
                    <strong>{e.score}</strong>
                  </td>
                  <td>
                    <span className="tag tag-accent">{e.grade}</span>
                  </td>
                  <td>{e.badges}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
