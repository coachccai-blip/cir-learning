// Courbe d'apprentissage de l'assiette.
//
// Jusqu'ici la première assiette d'une partie présentait d'un coup les cinq
// postes de dépense, avec la même tolérance que la dernière. Un joueur qui
// découvre le CIR devait donc arbitrer les taux d'affectation, les agréments
// MESR, les aides publiques et les postes supprimés dans le même écran — et
// rien ne se durcissait ensuite.
//
// Les postes arrivent maintenant un par un, dans l'ordre où on les apprend, et
// l'exigence de précision se resserre à chaque dossier. La courbe est une
// donnée d'équilibrage (`balance.json`), pas une règle en dur.

import balance from '../data/balance.json';
import type { AssietteCase, SaveGame } from './types';

export type Poste = 'personnel' | 'amortization' | 'subcontracting' | 'grants' | 'decoys';

export const ALL_POSTES: Poste[] = [
  'personnel',
  'amortization',
  'subcontracting',
  'grants',
  'decoys',
];

export interface ProgressionStep {
  /** Rang du dossier dans la partie (1 = première assiette construite). */
  index: number;
  postes: Poste[];
  tolerance: number;
  /** Postes qui apparaissent pour la première fois à cette étape. */
  introduces: Poste[];
}

type RawStep = { postes: string[]; tolerance: number };

function curve(): RawStep[] {
  const steps = balance.progression as RawStep[];
  if (steps.length === 0) throw new Error('Courbe de progression absente');
  return steps;
}

/**
 * Étape de progression du n-ième dossier instruit. Au-delà de la courbe, la
 * dernière marche est conservée : une saison plus longue ne redevient jamais
 * plus facile.
 */
export function stepFor(index: number): ProgressionStep {
  const steps = curve();
  const i = Math.max(1, Math.round(index));
  const raw = steps[Math.min(i, steps.length) - 1];
  const prev = i > 1 ? steps[Math.min(i - 1, steps.length) - 1] : null;
  const postes = raw.postes as Poste[];
  return {
    index: i,
    postes,
    tolerance: raw.tolerance,
    introduces: prev ? postes.filter((p) => !prev.postes.includes(p)) : [],
  };
}

/** Tolérance de précision applicable au n-ième dossier. */
export function toleranceForStep(index: number): number {
  return stepFor(index).tolerance;
}

/**
 * Masque les postes non encore introduits. Le joueur et le corrigé travaillent
 * sur le même cas restreint : l'assiette juste d'un dossier « personnel seul »
 * est bien celle du personnel seul, pas une assiette complète amputée.
 */
export function restrictCase(c: AssietteCase, postes: readonly Poste[]): AssietteCase {
  const has = (p: Poste) => postes.includes(p);
  if (ALL_POSTES.every(has)) return c;
  return {
    ...c,
    personnel: has('personnel') ? c.personnel : [],
    amortization: has('amortization') ? c.amortization : [],
    subcontracting: has('subcontracting') ? c.subcontracting : [],
    grants: has('grants') ? c.grants : [],
    decoys: has('decoys') ? c.decoys : [],
  };
}

/**
 * Étape applicable au dossier d'un client. Tant que l'assiette n'a pas été
 * ouverte, l'étape se déduit du nombre d'assiettes déjà construites ; ensuite
 * elle est figée dans la sauvegarde.
 */
export function stepForClient(save: SaveGame, clientId: string): ProgressionStep {
  const cs = save.portfolio.find((c) => c.clientId === clientId);
  if (cs?.baseStep) return stepFor(cs.baseStep);
  const done = save.portfolio.filter(
    (c) => c.assietteInput !== null && c.clientId !== clientId,
  ).length;
  return stepFor(done + 1);
}
