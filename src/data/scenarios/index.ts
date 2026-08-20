import type { Scenario } from '../../engine/types';
import { AGRI_DISCOVERY, AGRI_KICKOFF } from './agri';
import { SAAS_DISCOVERY, SAAS_KICKOFF } from './saas';
import { INDUS_DISCOVERY, INDUS_KICKOFF } from './indus';
import { BIOTECH_DISCOVERY, BIOTECH_KICKOFF } from './biotech';
import { GREEN_DISCOVERY, GREEN_KICKOFF } from './green';
import { SERVICES_DISCOVERY, SERVICES_KICKOFF } from './services';
import { GENERIC_FOLLOWUP, GENERIC_CLOSING } from './generic';
import { TUTORIAL, PROSPECT_CALL } from './misc';

export const SCENARIOS: Scenario[] = [
  TUTORIAL,
  PROSPECT_CALL,
  AGRI_DISCOVERY,
  AGRI_KICKOFF,
  SAAS_DISCOVERY,
  SAAS_KICKOFF,
  INDUS_DISCOVERY,
  INDUS_KICKOFF,
  BIOTECH_DISCOVERY,
  BIOTECH_KICKOFF,
  GREEN_DISCOVERY,
  GREEN_KICKOFF,
  SERVICES_DISCOVERY,
  SERVICES_KICKOFF,
  GENERIC_FOLLOWUP,
  GENERIC_CLOSING,
];

export function scenarioById(id: string): Scenario {
  const s = SCENARIOS.find((s) => s.id === id);
  if (!s) throw new Error(`Scénario inconnu : ${id}`);
  return s;
}
