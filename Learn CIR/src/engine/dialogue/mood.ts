// Humeur, confiance et sensibilité par archétype (§8.3).

import type { Archetype, Register } from '../types';

export type SensitivityTable = Record<Register, number>;

/**
 * Modulation de l'humeur par registre de réponse, par archétype.
 * Valeur ajoutée (×2) au delta d'humeur d'un choix utilisant ce registre.
 */
export const ARCHETYPE_SENSITIVITY: Record<Archetype, SensitivityTable> = {
  SCEPTIC: { preuve: 3, synthese: 1, empathie: -1, technique: 1, fermete: 0, commercial: -3 },
  RUSHED: { preuve: -1, synthese: 3, empathie: -2, technique: -2, fermete: 1, commercial: 0 },
  GEEK: { preuve: 1, synthese: -2, empathie: 0, technique: 3, fermete: -1, commercial: -2 },
  CFO: { preuve: 2, synthese: 2, empathie: -2, technique: -1, fermete: 1, commercial: -1 },
  DREAMER: { preuve: -1, synthese: 0, empathie: 2, technique: -1, fermete: -2, commercial: 2 },
  SILENT: { preuve: 1, synthese: 1, empathie: 2, technique: 0, fermete: -1, commercial: -2 },
};

export const ARCHETYPE_LABEL: Record<Archetype, string> = {
  SCEPTIC: 'Le sceptique',
  RUSHED: 'Le pressé',
  GEEK: 'Le techos passionné',
  CFO: 'Le DAF méfiant',
  DREAMER: "L'optimiste irréaliste",
  SILENT: 'Le taiseux',
};

export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export function moodDelta(baseMood: number, register: Register, archetype: Archetype): number {
  return baseMood + ARCHETYPE_SENSITIVITY[archetype][register] * 2;
}

/** États d'expression du portrait selon l'humeur. */
export function expressionForMood(mood: number): 'enthousiaste' | 'satisfait' | 'neutre' | 'agace' | 'ferme' {
  if (mood >= 80) return 'enthousiaste';
  if (mood >= 60) return 'satisfait';
  if (mood >= 35) return 'neutre';
  if (mood >= 20) return 'agace';
  return 'ferme';
}
