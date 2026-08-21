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

/**
 * Index (dans l'ordre d'affichage) du choix masqué par la fatigue, ou -1.
 * Seuil « Fatigué » : une option sur quatre disparaît (§4.3).
 */
export function maskedChoiceIndex(
  seed: string,
  scenarioId: string,
  nodeId: string,
  energy: number,
  choiceCount: number,
): number {
  if (energy > 49) return -1;
  // Un nœud à deux choix ne peut pas en masquer un : il ne resterait plus de
  // décision. Le masquage ne s'applique qu'à partir de trois options.
  if (choiceCount < 3) return -1;
  const rng = rngFromSeed(`${seed}:mask:${scenarioId}:${nodeId}`);
  return Math.floor(rng() * choiceCount);
}

export interface ChoiceResolution {
  gauges: { relation: number; security: number; profitability: number };
  mood: number;
  trust: number;
  score: number;
  nextNodeId: string | null;
}

export function resolveChoice(
  choice: DialogueChoice,
  archetype: Archetype | null,
  energy: number,
): ChoiceResolution {
  const exhausted = energy <= 24;
  const factor = exhausted ? 0.85 : 1; // malus −15 % (§4.3)
  const e = choice.effects;
  const baseMood = e.mood ?? 0;
  return {
    gauges: {
      relation: Math.round((e.relation ?? 0) * factor),
      security: Math.round((e.security ?? 0) * factor),
      profitability: Math.round((e.profitability ?? 0) * factor),
    },
    mood: archetype ? moodDelta(baseMood, choice.register, archetype) : baseMood,
    trust: e.trust ?? 0,
    score: Math.round(ROLE_SCORE[choice.role] * factor),
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
