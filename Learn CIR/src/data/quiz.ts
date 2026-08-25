// Quiz avant/après (§18.1, lot 10) : mesurer l'apprentissage.
//
// Deux jeux jumeaux, pas un seul posé deux fois : mêmes notions, cas
// différents. Reposer les mêmes questions mesurerait la mémoire d'un écran vu
// une heure plus tôt, pas la compétence acquise.

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q_verrou',
    question: 'Qu’est-ce qui caractérise le mieux un travail éligible au CIR ?',
    options: [
      'Le projet a été long et difficile pour les équipes',
      'Il lève une incertitude que l’état de l’art ne permet pas de résoudre',
      'C’est une nouveauté pour l’entreprise',
      'Le client y a consacré un gros budget',
    ],
    correct: 1,
    explanation:
      'La R&D éligible suppose un verrou technique et une incertitude sur l’aboutissement, pas une simple difficulté ni une nouveauté interne.',
  },
  {
    id: 'q_soustraitance',
    question: 'Une facture de sous-traitance est éligible au CIR si le prestataire…',
    options: [
      'a signé un devis détaillé',
      'est agréé par le MESR',
      'est une grande entreprise reconnue',
      'facture moins de 100 000 €',
    ],
    correct: 1,
    explanation:
      'Depuis 2022, tout sous-traitant (public ou privé) doit être agréé MESR. Sans agrément, la dépense est exclue, même si les travaux sont réels.',
  },
  {
    id: 'q_supprimes',
    question: 'Parmi ces postes, lequel n’est PLUS dans l’assiette du CIR depuis 2025 ?',
    options: [
      'Les salaires des chercheurs',
      'Les dotations aux amortissements R&D',
      'Les frais de brevet et la veille technologique',
      'La sous-traitance agréée',
    ],
    correct: 2,
    explanation:
      'La LF 2025 a supprimé les frais de brevet, la veille technologique et la majoration jeune docteur pour les dépenses exposées à compter du 15/02/2025.',
  },
  {
    id: 'q_subvention',
    question: 'Une subvention publique reçue sur un projet R&D…',
    options: [
      'n’a aucun impact sur le CIR',
      'se déduit de l’assiette à hauteur de sa part R&D',
      'augmente l’assiette du CIR',
      'doit être remboursée à l’administration',
    ],
    correct: 1,
    explanation:
      'Les subventions publiques se déduisent de l’assiette (quote-part R&D). Les oublier est le motif de redressement le plus fréquent.',
  },
  {
    id: 'q_promesse',
    question: 'En rendez-vous, quelle est la meilleure façon d’annoncer un montant de CIR ?',
    options: [
      'Un chiffre précis et optimiste pour rassurer le client',
      'Une fourchette prudente, à confirmer après les feuilles de temps',
      'Le montant le plus élevé possible pour signer',
      'Ne jamais donner d’ordre de grandeur',
    ],
    correct: 1,
    explanation:
      'Une estimation engage autant qu’un chiffre écrit. Une fourchette prudente coûte peu ; un chiffre précis trop tôt crée une dette de promesse.',
  },
];

/**
 * Quiz de sortie : question par question, la même notion que `QUIZ`, sur un cas
 * différent. L'ordre est aligné pour que la comparaison avant/après reste
 * lisible à l'écran de fin.
 */
export const QUIZ_POST: QuizQuestion[] = [
  {
    id: 'q_verrou_post',
    question: 'Un client a passé huit mois sur un logiciel de facturation. Qu’est-ce qui déciderait de son éligibilité ?',
    options: [
      'Le nombre de jours-hommes réellement consommés sur le projet',
      'Le fait que ce logiciel n’existait pas encore dans l’entreprise',
      'L’existence d’un problème que l’état de l’art ne savait pas résoudre',
      'Le budget de développement engagé par la direction générale',
    ],
    correct: 2,
    explanation:
      'Ni la durée, ni la nouveauté interne, ni le budget ne fondent l’éligibilité : c’est l’incertitude que l’état de l’art ne lève pas.',
  },
  {
    id: 'q_soustraitance_post',
    question: 'Votre client a sous-traité des essais à un laboratoire privé réputé, sans agrément MESR. Que retenez-vous ?',
    options: [
      'Rien : sans agrément, la dépense n’entre pas dans l’assiette',
      'La totalité, la réputation du laboratoire valant garantie',
      'La moitié, au titre d’un partage de risque raisonnable',
      'Tout, à condition que la facture soit détaillée poste par poste',
    ],
    correct: 0,
    explanation:
      'L’agrément MESR est une condition, pas un confort : sans lui, la sous-traitance est intégralement exclue depuis 2022.',
  },
  {
    id: 'q_supprimes_post',
    question: 'Votre client veut inscrire ses frais de dépôt de brevet 2025 dans l’assiette. Vous répondez…',
    options: [
      'Oui, les frais de brevet restent un poste classique de l’assiette',
      'Oui, mais seulement pour la part déposée à l’étranger',
      'Non, ces frais sont sortis de l’assiette depuis le 15 février 2025',
      'Oui, à hauteur du forfait de fonctionnement de 40 %',
    ],
    correct: 2,
    explanation:
      'Frais de brevet, veille technologique et majoration jeune docteur ont quitté l’assiette au 15/02/2025.',
  },
  {
    id: 'q_subvention_post',
    question: 'Une avance remboursable de l’ADEME a été octroyée en octobre, remboursable en 2029. Quand la déduisez-vous ?',
    options: [
      'En 2029, l’année du remboursement effectif',
      'Dès l’octroi, sur l’exercice où l’aide est accordée',
      'Jamais : une avance se rembourse, elle ne minore pas l’assiette',
      'À parts égales sur toute la durée de l’avance',
    ],
    correct: 1,
    explanation:
      'Une avance remboursable se déduit dès son octroi. Attendre le remboursement gonfle l’assiette de l’année.',
  },
  {
    id: 'q_promesse_post',
    question: 'Un dirigeant vous demande un montant pour son conseil d’administration de demain. Que faites-vous ?',
    options: [
      'Vous donnez le montant brut, quitte à préciser les déductions plus tard',
      'Vous refusez tout chiffre tant que les pièces ne sont pas toutes vues',
      'Vous donnez une fourchette nette, écrite comme estimation non définitive',
      'Vous donnez le chiffre qu’il espère, pour ne pas fragiliser la relation',
    ],
    correct: 2,
    explanation:
      'Une fourchette nette et qualifiée rend service sans créer de dette de promesse — ni le brut, ni le silence, ni la complaisance.',
  },
];
