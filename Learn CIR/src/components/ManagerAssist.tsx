import { Avatar } from '../avatars/Avatar';
import { SpeakButton } from './SpeakButton';
import { STR } from '../i18n/fr';

/**
 * La manager en accompagnement, sur les écrans de la phase Technique.
 *
 * Ces écrans sont les plus denses du jeu et les seuls où l'on est seul : ni
 * interlocuteur, ni portrait, ni voix. Amélie Roux y reprend sa place — elle
 * rappelle la consigne par écrit, et la lit à voix haute pour qui préfère
 * écouter en travaillant sur le tableau.
 */
export function ManagerAssist({ text }: { text: string }) {
  return (
    <aside className="panel-flat manager-assist">
      <div className="manager-avatar">
        <Avatar seed="Amélie Roux (manager)" expression="satisfait" />
      </div>
      <div className="manager-body">
        <div className="manager-name">
          {STR.manager.name} <span className="muted">· {STR.manager.role}</span>
        </div>
        <p className="manager-text">{text}</p>
      </div>
      <SpeakButton text={text} gender="F" />
    </aside>
  );
}
