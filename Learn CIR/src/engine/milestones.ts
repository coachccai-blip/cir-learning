// Conséquences des échéances du calendrier (§4.4) et abandon des dossiers
// négligés. Rien ici n'est décoratif : chaque jalon a un effet mesurable, sinon
// le bandeau annonce une échéance qui ne se passe jamais.

import type { ClientState, Gauges } from './types';

/** Effet d'une échéance sur la partie, à appliquer par l'appelant. */
export interface MilestoneOutcome {
  /** Deadlines ratées à ajouter à la sauvegarde (pénalisent le score final). */
  missed: string[];
  gauges: Partial<Gauges>;
  /** Retouches par dossier : humeur, confiance, pièces devenues inopposables. */
  patches: { clientId: string; mood?: number; trust?: number; losePieces?: string[] }[];
  /** Ce que le joueur lit. Chaîne vide = l'échéance est passée sans dégât. */
  report: string;
}

const NONE: MilestoneOutcome = { missed: [], gauges: {}, patches: [], report: '' };

/** Un dossier encore ouvert, donc encore sous la responsabilité du joueur. */
function isOpen(cs: ClientState): boolean {
  return cs.dossierState !== 'CLOSED' && cs.dossierState !== 'DEPOSITED' && cs.dossierState !== 'LOST';
}

/**
 * Ce que coûte une échéance au moment où elle tombe. Fonction pure : elle décrit
 * l'effet, elle ne l'applique pas.
 */
export function resolveMilestone(id: string, portfolio: readonly ClientState[]): MilestoneOutcome {
  switch (id) {
    case 'ms_proposals': {
      // Revue de pipeline : un dossier jamais qualifié est un dossier qu'on n'a
      // pas su ouvrir. Sophie Meyer le remarque.
      const late = portfolio.filter((c) => c.dossierState === 'LEAD');
      if (late.length === 0) return { ...NONE, gauges: { relation: 4 }, report: 'Revue de pipeline : tout est qualifié, Sophie Meyer vous félicite.' };
      return {
        missed: late.map((c) => `pipeline_${c.clientId}`),
        gauges: { relation: -3 * late.length },
        patches: [],
        report: `Revue de pipeline : ${late.length} dossier(s) encore à l’état de lead. Sophie Meyer le note.`,
      };
    }

    case 'ms_kickoff': {
      // Un client qui a signé et qu'on n'a pas rappelé perd confiance, et son
      // dossier démarre sans cadrage.
      const cold = portfolio.filter((c) => c.dossierState === 'SIGNED');
      if (cold.length === 0) return { ...NONE, report: 'Toutes les missions signées sont lancées.' };
      return {
        missed: cold.map((c) => `kickoff_${c.clientId}`),
        gauges: { security: -4 * cold.length },
        patches: cold.map((c) => ({ clientId: c.clientId, mood: -12, trust: -6 })),
        report: `${cold.length} client(s) signé(s) attendent toujours leur kick-off. La confiance s’érode.`,
      };
    }

    case 'ms_timesheets': {
      // Les feuilles de temps se récupèrent pendant les travaux. Passé la date,
      // elles ne sont plus opposables — c'est la leçon centrale du jeu.
      const noFollowup = portfolio.filter((c) => isOpen(c) && !c.followupDone && c.dossierState !== 'LEAD' && c.dossierState !== 'QUALIFIED');
      if (noFollowup.length === 0) return { ...NONE, gauges: { security: 5 }, report: 'Feuilles de temps collectées partout : vos assiettes seront défendables.' };
      return {
        missed: noFollowup.map((c) => `timesheets_${c.clientId}`),
        gauges: { security: -6 },
        patches: noFollowup.map((c) => ({ clientId: c.clientId, losePieces: ['piece_feuilles_temps'] })),
        report: `${noFollowup.length} dossier(s) sans suivi de mission : les feuilles de temps ne sont plus opposables.`,
      };
    }

    case 'ms_deposit': {
      const undeposited = portfolio.filter(isOpen);
      if (undeposited.length === 0) return { ...NONE, report: 'Tous vos dossiers sont déposés.' };
      return {
        missed: undeposited.map((c) => `deposit_${c.clientId}`),
        gauges: {},
        patches: [],
        report: `${undeposited.length} dossier(s) non déposé(s) : le crédit est perdu pour cette année.`,
      };
    }

    // Ouverture et demande d'information n'ont pas d'effet direct ici :
    // la première ouvre la saison, la seconde déclenche le contrôle intermédiaire.
    default:
      return NONE;
  }
}

/**
 * Dossiers abandonnés faute d'attention. Un client encore ouvert qu'on n'a pas
 * touché depuis `graceCycles` cycles part à la concurrence : c'est la sanction
 * qui donne du poids à l'arbitrage de portefeuille.
 */
export function neglectedClients(
  portfolio: readonly ClientState[],
  cycle: number,
  graceCycles: number,
): ClientState[] {
  return portfolio.filter((c) => isOpen(c) && cycle - c.lastTouchedCycle >= graceCycles);
}
