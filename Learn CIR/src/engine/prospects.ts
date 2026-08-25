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
 * Première combinaison prénom/nom encore libre, en balayant le produit complet
 * à partir d'un point de départ tiré au sort. Deux cent vingt-quatre couples :
 * le balayage aboutit toujours, et sans jamais repasser sur un nom déjà servi.
 */
function freshContact(rng: () => number, taken: readonly string[]): string {
  const total = FIRST_NAMES.length * LAST_NAMES.length;
  const start = Math.floor(rng() * total);
  for (let k = 0; k < total; k++) {
    const i = (start + k) % total;
    const name = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length)]}`;
    if (!taken.includes(name)) return name;
  }
  return `${FIRST_NAMES[0]} ${LAST_NAMES[0]}`;
}

/**
 * Fabrique un prospect, ou `null` si le vivier n'a plus une seule raison
 * sociale neuve à servir. Une même entreprise ne réapparaît jamais dans une
 * partie : deux fiches identiques à deux semaines d'écart se lisent comme un
 * bug, et mieux vaut un vivier plus court qu'un vivier qui radote.
 */
export function generateProspect(
  templates: ProspectTemplate[],
  seed: string,
  index: number,
  taken: TakenNames = NO_NAMES,
): GeneratedProspect | null {
  const rng = rngFromSeed(`${seed}:prospect:${index}`);
  // Équilibrage : 1 prospect sur 4 non éligible (§16).
  const forceNotEligible = rng() < balance.nonEligibleProspectRatio;
  const eligibilityPool = forceNotEligible
    ? templates.filter((t) => t.eligibilityProfile === 'NOT_ELIGIBLE')
    : templates.filter((t) => t.eligibilityProfile !== 'NOT_ELIGIBLE');
  const usable = eligibilityPool.length > 0 ? eligibilityPool : templates;
  // Un modèle dont toutes les raisons sociales sont prises ne peut plus rien
  // servir de neuf : on lui préfère un modèle qui a encore de la matière, et à
  // défaut n'importe quel modèle qui en a encore.
  const withRoom = usable.filter((t) => t.companyPool.some((c) => !taken.companies.includes(c)));
  const anyRoom = templates.filter((t) => t.companyPool.some((c) => !taken.companies.includes(c)));
  const candidates = withRoom.length > 0 ? withRoom : anyRoom;
  if (candidates.length === 0) return null;
  const tpl = pick(rng, candidates);
  const company = pick(
    rng,
    tpl.companyPool.filter((c) => !taken.companies.includes(c)),
  );
  const contactName = freshContact(rng, taken.contacts);
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
 * Coût d'une mission signée sur un prospect sans R&D réelle (§1.1 OP8).
 *
 * Les autres prospects ne signent plus rien au téléphone : un appel bien mené
 * y manifeste de l'intérêt, sans donner ni rendez-vous ni contrat. Ne reste
 * que la mission toxique — celle que la scène est écrite pour enseigner.
 */
export function resolveToxicMission(): {
  relation: number;
  security: number;
  profitability: number;
} {
  return { relation: -12, security: -15, profitability: -8 };
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
