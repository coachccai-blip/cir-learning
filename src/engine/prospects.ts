// Génération procédurale des prospects (§16) et système de promesse (§6.3).

import balance from '../data/balance.json';
import type { GeneratedProspect, ProspectTemplate } from './types';
import { CALL_POOL } from '../data/scenarios/calls';
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

export function generateProspect(
  templates: ProspectTemplate[],
  seed: string,
  index: number,
): GeneratedProspect {
  const rng = rngFromSeed(`${seed}:prospect:${index}`);
  // Équilibrage : 1 prospect sur 4 non éligible (§16).
  const forceNotEligible = rng() < balance.nonEligibleProspectRatio;
  const pool = forceNotEligible
    ? templates.filter((t) => t.eligibilityProfile === 'NOT_ELIGIBLE')
    : templates.filter((t) => t.eligibilityProfile !== 'NOT_ELIGIBLE');
  const tpl = pick(rng, pool.length > 0 ? pool : templates);
  const company = pick(rng, tpl.companyPool);
  const contactName = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
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
    // Portrait générique révélé à la signature (4 visuels par genre).
    portraitId: `prospect-${gender === 'F' ? 'f' : 'm'}-0${randInt(rng, 1, 4)}`,
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
