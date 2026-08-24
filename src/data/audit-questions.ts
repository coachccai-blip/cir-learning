// Vivier de questions du vérificateur.
//
// Chaque constat n'avait qu'une seule formulation : rejouer une saison, ou
// simplement commettre deux fois la même erreur dans la même partie, donnait
// mot pour mot la même question. Le contrôle sonnait comme un formulaire.
//
// Vingt formulations vivent ici, réparties sur les six familles de constats.
// Le moteur en tire une, de façon déterministe à partir de la graine de la
// partie et de l'identifiant du constat : deux parties ne posent pas les mêmes
// questions, mais une même partie rejouée à l'identique, si.
//
// Le fond ne change jamais — c'est toujours la même règle qui est opposée. Ce
// qui varie, c'est l'angle d'attaque : la pièce réclamée, la date, la méthode,
// le raisonnement.

import type { FindingFamily } from './audit-relances';

export interface QuestionContext {
  /** Ce dont on parle : un travail, un poste, un prestataire, une personne. */
  label: string;
  /** Montant en jeu, quand le constat en porte un. */
  amount?: number;
  /** Taux d'affectation revendiqué, pour les constats de personnel. */
  ratio?: number;
  /** Le joueur détient-il la pièce qui contredit sa propre déclaration ? */
  hasEvidence?: boolean;
}

const euros = (n: number) => `${n.toLocaleString('fr-FR')} €`;

/**
 * Vingt questions, trois à quatre par famille. Toutes posent la même exigence
 * de preuve ; aucune ne la pose de la même manière.
 */
export const AUDIT_QUESTIONS: Record<FindingFamily, ((c: QuestionContext) => string)[]> = {
  card: [
    (c) =>
      `Vous avez retenu « ${c.label} » dans l'assiette R&D. Où sont l'état de l'art et le verrou technique de ces travaux ?`,
    (c) =>
      `Reprenons « ${c.label} ». Quelle incertitude scientifique ces travaux levaient-ils, que l'état de l'art ne résolvait pas ?`,
    (c) =>
      `Sur « ${c.label} », dites-moi ce qui a été tenté et qui n'a pas fonctionné. Une recherche laisse des impasses.`,
    (c) =>
      `« ${c.label} » : qu'est-ce qui distingue ces travaux de ce que ferait un professionnel compétent du secteur ?`,
  ],
  decoy: [
    (c) =>
      `Votre assiette intègre « ${c.label} ». Ce poste a été supprimé de l'assiette du CIR. Qu'avez-vous à dire ?`,
    (c) =>
      `Je lis « ${c.label} » dans votre 2069-A. Sur quel texte en vigueur cette année vous appuyez-vous ?`,
    (c) =>
      `« ${c.label} » n'a plus sa place dans l'assiette. Depuis quand ce poste figure-t-il dans vos déclarations ?`,
  ],
  sub: [
    (c) =>
      `Vous avez retenu la facture de ${c.label}. Pouvez-vous produire son agrément MESR en cours de validité ?`,
    (c) =>
      `${c.label} : à quelle date avez-vous vérifié son agrément, et sur quel document ?`,
    (c) =>
      `Les travaux confiés à ${c.label} sont-ils facturés en premier rang, ou par l'intermédiaire d'un autre prestataire ?`,
    (c) =>
      `Sur ${c.label}, montrez-moi le contrat : quelle part relève de la recherche, et quelle part de la prestation courante ?`,
  ],
  grant: [
    (c) =>
      `${c.label} a versé ${euros(c.amount ?? 0)} sur ces travaux. Pourquoi cette somme n'apparaît-elle pas en déduction de l'assiette ?`,
    (c) =>
      `Je ne trouve aucune déduction au titre de ${c.label}. Produisez-moi la convention et sa clé d'affectation.`,
    (c) =>
      `${c.label} finance une partie de ces dépenses. Expliquez-moi comment la même dépense peut être financée deux fois.`,
  ],
  pers: [
    (c) =>
      `${c.label} est valorisé à ${Math.round((c.ratio ?? 0) * 100)} % de temps R&D. ${
        c.hasEvidence
          ? 'Vos propres feuilles de temps indiquent un taux inférieur. Comment l’expliquez-vous ?'
          : 'Sur quelles feuilles de temps vous appuyez-vous ?'
      }`,
    (c) =>
      `Détaillez-moi le mois de mars de ${c.label} : combien de jours de recherche, combien de jours de production ?`,
    (c) =>
      `Qui a établi le taux de ${c.label}, et à quel moment : pendant les travaux, ou au moment de la déclaration ?`,
  ],
  doc: [
    () =>
      'Votre dossier évoque une démarche expérimentale. Produisez-moi les comptes rendus d’essais et les hypothèses testées.',
    () =>
      'Montrez-moi une trace datée de l’année contrôlée : cahier de laboratoire, compte rendu, relevé d’essai. Une seule suffira pour commencer.',
    () =>
      'Vous décrivez des essais successifs. Où sont consignés les résultats négatifs ? Ce sont eux qui prouvent la recherche.',
  ],
};

/** Nombre total de formulations disponibles, toutes familles confondues. */
export const AUDIT_QUESTION_COUNT = Object.values(AUDIT_QUESTIONS).reduce(
  (n, list) => n + list.length,
  0,
);
