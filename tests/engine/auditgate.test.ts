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
    expect(finalAuditDue('onboarding', THRESHOLD, THRESHOLD, portfolio)).toBe(false);
    expect(finalAuditDue('onboarding', 100, THRESHOLD, portfolio)).toBe(false);
  });

  it('contrôle une première saison dont la sécurité a lâché', () => {
    expect(finalAuditDue('onboarding', THRESHOLD - 1, THRESHOLD, portfolio)).toBe(true);
    expect(finalAuditDue('onboarding', 0, THRESHOLD, portfolio)).toBe(true);
  });

  it('contrôle systématiquement la deuxième saison, sécurité ou non', () => {
    expect(finalAuditDue('expert', 100, THRESHOLD, portfolio)).toBe(true);
    expect(finalAuditDue('expert', 0, THRESHOLD, portfolio)).toBe(true);
  });

  it('ne contrôle rien quand aucune assiette n’a été chiffrée', () => {
    const rien = [dossier(null, false), dossier(null, false)];
    expect(finalAuditDue('expert', 0, THRESHOLD, rien)).toBe(false);
    expect(finalAuditDue('onboarding', 0, THRESHOLD, rien)).toBe(false);
    expect(finalAuditDue('expert', 0, THRESHOLD, [])).toBe(false);
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
  async function endSeason(mode: 'onboarding' | 'expert', security: number, chiffre: boolean) {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.boot();
    s.setOptions({ volume: 0 });
    s.newGame(mode, `fin-${mode}-${security}-${chiffre}`);
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
    expect(await endSeason('onboarding', 90, true)).toBe('quiz');
  });

  it('l’envoie quand la sécurité a lâché', async () => {
    expect(await endSeason('onboarding', 20, true)).toBe('audit');
  });

  it('l’envoie toujours en deuxième saison, et sans quiz derrière', async () => {
    expect(await endSeason('expert', 95, true)).toBe('audit');
  });

  it('va droit au bilan quand rien n’a été chiffré', async () => {
    expect(await endSeason('expert', 10, false)).toBe('end');
  });
});
