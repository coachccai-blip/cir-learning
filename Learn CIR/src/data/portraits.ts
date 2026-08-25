// Index des portraits disponibles (fichiers de `public/portraits/`).
//
// Cette table est volontairement dépourvue de toute dépendance au navigateur :
// le moteur doit pouvoir répondre à « ce visage existe-t-il vraiment ? » sans
// passer par l'affichage. `src/avatars/portraits.ts` s'en sert pour fabriquer
// les URL, la génération de prospects pour n'attribuer que de vrais visages.

export const PORTRAIT_FILES: Record<string, string> = {
  // Clients écrits (avatarSeed → fichier)
  'dupuis-01': 'dupuis-01.png',
  'brunet-02': 'brunet-02.png',
  'verdier-03': 'verdier-03.png',
  'kaplan-04': 'kaplan-04.png',
  'vasseur-05': 'vasseur-05.png',
  'lenoir-06': 'lenoir-06.png',
  // PNJ internes (seed = nom du speaker dans les dialogues)
  'Amélie Roux (manager)': 'roux-mgr.png',
  'Karim Bensaïd (senior)': 'bensaid-sr.png',
  'Sophie Meyer (directrice de BU)': 'meyer-bu.png',
  'verificateur-dgfip': 'verificateur.png',
  // Visages attribués aux prospects générés (révélés à la signature)
  'prospect-f-01': 'prospect-f-01.png',
  'prospect-f-02': 'prospect-f-02.png',
  'prospect-f-03': 'prospect-f-03.png',
  'prospect-f-04': 'prospect-f-04.png',
  'prospect-m-01': 'prospect-m-01.png',
  'prospect-m-02': 'prospect-m-02.png',
  'prospect-m-03': 'prospect-m-03.png',
  'prospect-m-04': 'prospect-m-04.png',
  // Visages de second plan, réutilisés par les PNJ des entretiens.
  'cherif-07': 'cherif-07.png',
  'roy-09': 'roy-09.png',
  'sy-dr-10': 'sy-dr-10.png',
  'meyer-atelier-11': 'meyer-atelier-11.png',
  'aubert-08': 'aubert-08.png',
  // PNJ secondaires (priorité 2 de l'Excel)
  'Nadia Cherif (responsable qualité)': 'cherif-07.png',
  'Kevin (développeur front)': 'roy-09.png',
  'Dr. Amina Sy (directrice scientifique)': 'sy-dr-10.png',
  'Bruno (chef d’atelier)': 'meyer-atelier-11.png',
  'Tom Aubert (technicien de labo)': 'aubert-08.png',
};

/**
 * Ce visage correspond-il à une vraie photo, ou faudrait-il retomber sur
 * l'avatar dessiné ? Un prospect ne peut devenir client qu'au premier cas :
 * un portefeuille de visages générés ne ressemble pas à un portefeuille.
 */
export function hasRealPortrait(seed: string | undefined): boolean {
  return seed !== undefined && seed in PORTRAIT_FILES;
}

/** Visages réservés aux prospects générés, par genre. */
export const PROSPECT_PORTRAITS: Record<'F' | 'M', string[]> = {
  F: Object.keys(PORTRAIT_FILES).filter((s) => s.startsWith('prospect-f-')),
  M: Object.keys(PORTRAIT_FILES).filter((s) => s.startsWith('prospect-m-')),
};
