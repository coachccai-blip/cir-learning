import { describe, it, expect } from 'vitest';
import { SCENARIOS } from '../../src/data/scenarios/index';
import { EVENTS } from '../../src/data/events';
import { GENERIC_JUSTIF } from '../../src/data/justif';
import { QUIZ } from '../../src/data/quiz';

// Un joueur ne doit jamais pouvoir répondre juste sans lire, en repérant
// la réponse la plus longue. Ces garde-fous verrouillent l'équilibrage.

const nodes = [
  ...SCENARIOS.flatMap((s) => s.nodes.map((n) => ({ id: `${s.id}/${n.id}`, choices: n.choices }))),
  ...EVENTS.map((e) => ({ id: e.id, choices: e.node.choices })),
];

/** Écart maximal toléré entre la réponse la plus longue et la plus courte d'un nœud. */
const MAX_SPREAD = 45;
/** Part maximale de nœuds où la bonne réponse est aussi la plus longue (hasard = 25 %). */
const MAX_LONGEST_IS_OPTIMAL = 0.4;

describe('Équilibrage de la longueur des réponses', () => {
  for (const n of nodes) {
    it(`${n.id} : les 4 réponses ont des longueurs comparables`, () => {
      const lens = n.choices.map((c) => c.text.length);
      expect(Math.max(...lens) - Math.min(...lens)).toBeLessThanOrEqual(MAX_SPREAD);
    });
  }

  it('la bonne réponse n’est pas systématiquement la plus longue', () => {
    let longestIsOptimal = 0;
    for (const n of nodes) {
      const longest = [...n.choices].sort((a, b) => b.text.length - a.text.length)[0];
      if (longest.role === 'optimal') longestIsOptimal++;
    }
    const ratio = longestIsOptimal / nodes.length;
    expect(ratio).toBeLessThanOrEqual(MAX_LONGEST_IS_OPTIMAL);
  });

  it('les blocs du justificatif ont des formulations de longueur comparable', () => {
    for (const b of GENERIC_JUSTIF.blocks) {
      const lens = b.options.map((o) => o.text.length);
      expect(Math.max(...lens) - Math.min(...lens)).toBeLessThanOrEqual(MAX_SPREAD);
    }
  });

  it('les propositions du quiz ont des longueurs comparables', () => {
    for (const q of QUIZ) {
      const lens = q.options.map((o) => o.length);
      expect(Math.max(...lens) - Math.min(...lens)).toBeLessThanOrEqual(MAX_SPREAD);
    }
  });
});
