import { describe, it, expect } from 'vitest';
import { migrateSave } from '../../src/state/persistence';
import { createNewGame } from '../../src/state/factory';
import { toleranceForMode } from '../../src/engine/economy';
import balance from '../../src/data/balance.json';
import { STR } from '../../src/i18n/fr';
import type { GameMode } from '../../src/engine/types';

const MODES: GameMode[] = ['onboarding', 'expert'];

describe('Deux modes de jeu : Onboarding et Expert', () => {
  it('chaque mode a son barème de tolérance et d’indices', () => {
    for (const m of MODES) {
      expect(balance.tolerance[m]).toBeGreaterThan(0);
      expect(balance.hints[m]).toBeGreaterThanOrEqual(0);
      expect(toleranceForMode(m)).toBe(balance.tolerance[m]);
    }
  });

  it('n’expose aucun barème ni libellé pour un troisième mode', () => {
    expect(Object.keys(balance.tolerance).sort()).toEqual([...MODES].sort());
    expect(Object.keys(balance.hints).sort()).toEqual([...MODES].sort());
    expect(Object.keys(STR.modes).sort()).toEqual([...MODES].sort());
  });

  it('Expert est plus exigeant qu’Onboarding', () => {
    expect(toleranceForMode('expert')).toBeLessThan(toleranceForMode('onboarding'));
    expect(balance.hints.expert).toBeLessThan(balance.hints.onboarding);
  });

  // Le mode « Découverte » a existé : les sauvegardes d'alors ne doivent ni
  // crasher ni rester sur un mode dont plus aucun barème n'existe.
  it('bascule une partie enregistrée en Découverte sur Onboarding', () => {
    const legacy = { ...createNewGame('onboarding', '2026-01-01T00:00:00Z'), mode: 'discovery' };
    const migrated = migrateSave(legacy);
    expect(migrated).not.toBeNull();
    expect(migrated!.mode).toBe('onboarding');
    expect(toleranceForMode(migrated!.mode)).toBeGreaterThan(0);
  });

  it('laisse intact le mode d’une partie valide', () => {
    for (const m of MODES) {
      expect(migrateSave(createNewGame(m, '2026-01-01T00:00:00Z'))!.mode).toBe(m);
    }
  });
});
