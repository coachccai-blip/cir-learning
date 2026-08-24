// Calendrier d'arrivée des pistes écrites, saison par saison.
//
// La première saison servait ses six dossiers dans un ordre tiré à la graine.
// C'est trop pour un joueur qui découvre : il en ouvrait trois ou quatre, n'en
// menait aucun au bout, et la sortie proposée après deux missions devenait
// illisible. Elle en sert désormais deux, toujours les mêmes, dans un ordre
// fixe — Maison Dupuis dès la première semaine, Mecaprécis à la deuxième. Le
// joueur a le temps de mener chacune jusqu'au bilan. Le reste du catalogue
// n'est pas perdu : il s'ouvre d'un coup dans les prospects pour qui décline
// la sortie proposée après deux missions et choisit de continuer.
//
// La deuxième saison garde son vivier tiré à la graine : le joueur y est
// aguerri, et deux parties ne doivent pas se ressembler.

import type { GameMode } from '../engine/types';

export interface PipelineEntry {
  clientId: string;
  /** Semaine où la fiche apparaît dans le vivier de prospection. */
  cycle: number;
}

/**
 * Calendrier imposé, quand la saison en a un. `null` = vivier tiré à la
 * graine (cf. `roster.ts`).
 */
export const PIPELINE: Record<GameMode, PipelineEntry[] | null> = {
  onboarding: [
    { clientId: 'cli_agri_dupuis', cycle: 1 },
    { clientId: 'cli_indus_verdier', cycle: 2 },
  ],
  expert: null,
};
