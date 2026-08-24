// Portefeuille de la deuxième saison (mode Expert). Données fictives.
//
// Ce sont d'autres entreprises que celles de l'Onboarding : rejouer la même
// campagne en plus sévère n'apprenait rien de neuf. Les visages, eux, sont
// ceux déjà produits pour le jeu — les figures secondaires de la première
// saison passent au premier plan, dans d'autres maisons et d'autres rôles.

import type { ClientDef } from '../engine/types';

export const EXPERT_CLIENTS: ClientDef[] = [
  {
    id: 'cli_exp_ovalis',
    name: 'Ovalis Nutrition',
    sector: 'AGRI',
    sectorLabel: 'Nutrition et compléments alimentaires',
    profileDifficulty: 3,
    headcount: 140,
    isSme: true,
    leadCycle: 1,
    contact: {
      name: 'Nadia Cherif',
      gender: 'F',
      role: 'Directrice qualité et R&D',
      archetype: 'CFO',
      avatarSeed: 'cherif-07',
      initialMood: 62,
      initialTrust: 40,
    },
    fees: { successRate: 0.18, negotiable: true, floorRate: 0.13 },
    caseId: 'case_exp_ovalis',
    scenarios: {
      discovery: 'sc_exp_disc_embellie',
      kickoff: 'sc_exp_kickoff',
      followup: 'sc_exp_followup',
      closing: 'sc_exp_cl_ovalis',
    },
    cardsetId: 'cards_exp_ovalis',
    cirEstimate: [70000, 105000],
    pitch:
      'Encapsulation de ferments vivants — un vrai verrou. Nadia Cherif arrive avec un tableau déjà rempli : taux ronds, homogènes, et aucune feuille de temps derrière.',
  },
  {
    id: 'cli_exp_fluxym',
    name: 'Fluxym',
    sector: 'SAAS',
    sectorLabel: 'Éditeur d’ordonnancement industriel',
    profileDifficulty: 3,
    headcount: 95,
    isSme: true,
    leadCycle: 1,
    contact: {
      name: 'Kevin Roy',
      gender: 'M',
      role: 'Directeur technique',
      archetype: 'DREAMER',
      avatarSeed: 'roy-09',
      initialMood: 72,
      initialTrust: 44,
    },
    fees: { successRate: 0.18, negotiable: true, floorRate: 0.13 },
    caseId: 'case_exp_fluxym',
    scenarios: {
      discovery: 'sc_exp_disc_embellie',
      kickoff: 'sc_exp_kickoff',
      followup: 'sc_exp_fu_fluxym',
      closing: 'sc_exp_cl_fluxym',
    },
    cardsetId: 'cards_exp_fluxym',
    cirEstimate: [150000, 220000],
    pitch:
      'Un solveur d’ordonnancement qui bute sur un vrai mur algorithmique, noyé dans beaucoup d’édition logicielle ordinaire. Deux financements publics croisés à démêler.',
  },
  {
    id: 'cli_exp_forgeal',
    name: 'Forgeal Industries',
    sector: 'INDUS',
    sectorLabel: 'Usinage de pièces réfractaires',
    profileDifficulty: 3,
    headcount: 36,
    isSme: true,
    leadCycle: 2,
    contact: {
      name: 'Bruno Meyer',
      gender: 'M',
      role: 'Gérant',
      archetype: 'SILENT',
      avatarSeed: 'meyer-atelier-11',
      initialMood: 58,
      initialTrust: 38,
    },
    fees: { successRate: 0.18, negotiable: false, floorRate: 0.18 },
    caseId: 'case_exp_forgeal',
    scenarios: {
      discovery: 'sc_exp_disc_refus',
      kickoff: 'sc_exp_kickoff',
      followup: 'sc_exp_fu_forgeal',
      closing: 'sc_exp_cl_forgeal',
    },
    cardsetId: 'cards_exp_forgeal',
    cirEstimate: [0, 18000],
    pitch:
      'Atelier remarquable, savoir-faire rare — et presque rien d’éligible au CIR. Bruno Meyer a un concurrent qui « prend tout ». La bonne réponse n’est pas de monter le dossier.',
  },
  {
    id: 'cli_exp_neoregen',
    name: 'Néorégén',
    sector: 'BIOTECH',
    sectorLabel: 'Thérapie cellulaire',
    profileDifficulty: 3,
    headcount: 62,
    isSme: true,
    leadCycle: 2,
    contact: {
      name: 'Dr. Amina Sy',
      gender: 'F',
      role: 'Directrice scientifique',
      archetype: 'GEEK',
      avatarSeed: 'sy-dr-10',
      initialMood: 68,
      initialTrust: 52,
    },
    fees: { successRate: 0.18, negotiable: true, floorRate: 0.14 },
    caseId: 'case_exp_neoregen',
    scenarios: {
      discovery: 'sc_exp_disc_embellie',
      kickoff: 'sc_exp_kickoff',
      followup: 'sc_exp_fu_neoregen',
      closing: 'sc_exp_cl_neoregen',
    },
    cardsetId: 'cards_exp_neoregen',
    cirEstimate: [260000, 360000],
    pitch:
      'Le plus gros dossier de la saison : sous-traitance en cascade, entité liée, subvention et avance remboursable. La frontière entre recherche et production de lots s’y joue à la ligne près.',
  },
];
