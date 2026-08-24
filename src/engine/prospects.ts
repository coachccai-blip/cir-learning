// Génération procédurale des prospects (§16) et système de promesse (§6.3).

import balance from '../data/balance.json';
import type { GeneratedProspect, ProspectTemplate } from './types';
import { CALL_POOL } from '../data/scenarios/calls';
import { PROSPECT_PORTRAITS } from '../data/portraits';
import { hashString, pick, randInt, rngFromSeed } from './rng';

const FIRST_NAMES = [
  'Claire', 'Antoine', 'Fatou', 'Julien', 'Inès', 'Mathieu', 'Léa', 'Romain',
  'Awa', 'Thomas', 'Nadia', 'Pierre', 'Chloé', 'Yanis', 'Margaux', 'Olivier',
];
const FIRST_NAME_GENDER: Record<string, 'F' | 'M'> = {
  Claire: 'F', Antoine: 'M', Fatou: 'F', Julien: 'M', Inès: 'F', Mathieu: 'M',
  Léa: 'F', Romain: 'M', Awa: 'F', Thomas: 'M', Nadia: 'F', Pierre: 'M',
  Chloé: 'F', Yanis: 'M', Margaux: 'F', Olivier: 'M',
};

export function genderForName(fullName: string): 'F' | 'M' {
  const first = fullName.split(' ')[0];
  return FIRST_NAME_GENDER[first] ?? 'M';
}

const LAST_NAMES = [
  'Marchal', 'Nguyen', 'Diallo', 'Petit', 'Fontaine', 'Garcia', 'Lemoine',
  'Bourgeois', 'Robin', 'Chevalier', 'Masson', 'Barbier', 'Costa', 'Renard',
];

/** Parcourt un pool sans répétition immédiate, avec un décalage propre à la partie. */
function rotate(pool: string[], index: number, seed: string): string {
  const offset = hashString(seed) % pool.length;
  return pool[(index + offset) % pool.length];
}

/**
 * Noms déjà pris dans la partie. Deux fiches « Épicerie Plus » côte à côte,
 * avec deux interlocuteurs différents, se lisaient comme un bug — et le vivier
 * se répète d'autant plus vite qu'aucun budget d'actions ne borne plus le
 * nombre d'appels par semaine.
 */
export interface TakenNames {
  companies: readonly string[];
  contacts: readonly string[];
}

const NO_NAMES: TakenNames = { companies: [], contacts: [] };

/**
 * Tire dans un vivier en évitant ce qui est déjà pris. Si tout est pris, on
 * rend le tirage libre plutôt que rien : mieux vaut un doublon lointain qu'une
 * fiche vide.
 */
function pickFresh(rng: () => number, pool: readonly string[], taken: readonly string[]): string {
  const free = pool.filter((x) => !taken.includes(x));
  return pick(rng, free.length > 0 ? free : pool);
}

export function generateProspect(
  templates: ProspectTemplate[],
  seed: string,
  index: number,
  taken: TakenNames = NO_NAMES,
): GeneratedProspect {
  const rng = rngFromSeed(`${seed}:prospect:${index}`);
  // Équilibrage : 1 prospect sur 4 non éligible (§16).
  const forceNotEligible = rng() < balance.nonEligibleProspectRatio;
  const eligibilityPool = forceNotEligible
    ? templates.filter((t) => t.eligibilityProfile === 'NOT_ELIGIBLE')
    : templates.filter((t) => t.eligibilityProfile !== 'NOT_ELIGIBLE');
  const usable = eligibilityPool.length > 0 ? eligibilityPool : templates;
  // Un modèle dont toutes les raisons sociales sont prises ne peut plus rien
  // servir de neuf : on lui préfère un modèle qui a encore de la matière.
  const withRoom = usable.filter((t) => t.companyPool.some((c) => !taken.companies.includes(c)));
  const tpl = pick(rng, withRoom.length > 0 ? withRoom : usable);
  const company = pickFresh(rng, tpl.companyPool, taken.companies);
  let contactName = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
  // Le couple prénom/nom offre plus de deux cents combinaisons : quelques
  // tirages suffisent à en trouver une libre.
  for (let tries = 0; tries < 12 && taken.contacts.includes(contactName); tries++) {
    contactName = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
  }
  const gender = genderForName(contactName);
  return {
    id: `pr_${index}_${Math.floor(rng() * 1e6)}`,
    company,
    sector: pick(rng, tpl.sectorPool),
    contactName,
    gender,
    size: randInt(rng, tpl.sizeRange[0], tpl.sizeRange[1]),
    eligibility: tpl.eligibilityProfile,
    hook: pick(rng, tpl.hooks),
    estimatedCir: Math.round(randInt(rng, tpl.estimatedCirRange[0], tpl.estimatedCirRange[1]) / 1000) * 1000,
    avatarSeed: `${company}-${contactName}`,
    // Portrait révélé à la signature. Toujours une vraie photo : un prospect
    // dont le visage serait dessiné ne peut pas entrer au portefeuille.
    portraitId: pick(rng, PROSPECT_PORTRAITS[gender]),
    // Situation d'appel cohérente avec le profil d'éligibilité. Rotation
    // (et non tirage pur) : deux prospects consécutifs ne tombent jamais sur
    // la même situation, le joueur voit un maximum de cas de figure.
    callScenarioId: rotate(CALL_POOL[tpl.eligibilityProfile], index, seed),
    status: 'NEW',
  };
}

/**
 * Résolution d'une petite mission générique signée en prospection.
 * Un prospect non éligible signé est une « mission toxique » (§1.1 OP8).
 */
export function resolveGenericMission(p: GeneratedProspect): {
  revenue: number;
  relation: number;
  security: number;
  profitability: number;
  toxic: boolean;
} {
  const fee = balance.defaultFeeRate;
  if (p.eligibility === 'NOT_ELIGIBLE') {
    return { revenue: 0, relation: -12, security: -15, profitability: -8, toxic: true };
  }
  const revenue = Math.round(p.estimatedCir * fee);
  if (p.eligibility === 'BORDERLINE') {
    return { revenue, relation: 3, security: -6, profitability: 4, toxic: false };
  }
  return { revenue, relation: 5, security: 0, profitability: 6, toxic: false };
}

// ---------- Promesses ----------

export interface PromiseOutcome {
  relation: number;
  profitability: number;
  churnRisk: boolean;
  label: string;
}

export function evaluatePromise(
  promise: { min: number; max: number },
  realCir: number,
): PromiseOutcome {
  const p = balance.promise;
  if (realCir >= promise.min && realCir <= promise.max) {
    return { relation: p.inRange, profitability: 0, churnRisk: false, label: 'Dans la fourchette annoncée' };
  }
  if (realCir > promise.max) {
    return {
      relation: p.aboveMax,
      profitability: p.aboveMaxProfitability,
      churnRisk: false,
      label: 'Au-dessus de la fourchette : bonne surprise, crédibilité de l’estimation entamée',
    };
  }
  const gap = (promise.min - realCir) / promise.min;
  if (gap < p.largeGapThreshold) {
    return { relation: p.belowSmall, profitability: 0, churnRisk: false, label: 'Sous la fourchette (écart < 15 %)' };
  }
  return {
    relation: p.belowLarge,
    profitability: 0,
    churnRisk: true,
    label: 'Très en dessous de la promesse : le client se sent trahi',
  };
}
