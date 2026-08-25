// Qui passe devant le vérificateur, et qui n'y passe pas.
//
// Le brief est explicite (§8.5) : le contrôle se déclenche sur les dossiers
// dont la Sécurité est inférieure au seuil. Or l'écran de contrôle s'affichait
// à la fin de toutes les parties : quand aucun dossier ne le méritait, le joueur tombait
// quand même sur le vérificateur, qui lui annonçait n'avoir rien à lui dire.
// Un contrôle qui arrive à tous les coups n'enseigne plus rien — c'est
// justement l'absence de contrôle qui récompense un travail propre.
//
// Module pur : ni React, ni stockage.

import type { ClientState } from './types';

/** Dossiers réellement contrôlables : ceux dont l'assiette a été chiffrée. */
export function auditableDossiers(portfolio: readonly ClientState[]): ClientState[] {
  return portfolio.filter((c) => c.assietteInput !== null);
}

/**
 * Le dossier qui sera contrôlé : le plus faible, c'est-à-dire celui dont
 * l'assiette est la moins précise. Le vérificateur ne tire pas au sort.
 */
export function weakestDossier(portfolio: readonly ClientState[]): ClientState | null {
  const dossiers = auditableDossiers(portfolio);
  if (dossiers.length === 0) return null;
  return dossiers.slice().sort((a, b) => (a.scores.base ?? 1) - (b.scores.base ?? 1))[0];
}

/**
 * Un contrôle de fin de saison est-il dû ? Seulement si la sécurité fiscale
 * est passée sous le seuil : une saison bien tenue s'achève sans visite, et
 * c'est la récompense.
 */
export function finalAuditDue(
  security: number,
  threshold: number,
  portfolio: readonly ClientState[],
): boolean {
  if (auditableDossiers(portfolio).length === 0) return false;
  return security < threshold;
}
