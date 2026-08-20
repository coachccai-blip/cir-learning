// Calendrier fiscal de la saison (§4.4) et chapitres de campagne (§10.2).
// Contenu, pas du code : uniquement des données déclaratives.

import type { CalendarMilestone, ChapterDef } from '../engine/types';

/** Nombre de cycles (semaines) d'une saison. */
export const SEASON_LENGTH = 24;

/** Date affichée pour chaque cycle (saison type, exercice clos au 31/12). */
export const CYCLE_DATES: string[] = [
  '1 septembre', '8 septembre', '15 septembre', '22 septembre',
  '29 septembre', '6 octobre', '13 octobre', '20 octobre',
  '27 octobre', '3 novembre', '10 novembre', '17 novembre',
  '24 novembre', '1 décembre', '8 décembre', '15 décembre',
  '5 janvier', '19 janvier', '2 février', '2 mars',
  '30 mars', '30 avril', '15 mai', 'Épilogue',
];

export const MILESTONES: CalendarMilestone[] = [
  {
    id: 'ms_opening',
    cycle: 1,
    date: '1ᵉʳ septembre',
    label: 'Ouverture de saison — objectifs annuels de Sophie Meyer',
    consequence: '',
  },
  {
    id: 'ms_proposals',
    cycle: 3,
    date: '15 septembre',
    label: 'Deadline : 2 premières propositions commerciales remises',
    consequence: 'Un lead quitte le portefeuille.',
  },
  {
    id: 'ms_kickoff_a',
    cycle: 6,
    date: '6 octobre',
    label: 'Kick-off obligatoire du premier client signé',
    consequence: 'Le client perd patience : Relation −10.',
  },
  {
    id: 'ms_q1_review',
    cycle: 9,
    date: '27 octobre',
    label: 'Point d’étape trimestriel (CA) avec Sophie',
    consequence: 'Dialogue tendu, malus XP si l’objectif intermédiaire n’est pas en vue.',
  },
  {
    id: 'ms_timesheets',
    cycle: 12,
    date: '17 novembre',
    label: 'Collecte des feuilles de temps chez tous les clients',
    consequence: 'Sans suivi de mission : assiette personnel plafonnée à 80 %.',
  },
  {
    id: 'ms_yearend',
    cycle: 15,
    date: '8 décembre',
    label: 'Clôture de l’exercice des clients',
    consequence: 'Les dépenses collectables sont verrouillées.',
  },
  {
    id: 'ms_rescrit',
    cycle: 17,
    date: '5 janvier',
    label: 'Fenêtre de rescrit fiscal (optionnelle)',
    consequence: 'Opportunité perdue de sécuriser un cas limite.',
  },
  {
    id: 'ms_quality',
    cycle: 20,
    date: '2 mars',
    label: 'Revue qualité interne des dossiers',
    consequence: 'Les erreurs non corrigées passent en dossier final.',
  },
  {
    id: 'ms_deposit',
    cycle: 22,
    date: '30 avril',
    label: 'Dépôt du 2069-A-SD avec la liasse fiscale',
    consequence: 'Dossier non déposé = 0 CA sur ce client, gros malus.',
  },
  {
    id: 'ms_refund',
    cycle: 23,
    date: '15 mai',
    label: 'Demande de remboursement immédiat (PME)',
    consequence: 'Les clients attendent l’imputation.',
  },
  {
    id: 'ms_epilogue',
    cycle: 24,
    date: 'Épilogue',
    label: 'Résultat de saison + éventuel contrôle fiscal',
    consequence: 'Score final.',
  },
];

export const CHAPTERS: ChapterDef[] = [
  {
    num: 1,
    title: 'Bienvenue chez Leyton',
    fromCycle: 1,
    toCycle: 1,
    notion: 'Vocabulaire, rôle du consultant, déroulé d’une mission',
    objective: 'Suivre le tutoriel : un jour et une nuit guidés.',
  },
  {
    num: 2,
    title: 'Le premier appel',
    fromCycle: 2,
    toCycle: 3,
    notion: 'Qualifier un prospect, ce qui est R&D et ce qui ne l’est pas',
    objective: 'Signer votre premier client.',
  },
  {
    num: 3,
    title: 'Cadrer, c’est protéger',
    fromCycle: 4,
    toCycle: 6,
    notion: 'Kick-off : interlocuteurs, périmètre, collecte',
    objective: 'Réussir un kick-off (score ≥ 70).',
  },
  {
    num: 4,
    title: 'La ligne de partage',
    fromCycle: 7,
    toCycle: 9,
    notion: 'R&D vs développement courant vs CII',
    objective: 'Qualifier un jeu de cartes avec ≥ 85 % de justesse.',
  },
  {
    num: 5,
    title: 'Le chiffre qui engage',
    fromCycle: 10,
    toCycle: 12,
    notion: 'Estimer sans promettre, construire l’assiette',
    objective: 'Rendre une assiette dans la tolérance.',
  },
  {
    num: 6,
    title: 'Argent public',
    fromCycle: 13,
    toCycle: 15,
    notion: 'Subventions, avances remboursables, sous-traitance agréée',
    objective: 'Déduire correctement les financements publics.',
  },
  {
    num: 7,
    title: 'Savoir dire non',
    fromCycle: 16,
    toCycle: 17,
    notion: 'Refuser une mission non éligible, préserver la relation',
    objective: 'Refuser sans perdre le contact.',
  },
  {
    num: 8,
    title: 'La course au dépôt',
    fromCycle: 18,
    toCycle: 22,
    notion: 'Gestion des deadlines, priorisation, qualité sous pression',
    objective: 'Déposer vos dossiers dans les délais.',
  },
  {
    num: 9,
    title: 'Le vérificateur',
    fromCycle: 23,
    toCycle: 24,
    notion: 'Documentation opposable, preuve',
    objective: 'Passer le contrôle fiscal.',
  },
];

export function chapterForCycle(cycle: number): ChapterDef {
  return CHAPTERS.find((c) => cycle >= c.fromCycle && cycle <= c.toCycle) ?? CHAPTERS[CHAPTERS.length - 1];
}

export function nextMilestone(cycle: number): CalendarMilestone | null {
  return MILESTONES.find((m) => m.cycle >= cycle) ?? null;
}
