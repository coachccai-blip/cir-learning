import { describe, it, expect, beforeAll } from 'vitest';
import type { ClientState, DossierState } from '../../src/engine/types';
import { nextClientAction } from '../../src/engine/activities';

/**
 * Le cycle de vie d'un dossier, de bout en bout.
 *
 * Data&Co restait bloqué au rendez-vous de découverte : le bon choix y est de
 * refuser de gonfler l'assiette, et ce refus était confondu avec un refus de
 * mission — le dossier ne quittait jamais l'état de lead, et l'action se
 * rejouait indéfiniment en consommant deux points à chaque fois.
 *
 * Ces contrôles vérifient qu'aucun état ne piège un dossier, puis qu'une
 * saison entière conduit réellement chaque client jusqu'au bilan.
 */

const base = (dossierState: DossierState, followupDone = false): ClientState =>
  ({ dossierState, followupDone }) as ClientState;

/** Transitions réellement opérées par le magasin quand l'action est jouée. */
const AFTER: Record<string, (cs: ClientState) => ClientState> = {
  discovery: (cs) => base('QUALIFIED', cs.followupDone),
  proposal: (cs) => base('SIGNED', cs.followupDone),
  kickoff: (cs) => base('KICKED_OFF', cs.followupDone),
  // Le suivi ne fait pas avancer l'état : c'est `followupDone` qui l'épuise.
  followup: (cs) => base(cs.dossierState, true),
  closing: (cs) => base('CLOSED', cs.followupDone),
};
/** Étapes de la phase Technique, qui font avancer l'état de leur côté. */
const TECH: Partial<Record<DossierState, DossierState>> = {
  KICKED_OFF: 'CARDS_DONE',
  CARDS_DONE: 'BASE_DONE',
  BASE_DONE: 'JUSTIFIED',
};

describe('Refuser de gonfler n’est pas refuser la mission', () => {
  it('ne met fin à la mission que sur un refus explicite du dossier', async () => {
    const { declinesMission } = await import('../../src/engine/dialogue/runner');
    // Data&Co : le bon choix est de refuser le gonflage, et la mission continue
    // sur un périmètre honnête.
    expect(declinesMission(['a_dit_non'])).toBe(false);
    // Forgeal, en deuxième saison : là, c'est bien le dossier qu'on décline.
    expect(declinesMission(['refus_mission', 'a_dit_non'])).toBe(true);
    expect(declinesMission([])).toBe(false);
  });

  it('laisse chaque scène de découverte qualifier son dossier, sauf refus assumé', async () => {
    const { declinesMission } = await import('../../src/engine/dialogue/runner');
    const { SCENARIOS } = await import('../../src/data/scenarios/index');
    const refusing = SCENARIOS.filter(
      (sc) =>
        sc.type === 'DISCOVERY' &&
        sc.nodes.some((n) => n.choices.some((c) => declinesMission(c.flags ?? []))),
    ).map((sc) => sc.id);
    // Une seule scène de découverte doit pouvoir clore la mission : celle qui
    // est écrite pour ça.
    expect(refusing).toEqual(['sc_exp_disc_refus']);
  });
});

describe('Cycle de vie d’un dossier', () => {
  it('mène un lead jusqu’au bilan sans jamais tourner en rond', () => {
    let cs = base('LEAD');
    const seen: string[] = [];
    for (let step = 0; step < 20 && cs.dossierState !== 'CLOSED'; step++) {
      const action = nextClientAction(cs);
      if (action) {
        seen.push(`${cs.dossierState}:${action.kind}`);
        cs = AFTER[action.kind](cs);
        continue;
      }
      // Plus rien de jour : la phase Technique prend le relais.
      const tech = TECH[cs.dossierState];
      expect(tech, `dossier bloqué en ${cs.dossierState}`).toBeDefined();
      cs = base(tech!, cs.followupDone);
    }
    expect(cs.dossierState).toBe('CLOSED');
    // Aucune action ne se propose deux fois depuis le même état.
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('épuise le suivi de mission après une seule fois', () => {
    for (const st of ['KICKED_OFF', 'CARDS_DONE', 'BASE_DONE'] as const) {
      expect(nextClientAction(base(st, false))?.kind).toBe('followup');
      expect(nextClientAction(base(st, true))).toBeNull();
    }
  });

  it('ne propose plus rien sur un dossier refusé, déposé ou clos', () => {
    for (const st of ['LOST', 'CLOSED', 'DEPOSITED'] as const) {
      expect(nextClientAction(base(st, false)), st).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// La même chose, mais sur le vrai magasin : une saison complète, tous clients.
// ---------------------------------------------------------------------------

describe('Une saison conduit chaque client jusqu’au bout', () => {
  beforeAll(() => {
    // Le magasin persiste dans `localStorage`, absent hors navigateur.
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
    it(`${mode} : aucun dossier ne reste coincé sur une action qui se rejoue`, async () => {
      const { useStore } = await import('../../src/state/store');
      const { scenarioById } = await import('../../src/data/scenarios/index');
      const { clientById } = await import('../../src/data/clients');
      const { startSession, getNode, advance, declinesMission, resolveChoice, sessionScore } =
        await import('../../src/engine/dialogue/runner');

      const s = useStore.getState();
      s.boot();
      s.setOptions({ volume: 0 });
      s.newGame(mode, `cycle-${mode}`);
      useStore.getState().commitQuiz('pre', [0, 0, 0, 0, 0, 0]);

      /** Joue un entretien en prenant systématiquement le meilleur choix. */
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
          clientId,
          kind,
          score: sessionScore(session),
          flags,
          promise: null,
          declined,
        });
      }

      // Le portefeuille démarre vide : les dossiers s'ouvrent au téléphone.
      // Ici, on vérifie l'enchaînement des états et non l'acquisition, alors on
      // ouvre d'un coup tout le vivier de la saison.
      const { rosterFor } = await import('../../src/data/clients');
      const { initClientState } = await import('../../src/state/factory');
      useStore.setState({
        save: {
          ...useStore.getState().save!,
          portfolio: rosterFor(mode).map((c) => initClientState(c.id)),
        },
      });

      // Chaque client est mené jusqu'au bilan, sans budget d'actions : on
      // vérifie l'enchaînement des états, pas l'économie de la saison.
      for (const start of useStore.getState().save!.portfolio) {
        const id = start.clientId;
        const seen = new Set<string>();
        for (let step = 0; step < 24; step++) {
          const cs = useStore.getState().save!.portfolio.find((p) => p.clientId === id)!;
          if (cs.dossierState === 'CLOSED' || cs.dossierState === 'LOST') break;

          const action = nextClientAction(cs);
          if (action) {
            const key = `${cs.dossierState}:${action.kind}`;
            expect(seen.has(key), `${id} rejoue ${action.kind} depuis ${cs.dossierState}`).toBe(false);
            seen.add(key);
            if (action.kind === 'proposal') useStore.getState().signClient(id);
            else play(action.kind, id);
            continue;
          }

          // Rien de jour : on fait avancer la partie technique à la main.
          const tech = TECH[cs.dossierState];
          expect(tech, `${id} bloqué en ${cs.dossierState}`).toBeDefined();
          useStore.setState({
            save: {
              ...useStore.getState().save!,
              portfolio: useStore
                .getState()
                .save!.portfolio.map((p) => (p.clientId === id ? { ...p, dossierState: tech! } : p)),
            },
          });
        }

        const final = useStore.getState().save!.portfolio.find((p) => p.clientId === id)!;
        // Un seul dossier du jeu est écrit pour être décliné : celui de la
        // deuxième saison. Partout ailleurs, jouer au mieux mène au bilan.
        const mayBeDeclined = id === 'cli_exp_forgeal';
        expect(
          final.dossierState,
          `${clientById(id).name} termine en ${final.dossierState}`,
        ).toBe(mayBeDeclined ? 'LOST' : 'CLOSED');
      }
    });
  }
});
