// Composition du vivier : d'où viennent les clients du portefeuille.
//
// Le portefeuille s'ouvrait sur deux ou trois dossiers déjà présents, tombés
// de nulle part. Le métier ne marche pas ainsi : au cabinet, un consultant
// n'hérite pas d'un portefeuille, il le construit au téléphone. Le
// portefeuille démarre donc vide, et chaque client écrit entre au vivier de
// prospection, comme les prospects générés — la différence tient à ce qui suit
// l'appel : un client écrit ouvre un vrai dossier, avec son cas, ses cartes et
// ses entretiens rédigés à la main.
//
// Un décrochage réussi n'est pas une signature : il donne un rendez-vous de
// découverte. Le dossier entre au portefeuille à l'état de lead, et c'est
// l'entretien de découverte qui le transforme en client.
//
// Les prospects générés, eux, ne deviennent jamais des dossiers : ce sont de
// petites missions conseil. Un client du portefeuille est toujours écrit à la
// main, avec sa découverte, sa proposition et ses entretiens.

import type { ClientDef, GeneratedProspect } from './types';
import { PIPELINE } from '../data/pipeline';
import { shuffleForDisplay } from './rng';
import { CALL_POOL } from '../data/scenarios/calls';

/** Ordre de passage des clients écrits dans le vivier, propre à la partie. */
export function rosterOrder(roster: readonly ClientDef[], seed: string): ClientDef[] {
  return shuffleForDisplay(roster, `${seed}:roster`);
}

/**
 * Fiche de prospection d'un client écrit. Au téléphone, on ne sait presque
 * rien : l'estimation annoncée reste la borne basse de la fourchette, et le
 * portrait est celui du contact — un vrai visage, jamais un avatar dessiné.
 */
export function scriptedProspect(c: ClientDef, index: number): GeneratedProspect {
  const pool = CALL_POOL.ELIGIBLE;
  return {
    id: `pr_scripted_${c.id}`,
    company: c.name,
    sector: c.sector,
    contactName: c.contact.name,
    gender: c.contact.gender,
    size: c.headcount,
    eligibility: 'ELIGIBLE',
    hook: c.sectorLabel,
    estimatedCir: c.cirEstimate[0],
    avatarSeed: c.contact.avatarSeed,
    portraitId: c.contact.avatarSeed,
    callScenarioId: pool[index % pool.length],
    status: 'NEW',
    scriptedClientId: c.id,
  };
}

/**
 * Fiches qui apparaissent au vivier à cette semaine.
 *
 * Le calendrier est écrit (cf. `PIPELINE`) : toujours les deux mêmes dossiers,
 * dans le même ordre, pour que le joueur qui découvre le métier ait le temps
 * de les mener au bout.
 */
export function prospectsForCycle(
  roster: readonly ClientDef[],
  cycle: number,
  alreadyOffered: readonly string[],
): GeneratedProspect[] {
  return PIPELINE.filter((e) => e.cycle === cycle && !alreadyOffered.includes(e.clientId)).map(
    (e, i) => {
      const c = roster.find((x) => x.id === e.clientId);
      if (!c) throw new Error(`Calendrier : client inconnu ${e.clientId}`);
      return scriptedProspect(c, cycle + i);
    },
  );
}

/**
 * Fiches restées au catalogue, jamais servies. Le calendrier de la première
 * saison n'en sert que deux, pour laisser le temps de les mener au bilan. Le
 * joueur qui décline la sortie proposée et choisit de continuer a fait ce
 * tour-là : le reste du catalogue s'ouvre alors d'un coup.
 */
export function remainingProspects(
  roster: readonly ClientDef[],
  seed: string,
  alreadyOffered: readonly string[],
): GeneratedProspect[] {
  return rosterOrder(roster, seed)
    .filter((c) => !alreadyOffered.includes(c.id))
    .map((c, i) => scriptedProspect(c, 100 + i));
}
