import { describe, it, expect } from 'vitest';
import { inProgress } from '../../src/engine/session';
import type { SaveGame } from '../../src/engine/types';

/**
 * « Continuer » ne s'affiche que s'il y a vraiment une partie à reprendre.
 *
 * Le bouton apparaissait dès qu'une sauvegarde existait, saison terminée
 * comprise — il menait alors au bilan de fin, pas au jeu. On promettait de
 * reprendre là où on s'était arrêté, et on rouvrait un écran de conclusion.
 */

const save = (patch: Partial<SaveGame> = {}): SaveGame =>
  ({ cycle: 1, phase: 'DAY', finished: false, ...patch }) as SaveGame;

describe('Reprise de partie', () => {
  it('ne propose rien quand aucune partie n’a été lancée', () => {
    expect(inProgress(null)).toBe(false);
  });

  it('propose de reprendre une saison commencée, quelle que soit la phase', () => {
    expect(inProgress(save())).toBe(true);
    expect(inProgress(save({ phase: 'NIGHT', cycle: 4 }))).toBe(true);
  });

  it('ne propose plus rien une fois la saison terminée', () => {
    // Une saison achevée se rejoue, elle ne se reprend pas.
    expect(inProgress(save({ finished: true, cycle: 6 }))).toBe(false);
  });

  it('reprend une sauvegarde ancienne où le drapeau manquait', () => {
    const legacy = { cycle: 2, phase: 'DAY' } as SaveGame;
    expect(inProgress(legacy)).toBe(true);
  });
});
