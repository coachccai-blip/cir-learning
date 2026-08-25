// Sortie honorable après deux missions menées à leur terme.
//
// Une saison complète dure six semaines et peut occuper six dossiers. C'est
// trop long pour l'usage réel : au bout de deux missions conduites du premier
// appel jusqu'au bilan, un consultant a vu tout l'enchaînement du métier
// — décrocher, cadrer, qualifier, chiffrer, rédiger, restituer. Le jeu le lui
// dit et lui ouvre la porte, sans la lui imposer : qui veut continuer continue,
// avec les pistes suivantes qui arrivent au fil des semaines.
//
// Module pur : ni React, ni stockage.

import type { ClientState, DossierState } from './types';

/** Un dossier est « mené à son terme » une fois le bilan de mission rendu. */
const COMPLETED: DossierState[] = ['CLOSED', 'DEPOSITED'];

export function completedMissions(portfolio: readonly ClientState[]): number {
  return portfolio.filter((c) => COMPLETED.includes(c.dossierState)).length;
}

/** Le joueur a-t-il fait le tour du métier ? */
export function hasGraduated(portfolio: readonly ClientState[], target: number): boolean {
  return completedMissions(portfolio) >= target;
}

/** Combien de missions restent avant la sortie proposée. */
export function missionsToGo(portfolio: readonly ClientState[], target: number): number {
  return Math.max(0, target - completedMissions(portfolio));
}
