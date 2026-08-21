// Relances du vérificateur — contrôle contradictoire (deuxième saison).
//
// En Onboarding, chaque constat se règle en une question : le joueur défend ou
// subit. C'est une caricature de contrôle. En Expert, le vérificateur relance :
// une fois le constat posé, il demande ce que le conseil propose. Reconnaître
// l'erreur, la chiffrer et proposer la rectification atténue le rappel —
// c'est exactement ce que fait un consultant en séance contradictoire.
//
// Les textes vivent ici, pas dans le moteur : `buildAuditFindings` les
// rattache aux constats qu'il fabrique.

export type FindingFamily = 'card' | 'decoy' | 'sub' | 'grant' | 'pers' | 'doc';

export interface Relance {
  question: string;
  goodAnswer: string;
  weakAnswers: string[];
}

export const RELANCES: Record<FindingFamily, Relance> = {
  card: {
    question:
      'Admettons. Que proposez-vous pour ces travaux, maintenant que nous sommes d’accord qu’ils ne relèvent pas de la recherche ?',
    goodAnswer:
      'Je les sors de l’assiette et vous remets une note qui isole leur montant, poste par poste.',
    weakAnswers: [
      'Je vous propose de les laisser et de trancher au moment du rappel.',
      'Nous pourrions les reclasser en innovation, ce serait plus simple.',
      'Le client tient beaucoup à ces travaux, je préfère ne rien retirer.',
    ],
  },
  decoy: {
    question:
      'Ce poste n’existe plus dans l’assiette depuis 2025. Comment corrigez-vous, et pour quelles autres années ?',
    goodAnswer:
      'Je le retire de l’exercice contrôlé et je vérifie les exercices ouverts avant votre demande.',
    weakAnswers: [
      'Je le retire pour cette année, les autres exercices ne vous regardent pas.',
      'Je préfère attendre votre proposition de rectification avant de bouger.',
      'C’est une erreur de reprise, elle se corrigera d’elle-même l’an prochain.',
    ],
  },
  sub: {
    question:
      'Sans agrément, la dépense sort. Comment traitez-vous le reste de la chaîne de sous-traitance ?',
    goodAnswer:
      'Je sors cette facture et je produis les attestations d’agrément de tous les autres prestataires.',
    weakAnswers: [
      'Je sors cette facture, les autres prestataires ne posent aucune difficulté.',
      'Je vous propose de retenir la moitié du montant, à titre de compromis.',
      'Nous demandons l’agrément au prestataire, il devrait l’obtenir cette année.',
    ],
  },
  grant: {
    question:
      'Cette aide devait minorer l’assiette. Quelle correction proposez-vous, et sur quelle base ?',
    goodAnswer:
      'Je déduis le montant affecté à la R&D et je vous transmets la convention qui fixe la clé.',
    weakAnswers: [
      'Je déduis l’aide entière, cela ira plus vite pour tout le monde.',
      'Je propose de la déduire l’année où le client la remboursera effectivement.',
      'La convention est introuvable, nous retiendrons le montant que vous voudrez.',
    ],
  },
  pers: {
    question:
      'Le taux ne tient pas. Sur quelle base le rectifiez-vous, et comment le documentez-vous ?',
    goodAnswer:
      'Je retiens le taux issu des relevés d’activité et je joins le détail par personne et par mois.',
    weakAnswers: [
      'Je propose de descendre le taux de dix points, cela devrait suffire.',
      'Je maintiens le taux : c’est la direction qui l’a déclaré, pas moi.',
      'Nous ferons signer une attestation rétroactive par les personnes concernées.',
    ],
  },
  doc: {
    question:
      'Votre dossier annonce une démarche expérimentale que rien n’étaie. Que me proposez-vous ?',
    goodAnswer:
      'Je vous remets les traces existantes, datées, et je renonce aux travaux que rien n’étaie.',
    weakAnswers: [
      'Je vous reconstitue un dossier complet sous quinze jours, avec les équipes.',
      'Les travaux ont bien eu lieu : je maintiens l’intégralité de l’assiette.',
      'Le chef de projet peut vous expliquer la démarche de vive voix, cela suffira.',
    ],
  },
};
