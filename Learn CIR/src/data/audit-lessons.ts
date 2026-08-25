// Le mot de la fin du vérificateur.
//
// Le contrôle s'arrêtait sur une liste de constats cochés et un montant. Or
// c'est la dernière scène du jeu : celle dont le joueur se souviendra. Le
// vérificateur y dit ce que la séance a montré, et explique la règle derrière
// chaque constat — il s'adresse à quelqu'un qui découvre le métier. Trois
// variantes par issue, tirées à la graine, pour qu'une partie rejouée ne se
// termine pas sur la même phrase.


/** Issue du contrôle, telle que `resolveAudit` la rend. */
export type AuditOutcome = 'validated' | 'partial' | 'total';

export interface AuditLesson {
  /** Ce que le vérificateur retient de la séance. */
  verdict: string;
  /** La règle que le joueur doit emporter. */
  lesson: string;
}

const ONBOARDING: Record<AuditOutcome, AuditLesson[]> = {
  validated: [
    {
      verdict:
        'Je n’ai rien à redresser. Ce n’est pas si fréquent, et ce n’est pas de la chance : à chaque question, vous aviez la pièce.',
      lesson:
        'Un dossier ne se défend pas le jour du contrôle. Il se défend le jour où on le monte, en gardant la trace de ce qu’on retient et de ce qu’on écarte.',
    },
    {
      verdict:
        'Rien à reprendre. Votre périmètre est étroit, et c’est précisément pour cela qu’il tient.',
      lesson:
        'Un montant plus petit et défendable vaut mieux qu’un montant flatteur qu’il faudra rendre, avec les intérêts.',
    },
    {
      verdict:
        'Vos réponses arrivaient avec le document. Je ne vais pas vous faire perdre davantage de temps.',
      lesson:
        'Ce que vous avez écarté vous a protégé autant que ce que vous avez retenu : un dossier où l’on voit les arbitrages désarme la moitié des questions.',
    },
  ],
  partial: [
    {
      verdict:
        'Une partie tient, une partie non. Vous avez su défendre ce qui était étayé, et pas le reste.',
      lesson:
        'Les constats que vous n’avez pas pu défendre portaient tous sur une pièce absente. Ce n’est pas une question de talent : c’est une question de collecte, faite pendant les travaux.',
    },
    {
      verdict:
        'Je retiens un rappel partiel. Votre dossier est honnête — il est simplement incomplet par endroits.',
      lesson:
        'L’honnêteté ne remplace pas la preuve. Une dépense réelle mais non tracée se traite au contrôle exactement comme une dépense inventée.',
    },
    {
      verdict:
        'Le cœur du dossier tient. Ce sont les marges qui lâchent, et ce sont toujours les mêmes.',
      lesson:
        'Agréments de sous-traitants et aides publiques concentrent l’essentiel des redressements. Deux vérifications au lancement vous en épargnent la moitié.',
    },
  ],
  total: [
    {
      verdict:
        'Le rappel est lourd. À presque chaque question, vous n’aviez rien à me montrer.',
      lesson:
        'Une assiette se construit sur des pièces, pas sur des déclarations. Sans feuilles de temps ni comptes rendus, il ne reste qu’un chiffre — et un chiffre seul ne se défend pas.',
    },
    {
      verdict:
        'Je redresse l’essentiel. Ce n’est pas votre bonne foi que je conteste, c’est l’absence de tout ce qui l’aurait établie.',
      lesson:
        'Rien de ce qui manquait aujourd’hui n’était introuvable il y a six mois. La preuve se constitue pendant les travaux, jamais après.',
    },
    {
      verdict:
        'Le dossier ne tient pas. Il était trop large dès le départ, et rien ne venait l’étayer.',
      lesson:
        'Retenir « pour voir » coûte toujours plus cher que de ne pas retenir. Un périmètre qu’on ne peut pas défendre entraîne avec lui celui qu’on aurait pu.',
    },
  ],
};

export const AUDIT_LESSONS: Record<AuditOutcome, AuditLesson[]> = ONBOARDING;
