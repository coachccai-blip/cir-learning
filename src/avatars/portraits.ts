// Portraits 3D optionnels : si un fichier existe dans public/portraits/, il
// remplace l'avatar SVG (qui reste le repli). Le mapping suit le fichier Excel
// « CIR-Quest-Personnages-Prompts.xlsx ».

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
  // PNJ secondaires (usage futur — priorité 2 de l'Excel)
  'Nadia Cherif (responsable qualité)': 'cherif-07.png',
  'Kevin (développeur front)': 'roy-09.png',
  'Dr. Amina Sy (directrice scientifique)': 'sy-dr-10.png',
  'Bruno (chef d’atelier)': 'meyer-atelier-11.png',
};

export function portraitUrl(seed: string): string | null {
  const file = PORTRAITS[seed];
  if (!file) return null;
  return `${import.meta.env.BASE_URL}portraits/${file}`;
}
