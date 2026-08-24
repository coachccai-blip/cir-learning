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
// La saison est-elle réellement jouable jusque-là ? Le budget de points
// d'action a disparu : ce qui borne encore la saison, c'est le calendrier et
// l'alternance des deux phases.
// ---------------------------------------------------------------------------

describe('Deux missions tiennent dans une saison', () => {
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
      s.newGame(`grad-${mode}`);
      useStore.getState().commitQuiz('pre', [0, 0, 0, 0, 0, 0]);
      useStore.getState().startFirstDay();

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
          session = advance(session, choice, resolveChoice(choice, null).score);
        }
        useStore.getState().endDialogue({
          clientId, kind, score: sessionScore(session), flags, promise: null, declined,
        });
      }

      // Un joueur appliqué : il décroche ses deux rendez-vous, puis mène ses
      // deux dossiers aussi loin que la semaine le permet. Plus de budget
      // d'actions — ce qui borne encore la saison, c'est l'alternance des deux
      // phases : une étape technique n'est jouable qu'après le jour qui l'ouvre.
      const wanted = balance.missionsToGraduate;
      for (let cycle = 1; cycle <= 6; cycle++) {
        // --- Phase Relation client
        for (let guard = 0; guard < 40; guard++) {
          const save = useStore.getState().save!;
          const open = save.portfolio.filter(
            (c) => c.dossierState !== 'CLOSED' && c.dossierState !== 'LOST',
          );
          // Décrocher d'abord : sans client, rien d'autre n'est jouable.
          const lead = save.prospects.find((p) => p.status === 'NEW' && p.scriptedClientId);
          if (open.length < wanted && lead) {
            useStore.getState().resolveProspectCall(lead.id, ['prospect_sign']);
            continue;
          }
          const target = open.map((c) => ({ c, a: nextClientAction(c) })).find((x) => x.a);
          if (!target) break;
          if (target.a!.kind === 'proposal') useStore.getState().signClient(target.c.clientId);
          else play(target.a!.kind, target.c.clientId);
        }

        // --- Phase Technique : la bascule ne se refuse jamais. On fait avancer
        // l'état à la main (les mini-jeux sont testés ailleurs).
        useStore.getState().switchPhase();
        expect(useStore.getState().save!.phase, `semaine ${cycle}`).toBe('NIGHT');
        for (let guard = 0; guard < 40; guard++) {
          const save = useStore.getState().save!;
          const next = save.portfolio.find((c) => TECH[c.dossierState]);
          if (!next) break;
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

// ---------------------------------------------------------------------------
// Ni points d'action ni énergie : rien ne se refuse jamais, dans les deux
// saisons.
// ---------------------------------------------------------------------------

describe('Aucune activité n’est refusée', () => {
  it('bascule en phase Technique quoi qu’il arrive', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('sans-pa');
    useStore.getState().switchPhase();
    expect(useStore.getState().save!.phase).toBe('NIGHT');
    useStore.getState().switchPhase();
    expect(useStore.getState().save!.cycle).toBe(2);
    expect(useStore.getState().save!.phase).toBe('DAY');
  });

  it('laisse appeler toutes les pistes du vivier dans la même journée', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('tout-appeler');
    useStore.getState().generateProspects(6);
    const all = useStore.getState().save!.prospects.filter((p) => p.status === 'NEW');
    expect(all.length).toBeGreaterThan(4);
    for (const p of all) {
      useStore.getState().resolveProspectCall(p.id, ['prospect_decline']);
    }
    // Aucun appel n'est resté en attente faute de budget.
    expect(useStore.getState().save!.prospects.filter((p) => p.status === 'NEW')).toEqual([]);
    expect(useStore.getState().save!.cycle).toBe(1);
  });

  it('ne garde plus aucune ressource à dépenser dans la sauvegarde', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    for (const mode of ['onboarding', 'expert'] as const) {
      s.newGame(`sans-jauge-${mode}`);
      const save = useStore.getState().save! as unknown as Record<string, unknown>;
      // Ni PA ni énergie : plus rien ne se rationne d'une semaine à l'autre.
      expect(save.actionPoints, mode).toBeUndefined();
      expect(save.energy, mode).toBeUndefined();
    }
    // Et le magasin n'expose plus de quoi en dépenser.
    const store = useStore.getState() as unknown as Record<string, unknown>;
    expect(store.spendPA).toBeUndefined();
    expect(store.spendEnergy).toBeUndefined();
    expect(store.applyEnergy).toBeUndefined();
  });

  it('reprend une sauvegarde de l’ancien régime sans la bloquer', async () => {
    const { migrateSave } = await import('../../src/state/persistence');
    const { createNewGame } = await import('../../src/state/factory');
    const legacy = {
      ...createNewGame(new Date(0).toISOString(), 'ancienne'),
      // Une partie sauvegardée à zéro PA et à plat : elle ne doit rien traîner.
      actionPoints: 0,
      energy: 4,
      overtimeUsedThisNight: true,
    };
    const migrated = migrateSave(legacy) as unknown as Record<string, unknown>;
    expect(migrated).not.toBeNull();
    expect(migrated.cycle).toBe(1);
    expect(migrated.portfolio).toEqual([]);
  });
});
