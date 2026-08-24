// Le mot de la fin du vérificateur.
//
// Le contrôle s'arrêtait sur une liste de constats cochés et un montant. Or
// c'est la dernière scène du jeu : celle dont le joueur se souviendra. Le
// vérificateur y dit ce que la séance a montré — et il ne le dit pas de la
// même manière selon la saison.
//
// En première saison, il s'adresse à quelqu'un qui découvre : il explique la
// règle derrière le constat. En deuxième, il s'adresse à un professionnel :
// il ne réexplique rien, il situe le travail. Trois variantes par cas, tirées
// à la graine, pour qu'une saison rejouée ne se termine pas sur la même phrase.

import type { GameMode } from '../engine/types';

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

const EXPERT: Record<AuditOutcome, AuditLesson[]> = {
  validated: [
    {
      verdict:
        'Rien à redresser, sur un dossier de cette complexité. Vous avez tenu la contradiction jusqu’au bout.',
      lesson:
        'Vous avez cessé de monter des dossiers pour commencer à les défendre. C’est exactement ce qui sépare la deuxième année de la première.',
    },
    {
      verdict:
        'Je n’emporte rien. Vos retraits étaient documentés, et c’est ce qui a rendu vos maintiens crédibles.',
      lesson:
        'Ce que vous écartez, écrit noir sur blanc, protège ce que vous gardez. Un dossier sans arbitrage visible se lit comme un dossier non trié.',
    },
    {
      verdict:
        'Vous avez répondu sur le texte, pas sur l’intention. C’est le seul terrain où je ne peux rien contre vous.',
      lesson:
        'Face à l’administration, l’argument d’autorité ne pèse rien et la bonne foi ne prouve rien. Seule la règle, citée et appliquée, tranche.',
    },
  ],
  partial: [
    {
      verdict:
        'Rappel partiel. Vous avez rectifié en séance ce que vous ne pouviez pas tenir — c’est un réflexe de professionnel.',
      lesson:
        'Reconnaître un constat n’efface pas le rappel, mais reconnaître trop tard le double. Ce que vous cédez au bon moment, vous ne le payez qu’une fois.',
    },
    {
      verdict:
        'Une part tombe. Ce sont les postes que vous aviez repris d’un tiers sans les revérifier vous-même.',
      lesson:
        'Un chiffre transmis par le client, ou par un confrère, engage celui qui le dépose. Le déclarant, c’est vous.',
    },
    {
      verdict:
        'Je redresse une fraction. Sur le reste, vous saviez de quoi vous parliez, et cela s’entend.',
      lesson:
        'Les dossiers denses se perdent toujours sur la même chose : le rang de sous-traitance, l’entité liée, la date où la recherche s’arrête. Trois vérifications, trois rappels évités.',
    },
  ],
  total: [
    {
      verdict:
        'Le rappel est lourd, et vous n’ignoriez rien de ce que je vous ai opposé. C’est plus grave qu’une erreur de débutant.',
      lesson:
        'Un consultant expérimenté qui suit son client dans son optimisme n’est plus un conseil : il est le maillon qui a validé le dossier. C’est vous que l’on cherchera.',
    },
    {
      verdict:
        'Tout tombe. Vous avez repris des taux que vos propres pièces contredisaient.',
      lesson:
        'Un tableau transmis par le client n’est pas une preuve : c’est une prétention. La preuve, c’est le planning, le relevé, le dépôt — ce que personne n’a écrit pour vous plaire.',
    },
    {
      verdict:
        'Je redresse l’intégralité. Le périmètre était intenable, et vous aviez les moyens de le savoir.',
      lesson:
        'Savoir dire non se paie une fois, à la signature. Ne pas savoir le dire se paie trois ans plus tard, avec les intérêts, et devant le client.',
    },
  ],
};

export const AUDIT_LESSONS: Record<GameMode, Record<AuditOutcome, AuditLesson[]>> = {
  onboarding: ONBOARDING,
  expert: EXPERT,
};
