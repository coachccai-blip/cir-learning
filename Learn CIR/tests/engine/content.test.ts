import { describe, it, expect } from 'vitest';
import { SCENARIOS } from '../../src/data/scenarios/index';
import { EVENTS } from '../../src/data/events';
import { CLIENTS } from '../../src/data/clients';
import { CASES } from '../../src/data/cases';
import { CARDSETS } from '../../src/data/cards';
import { CODEX, CODEX_STARTER, codexById } from '../../src/data/codex';
import { JUSTIF_SETS, justifForSector } from '../../src/data/justif';
import { QUIZ, QUIZ_POST } from '../../src/data/quiz';
import type { DialogueNode } from '../../src/engine/types';

const ROLES = ['optimal', 'acceptable', 'tempting', 'poor'] as const;

/**
 * Trois formes de nœud sont admises, et c'est voulu : tout ramener à quatre
 * choix « un bon, un correct, un tentant, un mauvais » rendait la grille
 * lisible en deux minutes, après quoi le joueur cherchait le registre au lieu
 * de lire la réponse.
 *
 * - standard  : 4 choix, un de chaque rôle ;
 * - couperet  : 2 ou 3 choix sous pression, aucune réponse confortable ;
 * - arbitrage : deux réponses optimales qui s'excluent (sécuriser ou fidéliser).
 */
function checkNode(node: DialogueNode, scenarioId: string, nodeIds: Set<string>) {
  it(`${scenarioId}/${node.id} : forme de nœud valide et feedback complet`, () => {
    expect(node.choices.length).toBeGreaterThanOrEqual(2);
    expect(node.choices.length).toBeLessThanOrEqual(4);
    const roles = node.choices.map((c) => c.role);
    // Toute scène doit offrir au moins une issue défendable.
    expect(roles).toContain('optimal');
    for (const r of roles) expect(ROLES).toContain(r);
    const optimals = roles.filter((r) => r === 'optimal').length;
    // Deux optimaux = arbitrage assumé ; au-delà, il n'y a plus de choix.
    expect(optimals).toBeLessThanOrEqual(2);
    const others = roles.filter((r) => r !== 'optimal');
    expect(new Set(others).size, 'les rôles non optimaux restent uniques').toBe(others.length);
    if (node.choices.length === 4 && optimals === 1) {
      expect([...roles].sort()).toEqual([...ROLES].sort());
    }
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
  it('aucun client écrit ne partage son suivi ni son bilan de mission', () => {
    // Tous les clients jouaient le même point d'étape et la même restitution :
    // la scène devenait une formalité, alors que c'est là que le métier se
    // joue. Chaque dossier a désormais la sienne.
    const roster = CLIENTS;
    for (const kind of ['followup', 'closing'] as const) {
      const used = roster.map((c) => c.scenarios[kind]);
      expect(new Set(used).size, `${kind} partagé entre clients`).toBe(used.length);
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

// Un paquet dominé par une seule colonne rend le tri gagnable sans réfléchir :
// il suffit de tout classer là. Ce garde-fou verrouille la correction.
describe('Équilibre des jeux de cartes', () => {
  for (const cs of CARDSETS) {
    it(`${cs.id} : aucun verdict ne dépasse la moitié du paquet`, () => {
      const counts: Record<string, number> = {};
      for (const c of cs.cards) counts[c.verdict] = (counts[c.verdict] ?? 0) + 1;
      expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(cs.cards.length / 2);
    });

    it(`${cs.id} : les trois verdicts sont représentés au moins deux fois`, () => {
      const counts: Record<string, number> = {};
      for (const c of cs.cards) counts[c.verdict] = (counts[c.verdict] ?? 0) + 1;
      for (const v of ['RD', 'CII', 'NONE']) expect(counts[v] ?? 0).toBeGreaterThanOrEqual(2);
    });
  }
});

// Le justificatif était le même pour tous les clients : cinq blocs identiques
// rejoués une fois par dossier. Ces contrôles verrouillent la spécialisation.
describe('Un justificatif par secteur', () => {
  const SECTORS = Object.keys(JUSTIF_SETS) as (keyof typeof JUSTIF_SETS)[];

  it('couvre les six secteurs, un jeu distinct chacun', () => {
    expect(SECTORS).toHaveLength(6);
    const ids = SECTORS.map((s) => JUSTIF_SETS[s].id);
    expect(new Set(ids).size).toBe(6);
  });

  it('sert un jeu à chaque client écrit', () => {
    for (const c of CLIENTS) expect(justifForSector(c.sector)).toBeDefined();
  });

  it('garde la même structure de blocs partout — c’est celle qu’attend l’administration', () => {
    const ref = JUSTIF_SETS.SAAS.blocks.map((b) => b.id);
    for (const s of SECTORS) expect(JUSTIF_SETS[s].blocks.map((b) => b.id)).toEqual(ref);
  });

  it('propose quatre rôles distincts par bloc, avec des textes propres au secteur', () => {
    const seen = new Set<string>();
    for (const s of SECTORS) {
      for (const b of JUSTIF_SETS[s].blocks) {
        expect(b.options.map((o) => o.role).sort()).toEqual(['acceptable', 'optimal', 'poor', 'tempting']);
        for (const o of b.options) {
          expect(seen.has(o.text), `formulation dupliquée entre secteurs : ${o.text}`).toBe(false);
          seen.add(o.text);
          expect(o.id).toMatch(/^j[a-z]+\d[a-d]$/);
        }
      }
    }
  });
});

// Le quiz de sortie reprenait les questions d'entrée : on mesurait la mémoire
// d'un écran vu une heure plus tôt, pas la compétence acquise.
describe('Quiz d’entrée et de sortie', () => {
  it('pose autant de questions des deux côtés, pour que la comparaison ait un sens', () => {
    expect(QUIZ_POST).toHaveLength(QUIZ.length);
  });

  it('ne repose jamais la même question', () => {
    const asked = new Set(QUIZ.map((q) => q.question));
    for (const q of QUIZ_POST) expect(asked.has(q.question)).toBe(false);
    expect(new Set([...QUIZ, ...QUIZ_POST].map((q) => q.id)).size).toBe(QUIZ.length * 2);
  });

  it('garde des questions bien formées, bonne réponse comprise', () => {
    for (const q of [...QUIZ, ...QUIZ_POST]) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(q.options.length);
      expect(q.explanation.length).toBeGreaterThan(20);
    }
  });

  it('ne place pas la bonne réponse toujours au même rang', () => {
    const positions = new Set([...QUIZ, ...QUIZ_POST].map((q) => q.correct));
    expect(positions.size).toBeGreaterThan(1);
  });
});

// Trois fiches n'étaient débloquables par aucun chemin de jeu : elles
// existaient sans jamais s'afficher.
describe('Le codex est intégralement atteignable', () => {
  it('chaque fiche est acquise au départ ou débloquée par un choix ou une carte', () => {
    const reachable = new Set<string>(CODEX_STARTER);
    for (const s of SCENARIOS) {
      for (const n of s.nodes) for (const c of n.choices) if (c.feedback.codexUnlock) reachable.add(c.feedback.codexUnlock);
    }
    for (const e of EVENTS) for (const c of e.node.choices) if (c.feedback.codexUnlock) reachable.add(c.feedback.codexUnlock);
    for (const cs of CARDSETS) for (const c of cs.cards) if (c.codexRef) reachable.add(c.codexRef);
    const orphans = CODEX.filter((c) => !reachable.has(c.id)).map((c) => c.id);
    expect(orphans, `fiches inatteignables : ${orphans.join(', ')}`).toEqual([]);
  });

  it('les fiches offertes au départ existent bien', () => {
    for (const id of CODEX_STARTER) expect(codexById(id)).toBeDefined();
  });
});

// Le registre « technique » n'apparaissait que 18 fois sur 332 choix, et
// jamais dans quatre kick-offs : le joueur ne pouvait pas répondre en
// consultant sur ces scènes, alors que c'est la moitié du métier enseigné.
describe('Registres de réponse', () => {
  for (const sc of SCENARIOS.filter((s) => s.clientId)) {
    it(`${sc.id} : propose au moins une réponse en registre technique`, () => {
      const regs = sc.nodes.flatMap((n) => n.choices.map((c) => c.register));
      expect(regs).toContain('technique');
    });
  }

  it('aucun registre ne monopolise plus de la moitié des choix', () => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const s of SCENARIOS) {
      for (const n of s.nodes) for (const c of n.choices) {
        counts[c.register] = (counts[c.register] ?? 0) + 1;
        total++;
      }
    }
    expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(total / 2);
  });
});
