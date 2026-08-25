// Portraits 3D : les fichiers de `public/portraits/` remplacent l'avatar SVG,
// qui reste le repli si une image manque. Le mapping suit le fichier Excel
// « CIR-Quest-Personnages-Prompts.xlsx ». Les images sont recadrées tête-épaules
// et servies en 320 px : elles s'affichent au plus grand en 150 px de diamètre.
//
// La table elle-même vit dans `data/portraits`, sans dépendance au navigateur :
// le moteur s'en sert pour n'attribuer que de vrais visages aux clients.

import { PORTRAIT_FILES } from '../data/portraits';

/**
 * Portraits embarqués directement dans la page, quand il y en a.
 *
 * La version hors ligne du jeu tient dans un seul fichier HTML : elle n'a
 * aucun serveur pour lui servir `portraits/dupuis-01.png`, et injecte donc les
 * images à la place. Le jeu servi sur le web ignore cette table et charge les
 * fichiers normalement.
 */
function inlined(): Record<string, string> | undefined {
  return (globalThis as { __PORTRAITS__?: Record<string, string> }).__PORTRAITS__;
}

function urlFor(file: string): string {
  return inlined()?.[file] ?? `${import.meta.env.BASE_URL}portraits/${file}`;
}

/** Tous les portraits disponibles — utilisé par la scène d'accueil. */
export function allPortraits(): string[] {
  return [...new Set(Object.values(PORTRAIT_FILES))].map(urlFor);
}

export function portraitUrl(seed: string): string | null {
  const file = PORTRAIT_FILES[seed];
  if (!file) return null;
  return urlFor(file);
}
