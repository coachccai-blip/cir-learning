import { create } from 'zustand';
import balance from '../data/balance.json';
import ruleset from '../data/rules/ruleset-2026.json';
import { clientById, findClient, rosterFor } from '../data/clients';
import { caseById, writtenCases } from '../data/cases';
import { cardsetById } from '../data/cards';
import { scenarioById } from '../data/scenarios/index';
import { EVENTS } from '../data/events';
import { PROSPECT_TEMPLATES } from '../data/prospects';
import { chapterForCycle, nextMilestone, MILESTONES, SEASON_LENGTH } from '../data/calendar';
import type {
  AssietteInput,
  CardVerdict,
  DeltaLogEntry,
  GameEvent,
  GameMode,
  Gauges,
  GeneratedProspect,
  LeaderboardEntry,
  Ruleset,
  SaveGame,
  Scenario,
} from '../engine/types';
import { clamp } from '../engine/dialogue/mood';
import { energyState, gradeForXp, maxClients, xpForBaseAccuracy } from '../engine/economy';
import { scoreAssiette } from '../engine/cir/scoring';
import { computeBreakdown } from '../engine/cir/calculator';
import { newBadges } from '../engine/badges';
import { evaluatePromise, generateProspect, resolveGenericMission } from '../engine/prospects';
import { buildClientFromProspect, prospectBecomesClient } from '../engine/clientgen';
import { neglectedClients, resolveMilestone } from '../engine/milestones';
import { stepFor, stepForClient } from '../engine/progression';
import { completeSeason, EMPTY_PROGRESS, type Progress } from '../engine/journey';
import { varyCase } from '../engine/casevar';
import { twistsForCase } from '../data/case-twists';
import { caseForClient } from './dossier';
import { loadCaseVariations, loadGeneratedClients, registerGeneratedClient } from '../data/registry';
import { rngFromSeed } from '../engine/rng';
import {
  DEFAULT_OPTIONS,
  loadCodexRead,
  loadLeaderboard,
  loadOptions,
  loadProgress,
  loadSave,
  persistCodexRead,
  persistLeaderboard,
  persistOptions,
  persistProgress,
  persistSave,
  type Options,
} from './persistence';
import { createNewGame, initClientState } from './factory';
import { STR } from '../i18n/fr';
import { playSound, type SoundName } from '../app/sound';

const RULESET = ruleset as Ruleset;
/** Millésime instruit pendant la saison (les cas écrits à la main sont sur 2025). */
const FISCAL_YEAR = 2025;

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
  | 'client'
  | 'quiz'
  | 'settlement';

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
  /** Scénario fourni inline (événements aléatoires, non présents dans SCENARIOS). */
  inlineScenario?: Scenario;
}

/**
 * Installe les variantes de dossiers de la partie. Purement déterministe :
 * la même graine redonne les mêmes montants et le même piège, y compris
 * après un rechargement de page — rien n'a besoin d'être persisté.
 */
function applyCaseVariations(seed: string): void {
  loadCaseVariations(
    writtenCases().map((c) => varyCase(c, twistsForCase(c.id), `${seed}:case:${c.id}`)),
  );
}

/** Transforme un événement (nœud unique à 4 choix) en scénario jouable. */
export function eventToScenario(ev: GameEvent): Scenario {
  return {
    id: ev.id,
    type: 'EVENT',
    title: ev.title,
    context: '',
    entryNode: ev.node.id,
    nodes: [ev.node],
  };
}

interface UIState {
  view: View;
  save: SaveGame | null;
  options: Options;
  leaderboard: LeaderboardEntry[];
  /** Avancement du parcours (saisons terminées) — hors sauvegarde de partie. */
  progress: Progress;
  codexReadPersistent: string[];
  toasts: Toast[];
  dialogue: DialogueContext | null;
  activeClientId: string | null;
  lastDeltas: Partial<Gauges> | null;
  quizPhase: 'pre' | 'post';
  /** Scène de règlement de promesse au bilan de mission. */
  settlement: {
    clientId: string;
    label: string;
    relation: number;
    profitability: number;
    reproach: string;
    realCir: number;
    promiseMin: number;
    promiseMax: number;
    churn: boolean;
  } | null;
  /** Overlay de transition jour/nuit (label affiché plein écran). */
  transition: { label: string; phase: 'DAY' | 'NIGHT' } | null;
  /** Contrôle de mi-saison (demande d'information) ou contrôle final. */
  auditMode: 'interim' | 'final';
  /** Célébration plein écran (confettis) ou constat d'échec. */
  celebration: {
    id: string;
    icon: string;
    title: string;
    subtitle?: string;
    tone: 'good' | 'bad';
  } | null;
}

interface Actions {
  boot: () => void;
  go: (view: View) => void;
  newGame: (mode: GameMode, seedOverride?: string) => void;
  startFirstDay: () => void;
  recordChoice: (entry: {
    scenarioId: string;
    nodeId: string;
    choiceId: string;
    role: 'optimal' | 'acceptable' | 'tempting' | 'poor';
    clientId?: string;
    text: string;
    impact: number;
    rule: string;
  }) => void;
  readMail: (id: string) => void;
  clearTransition: () => void;
  celebrate: (c: { icon: string; title: string; subtitle?: string; tone?: 'good' | 'bad' }) => void;
  clearCelebration: () => void;
  closeSettlement: () => void;
  playSfx: (name: SoundName) => void;
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
  resolveProspectCall: (prospectId: string, flags: string[]) => void;
  signClient: (clientId: string) => void;
  openClientDialogue: (clientId: string, kind: 'discovery' | 'kickoff' | 'followup' | 'closing') => void;

  commitQualification: (clientId: string, placements: Record<string, CardVerdict>) => void;
  commitBase: (clientId: string, input: AssietteInput) => void;
  commitJustif: (clientId: string, choices: Record<string, string>, score: number) => void;

  switchPhase: () => void;
  advanceCycle: () => void;
  maybeTriggerEvent: () => boolean;
  runAudit: (clientId: string, outcome: 'validated' | 'partial' | 'total', reassessed: number) => void;
  finishSeason: () => void;
  /** Referme la demande d'information et rend la main au joueur. */
  closeInterimAudit: () => void;
  commitQuiz: (phase: 'pre' | 'post', answers: number[]) => void;
  saveLeaderboard: (pseudo: string, score: number, grade: string) => void;
  /** Marque la saison terminée : c'est ce qui déverrouille la suivante. */
  completeSeason: (mode: GameMode, score: number) => void;
  /** Remet le parcours à zéro (usage formateur, depuis les options). */
  resetJourney: () => void;
}

export type Store = UIState & Actions;

let toastId = 1;
let celebrationId = 0;

function persist(save: SaveGame | null) {
  persistSave(save);
}

export const useStore = create<Store>((set, get) => ({
  view: 'home',
  save: null,
  options: DEFAULT_OPTIONS,
  leaderboard: [],
  progress: EMPTY_PROGRESS,
  codexReadPersistent: [],
  toasts: [],
  dialogue: null,
  activeClientId: null,
  lastDeltas: null,
  quizPhase: 'pre',
  settlement: null,
  transition: null,
  celebration: null,
  auditMode: 'final',

  boot: () => {
    const save = loadSave();
    // Les dossiers générés doivent être dans le registre avant que le moindre
    // écran ne tente de résoudre un `clientId` de prospect converti.
    loadGeneratedClients(save?.generatedClients ?? []);
    if (save) applyCaseVariations(save.seed);
    set({
      save,
      options: loadOptions(),
      leaderboard: loadLeaderboard(),
      progress: loadProgress(),
      codexReadPersistent: loadCodexRead(),
    });
  },

  go: (view) => set({ view }),

  newGame: (mode, seedOverride) => {
    // Toute saison est jouable d'emblée : l'ordre du parcours est un conseil
    // affiché à la sélection, pas une porte fermée.
    const save = createNewGame(mode, new Date(0).toISOString(), seedOverride);
    // Le portefeuille s'ouvre sur les leads du premier cycle ; les autres
    // arrivent au fil des semaines. Il y aura toujours plus de dossiers que de
    // points d'action : choisir qui l'on sert fait partie du jeu.
    const opening = rosterFor(mode).filter((c) => c.leadCycle <= 1);
    save.portfolio = opening.map((c) => initClientState(c.id));
    loadGeneratedClients([]);
    applyCaseVariations(save.seed);
    persist(save);
    // Quiz d'entrée avant de commencer (mesure de l'apprentissage §18.1).
    set({ save, view: 'quiz', quizPhase: 'pre', settlement: null, transition: null });
  },

  recordChoice: (entry) => {
    const save = get().save;
    if (!save) return;
    // Streak « le mot juste » : les choix optimal/acceptable font monter la
    // série ; un choix tentant ou mauvais la casse.
    const streak =
      entry.role === 'optimal' || entry.role === 'acceptable' ? save.stats.noJargonStreak + 1 : 0;
    const next: SaveGame = {
      ...save,
      history: [...save.history, { cycle: save.cycle, ...entry }],
      stats: { ...save.stats, noJargonStreak: streak },
    };
    persist(next);
    set({ save: next });
  },

  readMail: (id) => {
    const save = get().save;
    if (!save || save.mailsRead.includes(id)) return;
    const next = { ...save, mailsRead: [...save.mailsRead, id] };
    persist(next);
    set({ save: next });
  },

  clearTransition: () => set({ transition: null }),

  celebrate: (c) => {
    celebrationId += 1;
    set({ celebration: { id: `celeb-${celebrationId}`, tone: 'good', ...c } });
  },
  clearCelebration: () => set({ celebration: null }),

  closeSettlement: () => set({ settlement: null, view: 'day' }),

  playSfx: (name) => {
    playSound(name, get().options.volume);
  },

  // Démarre réellement la première journée (appelé après le quiz d'entrée).
  startFirstDay: () => {
    const save = get().save;
    if (!save) return;
    set({ view: 'day' });
    get().generateProspects(3);
    // Le tutoriel présente le cabinet et le métier : il n'a pas de sens en
    // deuxième saison. Celle-ci ouvre sur une autre scène — la directrice de BU
    // confie un portefeuille à quelqu'un qui a déjà déposé une campagne.
    if (!save.tutorialDone) {
      const scenarioId = save.mode === 'expert' ? 'sc_exp_opening' : 'sc_tutorial';
      get().startDialogue({ scenarioId, kind: 'tutorial', returnTo: 'day' });
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
    if (afterGrade.id !== beforeGrade) {
      get().toast(`Nouveau grade : ${afterGrade.label}`, true);
      get().playSfx('levelup');
      get().celebrate({
        icon: '⭐',
        title: `Promotion : ${afterGrade.label}`,
        subtitle: `${xp} XP — votre travail paie.`,
      });
    }
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

    // Pièces débloquées selon le score du scénario (hors événements inline).
    let unlockedPieces: string[] = [];
    if (dialogue && !dialogue.inlineScenario) {
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
          // Le suivi de mission ne se joue qu'une fois par client.
          const followupDone = cs.followupDone || result.kind === 'followup';
          const promise = result.promise ? { ...result.promise, cycle: save.cycle } : cs.promise;
          const piecesCollected = Array.from(new Set([...cs.piecesCollected, ...unlockedPieces]));
          // Le joueur s'est occupé de ce dossier : il ne l'abandonne pas.
          const lastTouchedCycle = save.cycle;
          return { ...cs, scores, flags, dossierState, promise, piecesCollected, followupDone, lastTouchedCycle };
        }),
      };
    }

    // Refus de mission (SERVICES / prospect toxique)
    if (result.declined) {
      next = { ...next, stats: { ...next.stats, refusedMissions: next.stats.refusedMissions + 1 } };
    }

    // Refus ferme d'un dossier inexistant : le client sort du portefeuille.
    // C'est un choix gagnant — il libère des points d'action et protège la
    // saison — mais il faut assumer de perdre le chiffre d'affaires.
    const refused = result.flags.includes('refus_mission') && result.clientId;
    if (refused) {
      next = {
        ...next,
        portfolio: next.portfolio.map((cs) =>
          cs.clientId === result.clientId ? { ...cs, dossierState: 'LOST' as const } : cs,
        ),
      };
    }

    // Bilan de mission : la promesse initiale est confrontée au CIR réel (§6.3).
    // Le règlement est présenté en vraie scène (view 'settlement'), pas en toast.
    let settlement: UIState['settlement'] = null;
    if (result.kind === 'closing' && result.clientId) {
      const cs = next.portfolio.find((p) => p.clientId === result.clientId);
      const client = findClient(result.clientId);
      if (cs?.promise && client) {
        const realCir = cs.playerCir ?? cs.trueCir ?? Math.round((client.cirEstimate[0] + client.cirEstimate[1]) / 2);
        const outcome = evaluatePromise({ min: cs.promise.min, max: cs.promise.max }, realCir);
        const reproach = outcome.churnRisk
          ? `Vous m'aviez promis ${cs.promise.min.toLocaleString('fr-FR')} €. On est très loin du compte. J'ai répété ce chiffre à mon banquier, à mes associés… Vous me mettez dans une situation impossible.`
          : outcome.relation < 0
            ? `C'est un peu moins que ce que vous aviez annoncé. Je ne vais pas vous mentir, je suis déçu — mais montrez-moi d'où vient l'écart.`
            : outcome.relation > 0 && cs.promise.kind === 'range'
              ? `Vous aviez vu juste : on est dans la fourchette annoncée. C'est exactement ce que j'attends d'un conseil.`
              : `Bien. Le montant dépasse même votre estimation — la prochaine fois, j'attendrai le chiffre haut.`;
        settlement = {
          clientId: client.id,
          label: outcome.label,
          relation: outcome.relation,
          profitability: outcome.profitability,
          reproach,
          realCir,
          promiseMin: cs.promise.min,
          promiseMax: cs.promise.max,
          churn: outcome.churnRisk,
        };
        // Le churn ferme durablement la relation client.
        if (outcome.churnRisk) {
          next = {
            ...next,
            portfolio: next.portfolio.map((p) =>
              p.clientId === result.clientId ? { ...p, trust: clamp(p.trust - 25), mood: clamp(p.mood - 20) } : p,
            ),
          };
        }
      }
    }

    persist(next);
    set({
      save: next,
      dialogue: null,
      settlement,
      view: settlement ? 'settlement' : (dialogue?.returnTo ?? 'day'),
    });
    get().addXp(xpBucket, 'Entretien mené');

    if (refused && result.clientId) {
      const refusedClient = findClient(result.clientId);
      get().playSfx('badge');
      get().celebrate({
        icon: '🛡️',
        title: STR.milestones.refusedTitle(refusedClient?.name ?? ''),
        subtitle: STR.milestones.refusedSubtitle,
        tone: 'good',
      });
    }

    if (settlement) {
      get().applyGauges(
        { relation: settlement.relation, profitability: settlement.profitability },
        `Promesse : ${settlement.label}`,
      );
      if (settlement.churn) get().playSfx('alert');
    }

    // Prospect : signature (→ client conseil avec portrait) ou refus (§16).
    if (result.kind === 'prospect' && result.prospectId) {
      get().resolveProspectCall(result.prospectId, result.flags);
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
      get().playSfx('badge');
      get().celebrate({
        icon: '🏅',
        title: gained.length > 1 ? `${gained.length} badges débloqués !` : `Badge : ${gained[0].label}`,
        subtitle: gained[0].description,
      });
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

  resolveProspectCall: (prospectId, flags) => {
    const save = get().save;
    if (!save) return;
    const p = save.prospects.find((p) => p.id === prospectId);
    if (!p || p.status !== 'NEW') return;

    const forceSign = flags.includes('prospect_sign');
    const maybe = flags.includes('prospect_maybe');
    const willSign = forceSign || (maybe && p.eligibility !== 'NOT_ELIGIBLE');

    if (willSign) {
      const outcome = resolveGenericMission(p);
      // Certaines signatures deviennent de vraies missions de fond : elles
      // entrent au portefeuille avec leur propre dossier à instruire la nuit.
      // Les autres restent des missions conseil qui n'apportent que du CA.
      const openSlots = save.portfolio.filter(
        (cs) => cs.dossierState !== 'CLOSED' && cs.dossierState !== 'DEPOSITED' && cs.dossierState !== 'LOST',
      ).length;
      const becomesClient =
        openSlots < balance.prospectToClient.maxActiveClients &&
        prospectBecomesClient(p, save.seed, balance.prospectToClient);

      let portfolio = save.portfolio;
      let generatedClients = save.generatedClients;
      if (becomesClient) {
        const bundle = buildClientFromProspect(
          p,
          save.seed,
          RULESET,
          balance.prospectToClient,
          FISCAL_YEAR,
        );
        registerGeneratedClient(bundle);
        generatedClients = [...save.generatedClients, bundle];
        // Le contrat est déjà signé au téléphone : le dossier démarre au kick-off.
        portfolio = [...save.portfolio, initClientState(bundle.client.id, 'SIGNED')];
      }

      const next: SaveGame = {
        ...save,
        prospects: save.prospects.map((x) =>
          x.id === prospectId ? { ...x, status: 'SIGNED' as const, revenue: outcome.revenue } : x,
        ),
        portfolio,
        generatedClients,
        revenue: { ...save.revenue, signed: save.revenue.signed + outcome.revenue },
        stats: { ...save.stats, prospectsSigned: save.stats.prospectsSigned + 1 },
      };
      persist(next);
      set({ save: next });
      get().applyGauges(
        { relation: outcome.relation, security: outcome.security, profitability: outcome.profitability },
        outcome.toxic
          ? `Mission toxique signée : ${p.company} n'a pas de R&D réelle`
          : `Mission conseil signée : ${p.company}`,
      );
      if (outcome.toxic) {
        get().toast(`${p.company} signé… mais rien d'éligible. Cette mission va vous coûter.`);
      } else if (becomesClient) {
        get().toast(STR.prospects.becameClient(p.company, p.contactName));
        get().celebrate({
          icon: '🏢',
          title: STR.prospects.newClientTitle(p.company),
          subtitle: STR.prospects.newClientSubtitle,
          tone: 'good',
        });
      } else {
        get().toast(
          `${p.company} signé — mission conseil (+${outcome.revenue.toLocaleString('fr-FR')} € CA)`,
        );
      }
      get().playSfx(becomesClient ? 'fanfare' : 'validate');
    } else {
      const goodRefusal = p.eligibility === 'NOT_ELIGIBLE' && !flags.includes('prospect_decline_rude');
      const next: SaveGame = {
        ...save,
        prospects: save.prospects.map((x) => (x.id === prospectId ? { ...x, status: 'DECLINED' as const } : x)),
        stats: {
          ...save.stats,
          prospectsDeclined: save.stats.prospectsDeclined + 1,
          refusedMissions: save.stats.refusedMissions + (goodRefusal ? 1 : 0),
        },
      };
      persist(next);
      set({ save: next });
      get().toast(goodRefusal ? 'Prospect non éligible écarté — bien vu.' : `${p.company} : pas de suite.`);
    }
  },

  signClient: (clientId) => {
    const save = get().save;
    if (!save) return;
    const c = clientById(clientId);
    const cs = save.portfolio.find((p) => p.clientId === clientId);
    if (!cs) return;
    // Honoraires estimés sur le dossier complet : la restriction aux postes
    // déjà introduits est un dispositif pédagogique, elle ne change pas le
    // crédit auquel le client a droit — ni ce qu'on lui facture.
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
    get().playSfx('success');
    get().celebrate({
      icon: '🤝',
      title: `${c.name} signé !`,
      subtitle: `CA estimé : ${signedRevenue.toLocaleString('fr-FR')} €`,
    });
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
              lastTouchedCycle: save.cycle,
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
    if (pct === 100) {
      get().playSfx('fanfare');
      get().celebrate({ icon: '🃏', title: 'Tri parfait !', subtitle: 'Toutes les cartes au bon endroit.' });
    } else if (pct >= 80) {
      get().playSfx('success');
      get().celebrate({ icon: '👍', title: `Qualification : ${pct} %`, subtitle: 'Bon tri — voyez les cartes manquées.' });
    } else {
      get().playSfx('fail');
      get().toast(`Qualification : ${pct} % de justesse`);
    }
    get().checkBadges();
  },

  commitBase: (clientId, input) => {
    const save = get().save;
    if (!save) return;
    const c = clientById(clientId);
    // Étape figée ici : le dossier gardera ses postes et sa tolérance même si
    // le joueur en instruit d'autres avant d'y revenir.
    const step = stepForClient(save, clientId);
    const theCase = caseForClient(save, clientId);
    const score = scoreAssiette(theCase, input, RULESET, step.tolerance);
    const player = computeBreakdown(theCase, input, RULESET, { legal: false });
    const exact = score.precision >= 0.99;
    const next = {
      ...save,
      portfolio: save.portfolio.map((cs) =>
        cs.clientId === clientId
          ? {
              ...cs,
              assietteInput: input,
              baseStep: step.index,
              lastTouchedCycle: save.cycle,
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
    const pct = Math.round(score.precision * 100);
    if (exact) {
      get().playSfx('fanfare');
      get().celebrate({ icon: '🎯', title: 'Assiette exacte !', subtitle: `${pct} % de précision — sans une erreur.` });
    } else if (score.withinTolerance) {
      get().playSfx('success');
      get().celebrate({ icon: '✅', title: 'Assiette validée', subtitle: `${pct} % de précision, dans la tolérance.` });
    } else {
      get().playSfx('fail');
      get().celebrate({
        icon: '⚠️',
        title: 'Assiette hors tolérance',
        subtitle: `${pct} % de précision. Regardez les écarts poste par poste — c'est là que ça se joue.`,
        tone: 'bad',
      });
    }
    get().checkBadges();
  },

  commitJustif: (clientId, choices, score) => {
    const save = get().save;
    if (!save) return;
    const next = {
      ...save,
      portfolio: save.portfolio.map((cs) =>
        cs.clientId === clientId
          ? {
              ...cs,
              justifChoices: choices,
              dossierState: 'JUSTIFIED' as const,
              lastTouchedCycle: save.cycle,
              scores: { ...cs.scores, justification: score },
            }
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
      set({
        save: next,
        view: 'night',
        transition: { label: `Semaine ${save.cycle} — ${STR.hud.night}`, phase: 'NIGHT' },
      });
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

    // Échéance du cycle : chacune a une conséquence, aucune n'est décorative.
    const missed: string[] = [...save.missedDeadlines];
    const ms = MILESTONES.find((m) => m.cycle === save.cycle);
    let portfolio = save.portfolio;
    const reports: string[] = [];
    if (ms) {
      const outcome = resolveMilestone(ms.id, portfolio);
      for (const id of outcome.missed) if (!missed.includes(id)) missed.push(id);
      if (outcome.report) reports.push(outcome.report);
      if (outcome.patches.length > 0) {
        portfolio = portfolio.map((cs) => {
          const patch = outcome.patches.find((p) => p.clientId === cs.clientId);
          if (!patch) return cs;
          return {
            ...cs,
            mood: clamp(cs.mood + (patch.mood ?? 0)),
            trust: clamp(cs.trust + (patch.trust ?? 0)),
            piecesCollected: patch.losePieces
              ? cs.piecesCollected.filter((x) => !patch.losePieces!.includes(x))
              : cs.piecesCollected,
          };
        });
      }
      if (Object.keys(outcome.gauges).length > 0) {
        get().applyGauges(outcome.gauges, ms.label);
      }
    }

    // Dossiers abandonnés : un client sans nouvelles depuis deux cycles s'en va.
    const dropped = neglectedClients(portfolio, save.cycle, balance.neglectGraceCycles);
    if (dropped.length > 0) {
      const lost = new Set(dropped.map((c) => c.clientId));
      portfolio = portfolio.map((cs) => (lost.has(cs.clientId) ? { ...cs, dossierState: 'LOST' as const } : cs));
      for (const cs of dropped) {
        missed.push(`neglected_${cs.clientId}`);
        reports.push(STR.milestones.lostClient(clientById(cs.clientId).name));
      }
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
      portfolio,
      cycle: nextCycle,
      phase: 'DAY',
      actionPoints: Math.max(1, dayPA),
      energy,
      cycleLog: [],
      missedDeadlines: missed,
      restUsedThisDay: false,
      stats: { ...save.stats, minEnergy: Math.min(save.stats.minEnergy, energy) },
      gaugeHistory: [
        ...save.gaugeHistory,
        {
          cycle: save.cycle,
          relation: save.gauges.relation,
          security: save.gauges.security,
          profitability: save.gauges.profitability,
        },
      ],
    };
    // Arrivée des leads du catalogue à leur cycle : le portefeuille dépasse
    // toujours ce que le budget d'actions permet de servir.
    const arriving = rosterFor(save.mode).filter(
      (c) => c.leadCycle <= nextCycle && !next.portfolio.some((cs) => cs.clientId === c.id),
    );
    if (arriving.length > 0) {
      next.portfolio = [...next.portfolio, ...arriving.map((c) => initClientState(c.id))];
    }

    persist(next);
    set({
      save: next,
      view: 'day',
      lastDeltas: null,
      transition: { label: `Semaine ${nextCycle} — ${STR.hud.day}`, phase: 'DAY' },
    });
    // Demande d'information de l'administration : le contrôle arrive tant
    // qu'il reste un cycle pour corriger les autres dossiers.
    if (ms?.id === 'ms_info_request' && portfolio.some((c) => c.assietteInput !== null)) {
      set({ view: 'audit', auditMode: 'interim', transition: null });
    }
    for (const r of reports) get().toast(r);
    for (const c of arriving) get().toast(STR.prospects.newLead(c.name, c.sectorLabel));
    // Nouveaux prospects
    get().generateProspects(2);
    // Événement aléatoire (33 %/cycle) — écrase la vue par un dialogue si tiré.
    get().maybeTriggerEvent();
  },

  maybeTriggerEvent: () => {
    const save = get().save;
    if (!save) return false;
    const rng = rngFromSeed(`${save.seed}:event:${save.cycle}`);
    if (rng() >= balance.eventChance) return false;
    const hasSignedClient = save.portfolio.some(
      (c) => c.dossierState !== 'LEAD' && c.dossierState !== 'QUALIFIED' && c.dossierState !== 'LOST',
    );
    const candidates = EVENTS.filter(
      (ev) =>
        !save.firedEvents.includes(ev.id) &&
        save.cycle >= ev.minCycle &&
        save.cycle <= ev.maxCycle &&
        (!ev.needsClient || hasSignedClient),
    );
    if (candidates.length === 0) return false;
    const ev = candidates[Math.floor(rng() * candidates.length)];
    const next = { ...save, firedEvents: [...save.firedEvents, ev.id] };
    persist(next);
    set({ save: next });
    get().startDialogue({ scenarioId: ev.id, kind: 'event', returnTo: 'day', inlineScenario: eventToScenario(ev) });
    return true;
  },

  commitQuiz: (phase, answers) => {
    const save = get().save;
    if (!save) return;
    const next = phase === 'pre' ? { ...save, quizPre: answers } : { ...save, quizPost: answers };
    persist(next);
    set({ save: next });
    if (phase === 'pre') get().startFirstDay();
    else set({ view: 'end' });
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
    if (outcome === 'validated') {
      get().addXp(balance.xp.auditPassed, 'Contrôle fiscal passé');
      get().playSfx('fanfare');
      get().celebrate({
        icon: '🛡️',
        title: 'Contrôle passé sans rappel !',
        subtitle: 'Votre dossier a tenu. C’est la preuve d’un travail sérieux.',
      });
    }
    if (reassessed > 0) {
      get().applyGauges({ security: -10, relation: -8 }, 'Redressement au contrôle');
      get().playSfx('fail');
      get().celebrate({
        icon: '📉',
        title: 'Redressement',
        subtitle: `${reassessed.toLocaleString('fr-FR')} € rappelés. La preuve se constituait pendant les travaux.`,
        tone: 'bad',
      });
    }
    get().checkBadges();
  },

  finishSeason: () => {
    const save = get().save;
    if (!save) return;
    const next = { ...save, finished: true };
    persist(next);
    set({ save: next, view: 'audit', auditMode: 'final' });
    get().checkBadges();
  },

  closeInterimAudit: () => {
    const save = get().save;
    set({ auditMode: 'final', view: save?.phase === 'NIGHT' ? 'night' : 'day' });
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

  completeSeason: (mode, score) => {
    const progress = completeSeason(get().progress, mode, score);
    persistProgress(progress);
    set({ progress });
  },

  resetJourney: () => {
    persistProgress(EMPTY_PROGRESS);
    set({ progress: EMPTY_PROGRESS });
  },
}));

/** Tolérance annoncée dans l'interface, pour le n-ième dossier d'une saison. */
export function toleranceLabel(mode: GameMode, step = 1): string {
  return `±${Math.round(stepFor(mode, step).tolerance * 100)} %`;
}

export { chapterForCycle, nextMilestone, maxClients };
