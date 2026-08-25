import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { Icon } from '../ui/Icon';
import { completedMissions, hasGraduated } from '../engine/graduation';
import balance from '../data/balance.json';

/**
 * Sortie honorable. Deux missions menées jusqu'au bilan suffisent à avoir vu
 * tout l'enchaînement du métier : le jeu le dit et propose de s'arrêter là,
 * sans jamais fermer la porte à qui veut continuer.
 */
export function GraduationBanner() {
  const save = useStore((s) => s.save);
  const finishSeason = useStore((s) => s.finishSeason);
  const acknowledge = useStore((s) => s.acknowledgeGraduation);

  if (!save || save.graduationAcknowledged) return null;
  if (!hasGraduated(save.portfolio, balance.missionsToGraduate)) return null;

  return (
    <div className="panel graduation-card">
      <div className="panel-title">
        <Icon name="trophy" size={22} />
        <h2>{STR.graduation.title}</h2>
      </div>
      <p className="lede">{STR.graduation.body}</p>
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" data-sfx="validate" onClick={finishSeason}>
          <Icon name="flag" size={17} /> {STR.graduation.quit}
        </button>
        <button className="btn" onClick={acknowledge}>
          <Icon name="play" size={17} /> {STR.graduation.keepPlaying}
        </button>
      </div>
    </div>
  );
}

/**
 * Rappel discret une fois la proposition écartée : la porte reste ouverte à
 * chaque semaine, sans réafficher le grand panneau.
 */
export function GraduationButton() {
  const save = useStore((s) => s.save);
  const finishSeason = useStore((s) => s.finishSeason);

  if (!save || !save.graduationAcknowledged) return null;
  if (!hasGraduated(save.portfolio, balance.missionsToGraduate)) return null;

  return (
    <button
      className="btn btn-sm"
      onClick={finishSeason}
      title={STR.graduation.progress(completedMissions(save.portfolio), balance.missionsToGraduate)}
    >
      <Icon name="flag" size={15} /> {STR.graduation.quit}
    </button>
  );
}
