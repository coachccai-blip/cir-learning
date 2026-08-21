import { describe, it, expect } from 'vitest';
import { nextClientAction } from '../../src/engine/activities';
import { initClientState } from '../../src/state/factory';
import { CLIENTS } from '../../src/data/clients';
import type { DossierState } from '../../src/engine/types';

const base = () => initClientState(CLIENTS[0].id);
const at = (dossierState: DossierState, followupDone = false) => ({ ...base(), dossierState, followupDone });

// Le suivi de mission est le seul livrable de jour qui ne fait pas avancer
// `dossierState` : sans garde-fou, il se rejouerait en boucle pour 1 PA.
describe('Une seule activité de jour à la fois, chacune à usage unique', () => {
  it('propose la découverte, puis la proposition, puis le kick-off', () => {
    expect(nextClientAction(at('LEAD'))?.kind).toBe('discovery');
    expect(nextClientAction(at('QUALIFIED'))?.kind).toBe('proposal');
    expect(nextClientAction(at('SIGNED'))?.kind).toBe('kickoff');
  });

  it('propose un suivi de mission une fois la mission lancée', () => {
    for (const s of ['KICKED_OFF', 'CARDS_DONE', 'BASE_DONE'] as DossierState[]) {
      expect(nextClientAction(at(s))?.kind).toBe('followup');
    }
  });

  it('ne repropose jamais le suivi de mission une fois joué', () => {
    for (const s of ['KICKED_OFF', 'CARDS_DONE', 'BASE_DONE'] as DossierState[]) {
      expect(nextClientAction(at(s, true))).toBeNull();
    }
  });

  it('propose le bilan de mission après le justificatif, et rien après la clôture', () => {
    expect(nextClientAction(at('JUSTIFIED'))?.kind).toBe('closing');
    expect(nextClientAction(at('JUSTIFIED', true))?.kind).toBe('closing');
    for (const s of ['CLOSED', 'DEPOSITED', 'LOST'] as DossierState[]) {
      expect(nextClientAction(at(s))).toBeNull();
    }
  });

  it('un nouveau dossier démarre sans suivi de mission consommé', () => {
    expect(base().followupDone).toBe(false);
  });
});
