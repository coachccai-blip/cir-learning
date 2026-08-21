// Conversion d'un prospect signé en véritable dossier client (§16 étendu).
//
// Toutes les grosses missions signées au téléphone ne se valent pas : seules
// celles qui portent un enjeu suffisant entrent au portefeuille et se jouent la
// nuit (qualification → assiette → justificatif → bilan). Les autres restent des
// missions conseil légères, qui n'apportent que du chiffre d'affaires.
//
// Le dossier est assemblé à partir des briques de `data/dossier-kit`, de façon
// déterministe (graine de partie + identifiant du prospect) : rejouer la même
// partie redonne exactement le même dossier.

import type {
  AssietteCase, ClientDef, GeneratedClientBundle, GeneratedProspect,
  Ruleset, Sector, WorkCard,
} from './types';
import { computeBreakdown } from './cir/calculator';
import { pick, randInt, rngFromSeed, shuffled } from './rng';
import {
  DECOY_BRICKS, GRANT_BRICKS, SECTOR_KITS, TEAM_FIRST_NAMES_F, TEAM_FIRST_NAMES_M,
  TEAM_LAST_NAMES,
} from '../data/dossier-kit';

export type { GeneratedClientBundle };

/** Réglages d'équilibrage passés par l'appelant (aucune valeur en dur ici). */
export interface ClientGenSettings {
  /** CIR estimé en dessous duquel la mission reste une simple mission conseil. */
  minEstimatedCir: number;
  /** Part des missions éligibles suffisamment grosses qui deviennent un dossier. */
  conversionRatio: number;
  /** Taux d'honoraires au succès appliqué aux dossiers générés. */
  feeRate: number;
  /** Nombre de cartes du mini-jeu de qualification. */
  cardCount: number;
}

/**
 * Un prospect signé devient-il un client à part entière ?
 * Non éligible : jamais (il n'y a rien à instruire). Petit dossier : non plus,
 * l'enjeu ne justifie pas une mission de fond. Au-dessus, une partie seulement,
 * tirée de façon déterministe : le portefeuille se renouvelle sans exploser.
 */
export function prospectBecomesClient(
  p: GeneratedProspect,
  seed: string,
  settings: ClientGenSettings,
): boolean {
  if (p.eligibility === 'NOT_ELIGIBLE') return false;
  if (p.estimatedCir < settings.minEstimatedCir) return false;
  return rngFromSeed(`${seed}:convert:${p.id}`)() < settings.conversionRatio;
}

const ARCHETYPES = ['SCEPTIC', 'RUSHED', 'GEEK', 'CFO', 'DREAMER', 'SILENT'] as const;
const ROLES = ['Directeur général', 'Directrice générale', 'Directeur technique', 'Directrice technique', 'Directeur administratif et financier'];

function difficultyFor(sector: Sector, eligible: boolean): 1 | 2 | 3 {
  if (!eligible) return 3;
  return sector === 'BIOTECH' || sector === 'SERVICES' ? 3 : 2;
}

/** Met à l'échelle tous les montants pour que le CIR réel approche l'estimation. */
function rescale(c: AssietteCase, factor: number): AssietteCase {
  const r = (n: number) => Math.round((n * factor) / 100) * 100;
  return {
    ...c,
    personnel: c.personnel.map((p) => ({ ...p, grossCost: r(p.grossCost) })),
    amortization: c.amortization.map((a) => ({ ...a, annualDepreciation: r(a.annualDepreciation) })),
    subcontracting: c.subcontracting.map((s) => ({ ...s, amount: r(s.amount) })),
    grants: c.grants.map((g) => ({ ...g, amount: r(g.amount) })),
    decoys: c.decoys.map((d) => ({ ...d, amount: r(d.amount) })),
  };
}

/**
 * Fabrique le dossier d'un prospect signé : fiche client, cas d'assiette et jeu
 * de cartes de qualification, cohérents entre eux et avec son secteur.
 */
export function buildClientFromProspect(
  p: GeneratedProspect,
  seed: string,
  ruleset: Ruleset,
  settings: ClientGenSettings,
  fiscalYear: number,
): GeneratedClientBundle {
  const rng = rngFromSeed(`${seed}:client:${p.id}`);
  const kit = SECTOR_KITS[p.sector];
  const clientId = `cli_gen_${p.id}`;

  // --- Équipe : au moins un poste sain et un poste piégé, jamais que des pièges.
  const clean = shuffled(rng, kit.cleanRoles).slice(0, randInt(rng, 1, 2));
  const trapped = shuffled(rng, kit.trappedRoles).slice(0, randInt(rng, 1, 2));
  const personnel = shuffled(rng, [...clean, ...trapped]).map((b, i) => ({
    id: `p${i + 1}`,
    // Prénom accordé avec l'intitulé du poste ('N' = épicène, au hasard).
    name: `${pick(rng, b.g === 'F' || (b.g === 'N' && rng() < 0.5) ? TEAM_FIRST_NAMES_F : TEAM_FIRST_NAMES_M)} ${pick(rng, TEAM_LAST_NAMES)}`,
    role: b.role,
    // Base nominale : 100 000 € de masse salariale répartie selon les poids.
    grossCost: Math.round(b.weight * 300000),
    claimedRdRatio: b.claimedRdRatio,
    trueRdRatio: b.trueRdRatio,
    ...(b.evidence ? { evidence: b.evidence } : {}),
    ...(b.trap ? { trap: b.trap } : {}),
  }));

  // --- Amortissements : un équipement une fois sur deux.
  const amortization = rng() < 0.5
    ? [{ id: 'a1', asset: pick(rng, kit.assets), annualDepreciation: randInt(rng, 6, 18) * 1000, rdRatio: 1, trueRdRatio: 1 }]
    : [];

  // --- Sous-traitance : une à deux lignes, dont au moins une éligible.
  const providers = shuffled(rng, kit.providers).slice(0, randInt(rng, 1, 2));
  const subcontracting = providers.map((b, i) => ({
    id: `s${i + 1}`,
    provider: b.provider,
    amount: Math.round(b.weight * 300000),
    hasMesrAgreement: b.hasMesrAgreement,
    related: b.related,
    tier: b.tier,
    ...(b.trap ? { trap: b.trap } : {}),
  }));

  // --- Aides publiques : une fois sur deux, toujours à déduire.
  const grants = rng() < 0.5
    ? [(() => { const g = pick(rng, GRANT_BRICKS); return { id: 'g1', source: g.source, amount: Math.round(g.weight * 300000), rdAllocationRatio: g.rdAllocationRatio, type: g.type, trap: g.trap }; })()]
    : [];

  // --- Leurres : postes supprimés que le client voudra toujours ajouter.
  const decoys = shuffled(rng, DECOY_BRICKS).slice(0, randInt(rng, 1, 2)).map((d, i) => ({
    id: `d${i + 1}`,
    label: d.label,
    amount: Math.round(d.weight * 300000),
    removedItemId: d.removedItemId,
    reason: d.reason,
  }));

  const nominal: AssietteCase = {
    id: `case_gen_${p.id}`,
    clientId,
    fiscalYear,
    narrative: `${p.company} a engagé des travaux sur ${pick(rng, kit.projects)}.`,
    personnel,
    amortization,
    subcontracting,
    grants,
    decoys,
  };

  // Recalage sur l'estimation annoncée au téléphone : le dossier réel doit
  // rester dans l'ordre de grandeur promis, sinon la promesse n'a aucun sens.
  const nominalCir = computeBreakdown(nominal, null, ruleset, { legal: true }).cir;
  const scaled = nominalCir > 0 ? rescale(nominal, p.estimatedCir / nominalCir) : nominal;
  const trueCir = computeBreakdown(scaled, null, ruleset, { legal: true }).cir;

  // --- Cartes de qualification : tirage équilibré entre les trois verdicts.
  // Un tirage au hasard dans le pool donnerait une majorité de « non éligible »,
  // et cocher cette colonne partout suffirait à passer le mini-jeu.
  const buckets = (['RD', 'CII', 'NONE'] as const).map((v) => shuffled(rng, kit.cards.filter((c) => c.verdict === v)));
  const picked: typeof kit.cards = [];
  for (let round = 0; picked.length < settings.cardCount; round++) {
    const before = picked.length;
    for (const b of buckets) {
      if (picked.length >= settings.cardCount) break;
      if (b[round]) picked.push(b[round]);
    }
    if (picked.length === before) break; // pool épuisé
  }
  const cards: WorkCard[] = shuffled(rng, picked).map((c, i) => ({ id: `gc${i + 1}`, ...c }));

  const contactRole = pick(rng, ROLES);
  const client: ClientDef = {
    id: clientId,
    name: p.company,
    sector: p.sector,
    sectorLabel: kit.label,
    profileDifficulty: difficultyFor(p.sector, p.eligibility === 'ELIGIBLE'),
    headcount: p.size,
    isSme: p.size < 250,
    leadCycle: 0,
    contact: {
      name: p.contactName,
      role: contactRole,
      archetype: pick(rng, ARCHETYPES),
      avatarSeed: p.avatarSeed,
      initialMood: randInt(rng, 55, 75),
      initialTrust: randInt(rng, 45, 60),
    },
    fees: { successRate: settings.feeRate, negotiable: true, floorRate: settings.feeRate * 0.7 },
    caseId: scaled.id,
    scenarios: {
      discovery: 'sc_generic_discovery',
      kickoff: 'sc_generic_kickoff',
      followup: 'sc_generic_followup',
      closing: 'sc_generic_closing',
    },
    cardsetId: `cards_gen_${p.id}`,
    cirEstimate: [Math.round(trueCir * 0.85), Math.round(trueCir * 1.15)],
    pitch: `Signé en prospection : ${p.hook}. ${p.company} (${p.size} salariés) attend un dossier solide.`,
  };

  return { client, case: scaled, cardset: { id: client.cardsetId, clientId, cards } };
}
