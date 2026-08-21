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
};

/**
 * Voix à employer pour ce locuteur. « Le client » et « Le prospect » n'ont pas
 * de genre propre : ils empruntent celui de l'interlocuteur en cours.
 */
export function genderForSpeaker(speaker: string, contextGender: Gender = 'M'): Gender {
  return SPEAKER_GENDER[speaker] ?? contextGender;
}
