// Variantes des dossiers écrits à la main, recalculées à l'identique depuis la
// graine à chaque chargement : rien de tout cela n'a besoin d'être persisté.
//
// Ce registre servait aussi les clients fabriqués à partir d'un prospect
// converti. Ces dossiers-là entraient au portefeuille déjà signés et sautaient
// le rendez-vous de découverte et la proposition : le joueur voyait apparaître
// un client qu'il n'avait jamais rencontré. Les clients sont désormais tous
// écrits à la main, et le registre n'a plus qu'un rôle.

import type { AssietteCase } from '../engine/types';

const varied = new Map<string, AssietteCase>();

/** Installe les variantes de la partie en cours (remplace les précédentes). */
export function loadCaseVariations(cases: readonly AssietteCase[]): void {
  varied.clear();
  for (const c of cases) varied.set(c.id, c);
}

export function variedCase(id: string): AssietteCase | undefined {
  return varied.get(id);
}
