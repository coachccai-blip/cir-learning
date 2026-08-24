// Calendrier d'arrivée des pistes écrites.
//
// Le vivier servait ses six dossiers dans un ordre tiré à la graine. C'est
// trop pour un joueur qui découvre le métier : il en ouvrait trois ou quatre,
// n'en menait aucun au bout, et la sortie proposée après deux missions
// devenait illisible. Il en sert désormais deux, toujours les mêmes, dans un
// ordre fixe — Maison Dupuis dès la première semaine, Mecaprécis à la
// deuxième. Le joueur a le temps de mener chacune jusqu'au bilan.
//
// Le reste du catalogue n'est pas perdu : il s'ouvre d'un coup dans les
// prospects pour qui décline la sortie proposée et choisit de continuer
// (cf. `remainingProspects` dans `engine/roster.ts`).

export interface PipelineEntry {
  clientId: string;
  /** Semaine où la fiche apparaît dans le vivier de prospection. */
  cycle: number;
}

export const PIPELINE: PipelineEntry[] = [
  { clientId: 'cli_agri_dupuis', cycle: 1 },
  { clientId: 'cli_indus_verdier', cycle: 2 },
];
