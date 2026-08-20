// Score de précision d'une assiette et détail des écarts poste par poste.

import type { AssietteCase, AssietteInput, AssietteScore, Ruleset } from '../types';
import { computeBreakdown, isSubcontractEligible } from './calculator';

export function scoreAssiette(
  c: AssietteCase,
  input: AssietteInput,
  ruleset: Ruleset,
  tolerance: number,
): AssietteScore {
  const player = computeBreakdown(c, input, ruleset, { legal: false });
  const truth = computeBreakdown(c, null, ruleset, { legal: true });

  const deviations: AssietteScore['deviations'] = [];

  for (const p of c.personnel) {
    const claimed = input.personnelRatios[p.id] ?? 0;
    if (Math.abs(claimed - p.trueRdRatio) > 0.011) {
      const delta = Math.round(p.grossCost * (claimed - p.trueRdRatio));
      deviations.push({
        label: `${p.name} (${p.role})`,
        delta,
        cause:
          p.trap ??
          `Taux retenu ${Math.round(claimed * 100)} % au lieu de ${Math.round(p.trueRdRatio * 100)} % justifiable.`,
      });
    }
  }

  for (const a of c.amortization) {
    const included = input.amortizationIncluded[a.id] ?? false;
    const trueRatio = a.trueRdRatio ?? a.rdRatio;
    const shouldInclude = trueRatio > 0;
    if (included !== shouldInclude) {
      deviations.push({
        label: a.asset,
        delta: included ? Math.round(a.annualDepreciation * a.rdRatio) : -Math.round(a.annualDepreciation * trueRatio),
        cause: a.trap ?? (included ? 'Immobilisation non affectée à la R&D.' : 'Dotation éligible oubliée.'),
      });
    }
  }

  for (const s of c.subcontracting) {
    const included = input.subcontractingIncluded[s.id] ?? false;
    const eligible = isSubcontractEligible(s, ruleset);
    if (included && !eligible) {
      deviations.push({
        label: s.provider,
        delta: s.amount,
        cause: s.trap ?? 'Sous-traitance non éligible retenue.',
      });
    } else if (!included && eligible) {
      deviations.push({
        label: s.provider,
        delta: -s.amount,
        cause: 'Sous-traitance agréée éligible non retenue.',
      });
    }
  }

  for (const g of c.grants) {
    const deducted = input.grantsDeducted[g.id] ?? false;
    if (!deducted) {
      deviations.push({
        label: `${g.source} (${g.type === 'grant' ? 'subvention' : 'avance remboursable'})`,
        delta: Math.round(g.amount * g.rdAllocationRatio),
        cause: g.trap ?? 'Financement public non déduit de l’assiette.',
      });
    }
  }

  for (const d of c.decoys) {
    if (input.decoysIncluded[d.id]) {
      deviations.push({ label: d.label, delta: d.amount, cause: d.reason });
    }
  }

  const precision =
    truth.cir === 0 ? (player.cir === 0 ? 1 : 0) : Math.max(0, 1 - Math.abs(player.cir - truth.cir) / truth.cir);

  return {
    playerCir: player.cir,
    trueCir: truth.cir,
    precision,
    withinTolerance: precision >= 1 - tolerance,
    deviations,
  };
}
