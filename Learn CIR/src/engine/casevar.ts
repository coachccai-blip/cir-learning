// Variation des dossiers écrits à la main.
//
// Les six cas de la campagne étaient strictement identiques d'une partie à
// l'autre : mêmes montants, mêmes pièges, aux mêmes lignes. Un consultant qui
// rejouait — ou à qui un collègue avait raconté la partie — retrouvait un
// corrigé déjà connu, et le jeu ne mesurait plus que la mémoire.
//
// Deux leviers, tous deux tirés de la graine de partie (donc reproductibles) :
//   1. les montants sont brouillés ligne par ligne, ce qui invalide tout
//      chiffre appris par cœur sans changer la nature de l'exercice ;
//   2. un « twist » déclaratif déplace les pièges — le prestataire agréé de la
//      partie précédente ne l'est plus, l'aide publique change de nature.
//
// Le twist est une donnée (`data/case-twists.ts`), jamais du texte fabriqué
// ici : les libellés de pièges doivent rester écrits par un humain.

import type {
  AssietteCase,
  GrantLine,
  PersonnelLine,
  SubcontractingLine,
} from './types';
import { rngFromSeed } from './rng';

/** Amplitude du brouillage des montants, en proportion du montant nominal. */
const AMOUNT_JITTER = 0.12;

export interface PersonnelPatch {
  id: string;
  role?: string;
  claimedRdRatio?: number;
  trueRdRatio?: number;
  evidence?: string;
  trap?: string;
  /** Retire le piège de cette ligne (elle devient un poste sain). */
  clearTrap?: boolean;
}

export interface AmortizationPatch {
  id: string;
  asset?: string;
  rdRatio?: number;
  trueRdRatio?: number;
  trap?: string;
  clearTrap?: boolean;
}

export interface SubcontractingPatch {
  id: string;
  provider?: string;
  hasMesrAgreement?: boolean;
  related?: boolean;
  tier?: number;
  trap?: string;
  clearTrap?: boolean;
}

export interface GrantPatch {
  id: string;
  source?: string;
  rdAllocationRatio?: number;
  type?: GrantLine['type'];
  trap?: string;
}

/**
 * Variante d'un cas. Toutes les lignes citées existent dans le cas de base ou
 * sont ajoutées par la variante elle-même ; `dropIds` retire des lignes.
 */
export interface CaseTwist {
  id: string;
  /** Une phrase ajoutée à la narration, pour que le joueur sente la différence. */
  hook: string;
  narrative?: string;
  personnel?: PersonnelPatch[];
  amortization?: AmortizationPatch[];
  subcontracting?: SubcontractingPatch[];
  grants?: GrantPatch[];
  addPersonnel?: PersonnelLine[];
  addSubcontracting?: SubcontractingLine[];
  addGrants?: GrantLine[];
  dropIds?: string[];
}

function applyTrap<T extends { trap?: string }>(
  line: T,
  patch: { trap?: string; clearTrap?: boolean },
): T {
  if (patch.clearTrap) {
    const { trap: _drop, ...rest } = line;
    return rest as T;
  }
  return patch.trap ? { ...line, trap: patch.trap } : line;
}

/** Applique un twist déclaratif à un cas, sans toucher aux montants. */
export function applyTwist(base: AssietteCase, twist: CaseTwist): AssietteCase {
  const dropped = new Set(twist.dropIds ?? []);
  const keep = <T extends { id: string }>(lines: T[]) => lines.filter((l) => !dropped.has(l.id));

  const personnel = [...keep(base.personnel), ...(twist.addPersonnel ?? [])].map((p) => {
    const patch = twist.personnel?.find((x) => x.id === p.id);
    if (!patch) return p;
    const { id: _id, clearTrap: _c, trap: _t, ...fields } = patch;
    return applyTrap({ ...p, ...fields }, patch);
  });

  const amortization = keep(base.amortization).map((a) => {
    const patch = twist.amortization?.find((x) => x.id === a.id);
    if (!patch) return a;
    const { id: _id, clearTrap: _c, trap: _t, ...fields } = patch;
    return applyTrap({ ...a, ...fields }, patch);
  });

  const subcontracting = [...keep(base.subcontracting), ...(twist.addSubcontracting ?? [])].map(
    (s) => {
      const patch = twist.subcontracting?.find((x) => x.id === s.id);
      if (!patch) return s;
      const { id: _id, clearTrap: _c, trap: _t, ...fields } = patch;
      return applyTrap({ ...s, ...fields }, patch);
    },
  );

  const grants = [...keep(base.grants), ...(twist.addGrants ?? [])].map((g) => {
    const patch = twist.grants?.find((x) => x.id === g.id);
    if (!patch) return g;
    const { id: _id, ...fields } = patch;
    return { ...g, ...fields };
  });

  return {
    ...base,
    narrative: twist.narrative ?? `${base.narrative} ${twist.hook}`,
    personnel,
    amortization,
    subcontracting,
    grants,
    decoys: keep(base.decoys),
  };
}

/**
 * Brouille les montants ligne par ligne. Chaque ligne bouge indépendamment :
 * un facteur global se retiendrait aussi facilement qu'un montant fixe.
 */
export function jitterAmounts(c: AssietteCase, seed: string): AssietteCase {
  const rng = rngFromSeed(`${seed}:amounts`);
  // Arrondi à la centaine : les montants restent lisibles à l'écran.
  const j = (n: number) => {
    const f = 1 + (rng() * 2 - 1) * AMOUNT_JITTER;
    return Math.max(100, Math.round((n * f) / 100) * 100);
  };
  return {
    ...c,
    personnel: c.personnel.map((p) => ({ ...p, grossCost: j(p.grossCost) })),
    amortization: c.amortization.map((a) => ({ ...a, annualDepreciation: j(a.annualDepreciation) })),
    subcontracting: c.subcontracting.map((s) => ({ ...s, amount: j(s.amount) })),
    grants: c.grants.map((g) => ({ ...g, amount: j(g.amount) })),
    decoys: c.decoys.map((d) => ({ ...d, amount: j(d.amount) })),
  };
}

/**
 * Dossier de la partie en cours : un twist tiré parmi ceux du cas (ou aucun),
 * puis les montants brouillés. Même graine ⇒ même dossier, y compris après un
 * rechargement de page : rien n'a besoin d'être persisté.
 */
export function varyCase(
  base: AssietteCase,
  twists: readonly CaseTwist[],
  seed: string,
): AssietteCase {
  const rng = rngFromSeed(`${seed}:twist`);
  // Le cas d'origine reste une variante possible : c'est celle qui a été
  // relue et équilibrée à la main.
  const pool: (CaseTwist | null)[] = [null, ...twists];
  const twist = pool[Math.floor(rng() * pool.length)] ?? null;
  return jitterAmounts(twist ? applyTwist(base, twist) : base, seed);
}

export type { SubcontractingLine, PersonnelLine, GrantLine };
