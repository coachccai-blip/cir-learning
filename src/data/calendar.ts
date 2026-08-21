// Calendrier fiscal de la saison (§4.4) et chapitres de campagne (§10.2).
// Contenu, pas du code : uniquement des données déclaratives.

import type { CalendarMilestone, ChapterDef } from '../engine/types';

/** Nombre de cycles (semaines) d'une saison. */
/**
 * Six cycles. Une partie doit tenir en une heure : à ~1,5 min par action, cela
 * borne la saison à ~75 points d'action. Six semaines de 13 PA y répondent, et
 * chaque semaine porte une échéance qui a des conséquences (aucune n'est
 * décorative, cf. `applyMilestone` dans le store).
 */
export const SEASON_LENGTH = 6;

/** Date affichée pour chaque cycle (campagne resserrée, exercice clos au 31/12). */
export const CYCLE_DATES: string[] = [
  '1 septembre', '15 octobre', '26 novembre', '14 janvier', '11 mars', 'Épilogue',
];

export const MILESTONES: CalendarMilestone[] = [
  {
    id: 'ms_opening',
    cycle: 1,
    date: '1ᵉʳ septembre',
    label: 'Ouverture de saison — objectifs annuels de Sophie Meyer',
    consequence: 'Aucune sanction : c’est le point de départ.',
  },
  {
    id: 'ms_proposals',
    cycle: 2,
    date: '15 octobre',
    label: 'Revue de pipeline — au moins deux dossiers qualifiés',
    consequence: 'Chaque dossier encore à l’état de lead coûte de la relation interne.',
  },
  {
    id: 'ms_kickoff',
    cycle: 3,
    date: '26 novembre',
    label: 'Kick-off obligatoire de tout client signé',
    consequence: 'Un client signé sans kick-off perd confiance et fragilise son dossier.',
  },
  {
    id: 'ms_timesheets',
    cycle: 4,
    date: '14 janvier',
    label: 'Collecte des feuilles de temps chez les clients lancés',
    consequence: 'Sans suivi de mission, les feuilles de temps ne sont plus opposables.',
  },
  {
    id: 'ms_info_request',
    cycle: 5,
    date: '11 mars',
    label: 'Demande d’information de l’administration sur un dossier déposé',
    consequence: 'Un contrôle intermédiaire : il reste un cycle pour corriger les autres.',
  },
  {
    id: 'ms_deposit',
    cycle: 6,
    date: 'Épilogue',
    label: 'Dépôt du 2069-A-SD et résultat de saison',
    consequence: 'Tout dossier non déposé est perdu, et pénalise le score final.',
  },
];

export const CHAPTERS: ChapterDef[] = [
  {
    num: 1,
    title: 'Bienvenue chez CIR Corp',
    fromCycle: 1,
    toCycle: 1,
    notion: 'Vocabulaire, rôle du consultant, déroulé d’une mission',
    objective: 'Suivre le tutoriel, puis ouvrir un premier dossier.',
  },
  {
    num: 2,
    title: 'Choisir ses combats',
    fromCycle: 2,
    toCycle: 2,
    notion: 'Qualifier, arbitrer un portefeuille plus large que sa capacité',
    objective: 'Qualifier au moins deux dossiers — vous ne pourrez pas tous les mener.',
  },
  {
    num: 3,
    title: 'Cadrer, c’est protéger',
    fromCycle: 3,
    toCycle: 3,
    notion: 'Kick-off : interlocuteurs, périmètre, collecte',
    objective: 'Lancer les missions que vous avez décidé de servir.',
  },
  {
    num: 4,
    title: 'La ligne de partage',
    fromCycle: 4,
    toCycle: 4,
    notion: 'R&D vs développement courant vs CII, et la preuve qui va avec',
    objective: 'Trier les travaux et collecter les pièces avant qu’il soit trop tard.',
  },
  {
    num: 5,
    title: 'Le chiffre qui engage',
    fromCycle: 5,
    toCycle: 5,
    notion: 'Assiette, aides publiques, justificatif opposable',
    objective: 'Construire des assiettes justes et tenir devant la première demande.',
  },
  {
    num: 6,
    title: 'Le vérificateur',
    fromCycle: 6,
    toCycle: 6,
    notion: 'Documentation opposable, dépôt, contrôle',
    objective: 'Déposer, puis répondre au contrôle.',
  },
];

export function chapterForCycle(cycle: number): ChapterDef {
  return CHAPTERS.find((c) => cycle >= c.fromCycle && cycle <= c.toCycle) ?? CHAPTERS[CHAPTERS.length - 1];
}

export function nextMilestone(cycle: number): CalendarMilestone | null {
  return MILESTONES.find((m) => m.cycle >= cycle) ?? null;
}
