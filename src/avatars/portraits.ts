// Portraits 3D : les 23 fichiers de public/portraits/ remplacent l'avatar SVG,
// qui reste le repli si une image manque. Le mapping suit le fichier Excel
// « CIR-Quest-Personnages-Prompts.xlsx ». Les images sont recadrées tête-épaules
// et servies en 320 px : elles s'affichent au plus grand en 150 px de diamètre.

const PORTRAITS: Record<string, string> = {
  // Clients (avatarSeed → fichier)
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
  // Clients issus de prospection (portrait révélé à la signature)
  'prospect-f-01': 'prospect-f-01.png',
  'prospect-f-02': 'prospect-f-02.png',
  'prospect-f-03': 'prospect-f-03.png',
  'prospect-f-04': 'prospect-f-04.png',
  'prospect-m-01': 'prospect-m-01.png',
  'prospect-m-02': 'prospect-m-02.png',
  'prospect-m-03': 'prospect-m-03.png',
  'prospect-m-04': 'prospect-m-04.png',
  // Deuxième saison (mode Expert) : les figures secondaires de la première
  // saison passent au premier plan, dans d'autres maisons et d'autres rôles.
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

/** Tous les portraits disponibles — utilisé par la scène d'accueil. */
export const ALL_PORTRAITS: string[] = [...new Set(Object.values(PORTRAITS))].map(
  (f) => `${import.meta.env.BASE_URL}portraits/${f}`,
);

export function portraitUrl(seed: string): string | null {
  const file = PORTRAITS[seed];
  if (!file) return null;
  return `${import.meta.env.BASE_URL}portraits/${file}`;
}
