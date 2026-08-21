// Registre des dossiers générés en cours de partie (prospects convertis en
// clients). Les catalogues statiques restent la source de vérité du contenu
// écrit à la main ; ce registre les complète pour la durée de la session, et
// il est réalimenté depuis la sauvegarde à chaque chargement.

import type { AssietteCase, Cardset, ClientDef, GeneratedClientBundle } from '../engine/types';

const clients = new Map<string, ClientDef>();
const cases = new Map<string, AssietteCase>();
const cardsets = new Map<string, Cardset>();

/** Réalimente le registre depuis la sauvegarde (remplace le contenu précédent). */
export function loadGeneratedClients(bundles: readonly GeneratedClientBundle[]): void {
  clients.clear();
  cases.clear();
  cardsets.clear();
  for (const b of bundles) registerGeneratedClient(b);
}

export function registerGeneratedClient(b: GeneratedClientBundle): void {
  clients.set(b.client.id, b.client);
  cases.set(b.case.id, b.case);
  cardsets.set(b.cardset.id, b.cardset);
}

export function generatedClient(id: string): ClientDef | undefined {
  return clients.get(id);
}
export function generatedCase(id: string): AssietteCase | undefined {
  return cases.get(id);
}
export function generatedCardset(id: string): Cardset | undefined {
  return cardsets.get(id);
}
export function generatedClients(): ClientDef[] {
  return [...clients.values()];
}
