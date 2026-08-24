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

/**
 * Ordre conseillé, pas imposé. La deuxième saison suppose les réflexes de la
 * première, mais un consultant déjà en poste doit pouvoir y aller directement :
 * on l'en informe, on ne lui barre pas la route.
 */
export const JOURNEY: GameMode[] = ['onboarding', 'expert'];

export interface Progress {
  /** Saisons menées jusqu'à l'écran de fin. */
  completed: GameMode[];
  /** Meilleur score obtenu par saison. */
  best: Partial<Record<GameMode, number>>;
}

export const EMPTY_PROGRESS: Progress = { completed: [], best: {} };

/** Saison conseillée avant celle-ci, ou null pour la première. */
export function advisedBefore(mode: GameMode): GameMode | null {
  const i = JOURNEY.indexOf(mode);
  return i > 0 ? JOURNEY[i - 1] : null;
}

/**
 * Le joueur a-t-il déjà mené la saison conseillée en amont ? Sert à afficher
 * une recommandation, jamais à interdire un départ : toutes les saisons sont
 * jouables dès la première partie.
 */
export function followsAdvice(mode: GameMode, progress: Progress): boolean {
  const advised = advisedBefore(mode);
  return advised === null || progress.completed.includes(advised);
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
