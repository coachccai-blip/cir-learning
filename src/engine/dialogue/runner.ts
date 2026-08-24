// Parcours du graphe de dialogue, application des effets, score de scénario (§8).

import type {
  Archetype,
  DialogueChoice,
  DialogueNode,
  Scenario,
} from '../types';
import { rngFromSeed, shuffled } from '../rng';
import { moodDelta } from './mood';

export const ROLE_SCORE: Record<DialogueChoice['role'], number> = {
  optimal: 100,
  acceptable: 70,
  tempting: 40,
  poor: 10,
};

export interface DialogueSession {
  scenarioId: string;
  currentNodeId: string | null;
  choicesMade: number;
  scoreSum: number;
  /** id des choix joués (pour l'historique). */
  played: { nodeId: string; choiceId: string }[];
}

export function startSession(scenario: Scenario): DialogueSession {
  return {
    scenarioId: scenario.id,
    currentNodeId: scenario.entryNode,
    choicesMade: 0,
    scoreSum: 0,
    played: [],
  };
}

export function getNode(scenario: Scenario, nodeId: string): DialogueNode {
  const node = scenario.nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`Nœud introuvable : ${nodeId} dans ${scenario.id}`);
  return node;
}

/**
 * Ordre d'affichage des choix, randomisé de façon déterministe (seed de partie
 * + nœud), pour la reproductibilité du débrief (§8.2).
 */
export function displayOrder(seed: string, scenarioId: string, node: DialogueNode): DialogueChoice[] {
  const rng = rngFromSeed(`${seed}:${scenarioId}:${node.id}`);
  return shuffled(rng, node.choices);
}

export interface ChoiceResolution {
  gauges: { relation: number; security: number; profitability: number };
  mood: number;
  trust: number;
  score: number;
  nextNodeId: string | null;
}

/**
 * Conséquences d'un choix. La fatigue amoindrissait les effets et masquait une
 * option sur quatre : le joueur perdait des points sur un dossier bien mené,
 * pour une raison qu'il ne voyait pas à l'écran. Un choix vaut désormais ce
 * qu'il vaut, et rien d'autre ne s'y ajoute.
 */
export function resolveChoice(
  choice: DialogueChoice,
  archetype: Archetype | null,
): ChoiceResolution {
  const e = choice.effects;
  const baseMood = e.mood ?? 0;
  return {
    gauges: {
      relation: e.relation ?? 0,
      security: e.security ?? 0,
      profitability: e.profitability ?? 0,
    },
    mood: archetype ? moodDelta(baseMood, choice.register, archetype) : baseMood,
    trust: e.trust ?? 0,
    score: ROLE_SCORE[choice.role],
    nextNodeId: choice.next,
  };
}

export function advance(session: DialogueSession, choice: DialogueChoice, score: number): DialogueSession {
  return {
    ...session,
    currentNodeId: choice.next,
    choicesMade: session.choicesMade + 1,
    scoreSum: session.scoreSum + score,
    played: [...session.played, { nodeId: session.currentNodeId ?? '', choiceId: choice.id }],
  };
}

export function sessionScore(session: DialogueSession): number {
  if (session.choicesMade === 0) return 0;
  return Math.round(session.scoreSum / session.choicesMade);
}


/**
 * Ce choix met-il fin à la mission ?
 *
 * Deux refus très différents coexistent dans le contenu : refuser de gonfler
 * une assiette (`a_dit_non`, qui laisse la mission se poursuivre sur un
 * périmètre honnête) et refuser le dossier lui-même (`refus_mission`). Les
 * confondre laissait Data&Co coincé au stade de lead, son rendez-vous de
 * découverte se rejouant sans fin. La règle vit ici, pas dans un écran, pour
 * être vérifiable.
 */
export function declinesMission(flags: readonly string[]): boolean {
  return flags.includes('refus_mission');
}
