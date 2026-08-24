// Portraits 3D : les fichiers de `public/portraits/` remplacent l'avatar SVG,
// qui reste le repli si une image manque. Le mapping suit le fichier Excel
// « CIR-Quest-Personnages-Prompts.xlsx ». Les images sont recadrées tête-épaules
// et servies en 320 px : elles s'affichent au plus grand en 150 px de diamètre.
//
// La table elle-même vit dans `data/portraits`, sans dépendance au navigateur :
// le moteur s'en sert pour n'attribuer que de vrais visages aux clients.

import { PORTRAIT_FILES } from '../data/portraits';

/** Tous les portraits disponibles — utilisé par la scène d'accueil. */
export const ALL_PORTRAITS: string[] = [...new Set(Object.values(PORTRAIT_FILES))].map(
  (f) => `${import.meta.env.BASE_URL}portraits/${f}`,
);

export function portraitUrl(seed: string): string | null {
  const file = PORTRAIT_FILES[seed];
  if (!file) return null;
  return `${import.meta.env.BASE_URL}portraits/${file}`;
}
