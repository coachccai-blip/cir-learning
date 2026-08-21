// Mémoire relationnelle (§8.3) : les PNJ citent explicitement les flags et les
// promesses au rendez-vous suivant. C'est ce qui rend la relation crédible.

import type { ClientState, ScenarioType } from '../engine/types';
import { clientById } from './clients';

/** Phrases de rappel par flag, dites par le PNJ en ouverture d'entretien. */
const FLAG_RECALLS: Record<string, string> = {
  a_demande_les_echecs:
    'La dernière fois, vous m’aviez demandé aussi nos projets abandonnés. J’ai préparé la liste — il y en a deux qui devraient vous intéresser.',
  a_dit_non:
    'Je n’ai pas oublié que vous avez su me dire non. C’est pour ça que vous êtes encore là.',
};

/** Contexte spécifique par client pour le suivi de mission (personnalise le générique). */
const FOLLOWUP_CONTEXT: Record<string, string> = {
  cli_agri_dupuis: 'Marc vous accueille entre deux essais de production, toujours aussi enthousiaste.',
  cli_saas_nexalog: 'Elsa a ouvert trois dashboards avant même que vous soyez assis.',
  cli_indus_verdier: 'Hervé a préparé un classeur étiqueté « CIR — preuves ». Il vous observe.',
  cli_biotech_cellvia: 'Laurent a votre échéancier de trésorerie sous les yeux, surligné.',
  cli_green_solterra: 'Marion vous accorde le créneau entre deux comités. Le chrono tourne.',
  cli_services_datao: 'Paul vous fait signe d’entrer. Toujours aussi peu bavard.',
};

const CLOSING_CONTEXT: Record<string, string> = {
  cli_agri_dupuis: 'Le moment de vérité pour Maison Dupuis : Marc attend « son chiffre » avec un grand sourire.',
  cli_saas_nexalog: 'Elsa veut le montant — et le détail du calcul, évidemment.',
  cli_indus_verdier: 'Hervé veut le chiffre, et surtout la preuve que chaque euro tiendra au contrôle.',
  cli_biotech_cellvia: 'Laurent a déjà mis à jour son plan de trésorerie. Il attend le montant net.',
  cli_green_solterra: 'Marion a dix minutes. Le chiffre, l’écart éventuel, la suite.',
  cli_services_datao: 'Paul vous reçoit calmement. Le dossier était petit ; reste à conclure proprement.',
};

export interface Recall {
  speaker: string;
  text: string;
}

/**
 * Construit les répliques de rappel du PNJ pour un entretien donné :
 * promesse chiffrée d'abord (la plus engageante), puis un flag mémorisé.
 */
export function buildRecalls(cs: ClientState, scenarioType: ScenarioType): Recall[] {
  const client = clientById(cs.clientId);
  const recalls: Recall[] = [];

  if (cs.promise && (scenarioType === 'FOLLOWUP' || scenarioType === 'CLOSING')) {
    const { min, max, kind } = cs.promise;
    recalls.push({
      speaker: client.contact.name,
      text:
        kind === 'precise'
          ? `Au fait — vous m’aviez annoncé ${min.toLocaleString('fr-FR')} €. Je l’ai déjà répété à tout le monde ici, ne me faites pas mentir.`
          : `Vous m’aviez parlé d’une fourchette de ${min.toLocaleString('fr-FR')} à ${max.toLocaleString('fr-FR')} €. On est toujours dedans ?`,
    });
  }

  for (const flag of cs.flags) {
    const line = FLAG_RECALLS[flag];
    if (line) {
      recalls.push({ speaker: client.contact.name, text: line });
      break; // un seul rappel de flag, le premier trouvé
    }
  }

  return recalls;
}

/** Contexte d'ambiance spécifique client pour les scénarios génériques. */
export function clientContext(clientId: string, scenarioType: ScenarioType): string | null {
  if (scenarioType === 'FOLLOWUP') return FOLLOWUP_CONTEXT[clientId] ?? null;
  if (scenarioType === 'CLOSING') return CLOSING_CONTEXT[clientId] ?? null;
  return null;
}
