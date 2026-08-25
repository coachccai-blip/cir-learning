// Y a-t-il une partie à reprendre ?
//
// L'accueil proposait « Continuer » dès qu'une sauvegarde traînait dans le
// navigateur — y compris après une saison terminée, où le bouton ne menait pas
// à une partie mais au bilan de fin. On promettait de reprendre le jeu là où
// on l'avait laissé, et on rouvrait un écran de conclusion.
//
// Module pur : ni React, ni stockage.

import type { SaveGame } from './types';

/**
 * Une partie est en cours si elle existe et n'est pas allée à son terme.
 * Une saison terminée se rejoue, elle ne se reprend pas.
 */
export function inProgress(save: SaveGame | null): save is SaveGame {
  return save !== null && !save.finished;
}
