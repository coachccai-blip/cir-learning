import { clientById } from '../data/clients';
import { CODEX_STARTER } from '../data/codex';
import type { ClientState, SaveGame } from '../engine/types';
import { rngFromSeed } from '../engine/rng';

export function makeSeed(): string {
  // Pas de Date.now ici pour rester déterministe/testable ; on dérive d'un compteur global.
  const n = (seedCounter = (seedCounter + 1) % 1_000_000);
  return `s${n.toString(36)}${(n * 2654435761) % 1_000_000}`;
}
let seedCounter = 1;

export function initClientState(
  clientId: string,
  /** Un prospect converti entre au portefeuille déjà signé, pas en simple lead. */
  dossierState: ClientState['dossierState'] = 'LEAD',
): ClientState {
  const c = clientById(clientId);
  return {
    clientId,
    mood: c.contact.initialMood,
    trust: c.contact.initialTrust,
    flags: [],
    dossierState,
    feeRate: c.fees.successRate,
    promise: null,
    piecesCollected: [],
    scores: { discovery: null, kickoff: null, qualification: null, base: null, justification: null },
    investigateDebt: 0,
    followupDone: false,
    lastTouchedCycle: 0,
    cardPlacements: {},
    baseStep: null,
    assietteInput: null,
    playerCir: null,
    trueCir: null,
    justifChoices: {},
    auditOutcome: null,
    signedRevenue: 0,
    collectedRevenue: 0,
  };
}

export function createNewGame(createdAt: string, seedOverride?: string): SaveGame {
  const seed = seedOverride ?? makeSeed();
  const rng = rngFromSeed(seed);
  void rng;
  return {
    schemaVersion: 1,
    seed,
    createdAt,
    cycle: 1,
    phase: 'DAY',
    gauges: { relation: 50, security: 50, profitability: 50 },
    xp: 0,
    revenue: { signed: 0, collected: 0 },
    portfolio: [],
    prospects: [],
    codexUnlocked: [...CODEX_STARTER],
    codexRead: [],
    badges: [],
    history: [],
    cycleLog: [],
    missedDeadlines: [],
    stats: {
      cardsCorrect: 0,
      cardsTotal: 0,
      verrousOk: 0,
      refusedMissions: 0,
      exactBases: 0,
      noJargonStreak: 0,
      prospectsSigned: 0,
      prospectsDeclined: 0,
    },
    tutorialDone: false,
    graduationAcknowledged: false,
    finished: false,
    firedEvents: [],
    quizPre: [],
    quizPost: [],
    mailsRead: [],
    gaugeHistory: [],
  };
}
