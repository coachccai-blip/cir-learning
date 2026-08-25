// Résolution du dossier tel que le joueur le voit.
//
// Un même cas d'assiette peut être servi de plusieurs façons : la variante
// tirée pour la partie en cours, et la restriction aux seuls postes déjà
// introduits par la courbe d'apprentissage. Tous les écrans et le magasin
// doivent passer par ici, sinon le corrigé, le contrôle et l'affichage
// finissent par diverger.

import { caseById } from '../data/cases';
import { clientById } from '../data/clients';
import { restrictCase, stepForClient, type ProgressionStep } from '../engine/progression';
import type { AssietteCase, SaveGame } from '../engine/types';

export function caseForClient(save: SaveGame, clientId: string): AssietteCase {
  return restrictCase(caseById(clientById(clientId).caseId), stepForClient(save, clientId).postes);
}

export function stepForDossier(save: SaveGame, clientId: string): ProgressionStep {
  return stepForClient(save, clientId);
}
