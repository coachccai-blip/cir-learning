import type { DialogueChoice, GaugeEffects, Register, Scenario } from '../../engine/types';

let counter = 0;

/** Fabrique un choix en réduisant la verbosité du contenu. */
export function choice(
  role: DialogueChoice['role'],
  register: Register,
  text: string,
  effects: GaugeEffects,
  feedback: { what: string; why: string; rule: string; codexUnlock?: string },
  next: string | null,
  extra?: { flags?: string[]; promise?: DialogueChoice['promise'] },
): DialogueChoice {
  counter += 1;
  return {
    id: `c${counter}`,
    role,
    register,
    text,
    effects,
    feedback,
    next,
    flags: extra?.flags,
    promise: extra?.promise,
  };
}

export const DEFAULT_OUTCOME: Scenario['outcome'] = {
  scoreThresholds: { excellent: 80, good: 60 },
  unlocks: { excellent: ['piece_feuilles_temps', 'piece_cr_essais'], good: ['piece_feuilles_temps'], poor: [] },
};
