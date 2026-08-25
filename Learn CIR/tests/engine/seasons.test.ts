import { describe, it, expect, beforeAll } from 'vitest';
import ruleset from '../../src/data/rules/ruleset-2026.json';
import { CASES } from '../../src/data/cases';
import { CASE_TWISTS, twistsForCase } from '../../src/data/case-twists';
import { MAILS, mailsForCycle } from '../../src/data/mails';
import { codexById } from '../../src/data/codex';
import { SEASON_LENGTH } from '../../src/data/calendar';
import { createNewGame, initClientState } from '../../src/state/factory';
import { applyTwist, jitterAmounts, varyCase } from '../../src/engine/casevar';
import {
  ALL_POSTES,
  restrictCase,
  stepFor,
  stepForClient,
  toleranceForStep,
  type Poste,
} from '../../src/engine/progression';
import { computeBreakdown } from '../../src/engine/cir/calculator';
import type { Ruleset, SaveGame } from '../../src/engine/types';

const RULESET = ruleset as Ruleset;

// ---------------------------------------------------------------------------
// Courbe d'apprentissage
// ---------------------------------------------------------------------------

describe('Courbe de progression de l’assiette', () => {
  it('n’exige jamais moins de précision au dossier suivant', () => {
    for (let i = 2; i <= 8; i++) {
      expect(toleranceForStep(i)).toBeLessThanOrEqual(toleranceForStep(i - 1));
    }
  });

  it('n’enlève jamais un poste déjà introduit', () => {
    for (let i = 2; i <= 8; i++) {
      for (const p of stepFor(i - 1).postes) {
        expect(stepFor(i).postes).toContain(p);
      }
    }
  });

  it('ouvre les cinq postes avant la fin de la saison', () => {
    expect(stepFor(6).postes.sort()).toEqual([...ALL_POSTES].sort());
  });

  it('commence sur le seul personnel, puis ouvre les postes un par un', () => {
    expect(stepFor(1).postes).not.toContain('subcontracting');
    expect(stepFor(1).postes).toContain('personnel');
    // Chaque marche en ouvre au moins autant que la précédente.
    for (let i = 2; i <= 4; i++) {
      expect(stepFor(i).postes.length).toBeGreaterThanOrEqual(stepFor(i - 1).postes.length);
    }
  });

  it('signale le poste nouvellement introduit, une seule fois', () => {
    const seen = new Set<Poste>();
    for (let i = 1; i <= 4; i++) {
      for (const p of stepFor(i).introduces) {
        expect(seen.has(p), `poste introduit deux fois : ${p}`).toBe(false);
        seen.add(p);
      }
    }
  });

  it('borne les rangs hors courbe sur la dernière marche', () => {
    expect(stepFor(0).tolerance).toBe(stepFor(1).tolerance);
    expect(stepFor(99).tolerance).toBe(stepFor(4).tolerance);
  });
});

describe('Restriction d’un cas aux postes ouverts', () => {
  it('vide exactement les postes non introduits', () => {
    const c = CASES[3]; // biotech : les cinq postes sont servis
    const restricted = restrictCase(c, ['personnel', 'amortization']);
    expect(restricted.personnel).toHaveLength(c.personnel.length);
    expect(restricted.subcontracting).toEqual([]);
    expect(restricted.grants).toEqual([]);
    expect(restricted.decoys).toEqual([]);
  });

  it('rend le cas intact quand tout est ouvert', () => {
    const c = CASES[0];
    expect(restrictCase(c, ALL_POSTES)).toBe(c);
  });

  it('laisse un CIR calculable sur un dossier restreint', () => {
    const restricted = restrictCase(CASES[0], ['personnel', 'amortization']);
    expect(computeBreakdown(restricted, null, RULESET, { legal: true }).cir).toBeGreaterThan(0);
  });
});

describe('Étape figée par dossier', () => {
  const save = (patch: Partial<SaveGame>): SaveGame =>
    ({ mode: 'onboarding', portfolio: [], ...patch }) as SaveGame;

  it('se déduit du nombre d’assiettes déjà construites', () => {
    const done = { ...initClientState('cli_agri_dupuis'), assietteInput: {} as never };
    const s = save({ portfolio: [done, initClientState('cli_saas_nexalog')] });
    expect(stepForClient(s, 'cli_saas_nexalog').index).toBe(2);
  });

  it('ne bouge plus une fois l’assiette ouverte', () => {
    const fixed = { ...initClientState('cli_saas_nexalog'), baseStep: 1 };
    const done = { ...initClientState('cli_agri_dupuis'), assietteInput: {} as never };
    const s = save({ portfolio: [done, fixed] });
    expect(stepForClient(s, 'cli_saas_nexalog').index).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Variabilité des dossiers
// ---------------------------------------------------------------------------

describe('Variantes de dossiers', () => {
  it('redonne exactement le même dossier pour la même graine', () => {
    for (const c of CASES) {
      const a = varyCase(c, twistsForCase(c.id), 'graine-fixe');
      const b = varyCase(c, twistsForCase(c.id), 'graine-fixe');
      expect(b).toEqual(a);
    }
  });

  it('ne redonne pas les mêmes montants d’une partie à l’autre', () => {
    const totals = new Set<number>();
    for (let i = 0; i < 12; i++) {
      const v = varyCase(CASES[1], twistsForCase('case_saas'), `graine-${i}`);
      totals.add(v.personnel.reduce((s, p) => s + p.grossCost, 0));
    }
    expect(totals.size).toBeGreaterThan(1);
  });

  it('finit par tirer chacune des variantes écrites', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 60; i++) {
      seen.add(varyCase(CASES[0], twistsForCase('case_agri'), `g${i}`).narrative);
    }
    // Le dossier d'origine plus ses variantes.
    expect(seen.size).toBe(twistsForCase('case_agri').length + 1);
  });

  it('garde des montants positifs et arrondis à la centaine', () => {
    const v = jitterAmounts(CASES[3], 'g');
    const amounts = [
      ...v.personnel.map((p) => p.grossCost),
      ...v.amortization.map((a) => a.annualDepreciation),
      ...v.subcontracting.map((s) => s.amount),
      ...v.grants.map((g) => g.amount),
      ...v.decoys.map((d) => d.amount),
    ];
    for (const n of amounts) {
      expect(n).toBeGreaterThan(0);
      expect(n % 100).toBe(0);
    }
  });

  it('laisse chaque variante calculable et non vide', () => {
    for (const c of CASES) {
      for (const t of twistsForCase(c.id)) {
        const v = jitterAmounts(applyTwist(c, t), 'g');
        expect(v.personnel.length, `${t.id} : plus personne à l’assiette`).toBeGreaterThan(0);
        expect(computeBreakdown(v, null, RULESET, { legal: true }).cir).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('ne cite que des lignes existantes', () => {
    for (const c of CASES) {
      const ids = new Set([
        ...c.personnel.map((p) => p.id),
        ...c.amortization.map((a) => a.id),
        ...c.subcontracting.map((s) => s.id),
        ...c.grants.map((g) => g.id),
        ...c.decoys.map((d) => d.id),
      ]);
      for (const t of twistsForCase(c.id)) {
        const added = new Set([
          ...(t.addPersonnel ?? []).map((p) => p.id),
          ...(t.addSubcontracting ?? []).map((s) => s.id),
          ...(t.addGrants ?? []).map((g) => g.id),
        ]);
        const referenced = [
          ...(t.personnel ?? []),
          ...(t.amortization ?? []),
          ...(t.subcontracting ?? []),
          ...(t.grants ?? []),
        ].map((x) => x.id);
        for (const id of referenced) {
          expect(ids.has(id) || added.has(id), `${t.id} : ligne inconnue ${id}`).toBe(true);
        }
        for (const id of t.dropIds ?? []) expect(ids.has(id), `${t.id} : ${id}`).toBe(true);
      }
    }
  });

  it('donne un identifiant unique à chaque ligne d’un cas, toutes catégories confondues', () => {
    for (const c of CASES) {
      const ids = [
        ...c.personnel.map((p) => p.id),
        ...c.amortization.map((a) => a.id),
        ...c.subcontracting.map((s) => s.id),
        ...c.grants.map((g) => g.id),
        ...c.decoys.map((d) => d.id),
      ];
      expect(new Set(ids).size, `${c.id} : identifiants dupliqués`).toBe(ids.length);
    }
  });

  // Les ratios changent d'une variante à l'autre : un piège qui cite un
  // pourcentage se désynchroniserait du chiffre affiché à l'écran.
  it('n’écrit aucun pourcentage dans les libellés de piège', () => {
    const withPercent = /\d+\s*%/;
    const lines = CASES.flatMap((c) => [
      ...c.personnel,
      ...c.amortization,
      ...c.subcontracting,
      ...c.grants,
    ]);
    const twistLines = Object.values(CASE_TWISTS)
      .flat()
      .flatMap((t) => [
        ...(t.personnel ?? []),
        ...(t.amortization ?? []),
        ...(t.subcontracting ?? []),
        ...(t.grants ?? []),
        ...(t.addPersonnel ?? []),
        ...(t.addSubcontracting ?? []),
        ...(t.addGrants ?? []),
      ]);
    for (const l of [...lines, ...twistLines]) {
      if (l.trap) expect(withPercent.test(l.trap), `piège chiffré : ${l.trap}`).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Contenu de la deuxième saison
// ---------------------------------------------------------------------------

describe('Boîte mail de la saison', () => {
  it('tient dans les six semaines de la saison', () => {
    for (const m of MAILS) {
      expect(m.fromCycle, m.id).toBeGreaterThanOrEqual(1);
      expect(m.toCycle, m.id).toBeLessThanOrEqual(SEASON_LENGTH);
      expect(m.toCycle, m.id).toBeGreaterThanOrEqual(m.fromCycle);
    }
  });

  it('délivre au moins un message chaque semaine', () => {
    for (let cycle = 1; cycle <= SEASON_LENGTH; cycle++) {
      expect(mailsForCycle(cycle).length, `semaine ${cycle}`).toBeGreaterThan(0);
    }
  });

  it('garde des identifiants uniques et des fiches codex existantes', () => {
    const ids = MAILS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of MAILS) {
      if (m.codexUnlock) expect(codexById(m.codexUnlock), m.id).toBeDefined();
    }
  });
});

describe('Une seule saison, un seul départ', () => {
  beforeAll(() => {
    const mem: Record<string, string> = {};
    (globalThis as unknown as { localStorage: unknown }).localStorage = {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => {
        mem[k] = v;
      },
      removeItem: (k: string) => {
        delete mem[k];
      },
    };
  });

  it('démarre stagiaire, sans expérience héritée', () => {
    const save = createNewGame(new Date(0).toISOString(), 'depart');
    expect(save.xp).toBe(0);
    expect(save.cycle).toBe(1);
    expect(save.portfolio).toEqual([]);
  });

  it('ouvre sur le quiz de positionnement, puis sur le tutoriel d’arrivée', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.boot();
    s.setOptions({ volume: 0 });
    s.newGame('quiz-unique');
    expect(useStore.getState().view).toBe('quiz');
    expect(useStore.getState().quizPhase).toBe('pre');
    useStore.getState().commitQuiz('pre', [0, 0, 0, 0, 0]);
    expect(useStore.getState().dialogue?.scenarioId).toBe('sc_tutorial');
  });

  it('ne garde aucune trace d’une deuxième saison', async () => {
    const { SCENARIOS } = await import('../../src/data/scenarios/index');
    // Plus aucun scénario de reprise ni de séance contradictoire.
    expect(SCENARIOS.filter((sc) => sc.id.startsWith('sc_exp_'))).toEqual([]);
    const store = (await import('../../src/state/store')).useStore.getState() as unknown as Record<
      string,
      unknown
    >;
    expect(store.completeSeason).toBeUndefined();
    expect(store.resetJourney).toBeUndefined();
    expect(store.progress).toBeUndefined();
  });
});
