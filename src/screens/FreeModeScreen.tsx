import { STR } from '../i18n/fr';
import { useStore } from '../state/store';

export function FreeModeScreen() {
  const go = useStore((s) => s.go);
  const newGame = useStore((s) => s.newGame);

  return (
    <div className="container">
      <div className="row">
        <h1>{STR.freeMode.title}</h1>
        <span className="spacer" />
        <button className="btn" onClick={() => go('home')}>
          {STR.common.back}
        </button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', marginTop: 16 }}>
        <div className="panel">
          <h3>{STR.freeMode.season}</h3>
          <p className="muted">{STR.freeMode.seasonDesc}</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => newGame('onboarding')}>
            {STR.common.play}
          </button>
        </div>
        <div className="panel">
          <h3>{STR.freeMode.daily}</h3>
          <p className="muted">{STR.freeMode.dailyDesc}</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => newGame('expert')}>
            {STR.common.play}
          </button>
        </div>
      </div>
    </div>
  );
}
