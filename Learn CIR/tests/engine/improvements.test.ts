import { describe, it, expect } from 'vitest';
import { evaluatePromise } from '../../src/engine/prospects';
import { QUIZ } from '../../src/data/quiz';
import { EVENTS } from '../../src/data/events';

describe('Sanction de la promesse (§6.3)', () => {
  const promise = { min: 30000, max: 45000 };
  it('récompense un CIR dans la fourchette', () => {
    const r = evaluatePromise(promise, 38000);
    expect(r.relation).toBeGreaterThan(0);
    expect(r.churnRisk).toBe(false);
  });
  it('pénalise légèrement un petit écart en dessous', () => {
    const r = evaluatePromise(promise, 28000); // ~7 % sous le min
    expect(r.relation).toBeLessThan(0);
    expect(r.churnRisk).toBe(false);
  });
  it('déclenche un risque de churn pour un gros écart', () => {
    const r = evaluatePromise(promise, 20000); // ~33 % sous le min
    expect(r.relation).toBeLessThanOrEqual(-35);
    expect(r.churnRisk).toBe(true);
  });
  it('signale la crédibilité entamée si le réel dépasse la fourchette', () => {
    const r = evaluatePromise(promise, 60000);
    expect(r.profitability).toBeLessThan(0);
  });
});

describe('Quiz avant/après', () => {
  it('chaque question a un index correct valide et une explication', () => {
    for (const q of QUIZ) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(q.options.length);
      expect(q.explanation.length).toBeGreaterThan(0);
    }
  });
  it('les identifiants de question sont uniques', () => {
    const ids = QUIZ.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Événements aléatoires', () => {
  it('chaque événement a une fenêtre de cycle cohérente', () => {
    for (const ev of EVENTS) {
      expect(ev.minCycle).toBeLessThanOrEqual(ev.maxCycle);
      expect(ev.node.choices).toHaveLength(4);
    }
  });
});
