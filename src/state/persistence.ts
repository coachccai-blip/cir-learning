import type { LeaderboardEntry, SaveGame } from '../engine/types';
import { genderForName } from '../engine/prospects';
import { hashString } from '../engine/rng';

const SAVE_KEY = 'cirquest.save.v1';
const LB_KEY = 'cirquest.leaderboard.v1';
const OPT_KEY = 'cirquest.options.v1';
const CODEX_READ_KEY = 'cirquest.codexread.v1';

export const CURRENT_SCHEMA = 1;

export interface Options {
  volume: number;
  reduceMotion: boolean;
  textSize: 'normal' | 'large' | 'xlarge';
}

export const DEFAULT_OPTIONS: Options = { volume: 0, reduceMotion: false, textSize: 'normal' };

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Migration défensive : une sauvegarde illisible ne crashe jamais le jeu. */
export function migrateSave(data: unknown): SaveGame | null {
  if (!data || typeof data !== 'object') return null;
  const s = data as Partial<SaveGame>;
  if (typeof s.schemaVersion !== 'number') return null;
  // Ici, une seule version : on renverrait des migrations successives si besoin.
  if (s.schemaVersion > CURRENT_SCHEMA) return null;
  // Backfill défensif des champs ajoutés après la v1 : une sauvegarde plus
  // ancienne ne doit jamais crasher le jeu.
  const filled: SaveGame = {
    ...(s as SaveGame),
    // Le mode « Découverte » a été retiré : une partie en cours bascule sur
    // Onboarding, le mode le plus proche, plutôt que de rester sur un mode
    // dont plus aucun barème n'existe.
    mode: (s.mode as string) === 'discovery' ? 'onboarding' : (s.mode ?? 'onboarding'),
    firedEvents: s.firedEvents ?? [],
    quizPre: s.quizPre ?? [],
    quizPost: s.quizPost ?? [],
    mailsRead: s.mailsRead ?? [],
    gaugeHistory: s.gaugeHistory ?? [],
    generatedClients: s.generatedClients ?? [],
    history: (s.history ?? []).map((h) => ({
      ...h,
      text: h.text ?? '',
      impact: h.impact ?? 0,
      rule: h.rule ?? '',
    })),
    portfolio: (s.portfolio ?? []).map((c) => ({
      ...c,
      followupDone: c.followupDone ?? false,
      lastTouchedCycle: c.lastTouchedCycle ?? 0,
    })),
    prospects: (s.prospects ?? []).map((p) => {
      const gender = p.gender ?? genderForName(p.contactName ?? '');
      return {
        ...p,
        gender,
        portraitId:
          p.portraitId ?? `prospect-${gender === 'F' ? 'f' : 'm'}-0${1 + (hashString(p.id ?? '') % 4)}`,
        callScenarioId: p.callScenarioId ?? 'sc_call_curieux',
      };
    }),
  };
  return filled;
}

export function loadSave(): SaveGame | null {
  return migrateSave(safeParse<unknown>(localStorage.getItem(SAVE_KEY), null));
}

export function persistSave(save: SaveGame | null): void {
  if (save === null) localStorage.removeItem(SAVE_KEY);
  else localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function loadLeaderboard(): LeaderboardEntry[] {
  // Même bascule que pour les sauvegardes : les scores enregistrés en
  // « Découverte » restent visibles, rattachés à Onboarding.
  return safeParse<LeaderboardEntry[]>(localStorage.getItem(LB_KEY), []).map((e) =>
    (e.mode as string) === 'discovery' ? { ...e, mode: 'onboarding' as const } : e,
  );
}

export function persistLeaderboard(entries: LeaderboardEntry[]): void {
  localStorage.setItem(LB_KEY, JSON.stringify(entries));
}

export function loadOptions(): Options {
  return { ...DEFAULT_OPTIONS, ...safeParse<Partial<Options>>(localStorage.getItem(OPT_KEY), {}) };
}

export function persistOptions(opts: Options): void {
  localStorage.setItem(OPT_KEY, JSON.stringify(opts));
}

/** Codex lu et badges survivent à une réinitialisation de partie. */
export function loadCodexRead(): string[] {
  return safeParse<string[]>(localStorage.getItem(CODEX_READ_KEY), []);
}

export function persistCodexRead(ids: string[]): void {
  localStorage.setItem(CODEX_READ_KEY, JSON.stringify(ids));
}
