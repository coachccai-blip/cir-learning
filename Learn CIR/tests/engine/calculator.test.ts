import { describe, it, expect } from 'vitest';
import { applyBrackets, computeBreakdown, isSubcontractEligible } from '../../src/engine/cir/calculator';
import { scoreAssiette } from '../../src/engine/cir/scoring';
import { CASES, caseById } from '../../src/data/cases';
import type { AssietteInput, Ruleset, SubcontractingLine } from '../../src/engine/types';
import rulesetJson from '../../src/data/rules/ruleset-2026.json';

const ruleset = rulesetJson as Ruleset;

// Corrigés « cas d'or » figés (recalculés par le moteur, §18.1).
const GOLD: Record<string, { base: number; cir: number }> = {
  case_agri: { base: 134630, cir: 40389 },
  case_saas: { base: 282550, cir: 84765 },
  case_indus: { base: 245500, cir: 73650 },
  case_biotech: { base: 464040, cir: 139212 },
  case_green: { base: 195075, cir: 58523 },
  case_services: { base: 14280, cir: 4284 },
};

describe('applyBrackets — barème par tranches', () => {
  it('applique 30 % sous 100 M€', () => {
    expect(applyBrackets(100000, ruleset.cir.rates)).toBe(30000);
  });
  it('applique le taux réduit au-delà de 100 M€', () => {
    const credit = applyBrackets(150000000, ruleset.cir.rates);
    expect(credit).toBe(100000000 * 0.3 + 50000000 * 0.05);
  });
  it('renvoie 0 pour une base négative ou nulle', () => {
    expect(applyBrackets(0, ruleset.cir.rates)).toBe(0);
    expect(applyBrackets(-5000, ruleset.cir.rates)).toBe(0);
  });
});

describe('Cas d’or — le moteur recalcule chaque cas', () => {
  for (const c of CASES) {
    it(`${c.id} correspond au corrigé figé`, () => {
      const t = computeBreakdown(c, null, ruleset, { legal: true });
      expect({ base: t.base, cir: t.cir }).toEqual(GOLD[c.id]);
    });
  }
});

describe('Règles de sous-traitance', () => {
  const base: SubcontractingLine = {
    id: 'x',
    provider: 'X',
    amount: 10000,
    hasMesrAgreement: true,
    related: false,
    tier: 1,
  };
  it('exclut un sous-traitant sans agrément MESR', () => {
    expect(isSubcontractEligible({ ...base, hasMesrAgreement: false }, ruleset)).toBe(false);
  });
  it('exclut le 3ᵉ rang (cascade limitée au 2ᵉ)', () => {
    expect(isSubcontractEligible({ ...base, tier: 3 }, ruleset)).toBe(false);
  });
  it('accepte un agréé de 1er rang', () => {
    expect(isSubcontractEligible(base, ruleset)).toBe(true);
  });
});

describe('Forfait de fonctionnement', () => {
  it('applique 40 % personnel + 75 % amortissements et jamais sur la sous-traitance', () => {
    const c = caseById('case_saas');
    const t = computeBreakdown(c, null, ruleset, { legal: true });
    expect(t.operatingAllowance).toBe(
      Math.round(t.personnel * 0.4 + t.amortization * 0.75),
    );
  });
});

describe('Limite proportionnelle 3× appliquée avant le plafond global', () => {
  it('plafonne la sous-traitance à 3× les autres dépenses', () => {
    const c = {
      id: 'synthetic',
      clientId: 'x',
      fiscalYear: 2025,
      narrative: '',
      personnel: [{ id: 'p', name: 'p', role: 'r', grossCost: 10000, claimedRdRatio: 1, trueRdRatio: 1 }],
      amortization: [],
      subcontracting: [
        { id: 's', provider: 'Agréé', amount: 500000, hasMesrAgreement: true, related: false, tier: 1 },
      ],
      grants: [],
      decoys: [],
    };
    const t = computeBreakdown(c, null, ruleset, { legal: true });
    // autres dépenses = 10000 personnel + 4000 forfait = 14000 ; cap = 42000
    expect(t.subcontractingCapHit).toBe('proportional');
    expect(t.subcontractingRetained).toBe(42000);
  });
});

describe('Postes supprimés et déductions', () => {
  it('exclut brevets/veille/majoration JD du calcul juste', () => {
    const c = caseById('case_biotech');
    const t = computeBreakdown(c, null, ruleset, { legal: true });
    expect(t.decoysIncluded).toBe(0);
  });
  it('déduit les subventions du calcul juste', () => {
    const c = caseById('case_biotech');
    const t = computeBreakdown(c, null, ruleset, { legal: true });
    // 120000 subvention + 60000 avance
    expect(t.grantsDeducted).toBe(180000);
  });
});

describe('Property-based — monotonie et positivité', () => {
  it('cir ≥ 0 et base ≥ 0 pour tous les cas', () => {
    for (const c of CASES) {
      const t = computeBreakdown(c, null, ruleset, { legal: true });
      expect(t.cir).toBeGreaterThanOrEqual(0);
      expect(t.base).toBeGreaterThanOrEqual(0);
    }
  });
  it('ajouter une dépense de personnel éligible n’abaisse jamais le CIR', () => {
    const c = caseById('case_agri');
    const t1 = computeBreakdown(c, null, ruleset, { legal: true });
    const c2 = {
      ...c,
      personnel: [...c.personnel, { id: 'extra', name: 'x', role: 'Chercheur', grossCost: 50000, claimedRdRatio: 1, trueRdRatio: 1 }],
    };
    const t2 = computeBreakdown(c2, null, ruleset, { legal: true });
    expect(t2.cir).toBeGreaterThanOrEqual(t1.cir);
  });
});

describe('Scoring d’assiette', () => {
  it('donne une précision de 1 pour une saisie parfaite', () => {
    const c = caseById('case_agri');
    const perfect: AssietteInput = {
      personnelRatios: Object.fromEntries(c.personnel.map((p) => [p.id, p.trueRdRatio])),
      amortizationIncluded: Object.fromEntries(c.amortization.map((a) => [a.id, true])),
      subcontractingIncluded: { s1: true, s2: false },
      grantsDeducted: Object.fromEntries(c.grants.map((g) => [g.id, true])),
      decoysIncluded: Object.fromEntries(c.decoys.map((d) => [d.id, false])),
    };
    const score = scoreAssiette(c, perfect, ruleset, 0.05);
    expect(score.precision).toBeCloseTo(1, 5);
    expect(score.withinTolerance).toBe(true);
    expect(score.deviations).toHaveLength(0);
  });
  it('détecte un gonflement de taux et un poste supprimé', () => {
    const c = caseById('case_agri');
    const bad: AssietteInput = {
      personnelRatios: { p1: 1.0, p2: 0.6, p3: 0.5 }, // p1 et p3 gonflés
      amortizationIncluded: { a1: true },
      subcontractingIncluded: { s1: true, s2: true }, // s2 non agréé retenu
      grantsDeducted: { g1: false }, // subvention non déduite
      decoysIncluded: { d1: true, d2: false }, // brevet inclus
    };
    const score = scoreAssiette(c, bad, ruleset, 0.05);
    expect(score.precision).toBeLessThan(1);
    expect(score.withinTolerance).toBe(false);
    const causes = score.deviations.map((d) => d.label);
    expect(causes.length).toBeGreaterThanOrEqual(4);
  });
});
