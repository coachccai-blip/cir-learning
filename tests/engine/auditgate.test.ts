import { describe, it, expect, beforeAll } from 'vitest';
import balance from '../../src/data/balance.json';
import { auditableDossiers, finalAuditDue, weakestDossier } from '../../src/engine/auditgate';
import type { AssietteInput, ClientState } from '../../src/engine/types';

/**
 * Le vérificateur ne se déplace pas pour rien.
 *
 * L'écran de contrôle s'ouvrait à la fin de toutes les parties : quand aucun
 * dossier ne le méritait, le joueur tombait quand même sur le vérificateur,
 * venu lui annoncer qu'il n'avait rien à lui dire. Le brief (§8.5) le réserve
 * aux dossiers dont la sécurité est passée sous le seuil en première saison, et
 * le rend systématique en deuxième.
 */

const THRESHOLD = balance.auditSecurityThreshold;
const dossier = (base: number | null, chiffre = true): ClientState =>
  ({
    clientId: `c${base}`,
    assietteInput: chiffre ? ({} as AssietteInput) : null,
    scores: { discovery: null, kickoff: null, qualification: null, base, justification: null },
  }) as ClientState;

describe('Déclenchement du contrôle de fin de saison', () => {
  const portfolio = [dossier(0.9), dossier(0.4), dossier(0.7)];

  it('épargne une première saison bien tenue', () => {
    expect(finalAuditDue(THRESHOLD, THRESHOLD, portfolio)).toBe(false);
    expect(finalAuditDue(100, THRESHOLD, portfolio)).toBe(false);
  });

  it('contrôle une première saison dont la sécurité a lâché', () => {
    expect(finalAuditDue(THRESHOLD - 1, THRESHOLD, portfolio)).toBe(true);
    expect(finalAuditDue(0, THRESHOLD, portfolio)).toBe(true);
  });

  it('ne dépend que de la sécurité, jamais du hasard', () => {
    // Deux appels identiques donnent le même verdict : le contrôle se mérite.
    expect(finalAuditDue(30, THRESHOLD, portfolio)).toBe(finalAuditDue(30, THRESHOLD, portfolio));
    expect(finalAuditDue(THRESHOLD + 20, THRESHOLD, portfolio)).toBe(false);
  });

  it('ne contrôle rien quand aucune assiette n’a été chiffrée', () => {
    const rien = [dossier(null, false), dossier(null, false)];
    expect(finalAuditDue(0, THRESHOLD, rien)).toBe(false);
    expect(finalAuditDue(0, THRESHOLD, rien)).toBe(false);
    expect(finalAuditDue(0, THRESHOLD, [])).toBe(false);
  });

  it('porte sur le dossier le moins précis, jamais au hasard', () => {
    expect(weakestDossier(portfolio)!.scores.base).toBe(0.4);
    expect(auditableDossiers([...portfolio, dossier(null, false)])).toHaveLength(3);
    expect(weakestDossier([])).toBeNull();
  });
});

describe('Fin de saison, écran par écran', () => {
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

  /** Termine une saison dans l'état demandé et rend l'écran affiché. */
  async function endSeason(security: number, chiffre: boolean) {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.boot();
    s.setOptions({ volume: 0 });
    s.newGame(`fin-${security}-${chiffre}`);
    useStore.setState({
      save: {
        ...useStore.getState().save!,
        gauges: { ...useStore.getState().save!.gauges, security },
        portfolio: chiffre ? [dossier(0.5)] : [],
      },
    });
    useStore.getState().finishSeason();
    return useStore.getState().view;
  }

  it('n’envoie pas le vérificateur sur une première saison propre', async () => {
    expect(await endSeason(90, true)).toBe('quiz');
  });

  it('l’envoie quand la sécurité a lâché', async () => {
    expect(await endSeason(20, true)).toBe('audit');
  });

  it('va droit au quiz de sortie quand rien n’a été chiffré', async () => {
    // Sans assiette construite, il n'y a rien à contrôler : on passe au bilan.
    expect(await endSeason(10, false)).toBe('quiz');
  });
});

// ---------------------------------------------------------------------------
// Le vérificateur ne récite pas un formulaire.
// ---------------------------------------------------------------------------

describe('Vivier de questions du vérificateur', () => {
  it('compte au moins vingt formulations, toutes distinctes', async () => {
    const { AUDIT_QUESTIONS, AUDIT_QUESTION_COUNT } = await import('../../src/data/audit-questions');
    expect(AUDIT_QUESTION_COUNT).toBeGreaterThanOrEqual(20);
    const rendered = Object.values(AUDIT_QUESTIONS).flatMap((pool) =>
      pool.map((q) => q({ label: 'Sujet', amount: 12000, ratio: 0.8, hasEvidence: true })),
    );
    expect(new Set(rendered).size, 'deux questions identiques dans le vivier').toBe(rendered.length);
    // Chaque famille de constat a de quoi varier.
    for (const [family, pool] of Object.entries(AUDIT_QUESTIONS)) {
      expect(pool.length, `famille ${family} sans variante`).toBeGreaterThanOrEqual(3);
    }
  });

  it('varie la formulation d’une partie à l’autre, et la répète à l’identique dans la même', async () => {
    const { questionFor } = await import('../../src/engine/audit');
    const ctx = { label: 'Cortexa' };
    const a = questionFor('sub', 'f_sub_1', ctx, 'graine-a');
    expect(questionFor('sub', 'f_sub_1', ctx, 'graine-a')).toBe(a);
    // Sur assez de graines, le vivier est réellement parcouru.
    const seen = new Set(
      Array.from({ length: 40 }, (_, i) => questionFor('sub', 'f_sub_1', ctx, `g${i}`)),
    );
    expect(seen.size).toBeGreaterThan(1);
  });

  it('pose des questions différentes sur deux constats de la même famille', async () => {
    const { questionFor } = await import('../../src/engine/audit');
    const rendered = new Set(
      Array.from({ length: 12 }, (_, i) =>
        questionFor('card', `f_card_${i}`, { label: `Travaux ${i}` }, 'meme-partie'),
      ),
    );
    expect(rendered.size).toBeGreaterThan(1);
  });
});

describe('Le mot de la fin du vérificateur', () => {
  it('rend toujours la même leçon pour une même partie', async () => {
    const { auditLesson } = await import('../../src/engine/audit');
    for (const outcome of ['validated', 'partial', 'total'] as const) {
      for (const seed of ['s1', 's2', 's3', 's4']) {
        const a = auditLesson(outcome, seed);
        expect(auditLesson(outcome, seed).verdict, `${outcome}/${seed}`).toBe(a.verdict);
        expect(auditLesson(outcome, seed).lesson, `${outcome}/${seed}`).toBe(a.lesson);
      }
    }
  });

  it('dit autre chose selon l’issue du contrôle', async () => {
    const { auditLesson } = await import('../../src/engine/audit');
    const verdicts = (['validated', 'partial', 'total'] as const).map(
      (o) => auditLesson(o, 'fixe').verdict,
    );
    expect(new Set(verdicts).size).toBe(3);
  });

  it('varie d’une partie à l’autre, sans jamais rester vide', async () => {
    const { auditLesson } = await import('../../src/engine/audit');
    const seen = new Set(
      Array.from({ length: 30 }, (_, i) => auditLesson('partial', `g${i}`).lesson),
    );
    expect(seen.size).toBeGreaterThan(1);
    for (const o of ['validated', 'partial', 'total'] as const) {
      const l = auditLesson(o, 'x');
      expect(l.verdict.length).toBeGreaterThan(40);
      expect(l.lesson.length).toBeGreaterThan(40);
    }
  });
});
