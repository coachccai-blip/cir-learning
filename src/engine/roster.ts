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

import type { ClientDef, GameMode, GeneratedProspect } from './types';
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
 * Deux régimes coexistent, et c'est voulu. La première saison suit un
 * calendrier écrit (cf. `PIPELINE`) : toujours les deux mêmes dossiers, dans
 * le même ordre, pour que le joueur qui découvre ait le temps de les mener au
 * bout. La deuxième tire dans son vivier à la graine, une fiche par semaine à
 * partir de la troisième : rien avant, pour que celui qui s'arrête à deux
 * missions ne voie jamais arriver un dossier qu'il n'ouvrira pas.
 */
export function prospectsForCycle(
  mode: GameMode,
  roster: readonly ClientDef[],
  seed: string,
  cycle: number,
  openingSize: number,
  alreadyOffered: readonly string[],
): GeneratedProspect[] {
  const planned = PIPELINE[mode];
  if (planned) {
    return planned
      .filter((e) => e.cycle === cycle && !alreadyOffered.includes(e.clientId))
      .map((e, i) => {
        const c = roster.find((x) => x.id === e.clientId);
        if (!c) throw new Error(`Calendrier ${mode} : client inconnu ${e.clientId}`);
        return scriptedProspect(c, cycle + i);
      });
  }

  const order = rosterOrder(roster, seed);
  if (cycle === 1) {
    return order.slice(0, Math.max(1, openingSize)).map((c, i) => scriptedProspect(c, i));
  }
  if (cycle < 3) return [];
  const waiting = order.slice(openingSize).filter((c) => !alreadyOffered.includes(c.id));
  return waiting[0] ? [scriptedProspect(waiting[0], openingSize + cycle)] : [];
}
