import { STR } from '../i18n/fr';
import { useStore } from '../state/store';

export function HomeScreen() {
  const go = useStore((s) => s.go);
  const save = useStore((s) => s.save);

  return (
    <div className="home">
      <div className="home-card">
        <div className="home-logo">
          {STR.appTitle.toUpperCase()}
        </div>
        <div className="home-sub">{STR.appTagline}</div>
        <p className="home-pitch">{STR.appPitch}</p>
        <div className="home-menu">
          <button className="btn btn-primary" onClick={() => go('mode')}>
            {STR.menu.newGame}
          </button>
          {save && (
            <button className="btn" onClick={() => go(save.finished ? 'end' : save.phase === 'DAY' ? 'day' : 'night')}>
              {STR.menu.continue} — {STR.hud.cycle} {save.cycle}
            </button>
          )}
          <button className="btn" onClick={() => go('freemode')}>
            {STR.menu.freeMode}
          </button>
          <button className="btn" onClick={() => go('codex')}>
            {STR.menu.codex}
          </button>
          <button className="btn" onClick={() => go('leaderboard')}>
            {STR.menu.leaderboard}
          </button>
          <button className="btn" onClick={() => go('options')}>
            {STR.menu.options}
          </button>
        </div>
        <p className="disclaimer">⚠️ {STR.disclaimer}</p>
      </div>
    </div>
  );
}
