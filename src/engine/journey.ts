// Parcours en deux saisons.
//
// Le jeu n'est plus une partie unique déclinée en deux difficultés : c'est un
// parcours. On apprend le métier en Onboarding — la première saison donne les
// taux justifiables, ouvre les postes un par un, et pardonne. Puis on le tient
// vraiment en Expert : les interlocuteurs embellissent, la preuve se gagne sur
// le terrain, un dossier doit être refusé, et le vérificateur relance.
//
// Module pur : l'ordre des saisons et l'état d'avancement ne dépendent ni du
// stockage ni de React.

import type { GameMode } from './types';

/** Ordre imposé : on ne saute pas la première saison. */
export const JOURNEY: GameMode[] = ['onboarding', 'expert'];

export interface Progress {
  /** Saisons menées jusqu'à l'écran de fin. */
  completed: GameMode[];
  /** Meilleur score obtenu par saison. */
  best: Partial<Record<GameMode, number>>;
}

export const EMPTY_PROGRESS: Progress = { completed: [], best: {} };

/** Saison précédente dans le parcours, ou null pour la première. */
export function requiredBefore(mode: GameMode): GameMode | null {
  const i = JOURNEY.indexOf(mode);
  return i > 0 ? JOURNEY[i - 1] : null;
}

export function isUnlocked(mode: GameMode, progress: Progress): boolean {
  const required = requiredBefore(mode);
  return required === null || progress.completed.includes(required);
}

/** La saison suivant celle qui vient d'être terminée, si elle existe. */
export function nextSeason(mode: GameMode): GameMode | null {
  const i = JOURNEY.indexOf(mode);
  return i >= 0 && i + 1 < JOURNEY.length ? JOURNEY[i + 1] : null;
}

export function journeyComplete(progress: Progress): boolean {
  return JOURNEY.every((m) => progress.completed.includes(m));
}

/** Enregistre une saison terminée. Le meilleur score est conservé. */
export function completeSeason(progress: Progress, mode: GameMode, score: number): Progress {
  return {
    completed: progress.completed.includes(mode) ? progress.completed : [...progress.completed, mode],
    best: { ...progress.best, [mode]: Math.max(progress.best[mode] ?? 0, score) },
  };
}
