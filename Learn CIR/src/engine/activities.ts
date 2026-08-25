import type { ClientState } from './types';

/** Nature de l'activité commerciale proposée sur un dossier, à un instant donné. */
export type ClientActionKind = 'discovery' | 'proposal' | 'kickoff' | 'followup' | 'closing';

export type ClientAction = { kind: ClientActionKind; cost: number };

/**
 * Prochaine action disponible sur un dossier. Chaque activité est à usage unique :
 * l'avancement de `dossierState` consomme naturellement découverte, proposition,
 * kick-off et bilan. Le suivi de mission, lui, ne fait pas avancer l'état — c'est
 * `followupDone` qui garantit qu'il ne se rejoue pas en boucle (un seul par client).
 * `null` = plus rien à faire de jour sur ce dossier.
 */
export function nextClientAction(cs: ClientState): ClientAction | null {
  switch (cs.dossierState) {
    case 'LEAD':
      return { kind: 'discovery', cost: 2 };
    case 'QUALIFIED':
      return { kind: 'proposal', cost: 1 };
    case 'SIGNED':
      return { kind: 'kickoff', cost: 2 };
    case 'KICKED_OFF':
    case 'CARDS_DONE':
    case 'BASE_DONE':
      return cs.followupDone ? null : { kind: 'followup', cost: 1 };
    case 'JUSTIFIED':
      return { kind: 'closing', cost: 2 };
    default:
      return null;
  }
}

/**
 * Où en est la journée, du point de vue de la manager.
 *
 * Le joueur arrivait sur un portefeuille vide sans savoir par quel bout
 * commencer, puis restait en phase Relation client une fois tout fait, faute
 * qu'on lui dise que la suite se passe ailleurs. Ces trois états couvrent la
 * boucle : on décroche, on mène ses rendez-vous, on bascule au montage.
 */
export type DayStage = 'prospect' | 'meetings' | 'technique';

export function dayStage(portfolio: readonly ClientState[]): DayStage {
  const open = portfolio.filter(
    (cs) => cs.dossierState !== 'LOST' && cs.dossierState !== 'CLOSED' && cs.dossierState !== 'DEPOSITED',
  );
  // Sans dossier ouvert, il n'y a rien d'autre à faire que le téléphone.
  if (open.length === 0) return 'prospect';
  // Un rendez-vous, un kick-off ou un suivi en attente : la journée n'est pas finie.
  if (open.some((cs) => nextClientAction(cs) !== null)) return 'meetings';
  return 'technique';
}
