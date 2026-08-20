// Calcul de l'assiette et du CIR. Aucune règle codée en dur :
// tous les paramètres proviennent du ruleset JSON (§9.8 du brief).

import type {
  AssietteCase,
  AssietteInput,
  CirBreakdown,
  RateBracket,
  Ruleset,
  SubcontractingLine,
} from '../types';

/** Applique un barème par tranches à une assiette. */
export function applyBrackets(base: number, brackets: RateBracket[]): number {
  let remaining = Math.max(0, base);
  let prev = 0;
  let credit = 0;
  for (const b of brackets) {
    const ceiling = b.upTo ?? Infinity;
    const slice = Math.min(remaining, ceiling - prev);
    if (slice <= 0) break;
    credit += slice * b.rate;
    remaining -= slice;
    prev = ceiling;
    if (remaining <= 0) break;
  }
  return credit;
}

/** Une ligne de sous-traitance est-elle légalement éligible ? */
export function isSubcontractEligible(line: SubcontractingLine, ruleset: Ruleset): boolean {
  const rules = ruleset.cir.subcontracting;
  if (rules.agreementRequired && !line.hasMesrAgreement) return false;
  if (line.tier > rules.maxTier) return false;
  return true;
}

export interface ComputeOptions {
  /**
   * true = calcul « juste » : ratios réels, lignes illégales exclues,
   * toutes les subventions déduites, leurres exclus.
   * false = calcul « déclaré » : ce que le joueur a saisi ; seuls les
   * plafonds arithmétiques (proportionnel et annuel) sont appliqués.
   */
  legal: boolean;
}

function trueInput(c: AssietteCase): AssietteInput {
  return {
    personnelRatios: Object.fromEntries(c.personnel.map((p) => [p.id, p.trueRdRatio])),
    amortizationIncluded: Object.fromEntries(
      c.amortization.map((a) => [a.id, (a.trueRdRatio ?? a.rdRatio) > 0]),
    ),
    subcontractingIncluded: Object.fromEntries(c.subcontracting.map((s) => [s.id, true])),
    grantsDeducted: Object.fromEntries(c.grants.map((g) => [g.id, true])),
    decoysIncluded: Object.fromEntries(c.decoys.map((d) => [d.id, false])),
  };
}

export function computeBreakdown(
  c: AssietteCase,
  rawInput: AssietteInput | null,
  ruleset: Ruleset,
  opts: ComputeOptions,
): CirBreakdown {
  const input = opts.legal || rawInput === null ? trueInput(c) : rawInput;
  const warnings: string[] = [];
  const sub = ruleset.cir.subcontracting;

  // 1. Personnel
  let personnel = 0;
  for (const p of c.personnel) {
    const ratio = opts.legal ? p.trueRdRatio : (input.personnelRatios[p.id] ?? 0);
    personnel += p.grossCost * Math.min(1, Math.max(0, ratio));
  }

  // 2. Amortissements
  let amortization = 0;
  for (const a of c.amortization) {
    const included = input.amortizationIncluded[a.id] ?? false;
    if (!included) continue;
    const ratio = opts.legal ? (a.trueRdRatio ?? a.rdRatio) : a.rdRatio;
    amortization += a.annualDepreciation * ratio;
  }

  // 3. Forfait de fonctionnement (jamais sur la sous-traitance)
  const operatingAllowance =
    personnel * ruleset.cir.operatingAllowance.onPersonnel +
    amortization * ruleset.cir.operatingAllowance.onAmortization;

  // 4. Leurres (postes supprimés) — uniquement si le joueur les a inclus
  let decoysIncluded = 0;
  if (!opts.legal) {
    for (const d of c.decoys) {
      if (input.decoysIncluded[d.id]) decoysIncluded += d.amount;
    }
  }

  // 5. Sous-traitance
  let relatedRaw = 0;
  let unrelatedRaw = 0;
  for (const s of c.subcontracting) {
    const included = opts.legal
      ? isSubcontractEligible(s, ruleset)
      : (input.subcontractingIncluded[s.id] ?? false);
    if (!included) continue;
    if (opts.legal || isSubcontractEligible(s, ruleset)) {
      // ligne légale
    } else {
      warnings.push(
        `${s.provider} : dépense non éligible (${!s.hasMesrAgreement ? 'pas d’agrément MESR' : 'sous-traitance de rang ' + s.tier}).`,
      );
    }
    if (s.related) relatedRaw += s.amount;
    else unrelatedRaw += s.amount;
  }
  const subcontractingRaw = relatedRaw + unrelatedRaw;

  // 5a. Limite proportionnelle : 3 × les autres dépenses éligibles — appliquée en premier.
  const otherExpenses = personnel + amortization + operatingAllowance + decoysIncluded;
  const proportionalCap = otherExpenses * sub.proportionalCapMultiplier;
  let capHit: CirBreakdown['subcontractingCapHit'] = 'none';
  let retained = subcontractingRaw;
  if (retained > proportionalCap) {
    retained = proportionalCap;
    capHit = 'proportional';
    warnings.push(
      `Limite proportionnelle : la sous-traitance retenue est plafonnée à ${sub.proportionalCapMultiplier} × les autres dépenses.`,
    );
  }

  // 5b. Plafonds annuels : 2 M€ (entités liées) / 10 M€ (global).
  const scale = subcontractingRaw > 0 ? retained / subcontractingRaw : 0;
  let relatedRetained = relatedRaw * scale;
  const unrelatedRetained = unrelatedRaw * scale;
  if (relatedRetained > sub.annualCapRelated) {
    relatedRetained = sub.annualCapRelated;
    capHit = 'annual';
    warnings.push('Plafond annuel de sous-traitance vers des entités liées atteint.');
  }
  let subcontractingRetained = relatedRetained + unrelatedRetained;
  if (subcontractingRetained > sub.annualCapUnrelated) {
    subcontractingRetained = sub.annualCapUnrelated;
    capHit = 'annual';
    warnings.push('Plafond annuel global de sous-traitance atteint.');
  }

  // 6. Déductions : subventions et avances remboursables
  let grantsDeducted = 0;
  for (const g of c.grants) {
    const deducted = opts.legal ? true : (input.grantsDeducted[g.id] ?? false);
    if (deducted) grantsDeducted += g.amount * g.rdAllocationRatio;
  }

  const base = Math.max(
    0,
    personnel +
      amortization +
      operatingAllowance +
      decoysIncluded +
      subcontractingRetained -
      grantsDeducted,
  );
  const cir = Math.round(applyBrackets(base, ruleset.cir.rates));

  return {
    personnel: Math.round(personnel),
    amortization: Math.round(amortization),
    operatingAllowance: Math.round(operatingAllowance),
    subcontractingRaw: Math.round(subcontractingRaw),
    subcontractingRetained: Math.round(subcontractingRetained),
    subcontractingCapHit: capHit,
    grantsDeducted: Math.round(grantsDeducted),
    decoysIncluded: Math.round(decoysIncluded),
    base: Math.round(base),
    cir,
    warnings,
  };
}
