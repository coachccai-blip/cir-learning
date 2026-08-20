import { create } from 'zustand';
import balance from '../data/balance.json';
import ruleset from '../data/rules/ruleset-2026.json';
import { CLIENTS, clientById } from '../data/clients';
import { caseById } from '../data/cases';
import { cardsetById } from '../data/cards';
import { scenarioById } from '../data/scenarios/index';
import { PROSPECT_TEMPLATES } from '../data/prospects';
import { chapterForCycle, nextMilestone, MILESTONES, SEASON_LENGTH } from '../data/calendar';
import type {
  AssietteInput,
  CardVerdict,
  DeltaLogEntry,
  GameMode,
  Gauges,
  GeneratedProspect,
  LeaderboardEntry,
  Ruleset,
  SaveGame,
} from '../engine/types';
import { clamp } from '../engine/dialogue/mood';
import { energyState, gradeForXp, maxClients, xpForBaseAccuracy, toleranceForMode } from '../engine/economy';
import { scoreAssiette } from '../engine/cir/scoring';
import { computeBreakdown } from '../engine/cir/calculator';
import { newBadges } from '../engine/badges';
import { generateProspect } from '../engine/prospects';
import {
  DEFAULT_OPTIONS,
  loadCodexRead,
  loadLeaderboard,
  loadOptions,
  loadSave,
  persistCodexRead,
  persistLeaderboard,
  persistOptions,
  persistSave,
  type Options,
} from './persistence';
import { createNewGame, initClientState } from './factory';

const RULESET = ruleset as Ruleset;

export type View =
  | 'home'
  | 'mode'
  | 'day'
  | 'night'
  | 'dialogue'
  | 'qualification'
  | 'base'
  | 'justif'
  | 'bilan'
  | 'audit'
  | 'end'
  | 'codex'
  | 'leaderboard'
  | 'options'
  | 'freemode'
  | 'client';

export interface Toast {
  id: number;
  text: string;
  badge?: boolean;
}

export interface DialogueContext {
  scenarioId: string;
  clientId?: string;
  kind: 'discovery' | 'kickoff' | 'followup' | 'closing' | 'tutorial' | 'prospect' | 'event';
  prospectId?: string;
  returnTo: View;
}

interface UIState {
  view: View;
  save: SaveGame | null;
  options: Options;
  leaderboard: LeaderboardEntry[];
  codexReadPersistent: string[];
  toasts: Toast[];
  dialogue: DialogueContext | null;
  activeClientId: string | null;
  lastDeltas: Partial<Gauges> | null;
}

interface Actions {
  boot: () => void;
  go: (view: View) => void;
  newGame: (mode: GameMode) => void;
  setOptions: (patch: Partial<Options>) => void;
  resetSave: () => void;
  toast: (text: string, badge?: boolean) => void;
  dismissToast: (id: number) => void;

  startDialogue: (ctx: DialogueContext) => void;
  applyGauges: (deltas: Partial<Gauges>, cause: string) => void;
  applyEnergy: (delta: number, cause: string) => void;
  addXp: (amount: number, cause: string) => void;
  unlockCodex: (id: string) => void;
  markCodexRead: (id: string) => void;

  spendPA: (n: number) => boolean;
  checkBadges: () => void;
  endDialogue: (result: {
    clientId?: string;
    kind: DialogueContext['kind'];
    score: number;
    flags: string[];
    promise?: { min: number; max: number; kind: 'range' | 'precise' } | null;
    prospectId?: string;
    declined?: boolean;
  }) => void;

  generateProspects: (n: number) => void;
  signClient: (clientId: string) => void;
  openClientDialogue: (clientId: string, kind: 'discovery' | 'kickoff' | 'followup' | 'closing') => void;

  commitQualification: (clientId: string, placements: Record<string, CardVerdict>) => void;
  commitBase: (clientId: string, input: AssietteInput) => void;
  commitJustif: (clientId: string, choices: Record<string, string>, score: number) => void;

  switchPhase: () => void;
  advanceCycle: () => void;
  runAudit: (clientId: string, outcome: 'validated' | 'partial' | 'total', reassessed: number) => void;
  finishSeason: () => void;
  saveLeaderboard: (pseudo: string, score: number, grade: string) => void;
}

export type Store = UIState & Actions;

let toastId = 1;

function persist(save: SaveGame | null) {
  persistSave(save);
}

export const useStore = create<Store>((set, get) => ({
  view: 'home',
  save: null,
  options: DEFAULT_OPTIONS,
  leaderboard: [],
  codexReadPersistent: [],
  toasts: [],
  dialogue: null,
  activeClientId: null,
  lastDeltas: null,

  boot: () => {
    const save = loadSave();
    set({
      save,
      options: loadOptions(),
      leaderboard: loadLeaderboard(),
      codexReadPersistent: loadCodexRead(),
    });
  },

  go: (view) => set({ view }),

  newGame: (mode) => {
    const save = createNewGame(mode, new Date(0).toISOString());
    // Générer les leads du portefeuille selon le mode.
    const count = mode === 'expert' ? CLIENTS.length : Math.min(4, CLIENTS.length);
    save.portfolio = CLIENTS.slice(0, count).map((c) => initClientState(c.id));
    persist(save);
    set({ save, view: 'day' });
    get().generateProspects(3);
    // Tutoriel au tout premier cycle
    if (!save.tutorialDone) {
      get().startDialogue({ scenarioId: 'sc_tutorial', kind: 'tutorial', returnTo: 'day' });
    }
  },

  setOptions: (patch) => {
    const options = { ...get().options, ...patch };
    persistOptions(options);
    set({ options });
  },

  resetSave: () => {
    persist(null);
    set({ save: null, view: 'home' });
  },

  toast: (text, badge) => {
    const t: Toast = { id: toastId++, text, badge };
    set({ toasts: [...get().toasts, t] });
    setTimeout(() => get().dismissToast(t.id), 3200);
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  startDialogue: (ctx) => set({ dialogue: ctx, view: 'dialogue' }),

  applyGauges: (deltas, cause) => {
    const save = get().save;
    if (!save) return;
    const g = { ...save.gauges };
    const log: DeltaLogEntry[] = [...save.cycleLog];
    (Object.keys(deltas) as (keyof Gauges)[]).forEach((k) => {
      const d = deltas[k];
      if (d) {
        g[k] = clamp(g[k] + d);
        log.push({ gauge: k, delta: d, cause });
      }
    });
    const next = { ...save, gauges: g, cycleLog: log };
    persist(next);
    set({ save: next, lastDeltas: deltas });
  },

  applyEnergy: (delta, cause) => {
    const save = get().save;
    if (!save) return;
    const energy = clamp(save.energy + delta);
    const stats = { ...save.stats, minEnergy: Math.min(save.stats.minEnergy, energy) };
    const log = [...save.cycleLog, { gauge: 'energy' as const, delta, cause }];
    const next = { ...save, energy, stats, cycleLog: log };
    persist(next);
    set({ save: next });
  },

  addXp: (amount, cause) => {
    const save = get().save;
    if (!save) return;
    const beforeGrade = gradeForXp(save.xp).id;
    const xp = save.xp + amount;
    const afterGrade = gradeForXp(xp);
    const log = [...save.cycleLog, { gauge: 'xp' as const, delta: amount, cause }];
    const next = { ...save, xp, cycleLog: log };
    persist(next);
    set({ save: next });
    if (afterGrade.id !== beforeGrade) get().toast(`Nouveau grade : ${afterGrade.label}`, true);
  },

  unlockCodex: (id) => {
    const save = get().save;
    if (!save || save.codexUnlocked.includes(id)) return;
    const next = { ...save, codexUnlocked: [...save.codexUnlocked, id] };
    persist(next);
    set({ save: next });
  },

  markCodexRead: (id) => {
    const save = get().save;
    const persistent = get().codexReadPersistent.includes(id)
      ? get().codexReadPersistent
      : [...get().codexReadPersistent, id];
    persistCodexRead(persistent);
    if (save && !save.codexRead.includes(id)) {
      const next = { ...save, codexRead: [...save.codexRead, id] };
      persist(next);
      set({ save: next, codexReadPersistent: persistent });
      get().addXp(balance.xp.codexRead, 'Fiche codex lue');
    } else {
      set({ codexReadPersistent: persistent });
    }
  },

  spendPA: (n) => {
    const save = get().save;
    if (!save || save.actionPoints < n) return false;
    const next = { ...save, actionPoints: save.actionPoints - n };
    persist(next);
    set({ save: next });
    return true;
  },

  endDialogue: (result) => {
    const save = get().save;
    const dialogue = get().dialogue;
    if (!save) return;

    // XP selon le score de dialogue
    let xpBucket: number = balance.xp.dialogueChoice.acceptable;
    if (result.score >= 85) xpBucket = balance.xp.dialogueChoice.optimal;
    else if (result.score >= 65) xpBucket = balance.xp.dialogueChoice.acceptable;
    else if (result.score >= 40) xpBucket = balance.xp.dialogueChoice.tempting;
    else xpBucket = balance.xp.dialogueChoice.poor;

    let next = { ...save };

    if (result.kind === 'tutorial') {
      next = { ...next, tutorialDone: true };
    }

    // Pièces débloquées selon le score du scénario
    let unlockedPieces: string[] = [];
    if (dialogue) {
      const sc = scenarioById(dialogue.scenarioId);
      if (sc.outcome) {
        if (result.score >= sc.outcome.scoreThresholds.excellent) unlockedPieces = sc.outcome.unlocks.excellent;
        else if (result.score >= sc.outcome.scoreThresholds.good) unlockedPieces = sc.outcome.unlocks.good;
        else unlockedPieces = sc.outcome.unlocks.poor;
      }
    }

    // Mise à jour du client concerné
    if (result.clientId) {
      next = {
        ...next,
        portfolio: next.portfolio.map((cs) => {
          if (cs.clientId !== result.clientId) return cs;
          const scores = { ...cs.scores };
          if (result.kind === 'discovery') scores.discovery = result.score;
          if (result.kind === 'kickoff') scores.kickoff = result.score;
          const flags = Array.from(new Set([...cs.flags, ...result.flags]));
          let dossierState = cs.dossierState;
          if (result.kind === 'discovery' && dossierState === 'LEAD' && !result.declined) dossierState = 'QUALIFIED';
          if (result.kind === 'kickoff' && dossierState === 'SIGNED') dossierState = 'KICKED_OFF';
          if (result.kind === 'closing' && (dossierState === 'JUSTIFIED' || dossierState === 'BASE_DONE')) dossierState = 'CLOSED';
          const promise = result.promise ? { ...result.promise, cycle: save.cycle } : cs.promise;
          const piecesCollected = Array.from(new Set([...cs.piecesCollected, ...unlockedPieces]));
          return { ...cs, scores, flags, dossierState, promise, piecesCollected };
        }),
      };
    }

    // Refus de mission (SERVICES / prospect toxique)
    if (result.declined) {
      next = { ...next, stats: { ...next.stats, refusedMissions: next.stats.refusedMissions + 1 } };
    }

    persist(next);
    set({ save: next, dialogue: null, view: dialogue?.returnTo ?? 'day' });
    get().addXp(xpBucket, 'Entretien mené');

    // Prospect : signature ou refus
    if (result.kind === 'prospect' && result.prospectId) {
      if (result.declined) {
        get().toast('Prospect écarté — bien vu.');
      }
    }
    get().checkBadges();
  },

  checkBadges: () => {
    const save = get().save;
    if (!save) return;
    const gained = newBadges(save);
    if (gained.length > 0) {
      const next = { ...save, badges: [...save.badges, ...gained.map((b) => b.id)] };
      persist(next);
      set({ save: next });
      gained.forEach((b) => get().toast(b.label, true));
    }
  },

  generateProspects: (n) => {
    const save = get().save;
    if (!save) return;
    const base = save.prospects.length;
    const fresh: GeneratedProspect[] = [];
    for (let i = 0; i < n; i++) {
      fresh.push(generateProspect(PROSPECT_TEMPLATES, save.seed, base + i + save.cycle * 7));
    }
    const next = { ...save, prospects: [...save.prospects, ...fresh] };
    persist(next);
    set({ save: next });
  },

  signClient: (clientId) => {
    const save = get().save;
    if (!save) return;
    const c = clientById(clientId);
    const cs = save.portfolio.find((p) => p.clientId === clientId);
    if (!cs) return;
    const trueCir = computeBreakdown(caseById(c.caseId), null, RULESET, { legal: true }).cir;
    const signedRevenue = Math.round(trueCir * cs.feeRate);
    const next = {
      ...save,
      portfolio: save.portfolio.map((p) =>
        p.clientId === clientId ? { ...p, dossierState: 'SIGNED' as const, signedRevenue } : p,
      ),
      revenue: { ...save.revenue, signed: save.revenue.signed + signedRevenue },
    };
    persist(next);
    set({ save: next });
    get().toast(`${c.name} signé — CA estimé ${signedRevenue.toLocaleString('fr-FR')} €`);
  },

  openClientDialogue: (clientId, kind) => {
    const c = clientById(clientId);
    const scenarioId = c.scenarios[kind];
    get().startDialogue({ scenarioId, clientId, kind, returnTo: 'day' });
  },

  commitQualification: (clientId, placements) => {
    const save = get().save;
    if (!save) return;
    const c = clientById(clientId);
    const cardset = cardsetById(c.cardsetId);
    let correct = 0;
    let investigate = 0;
    let securityDelta = 0;
    for (const card of cardset.cards) {
      const placed = placements[card.id];
      if (placed === 'INVESTIGATE') {
        investigate += 1;
      } else if (placed === card.verdict) {
        correct += 1;
      } else if (placed) {
        // erreur : gonfle l'assiette si placé en R&D
        if (placed === 'RD' && card.verdict !== 'RD') securityDelta -= 4;
      }
    }
    const total = cardset.cards.length;
    const pct = Math.round((correct / total) * 100);
    const verrousOk = cardset.cards.filter((c) => c.verdict === 'RD' && placements[c.id] === 'RD').length;
    const next = {
      ...save,
      portfolio: save.portfolio.map((cs) =>
        cs.clientId === clientId
          ? {
              ...cs,
              cardPlacements: placements,
              investigateDebt: cs.investigateDebt + investigate,
              dossierState: cs.dossierState === 'KICKED_OFF' || cs.dossierState === 'SIGNED' ? 'CARDS_DONE' : cs.dossierState,
              scores: { ...cs.scores, qualification: pct },
            }
          : cs,
      ),
      stats: {
        ...save.stats,
        cardsCorrect: save.stats.cardsCorrect + correct,
        cardsTotal: save.stats.cardsTotal + total,
        verrousOk: save.stats.verrousOk + verrousOk,
      },
    };
    persist(next);
    set({ save: next });
    if (securityDelta) get().applyGauges({ security: securityDelta }, 'Cartes non éligibles classées en R&D');
    get().addXp(Math.round(pct), 'Qualification menée');
    get().toast(`Qualification : ${pct}% de justesse`);
    get().checkBadges();
  },

  commitBase: (clientId, input) => {
    const save = get().save;
    if (!save) return;
    const c = clientById(clientId);
    const theCase = caseById(c.caseId);
    const tol = toleranceForMode(save.mode);
    const score = scoreAssiette(theCase, input, RULESET, tol);
    const player = computeBreakdown(theCase, input, RULESET, { legal: false });
    const exact = score.precision >= 0.99;
    const next = {
      ...save,
      portfolio: save.portfolio.map((cs) =>
        cs.clientId === clientId
          ? {
              ...cs,
              assietteInput: input,
              playerCir: player.cir,
              trueCir: score.trueCir,
              dossierState: 'BASE_DONE' as const,
              scores: { ...cs.scores, base: score.precision },
            }
          : cs,
      ),
      stats: { ...save.stats, exactBases: save.stats.exactBases + (exact ? 1 : 0) },
    };
    persist(next);
    set({ save: next });
    const secDelta = score.withinTolerance ? 8 : -10;
    get().applyGauges({ security: secDelta }, score.withinTolerance ? 'Assiette dans la tolérance' : 'Assiette hors tolérance');
    get().addXp(xpForBaseAccuracy(score.precision, c.profileDifficulty), 'Assiette construite');
    get().checkBadges();
  },

  commitJustif: (clientId, choices, score) => {
    const save = get().save;
    if (!save) return;
    const next = {
      ...save,
      portfolio: save.portfolio.map((cs) =>
        cs.clientId === clientId
          ? { ...cs, justifChoices: choices, dossierState: 'JUSTIFIED' as const, scores: { ...cs.scores, justification: score } }
          : cs,
      ),
    };
    persist(next);
    set({ save: next });
    get().applyGauges({ security: score >= 70 ? 6 : -4 }, 'Justificatif technique');
    get().addXp(Math.round(score), 'Justificatif rédigé');
  },

  switchPhase: () => {
    const save = get().save;
    if (!save) return;
    if (save.phase === 'DAY') {
      const st = energyState(save.energy);
      let pa = balance.actionPoints.night;
      if (st === 'exhausted') pa -= 1;
      const next = { ...save, phase: 'NIGHT' as const, actionPoints: Math.max(1, pa), overtimeUsedThisNight: false };
      persist(next);
      set({ save: next, view: 'night' });
    } else {
      get().advanceCycle();
    }
  },

  advanceCycle: () => {
    const save = get().save;
    if (!save) return;
    // Fatigue de nuit
    const nightDrain = save.actionPoints === 0 ? balance.energy.nightFull : balance.energy.nightNormal;
    let energy = clamp(save.energy + nightDrain);
    // Récompense de nuit reposée
    if (save.actionPoints >= 2) energy = clamp(energy + balance.energy.restfulNightBonus);
    // Week-end
    energy = clamp(energy + balance.energy.weekend);

    // Deadlines manquées ce cycle
    const missed: string[] = [...save.missedDeadlines];
    const ms = MILESTONES.find((m) => m.cycle === save.cycle);
    if (ms && ms.id === 'ms_deposit') {
      // dépôt : clients non déposés → pénalité
      save.portfolio.forEach((cs) => {
        if (cs.dossierState !== 'DEPOSITED' && cs.dossierState !== 'JUSTIFIED' && cs.dossierState !== 'CLOSED') {
          if (!missed.includes(cs.clientId)) missed.push(`deposit_${cs.clientId}`);
        }
      });
    }

    const nextCycle = save.cycle + 1;
    if (nextCycle > SEASON_LENGTH) {
      get().finishSeason();
      return;
    }

    const st = energyState(energy);
    let dayPA = balance.actionPoints.day;
    if (st === 'fit') dayPA += 1;
    if (st === 'exhausted') dayPA -= 1;

    const next: SaveGame = {
      ...save,
      cycle: nextCycle,
      phase: 'DAY',
      actionPoints: Math.max(1, dayPA),
      energy,
      cycleLog: [],
      missedDeadlines: missed,
      restUsedThisDay: false,
      stats: { ...save.stats, minEnergy: Math.min(save.stats.minEnergy, energy) },
    };
    persist(next);
    set({ save: next, view: 'day', lastDeltas: null });
    // Nouveaux prospects
    get().generateProspects(2);
  },

  runAudit: (clientId, outcome, reassessed) => {
    const save = get().save;
    if (!save) return;
    const next = {
      ...save,
      portfolio: save.portfolio.map((cs) =>
        cs.clientId === clientId ? { ...cs, auditOutcome: outcome } : cs,
      ),
    };
    persist(next);
    set({ save: next });
    if (outcome === 'validated') get().addXp(balance.xp.auditPassed, 'Contrôle fiscal passé');
    if (reassessed > 0) get().applyGauges({ security: -10, relation: -8 }, 'Redressement au contrôle');
    get().checkBadges();
  },

  finishSeason: () => {
    const save = get().save;
    if (!save) return;
    const next = { ...save, finished: true };
    persist(next);
    set({ save: next, view: 'audit' });
    get().checkBadges();
  },

  saveLeaderboard: (pseudo, score, grade) => {
    const save = get().save;
    if (!save) return;
    const entry: LeaderboardEntry = {
      pseudo: pseudo.slice(0, 24) || 'Anonyme',
      mode: save.mode,
      score,
      grade,
      date: save.createdAt,
      badges: save.badges.length,
    };
    const lb = [...get().leaderboard, entry].sort((a, b) => b.score - a.score);
    persistLeaderboard(lb);
    set({ leaderboard: lb });
  },
}));

export function toleranceLabel(mode: GameMode): string {
  return `±${Math.round(toleranceForMode(mode) * 100)} %`;
}

export { chapterForCycle, nextMilestone, maxClients };
