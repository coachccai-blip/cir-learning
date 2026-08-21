// Quiz avant/après (§18.1, lot 10) : mesurer l'apprentissage.
// Les mêmes 5 questions sont posées au début et à la fin de la saison.

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
