import { describe, it, expect } from 'vitest';
import { nextClientAction } from '../../src/engine/activities';
import { initClientState } from '../../src/state/factory';
import { CLIENTS } from '../../src/data/clients';
import type { ClientState, DossierState } from '../../src/engine/types';

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

describe('Consigne de la manager en phase Relation client', () => {
  const cs = (dossierState: DossierState, followupDone = false): ClientState =>
    ({ dossierState, followupDone }) as ClientState;

  it('envoie prospecter quand le portefeuille est vide', async () => {
    const { dayStage } = await import('../../src/engine/activities');
    expect(dayStage([])).toBe('prospect');
    // Un portefeuille qui ne contient que des dossiers finis ou perdus est vide
    // pour ce qui reste à faire aujourd'hui.
    expect(dayStage([cs('CLOSED'), cs('LOST'), cs('DEPOSITED')])).toBe('prospect');
  });

  it('renvoie aux rendez-vous tant qu’une action de jour reste ouverte', async () => {
    const { dayStage } = await import('../../src/engine/activities');
    for (const st of ['LEAD', 'QUALIFIED', 'SIGNED', 'JUSTIFIED'] as const) {
      expect(dayStage([cs(st)]), st).toBe('meetings');
    }
    // Le suivi de mission compte comme une action de jour tant qu'il n'est pas fait.
    expect(dayStage([cs('KICKED_OFF', false)])).toBe('meetings');
  });

  it('bascule en phase Technique une fois la journée épuisée', async () => {
    const { dayStage } = await import('../../src/engine/activities');
    for (const st of ['KICKED_OFF', 'CARDS_DONE', 'BASE_DONE'] as const) {
      expect(dayStage([cs(st, true)]), st).toBe('technique');
    }
    // Un dossier clos n'empêche pas de basculer si un autre est prêt à monter.
    expect(dayStage([cs('CLOSED'), cs('CARDS_DONE', true)])).toBe('technique');
  });

  it('donne une consigne écrite pour chacun des trois états', async () => {
    const { STR } = await import('../../src/i18n/fr');
    for (const key of ['dayProspect', 'dayMeetings', 'dayTechnique'] as const) {
      expect(STR.manager.brief[key].length, key).toBeGreaterThan(80);
    }
  });
});
