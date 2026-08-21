// PA, énergie, XP, grades, score final (§4, §5).

import balance from '../data/balance.json';
import type { GameMode, Gauges, SaveGame } from './types';

export type EnergyState = 'fit' | 'normal' | 'tired' | 'exhausted';

export function energyState(energy: number): EnergyState {
  const t = balance.energy.thresholds;
  if (energy >= t.fit) return 'fit';
  if (energy <= t.exhausted) return 'exhausted';
  if (energy <= t.tired) return 'tired';
  return 'normal';
}

export const ENERGY_STATE_LABEL: Record<EnergyState, string> = {
  fit: 'En forme',
  normal: 'Normal',
  tired: 'Fatigué',
  exhausted: 'Épuisé',
};

/** PA de base d'une phase, modulés par l'état d'énergie (§4.3). */
export function basePA(phase: 'DAY' | 'NIGHT', energy: number): number {
  let pa = phase === 'DAY' ? balance.actionPoints.day : balance.actionPoints.night;
  const state = energyState(energy);
  if (state === 'fit' && phase === 'DAY') pa += 1;
  if (state === 'exhausted') pa -= 1;
  return Math.max(1, pa);
}

export function toleranceForMode(mode: GameMode): number {
  return balance.tolerance[mode];
}

export interface GradeInfo {
  id: string;
  label: string;
  xp: number;
}

export function gradeForXp(xp: number): GradeInfo {
  const grades = balance.grades as GradeInfo[];
  let current = grades[0];
  for (const g of grades) if (xp >= g.xp) current = g;
  return current;
}

export function nextGrade(xp: number): GradeInfo | null {
  const grades = balance.grades as GradeInfo[];
  for (const g of grades) if (xp < g.xp) return g;
  return null;
}

export function maxClients(xp: number): number {
  const id = gradeForXp(xp).id;
  if (id === 'stagiaire') return 1;
  if (id === 'junior') return 2;
  if (id === 'consultant') return 2;
  return 3;
}

export function xpForBaseAccuracy(precision: number, difficulty: 1 | 2 | 3): number {
  const { min, max } = balance.xp.baseAccuracy;
  const range = min + ((max - min) * (difficulty - 1)) / 2;
  return Math.round(range * Math.max(0, precision));
}

// ---------- Score final (§5.4) ----------

export interface FinalScore {
  total: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  parts: { label: string; value: number; weight: number; contribution: number }[];
  penalties: { label: string; value: number }[];
}

export function computeFinalScore(save: SaveGame, auditPassed: boolean, reassessments: number): FinalScore {
  const w = balance.finalScore;
  const g: Gauges = save.gauges;
  const accuracy =
    save.portfolio.filter((c) => c.scores.base !== null).length > 0
      ? save.portfolio
          .filter((c) => c.scores.base !== null)
          .reduce((s, c) => s + (c.scores.base ?? 0), 0) /
        save.portfolio.filter((c) => c.scores.base !== null).length
      : 0;
  const revenueRatio = Math.min(w.revenueCapRatio, save.revenue.signed / balance.seasonRevenueTarget);

  const parts = [
    { label: 'Sécurité fiscale', value: g.security, weight: w.security, contribution: g.security * w.security },
    { label: 'Relation client', value: g.relation, weight: w.relation, contribution: g.relation * w.relation },
    {
      label: 'Rentabilité',
      value: g.profitability,
      weight: w.profitability,
      contribution: g.profitability * w.profitability,
    },
    {
      label: "CA / objectif",
      value: Math.round(revenueRatio * 100),
      weight: w.revenue,
      contribution: revenueRatio * 100 * w.revenue,
    },
    {
      label: 'Précision des assiettes',
      value: Math.round(accuracy * 100),
      weight: w.accuracy,
      contribution: accuracy * 100 * w.accuracy,
    },
  ];

  const penalties: FinalScore['penalties'] = [];
  if (save.missedDeadlines.length > 0)
    penalties.push({
      label: `${save.missedDeadlines.length} deadline(s) ratée(s)`,
      value: save.missedDeadlines.length * w.penaltyDeadline,
    });
  if (reassessments > 0)
    penalties.push({ label: `${reassessments} redressement(s)`, value: reassessments * w.penaltyReassessment });

  const total = Math.max(
    0,
    Math.round(parts.reduce((s, p) => s + p.contribution, 0) - penalties.reduce((s, p) => s + p.value, 0)),
  );

  let grade: FinalScore['grade'];
  if (total >= 80 && auditPassed && reassessments === 0) grade = 'S';
  else if (total >= 70) grade = 'A';
  else if (total >= 55) grade = 'B';
  else if (total >= 40) grade = 'C';
  else grade = 'D';

  return { total, grade, parts, penalties };
}
