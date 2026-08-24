import { describe, it, expect, beforeAll } from 'vitest';
import { completedMissions, hasGraduated, missionsToGo } from '../../src/engine/graduation';
import balance from '../../src/data/balance.json';
import type { ClientState, DossierState } from '../../src/engine/types';

/**
 * La sortie proposée après deux missions.
 *
 * Le décompte porte sur les missions menées jusqu'au bilan, pas sur les
 * semaines écoulées : un joueur qui traîne six semaines sans rien clore n'a
 * rien vu du métier, et un joueur rapide ne doit pas attendre la fin du
 * calendrier pour qu'on lui dise qu'il a fait le tour.
 */

const TARGET = balance.missionsToGraduate;
const cs = (dossierState: DossierState): ClientState => ({ dossierState }) as ClientState;

describe('Sortie après deux missions', () => {
  it('ne compte que les dossiers rendus', () => {
    const portfolio = [
      cs('CLOSED'), cs('DEPOSITED'),
      cs('JUSTIFIED'), cs('BASE_DONE'), cs('SIGNED'), cs('LEAD'), cs('LOST'),
    ];
    expect(completedMissions(portfolio)).toBe(2);
  });

  it('n’ouvre la porte qu’à partir de la deuxième mission rendue', () => {
    expect(hasGraduated([], TARGET)).toBe(false);
    expect(hasGraduated([cs('CLOSED')], TARGET)).toBe(false);
    expect(missionsToGo([cs('CLOSED')], TARGET)).toBe(1);
    expect(hasGraduated([cs('CLOSED'), cs('DEPOSITED')], TARGET)).toBe(true);
    expect(missionsToGo([cs('CLOSED'), cs('DEPOSITED')], TARGET)).toBe(0);
  });

  it('ne redescend jamais sous zéro une fois la porte ouverte', () => {
    const many = Array.from({ length: 6 }, () => cs('CLOSED'));
    expect(missionsToGo(many, TARGET)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// La saison est-elle réellement jouable jusque-là, budget d'actions compris ?
// ---------------------------------------------------------------------------

describe('Deux missions tiennent dans le budget d’une saison', () => {
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

  for (const mode of ['onboarding', 'expert'] as const) {
    it(`${mode} : deux clients décrochés au téléphone et menés au bilan`, async () => {
      const { useStore } = await import('../../src/state/store');
      const { nextClientAction } = await import('../../src/engine/activities');
      const { scenarioById } = await import('../../src/data/scenarios/index');
      const { clientById } = await import('../../src/data/clients');
      const { startSession, getNode, advance, declinesMission, resolveChoice, sessionScore } =
        await import('../../src/engine/dialogue/runner');

      const s = useStore.getState();
      s.boot();
      s.setOptions({ volume: 0 });
      s.newGame(mode, `grad-${mode}`);
      useStore.getState().commitQuiz('pre', [0, 0, 0, 0, 0, 0]);
      useStore.getState().startFirstDay();

      /** Coût des étapes techniques, tel que la phase Technique le facture. */
      const NIGHT_COST = 2;
      const TECH: Partial<Record<DossierState, DossierState>> = {
        SIGNED: 'CARDS_DONE',
        KICKED_OFF: 'CARDS_DONE',
        CARDS_DONE: 'BASE_DONE',
        BASE_DONE: 'JUSTIFIED',
      };

      function play(kind: 'discovery' | 'kickoff' | 'followup' | 'closing', clientId: string) {
        const sc = scenarioById(clientById(clientId).scenarios[kind]);
        let session = startSession(sc);
        const flags: string[] = [];
        let declined = false;
        for (let guard = 0; session.currentNodeId && guard < 20; guard++) {
          const node = getNode(sc, session.currentNodeId)!;
          const choice = node.choices.find((c) => c.role === 'optimal') ?? node.choices[0];
          if (choice.flags) flags.push(...choice.flags);
          if (declinesMission(choice.flags ?? [])) declined = true;
          session = advance(session, choice, resolveChoice(choice, null, 80).score);
        }
        useStore.getState().endDialogue({
          clientId, kind, score: sessionScore(session), flags, promise: null, declined,
        });
      }

      // Un joueur appliqué : il décroche ses deux rendez-vous, puis fait
      // avancer ses deux dossiers autant que ses points d'action le permettent.
      const wanted = balance.missionsToGraduate;
      for (let cycle = 1; cycle <= 6; cycle++) {
        // --- Phase Relation client
        for (let guard = 0; guard < 30; guard++) {
          const save = useStore.getState().save!;
          const open = save.portfolio.filter(
            (c) => c.dossierState !== 'CLOSED' && c.dossierState !== 'LOST',
          );
          // Décrocher d'abord : sans client, rien d'autre n'est jouable.
          const lead = save.prospects.find((p) => p.status === 'NEW' && p.scriptedClientId);
          if (open.length < wanted && lead && useStore.getState().spendPA(1)) {
            useStore.getState().resolveProspectCall(lead.id, ['prospect_sign']);
            continue;
          }
          const target = open
            .map((c) => ({ c, a: nextClientAction(c) }))
            .find((x) => x.a && x.a.cost <= useStore.getState().save!.actionPoints);
          if (!target) break;
          useStore.getState().spendPA(target.a!.cost);
          if (target.a!.kind === 'proposal') useStore.getState().signClient(target.c.clientId);
          else play(target.a!.kind, target.c.clientId);
        }

        // --- Phase Technique : on facture le même coût que l'écran, et on fait
        // avancer l'état à la main (les mini-jeux sont testés ailleurs).
        useStore.getState().switchPhase();
        for (let guard = 0; guard < 30; guard++) {
          const save = useStore.getState().save!;
          const next = save.portfolio.find((c) => TECH[c.dossierState]);
          if (!next || !useStore.getState().spendPA(NIGHT_COST)) break;
          useStore.setState({
            save: {
              ...useStore.getState().save!,
              portfolio: useStore.getState().save!.portfolio.map((c) =>
                c.clientId === next.clientId ? { ...c, dossierState: TECH[c.dossierState]! } : c,
              ),
            },
          });
        }

        if (hasGraduated(useStore.getState().save!.portfolio, wanted)) break;
        if (cycle < 6) useStore.getState().advanceCycle();
      }

      const save = useStore.getState().save!;
      expect(
        completedMissions(save.portfolio),
        `saison ${mode} : ${save.portfolio.map((c) => `${c.clientId}=${c.dossierState}`).join(', ')}`,
      ).toBeGreaterThanOrEqual(wanted);
      expect(save.cycle).toBeLessThanOrEqual(6);
    });
  }
});
