import { describe, it, expect } from 'vitest';
import { SCENARIOS } from '../../src/data/scenarios/index';
import { EVENTS } from '../../src/data/events';
import { CLIENTS } from '../../src/data/clients';
import { CASES } from '../../src/data/cases';
import { CARDSETS } from '../../src/data/cards';
import { CODEX, codexById } from '../../src/data/codex';
import type { DialogueNode } from '../../src/engine/types';

const ROLES = ['optimal', 'acceptable', 'tempting', 'poor'] as const;

function checkNode(node: DialogueNode, scenarioId: string, nodeIds: Set<string>) {
  it(`${scenarioId}/${node.id} a exactement 4 choix avec rôles uniques et feedback complet`, () => {
    expect(node.choices).toHaveLength(4);
    const roles = node.choices.map((c) => c.role).sort();
    expect(roles).toEqual([...ROLES].sort());
    for (const c of node.choices) {
      expect(c.feedback.what.length).toBeGreaterThan(0);
      expect(c.feedback.why.length).toBeGreaterThan(0);
      expect(c.feedback.rule.length).toBeGreaterThan(0);
      if (c.next !== null) expect(nodeIds.has(c.next)).toBe(true);
      if (c.feedback.codexUnlock) expect(codexById(c.feedback.codexUnlock)).toBeDefined();
    }
  });
}

describe('Lint de contenu — scénarios', () => {
  for (const sc of SCENARIOS) {
    const nodeIds = new Set(sc.nodes.map((n) => n.id));
    it(`${sc.id} : entryNode existe`, () => {
      expect(nodeIds.has(sc.entryNode)).toBe(true);
    });
    for (const node of sc.nodes) checkNode(node, sc.id, nodeIds);
  }
});

describe('Lint de contenu — événements', () => {
  for (const ev of EVENTS) {
    checkNode(ev.node, ev.id, new Set([ev.node.id]));
  }
});

describe('Intégrité des références client → contenu', () => {
  it('chaque client pointe vers un cas, un cardset et des scénarios existants', () => {
    const scenarioIds = new Set(SCENARIOS.map((s) => s.id));
    const caseIds = new Set(CASES.map((c) => c.id));
    const cardsetIds = new Set(CARDSETS.map((c) => c.id));
    for (const cl of CLIENTS) {
      expect(caseIds.has(cl.caseId)).toBe(true);
      expect(cardsetIds.has(cl.cardsetId)).toBe(true);
      expect(scenarioIds.has(cl.scenarios.discovery)).toBe(true);
      expect(scenarioIds.has(cl.scenarios.kickoff)).toBe(true);
      expect(scenarioIds.has(cl.scenarios.followup)).toBe(true);
      expect(scenarioIds.has(cl.scenarios.closing)).toBe(true);
    }
  });
  it('chaque cardset référence des fiches codex existantes', () => {
    for (const cs of CARDSETS) {
      for (const card of cs.cards) {
        if (card.codexRef) expect(codexById(card.codexRef)).toBeDefined();
      }
    }
  });
  it('les identifiants de codex sont uniques', () => {
    const ids = CODEX.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
