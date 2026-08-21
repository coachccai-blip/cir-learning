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
          {(() => {
            // Seed dérivée de la date : même portefeuille et mêmes tirages pour
            // tous les joueurs du jour (§10.3).
            const today = new Date().toISOString().slice(0, 10);
            return (
              <>
                <p style={{ marginTop: 8 }}>
                  <span className="tag tag-accent">Défi du {today.split('-').reverse().join('/')}</span>
                </p>
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => newGame('onboarding', `daily-${today}`)}>
                  {STR.common.play}
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
