// Genre des interlocuteurs non-clients, pour la lecture à haute voix.
// Les clients portent le leur sur leur fiche (`ClientDef.contact.gender`) ;
// ici vivent les PNJ internes et les figures de passage.

import type { Gender } from '../app/speech';

const SPEAKER_GENDER: Record<string, Gender> = {
  'Amélie Roux (manager)': 'F',
  'Karim Bensaïd (senior)': 'M',
  'Sophie Meyer (directrice de BU)': 'F',
  'Nadia Cherif (responsable qualité)': 'F',
  'Dr. Amina Sy (directrice scientifique)': 'F',
  'Kevin (développeur front)': 'M',
  'Bruno (chef d’atelier)': 'M',
  'Rémi (data scientist)': 'M',
  'L’assistante de direction': 'F',
  'Le commissaire aux comptes': 'M',
  'Le vérificateur': 'M',
  // Deuxième saison : le technicien qui contredit sa direction.
  'Tom Aubert': 'M',
  'Bruno Meyer': 'M',
};

/**
 * Voix à employer pour ce locuteur. « Le client » et « Le prospect » n'ont pas
 * de genre propre : ils empruntent celui de l'interlocuteur en cours.
 */
export function genderForSpeaker(speaker: string, contextGender: Gender = 'M'): Gender {
  return SPEAKER_GENDER[speaker] ?? contextGender;
}

/**
 * Libellés d'interlocuteur employés par les scénarios partagés. Ils n'ont pas
 * de genre propre : ils empruntent celui de la personne réellement en face.
 * « Le dirigeant » affiché au-dessus du portrait d'une directrice était une
 * incohérence à l'écran, alors que la voix, elle, était juste.
 */
const GENERIC_SPEAKERS = ['Le client', 'Le dirigeant', 'Le prospect', 'La cliente'];

export function isGenericSpeaker(speaker: string): boolean {
  return GENERIC_SPEAKERS.includes(speaker);
}

/** Nom à afficher : le vrai interlocuteur dès qu'on sait de qui il s'agit. */
export function displayedSpeaker(speaker: string, realName?: string): string {
  return realName && isGenericSpeaker(speaker) ? realName : speaker;
}
