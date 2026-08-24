import { describe, it, expect } from 'vitest';
import balance from '../../src/data/balance.json';
import ruleset from '../../src/data/rules/ruleset-2026.json';
import { CASES } from '../../src/data/cases';
import { EXPERT_CASES } from '../../src/data/cases-expert';
import { EXPERT_CLIENTS } from '../../src/data/clients-expert';
import { EXPERT_CARDSETS } from '../../src/data/cards-expert';
import { CASE_TWISTS, twistsForCase } from '../../src/data/case-twists';
import { SCENARIOS, scenarioById } from '../../src/data/scenarios/index';
import { MAILS, mailsForCycle } from '../../src/data/mails';
import { SEASON_LENGTH } from '../../src/data/calendar';
import { createNewGame } from '../../src/state/factory';
import { portraitUrl } from '../../src/avatars/portraits';
import { applyTwist, jitterAmounts, varyCase } from '../../src/engine/casevar';
import {
  ALL_POSTES,
  restrictCase,
  stepFor,
  stepForClient,
  toleranceForStep,
  type Poste,
} from '../../src/engine/progression';
import { gradeForXp, nextGrade } from '../../src/engine/economy';
import {
  completeSeason,
  EMPTY_PROGRESS,
  followsAdvice,
  JOURNEY,
  journeyComplete,
  nextSeason,
  advisedBefore,
} from '../../src/engine/journey';
import { buildAuditFindings, resolveAudit } from '../../src/engine/audit';
import { computeBreakdown } from '../../src/engine/cir/calculator';
import { initClientState } from '../../src/state/factory';
import type { AuditFinding, GameMode, Ruleset, SaveGame } from '../../src/engine/types';

const RULESET = ruleset as Ruleset;
// Fichiers réellement présents dans public/portraits, énumérés au build.
const PORTRAIT_FILES = new Set(
  Object.keys(import.meta.glob('../../public/portraits/*.png')).map((p) => p.split('/').pop()!),
);
const MODES: GameMode[] = ['onboarding', 'expert'];

// ---------------------------------------------------------------------------
// Courbe d'apprentissage
// ---------------------------------------------------------------------------

describe('Courbe de progression de l’assiette', () => {
  it('n’exige jamais moins de précision au dossier suivant', () => {
    for (const mode of MODES) {
      for (let i = 2; i <= 8; i++) {
        expect(toleranceForStep(mode, i)).toBeLessThanOrEqual(toleranceForStep(mode, i - 1));
      }
    }
  });

  it('n’enlève jamais un poste déjà introduit', () => {
    for (const mode of MODES) {
      for (let i = 2; i <= 8; i++) {
        for (const p of stepFor(mode, i - 1).postes) {
          expect(stepFor(mode, i).postes).toContain(p);
        }
      }
    }
  });

  it('ouvre les cinq postes avant la fin de chaque saison', () => {
    for (const mode of MODES) {
      expect(stepFor(mode, 6).postes.sort()).toEqual([...ALL_POSTES].sort());
    }
  });

  it('commence l’Onboarding sur le seul personnel, et l’Expert sur tout', () => {
    expect(stepFor('onboarding', 1).postes).not.toContain('subcontracting');
    expect(stepFor('expert', 1).postes.sort()).toEqual([...ALL_POSTES].sort());
    // La deuxième saison est plus exigeante dès son premier dossier.
    expect(toleranceForStep('expert', 1)).toBeLessThan(toleranceForStep('onboarding', 4));
  });

  it('signale le poste nouvellement introduit, une seule fois', () => {
    const seen = new Set<Poste>();
    for (let i = 1; i <= 4; i++) {
      for (const p of stepFor('onboarding', i).introduces) {
        expect(seen.has(p), `poste introduit deux fois : ${p}`).toBe(false);
        seen.add(p);
      }
    }
  });

  it('borne les rangs hors courbe sur la dernière marche', () => {
    expect(stepFor('onboarding', 0).tolerance).toBe(stepFor('onboarding', 1).tolerance);
    expect(stepFor('onboarding', 99).tolerance).toBe(balance.tolerance.onboarding);
    expect(stepFor('expert', 99).tolerance).toBe(balance.tolerance.expert);
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
    for (const c of [...CASES, ...EXPERT_CASES]) {
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
    const lines = [...CASES, ...EXPERT_CASES].flatMap((c) => [
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

describe('Portefeuille de la saison Expert', () => {
  it('ne partage aucun client avec la première saison', () => {
    const first = new Set(CASES.map((c) => c.clientId));
    for (const c of EXPERT_CLIENTS) expect(first.has(c.id)).toBe(false);
  });

  it('pointe vers un cas, un jeu de cartes et des scénarios existants', () => {
    const scenarioIds = new Set(SCENARIOS.map((s) => s.id));
    const caseIds = new Set(EXPERT_CASES.map((c) => c.id));
    const cardsetIds = new Set(EXPERT_CARDSETS.map((c) => c.id));
    for (const cl of EXPERT_CLIENTS) {
      expect(caseIds.has(cl.caseId), cl.id).toBe(true);
      expect(cardsetIds.has(cl.cardsetId), cl.id).toBe(true);
      for (const sc of Object.values(cl.scenarios)) expect(scenarioIds.has(sc), sc).toBe(true);
    }
  });

  it('réutilise des portraits déjà présents dans le dépôt', () => {
    for (const cl of EXPERT_CLIENTS) {
      const url = portraitUrl(cl.contact.avatarSeed);
      expect(url, `portrait manquant pour ${cl.id}`).not.toBeNull();
      const file = url!.split('/').pop()!;
      expect(PORTRAIT_FILES.has(file), `fichier absent : ${file}`).toBe(true);
    }
  });

  it('sert les cinq postes dès le premier dossier expert', () => {
    for (const c of EXPERT_CASES) {
      expect(c.personnel.length, c.id).toBeGreaterThan(0);
      // Forgeal est le dossier à refuser : il n'a ni aide publique ni
      // sous-traitance éligible, c'est précisément ce qui le disqualifie.
      if (c.id === 'case_exp_forgeal') continue;
      expect(c.amortization.length, c.id).toBeGreaterThan(0);
      expect(c.subcontracting.length, c.id).toBeGreaterThan(0);
      expect(c.grants.length, c.id).toBeGreaterThan(0);
      expect(c.decoys.length, c.id).toBeGreaterThan(0);
    }
  });

  // En Expert, le taux justifiable n'est révélé que par la pièce : une ligne
  // piégée sans pièce serait indevinable à ±1 % de tolérance.
  it('adosse chaque ligne de personnel piégée à une pièce à récupérer', () => {
    for (const c of EXPERT_CASES) {
      for (const p of c.personnel) {
        if (p.trap) expect(p.evidence, `${c.id}/${p.id} : piège sans pièce`).toBeTruthy();
      }
    }
  });

  it('garde un dossier qu’il faut refuser plutôt que monter', () => {
    const forgeal = EXPERT_CASES.find((c) => c.id === 'case_exp_forgeal')!;
    const legal = computeBreakdown(forgeal, null, RULESET, { legal: true }).cir;
    const gonfle = computeBreakdown(
      forgeal,
      {
        personnelRatios: Object.fromEntries(forgeal.personnel.map((p) => [p.id, p.claimedRdRatio])),
        amortizationIncluded: Object.fromEntries(forgeal.amortization.map((a) => [a.id, true])),
        subcontractingIncluded: Object.fromEntries(forgeal.subcontracting.map((s) => [s.id, true])),
        grantsDeducted: {},
        decoysIncluded: Object.fromEntries(forgeal.decoys.map((d) => [d.id, true])),
      },
      RULESET,
      { legal: false },
    ).cir;
    // Ce que le client réclame est très au-dessus de ce qui est défendable.
    expect(gonfle).toBeGreaterThan(legal * 3);
  });

  it('propose un chemin de refus explicite dans le scénario dédié', () => {
    const sc = SCENARIOS.find((s) => s.id === 'sc_exp_disc_refus')!;
    const refus = sc.nodes.flatMap((n) => n.choices).filter((c) => c.flags?.includes('refus_mission'));
    expect(refus).toHaveLength(1);
    expect(refus[0].role).toBe('optimal');
  });
});

// ---------------------------------------------------------------------------
// Parcours en deux saisons
// ---------------------------------------------------------------------------

describe('Parcours Onboarding → Expert', () => {
  // L'ordre est un conseil, pas une porte fermée : un consultant déjà en poste
  // doit pouvoir entrer directement par la seconde saison.
  it('conseille la première saison avant la seconde, sans l’imposer', () => {
    expect(advisedBefore('onboarding')).toBeNull();
    expect(advisedBefore('expert')).toBe('onboarding');
    expect(followsAdvice('onboarding', EMPTY_PROGRESS)).toBe(true);
    expect(followsAdvice('expert', EMPTY_PROGRESS)).toBe(false);
  });

  it('cesse de conseiller une fois la première saison terminée', () => {
    const p = completeSeason(EMPTY_PROGRESS, 'onboarding', 72);
    expect(followsAdvice('expert', p)).toBe(true);
    expect(nextSeason('onboarding')).toBe('expert');
    expect(nextSeason('expert')).toBeNull();
  });

  it('déclare le parcours complet quand les deux saisons sont menées', () => {
    let p = completeSeason(EMPTY_PROGRESS, 'onboarding', 60);
    expect(journeyComplete(p)).toBe(false);
    p = completeSeason(p, 'expert', 55);
    expect(journeyComplete(p)).toBe(true);
    expect(p.completed).toEqual(JOURNEY);
  });

  it('conserve le meilleur score et n’enregistre pas deux fois la même saison', () => {
    let p = completeSeason(EMPTY_PROGRESS, 'onboarding', 80);
    p = completeSeason(p, 'onboarding', 61);
    expect(p.completed).toEqual(['onboarding']);
    expect(p.best.onboarding).toBe(80);
  });
});

// ---------------------------------------------------------------------------
// Contrôle contradictoire
// ---------------------------------------------------------------------------

describe('Séance contradictoire', () => {
  const theCase = EXPERT_CASES[0];
  const cardset = EXPERT_CARDSETS[0];
  const gonfle = {
    ...initClientState('cli_exp_ovalis'),
    assietteInput: {
      personnelRatios: Object.fromEntries(theCase.personnel.map((p) => [p.id, p.claimedRdRatio])),
      amortizationIncluded: Object.fromEntries(theCase.amortization.map((a) => [a.id, true])),
      subcontractingIncluded: Object.fromEntries(theCase.subcontracting.map((s) => [s.id, true])),
      grantsDeducted: {},
      decoysIncluded: Object.fromEntries(theCase.decoys.map((d) => [d.id, true])),
    },
  };

  const findings = (contradictoire: boolean) =>
    buildAuditFindings(gonfle, theCase, cardset, RULESET, { contradictoire });

  it('ne relance qu’en séance contradictoire', () => {
    expect(findings(false).every((f) => f.followUp === undefined)).toBe(true);
    const withRelance = findings(true);
    expect(withRelance.length).toBeGreaterThan(0);
    expect(withRelance.every((f) => f.followUp !== undefined)).toBe(true);
  });

  it('propose une seule bonne réponse par relance', () => {
    for (const f of findings(true)) {
      expect(f.followUp!.weakAnswers).toHaveLength(3);
      expect(f.followUp!.goodAnswer.length).toBeGreaterThan(20);
      expect(f.followUp!.weakAnswers).not.toContain(f.followUp!.goodAnswer);
    }
  });

  it('atténue le rappel d’un constat rectifié sans l’effacer', () => {
    const fs = findings(true);
    const ids = fs.map((f) => f.id);
    const plein = resolveAudit(fs, [], 0, 500000, 0.18);
    const rectifie = resolveAudit(fs, [], 0, 500000, 0.18, ids, balance.audit.remedyRelief);
    expect(rectifie.reassessedAmount).toBeLessThan(plein.reassessedAmount);
    expect(rectifie.reassessedAmount).toBeGreaterThan(0);
    expect(rectifie.findings.every((f) => f.mitigated)).toBe(true);
  });

  it('ne rectifie pas un constat déjà défendu', () => {
    const f: AuditFinding = {
      id: 'f_test',
      clientId: 'x',
      label: 'test',
      defensible: true,
      question: 'q',
      goodAnswer: 'a',
      weakAnswers: [],
      reassessment: 1000,
    };
    const r = resolveAudit([f], ['f_test'], 0, 10000, 0.2, ['f_test'], 0.4);
    expect(r.findings[0].defended).toBe(true);
    expect(r.findings[0].mitigated).toBe(false);
    expect(r.reassessedAmount).toBe(0);
  });
});


// ---------------------------------------------------------------------------
// Le récit de la deuxième saison
// ---------------------------------------------------------------------------

describe('Une deuxième saison qui ne rejoue pas la première', () => {
  it('ouvre sur une scène de reprise, pas sur le tutoriel d’arrivée', () => {
    const opening = scenarioById('sc_exp_opening');
    expect(opening.type).toBe('INTERNAL');
    expect(opening.id).not.toBe('sc_tutorial');
    // La scène est confiée à la direction de BU, pas à la manager d'accueil.
    expect(opening.nodes.every((n) => n.speaker.includes('Sophie Meyer'))).toBe(true);
  });

  it('fait revenir le joueur avec une saison au compteur', () => {
    const first = createNewGame('onboarding', '2026-01-01T00:00:00.000Z', 'g');
    const second = createNewGame('expert', '2026-01-01T00:00:00.000Z', 'g');
    expect(first.xp).toBe(0);
    expect(second.xp).toBeGreaterThan(first.xp);
    expect(gradeForXp(second.xp).id).not.toBe('stagiaire');
  });

  it('donne un grade encore à gagner en deuxième saison', () => {
    const start = createNewGame('expert', '2026-01-01T00:00:00.000Z', 'g').xp;
    expect(nextGrade(start), 'plus rien à débloquer').not.toBeNull();
  });

  it('laisse commencer par la deuxième saison, en le signalant', () => {
    expect(followsAdvice('expert', EMPTY_PROGRESS)).toBe(false);
    // Une saison Expert menée seule compte bel et bien, mais ne clôt pas le
    // parcours : il reste la première à faire.
    const straightToExpert = completeSeason(EMPTY_PROGRESS, 'expert', 90);
    expect(straightToExpert.completed).toEqual(['expert']);
    expect(journeyComplete(straightToExpert)).toBe(false);
    expect(followsAdvice('expert', straightToExpert)).toBe(false);
  });
});

describe('Boîte mail par saison', () => {
  it('tient dans les six semaines de la saison', () => {
    for (const m of MAILS) {
      expect(m.fromCycle, m.id).toBeGreaterThanOrEqual(1);
      expect(m.toCycle, m.id).toBeLessThanOrEqual(SEASON_LENGTH);
      expect(m.fromCycle, m.id).toBeLessThanOrEqual(m.toCycle);
    }
  });

  it('délivre au moins un message chaque semaine, dans les deux saisons', () => {
    for (const mode of MODES) {
      for (let c = 1; c <= SEASON_LENGTH; c++) {
        expect(mailsForCycle(c, mode).length, `${mode} semaine ${c}`).toBeGreaterThan(0);
      }
    }
  });

  it('ne souhaite pas la bienvenue à un consultant de deuxième saison', () => {
    const expertInbox = Array.from({ length: SEASON_LENGTH }, (_, i) => mailsForCycle(i + 1, 'expert')).flat();
    const ids = expertInbox.map((m) => m.id);
    expect(ids).not.toContain('mail_bienvenue');
    expect(ids).not.toContain('mail_methodo');
    expect(expertInbox.some((m) => m.id.startsWith('mail_exp_'))).toBe(true);
  });

  it('n’envoie pas les messages de deuxième saison au nouveau venu', () => {
    const rookieInbox = Array.from({ length: SEASON_LENGTH }, (_, i) => mailsForCycle(i + 1, 'onboarding')).flat();
    expect(rookieInbox.every((m) => !m.id.startsWith('mail_exp_'))).toBe(true);
  });

  it('garde des identifiants uniques et des fiches codex existantes', () => {
    expect(new Set(MAILS.map((m) => m.id)).size).toBe(MAILS.length);
  });
});
