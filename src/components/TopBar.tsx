import { STR } from '../i18n/fr';
import { useStore, chapterForCycle, nextMilestone } from '../state/store';
import { CYCLE_DATES } from '../data/calendar';
import { energyState, ENERGY_STATE_LABEL, gradeForXp } from '../engine/economy';

export function TopBar() {
  const save = useStore((s) => s.save);
  const go = useStore((s) => s.go);
  if (!save) return null;

  const chapter = chapterForCycle(save.cycle);
  const ms = nextMilestone(save.cycle);
  const grade = gradeForXp(save.xp);
  const estate = energyState(save.energy);

  const dots = [];
  for (let i = 0; i < 6; i++) dots.push(<span key={i} className={`pa-dot${i < save.actionPoints ? ' on' : ''}`} />);

  return (
    <header className="topbar">
      <div className="brand" onClick={() => go('home')} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
        CIR QUEST
      </div>
      <span className="tag" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>
        Ch.{chapter.num} · {chapter.title}
      </span>
      <div className="hud">
        <div className="hud-chip">
          <span>
            {save.phase === 'DAY' ? '☀ ' + STR.hud.day : '☾ ' + STR.hud.night} · {STR.hud.cycle} {save.cycle}
          </span>
          <strong>{CYCLE_DATES[save.cycle - 1]}</strong>
        </div>
        <div className="hud-chip">
          <span>{STR.hud.pa}</span>
          <span className="pa-dots">{dots}</span>
        </div>
        <div className="hud-chip">
          <span>
            {STR.hud.energy} · {ENERGY_STATE_LABEL[estate]}
          </span>
          <strong>{save.energy}</strong>
        </div>
        <div className="hud-chip">
          <span>{grade.label}</span>
          <strong>{save.xp} XP</strong>
        </div>
        <div className="hud-chip">
          <span>{STR.hud.revenue}</span>
          <strong>{save.revenue.signed.toLocaleString('fr-FR')} €</strong>
        </div>
        {ms && (
          <div className="hud-chip" title={ms.label}>
            <span>{STR.hud.nextDeadline}</span>
            <strong>
              {ms.date} (S{ms.cycle})
            </strong>
          </div>
        )}
      </div>
    </header>
  );
}
