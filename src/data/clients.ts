// Les 6 clients de la campagne (§3.3, §3.4, §10.2). Données fictives.

import type { ClientDef, GameMode } from '../engine/types';
import { EXPERT_CLIENTS } from './clients-expert';
import { generatedClient, generatedClients } from './registry';

export const CLIENTS: ClientDef[] = [
  {
    id: 'cli_agri_dupuis',
    name: 'Maison Dupuis',
    sector: 'AGRI',
    sectorLabel: 'Agroalimentaire',
    profileDifficulty: 1,
    headcount: 48,
    isSme: true,
    leadCycle: 1,
    contact: {
      name: 'Marc Dupuis',
      gender: 'M',
      role: 'Directeur général',
      archetype: 'DREAMER',
      avatarSeed: 'dupuis-01',
      initialMood: 75,
      initialTrust: 50,
    },
    fees: { successRate: 0.2, negotiable: true, floorRate: 0.14 },
    caseId: 'case_agri',
    scenarios: {
      discovery: 'sc_agri_disc',
      kickoff: 'sc_agri_kick',
      followup: 'sc_generic_followup',
      closing: 'sc_generic_closing',
    },
    cardsetId: 'cards_agri',
    cirEstimate: [60000, 90000],
    pitch:
      'PME familiale de l’agroalimentaire. Travaille sur la stabilisation d’une émulsion végétale sans additif. Marc est convaincu que « tout ce qu’on fait, c’est de la R&D ».',
  },
  {
    id: 'cli_saas_nexalog',
    name: 'Nexalog',
    sector: 'SAAS',
    sectorLabel: 'Éditeur logiciel B2B',
    profileDifficulty: 2,
    headcount: 120,
    isSme: true,
    leadCycle: 1,
    contact: {
      name: 'Elsa Brunet',
      gender: 'F',
      role: 'CTO co-fondatrice',
      archetype: 'GEEK',
      avatarSeed: 'brunet-02',
      initialMood: 70,
      initialTrust: 45,
    },
    fees: { successRate: 0.2, negotiable: true, floorRate: 0.15 },
    caseId: 'case_saas',
    scenarios: {
      discovery: 'sc_saas_disc',
      kickoff: 'sc_saas_kick',
      followup: 'sc_generic_followup',
      closing: 'sc_generic_closing',
    },
    cardsetId: 'cards_saas',
    cirEstimate: [350000, 480000],
    pitch:
      'Éditeur d’une plateforme logistique temps réel. Elsa adore son moteur de prédiction — et peut en parler trois heures. Toute la difficulté : la frontière R&D / développement courant.',
  },
  {
    id: 'cli_indus_verdier',
    name: 'Mecaprécis',
    sector: 'INDUS',
    sectorLabel: 'Mécanique de précision',
    profileDifficulty: 2,
    headcount: 85,
    isSme: true,
    leadCycle: 1,
    contact: {
      name: 'Hervé Verdier',
      gender: 'M',
      role: 'Directeur général',
      archetype: 'SCEPTIC',
      avatarSeed: 'verdier-03',
      initialMood: 35,
      initialTrust: 30,
    },
    fees: { successRate: 0.18, negotiable: true, floorRate: 0.13 },
    caseId: 'case_indus',
    scenarios: {
      discovery: 'sc_indus_disc',
      kickoff: 'sc_indus_kick',
      followup: 'sc_generic_followup',
      closing: 'sc_generic_closing',
    },
    cardsetId: 'cards_indus',
    cirEstimate: [200000, 300000],
    pitch:
      'Sous-traitant aéronautique. Un concurrent redressé lui a laissé une peur bleue du CIR. Hervé exige des preuves, des références et le texte de loi. Beau dossier : prototypes et bancs d’essais.',
  },
  {
    id: 'cli_biotech_cellvia',
    name: 'Cellvia Therapeutics',
    sector: 'BIOTECH',
    sectorLabel: 'Biotech pré-clinique',
    profileDifficulty: 3,
    headcount: 60,
    isSme: true,
    leadCycle: 2,
    contact: {
      name: 'Laurent Kaplan',
      gender: 'M',
      role: 'Directeur administratif et financier',
      archetype: 'CFO',
      avatarSeed: 'kaplan-04',
      initialMood: 50,
      initialTrust: 40,
    },
    fees: { successRate: 0.2, negotiable: true, floorRate: 0.14 },
    caseId: 'case_biotech',
    scenarios: {
      discovery: 'sc_biotech_disc',
      kickoff: 'sc_biotech_kick',
      followup: 'sc_generic_followup',
      closing: 'sc_generic_closing',
    },
    cardsetId: 'cards_biotech',
    cirEstimate: [400000, 550000],
    pitch:
      'Biotech en phase pré-clinique, brûle du cash Bpifrance. Laurent veut un calendrier de trésorerie et un risque quantifié. Dossier riche : sous-traitance agréée, subventions, docteurs.',
  },
  {
    id: 'cli_green_solterra',
    name: 'Solterra Materials',
    sector: 'GREENTECH',
    sectorLabel: 'Cleantech / matériaux',
    profileDifficulty: 3,
    headcount: 110,
    isSme: false,
    leadCycle: 2,
    contact: {
      name: 'Marion Vasseur',
      gender: 'F',
      role: 'CEO',
      archetype: 'RUSHED',
      avatarSeed: 'vasseur-05',
      initialMood: 55,
      initialTrust: 40,
    },
    fees: { successRate: 0.17, negotiable: true, floorRate: 0.12 },
    caseId: 'case_green',
    scenarios: {
      discovery: 'sc_green_disc',
      kickoff: 'sc_green_kick',
      followup: 'sc_generic_followup',
      closing: 'sc_generic_closing',
    },
    cardsetId: 'cards_green',
    cirEstimate: [260000, 380000],
    pitch:
      'Matériaux biosourcés pour le bâtiment. Marion enchaîne les levées et les comités. Vingt minutes chrono par rendez-vous. Dossier piégeux : avance remboursable et consortium.',
  },
  {
    id: 'cli_services_datao',
    name: 'Data&Co',
    sector: 'SERVICES',
    sectorLabel: 'ESN / conseil',
    profileDifficulty: 2,
    headcount: 230,
    isSme: true,
    leadCycle: 3,
    contact: {
      name: 'Paul Lenoir',
      gender: 'M',
      role: 'Directeur des opérations',
      archetype: 'SILENT',
      avatarSeed: 'lenoir-06',
      initialMood: 50,
      initialTrust: 35,
    },
    fees: { successRate: 0.2, negotiable: false, floorRate: 0.2 },
    caseId: 'case_services',
    scenarios: {
      discovery: 'sc_services_disc',
      kickoff: 'sc_services_kick',
      followup: 'sc_generic_followup',
      closing: 'sc_generic_closing',
    },
    cardsetId: 'cards_services',
    cirEstimate: [0, 25000],
    pitch:
      'ESN de 230 personnes. Le DG a « entendu dire que toutes les ESN font du CIR ». Paul répond par oui ou par non. La vraie question : y a-t-il seulement de la R&D ici ?',
  },
];

/**
 * Portefeuille de départ selon la saison jouée. L'Onboarding et l'Expert ne
 * partagent aucun client : rejouer la même campagne en plus sévère
 * n'apprenait rien de neuf.
 */
export function rosterFor(mode: GameMode): ClientDef[] {
  return mode === 'expert' ? EXPERT_CLIENTS : CLIENTS;
}

export function clientById(id: string): ClientDef {
  const c =
    CLIENTS.find((c) => c.id === id) ??
    EXPERT_CLIENTS.find((c) => c.id === id) ??
    generatedClient(id);
  if (!c) throw new Error(`Client inconnu : ${id}`);
  return c;
}

/** Le client existe-t-il ? Utilisé là où l'absence est un cas normal. */
export function findClient(id: string | undefined): ClientDef | undefined {
  if (!id) return undefined;
  return CLIENTS.find((c) => c.id === id) ?? EXPERT_CLIENTS.find((c) => c.id === id) ?? generatedClient(id);
}

/** Catalogues écrits à la main + dossiers générés en cours de partie. */
export function allClients(): ClientDef[] {
  return [...CLIENTS, ...EXPERT_CLIENTS, ...generatedClients()];
}
