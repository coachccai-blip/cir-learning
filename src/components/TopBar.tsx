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
  // Alerte « J-2 » : l'échéance tombe cette semaine ou la suivante.
  const deadlineSoon = ms !== null && ms.cycle - save.cycle <= 1 && ms.consequence !== '';

  // Autant de pastilles que de PA possibles dans la phase (jour + bonus forme).
  const maxDots = Math.max(save.actionPoints, save.phase === 'DAY' ? 11 : 8);
  const dots = [];
  for (let i = 0; i < maxDots; i++) dots.push(<span key={i} className={`pa-dot${i < save.actionPoints ? ' on' : ''}`} />);

  return (
    <header className="topbar">
      {/* Groupe 1 — temps : phase, date, chapitre */}
      <div className="brand" onClick={() => go('home')} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
        {STR.appTitle.toUpperCase()}
      </div>
      <div className="hud-group hud-time">
        <div className="hud-chip hud-primary">
          <span>
            {save.phase === 'DAY' ? '☀ ' + STR.hud.day : '☾ ' + STR.hud.night} · {STR.hud.cycle} {save.cycle}
          </span>
          <strong>{CYCLE_DATES[save.cycle - 1]}</strong>
        </div>
        <span className="tag hud-chapter">
          Ch.{chapter.num} · {chapter.title}
        </span>
      </div>

      <div className="hud">
        {/* Groupe 2 — ressources actionnables : PA, énergie */}
        <div className="hud-group">
          <div className="hud-chip hud-primary">
            <span>{STR.hud.pa}</span>
            <span className="pa-dots">{dots}</span>
          </div>
          <div className="hud-chip hud-primary">
            <span>
              {STR.hud.energy} · {ENERGY_STATE_LABEL[estate]}
            </span>
            <strong>{save.energy}</strong>
          </div>
        </div>

        {/* Groupe 3 — progression : discret */}
        <div className="hud-group hud-secondary">
          <div className="hud-chip">
            <span>{grade.label}</span>
            <strong>{save.xp} XP</strong>
          </div>
          <div className="hud-chip">
            <span>{STR.hud.revenue}</span>
            <strong>{save.revenue.signed.toLocaleString('fr-FR')} €</strong>
          </div>
        </div>

        {/* Deadline : chip normale, ou alerte pulsante à J-2 */}
        {ms && (
          <div className={`hud-chip${deadlineSoon ? ' deadline-alert' : ' hud-secondary'}`} title={ms.consequence || ms.label}>
            <span>{deadlineSoon ? '⚠ ' + STR.hud.nextDeadline : STR.hud.nextDeadline}</span>
            <strong>
              {ms.date} (S{ms.cycle})
            </strong>
          </div>
        )}
      </div>
    </header>
  );
}
