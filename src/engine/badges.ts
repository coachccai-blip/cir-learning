// Badges — chaque badge = une notion maîtrisée (§5.3).

import type { SaveGame } from './types';

export interface BadgeDef {
  id: string;
  label: string;
  description: string;
  earned: (save: SaveGame) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'verrou_leve',
    label: 'Verrou levé',
    description: 'Caractériser correctement 5 verrous techniques.',
    earned: (s) => s.stats.verrousOk >= 5,
  },
  {
    id: 'non_c_est_non',
    label: 'Non, c’est non',
    description: 'Refuser 3 missions non éligibles.',
    earned: (s) => s.stats.refusedMissions >= 3,
  },
  {
    id: 'assiette_au_gramme',
    label: 'Assiette au gramme près',
    description: '3 assiettes exactes à ±1 %.',
    earned: (s) => s.stats.exactBases >= 3,
  },
  {
    id: 'rien_a_declarer',
    label: 'Rien à déclarer',
    description: 'Passer un contrôle fiscal sans aucun rappel.',
    earned: (s) => s.portfolio.some((c) => c.auditOutcome === 'validated'),
  },
  {
    id: 'sceptique_converti',
    label: 'Le sceptique converti',
    description: 'Signer un client sceptique malgré une humeur très basse.',
    earned: (s) =>
      s.portfolio.some(
        (c) => c.clientId === 'cli_indus_verdier' && c.dossierState !== 'LEAD' && c.dossierState !== 'LOST',
      ),
  },
  {
    id: 'nuit_blanche',
    label: 'Nuit blanche… une seule',
    description: 'Terminer la saison sans jamais descendre sous 25 d’énergie.',
    earned: (s) => s.finished && s.stats.minEnergy >= 25,
  },
  {
    id: 'le_mot_juste',
    label: 'Le mot juste',
    description: '10 choix de dialogue d’affilée sans jargon ni faute de posture.',
    earned: (s) => s.stats.noJargonStreak >= 10,
  },
  {
    id: 'trieur',
    label: 'L’œil du trieur',
    description: '20 cartes de qualification correctement classées.',
    earned: (s) => s.stats.cardsCorrect >= 20,
  },
  {
    id: 'portefeuille_plein',
    label: 'Portefeuille plein',
    description: 'Déposer 4 dossiers dans les délais.',
    earned: (s) => s.portfolio.filter((c) => c.dossierState === 'DEPOSITED').length >= 4,
  },
  {
    id: 'bibliothecaire',
    label: 'Le bibliothécaire',
    description: 'Lire 20 fiches codex.',
    earned: (s) => s.codexRead.length >= 20,
  },
];

/** Retourne les badges nouvellement gagnés. */
export function newBadges(save: SaveGame): BadgeDef[] {
  return BADGES.filter((b) => !save.badges.includes(b.id) && b.earned(save));
}
