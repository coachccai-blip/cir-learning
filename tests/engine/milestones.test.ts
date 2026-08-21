import { describe, it, expect } from 'vitest';
import { neglectedClients, resolveMilestone } from '../../src/engine/milestones';
import { MILESTONES, SEASON_LENGTH } from '../../src/data/calendar';
import { initClientState } from '../../src/state/factory';
import { CLIENTS } from '../../src/data/clients';
import type { ClientState, DossierState } from '../../src/engine/types';

const at = (i: number, dossierState: DossierState, extra: Partial<ClientState> = {}): ClientState => ({
  ...initClientState(CLIENTS[i].id),
  dossierState,
  ...extra,
});

describe('Le calendrier a des dents', () => {
  it('couvre chaque cycle de la saison, sans trou ni débordement', () => {
    const cycles = MILESTONES.map((m) => m.cycle);
    expect(cycles).toEqual([...cycles].sort((a, b) => a - b));
    expect(Math.max(...cycles)).toBe(SEASON_LENGTH);
    expect(new Set(cycles).size).toBe(MILESTONES.length);
  });

  // Le grief d'origine : dix jalons sur onze n'avaient aucun effet mécanique.
  it('donne un effet mesurable à chaque échéance sanctionnable', () => {
    const neglected = [at(0, 'LEAD'), at(1, 'SIGNED'), at(2, 'CARDS_DONE')];
    for (const id of ['ms_proposals', 'ms_kickoff', 'ms_timesheets', 'ms_deposit']) {
      const o = resolveMilestone(id, neglected);
      const bites =
        o.missed.length > 0 || o.patches.length > 0 || Object.keys(o.gauges).length > 0;
      expect(bites, `${id} devrait avoir une conséquence`).toBe(true);
      expect(o.report).not.toBe('');
    }
  });

  it('récompense le joueur à jour au lieu de le sanctionner', () => {
    const clean = [at(0, 'BASE_DONE', { followupDone: true })];
    expect(resolveMilestone('ms_proposals', clean).missed).toHaveLength(0);
    expect(resolveMilestone('ms_kickoff', clean).missed).toHaveLength(0);
    expect(resolveMilestone('ms_timesheets', clean).gauges.security).toBeGreaterThan(0);
  });

  it('retire les feuilles de temps des dossiers sans suivi de mission', () => {
    const cs = at(0, 'CARDS_DONE', { followupDone: false, piecesCollected: ['piece_feuilles_temps'] });
    const patch = resolveMilestone('ms_timesheets', [cs]).patches[0];
    expect(patch.losePieces).toContain('piece_feuilles_temps');
  });

  it('ne sanctionne jamais un dossier déjà clos ou perdu', () => {
    const done = [at(0, 'CLOSED'), at(1, 'DEPOSITED'), at(2, 'LOST')];
    for (const id of ['ms_kickoff', 'ms_timesheets', 'ms_deposit']) {
      expect(resolveMilestone(id, done).missed).toHaveLength(0);
    }
  });
});

describe('Un dossier négligé finit par partir', () => {
  it('laisse deux cycles de répit', () => {
    const cs = at(0, 'KICKED_OFF', { lastTouchedCycle: 3 });
    expect(neglectedClients([cs], 4, 2)).toHaveLength(0);
    expect(neglectedClients([cs], 5, 2)).toHaveLength(1);
  });

  it('n’emporte pas les dossiers déjà terminés', () => {
    for (const st of ['CLOSED', 'DEPOSITED', 'LOST'] as DossierState[]) {
      expect(neglectedClients([at(0, st, { lastTouchedCycle: 0 })], 10, 2)).toHaveLength(0);
    }
  });
});
