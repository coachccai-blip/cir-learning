import { STR } from '../i18n/fr';
import { useStore, chapterForCycle, nextMilestone } from '../state/store';
import { CYCLE_DATES } from '../data/calendar';
import { gradeForXp } from '../engine/economy';
import { Icon } from '../ui/Icon';

export function TopBar() {
  const save = useStore((s) => s.save);
  const go = useStore((s) => s.go);
  if (!save) return null;

  const chapter = chapterForCycle(save.cycle);
  const ms = nextMilestone(save.cycle);
  const grade = gradeForXp(save.xp);
  // Alerte « J-2 » : l'échéance tombe cette semaine ou la suivante.
  const deadlineSoon = ms !== null && ms.cycle - save.cycle <= 1 && ms.alert !== false;

  return (
    <header className="topbar">
      {/* Groupe 1 — temps : phase, date, chapitre */}
      <div className="brand" onClick={() => go('home')} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
        {STR.appTitle.toUpperCase()}
      </div>
      <div className="hud-group hud-time">
        <div className="hud-chip hud-primary">
          <span className="hud-label">
            <Icon name={save.phase === 'DAY' ? 'relation' : 'technique'} size={15} />
            {save.phase === 'DAY' ? STR.hud.day : STR.hud.night} · {STR.hud.cycle} {save.cycle}
          </span>
          <strong>{CYCLE_DATES[save.cycle - 1]}</strong>
        </div>
        <span className="tag hud-chapter">
          <Icon name="book" size={14} />
          {STR.hud.chapter(chapter.num)} · {chapter.title}
        </span>
      </div>

      <div className="hud">

        {/* Groupe 3 — progression : discret */}
        <div className="hud-group hud-secondary">
          <div className="hud-chip">
            <span className="hud-label">
              <Icon name="star" size={14} /> {grade.label}
            </span>
            <strong>{save.xp} XP</strong>
          </div>
          <div className="hud-chip">
            <span className="hud-label">
              <Icon name="euro" size={14} /> {STR.hud.revenue}
            </span>
            <strong>{save.revenue.signed.toLocaleString('fr-FR')} €</strong>
          </div>
        </div>

        {/* Deadline : chip normale, ou alerte pulsante à J-2 */}
        {ms && (
          <div className={`hud-chip${deadlineSoon ? ' deadline-alert' : ' hud-secondary'}`} title={ms.consequence || ms.label}>
            <span className="hud-label">
              <Icon name={deadlineSoon ? 'alert' : 'calendar'} size={14} /> {STR.hud.nextDeadline}
            </span>
            <strong>
              {ms.date} (S{ms.cycle})
            </strong>
          </div>
        )}
      </div>
    </header>
  );
}
