import type { Scenario } from '../../engine/types';
import { choice, DEFAULT_OUTCOME } from './helpers';

// Cellvia — Laurent Kaplan, CFO (veut du cash, des délais, un risque quantifié).

export const BIOTECH_DISCOVERY: Scenario = {
  id: 'sc_biotech_disc',
  type: 'DISCOVERY',
  clientId: 'cli_biotech_cellvia',
  title: 'Rendez-vous découverte — Cellvia Therapeutics',
  context: 'Laurent Kaplan, DAF, brûle du cash Bpifrance. Il veut un calendrier de trésorerie et un risque chiffré. Dossier riche : sous-traitance agréée, subventions, docteurs.',
  objectives: ['Parler cash et calendrier', 'Anticiper la déduction des aides', 'Quantifier le risque honnêtement'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Laurent Kaplan',
      expression: 'neutre',
      text: 'Je vais droit au but : combien de cash, et quand ? On lève dans six mois, chaque euro compte.',
      choices: [
        choice('optimal', 'synthese', 'PME, vous avez droit au remboursement immédiat : je vous fais un calendrier et un risque chiffré.', { relation: 6, security: 6, profitability: 3, mood: 5, trust: 5 }, { what: 'Vous parlez sa langue.', why: 'Le CFO veut cash + délai + risque, dans cet ordre.', rule: 'Le remboursement immédiat PME est un argument de trésorerie clé.', codexUnlock: 'cdx_calendrier' }, 'n2'),
        choice('acceptable', 'preuve', 'Le montant dépend de l’assiette nette des aides : fourchette et calendrier dès les pièces vues.', { security: 8, mood: 2, trust: 3 }, { what: 'Vous restez factuel.', why: 'Solide, un peu moins orienté trésorerie.', rule: 'L’assiette se calcule nette des aides.' }, 'n2'),
        choice('tempting', 'commercial', 'Beaucoup de cash, très vite : vous allez adorer, c’est le plus beau dossier du moment.', { relation: 6, security: -10, mood: 3 }, { what: 'Vous survendez.', why: 'Un CFO se méfie d’un vendeur qui promet « beaucoup, vite ».', rule: 'Le CFO veut un chiffre étayé, pas de l’enthousiasme.' }, 'n2'),
        choice('poor', 'empathie', 'Ne pensons pas trop au risque tout de suite, concentrons-nous plutôt sur le positif.', { relation: -6, security: -6, mood: -4 }, { what: 'Vous éludez le risque.', why: 'Un DAF exige justement le risque quantifié.', rule: 'On ne cache pas le risque à un CFO.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Laurent Kaplan',
      expression: 'neutre',
      text: 'On a une grosse subvention Bpifrance et une avance remboursable de la Région. Ça change quoi au chiffre ?',
      choices: [
        choice('optimal', 'preuve', 'Les deux se déduisent de l’assiette : la subvention au prorata R&D, l’avance dès son octroi.', { relation: 4, security: 12, mood: 4, trust: 5 }, { what: 'Vous intégrez les déductions.', why: 'Oublier de déduire une aide est le redressement n°1.', rule: 'Subventions et avances remboursables se déduisent.', codexUnlock: 'cdx_subventions' }, 'n3'),
        choice('acceptable', 'synthese', 'On déduira les deux de l’assiette ; je vous montrerai l’effet exact sur le montant net.', { security: 8, trust: 3 }, { what: 'Vous annoncez la déduction.', why: 'Correct.', rule: 'Le net d’aides est le vrai chiffre.', codexUnlock: 'cdx_avances' }, 'n3'),
        choice('tempting', 'commercial', 'On peut « oublier » l’avance remboursable pour maximiser le chiffre, ça reste entre nous.', { relation: 4, security: -16, mood: 2 }, { what: 'Vous proposez une fraude.', why: 'Ne pas déduire une aide connue est frauduleux.', rule: 'On ne dissimule jamais une aide publique.' }, 'n3'),
        choice('poor', 'fermete', 'Les aides et le CIR, ça n’a rien à voir : on ne touche à rien de ce côté-là.', { security: -14 }, { what: 'Vous vous trompez.', why: 'Aides et CIR interagissent directement via l’assiette.', rule: 'Les aides publiques minorent l’assiette.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Laurent Kaplan',
      expression: 'neutre',
      text: 'Nos essais in vivo sont sous-traités à une CRO, et un peu à notre filiale. Et on a des docteurs. Des pièges ?',
      choices: [
        choice('optimal', 'preuve', 'CRO agréée, filiale = entité liée donc plafond à 2 M€, et plus de majoration jeune docteur.', { relation: 4, security: 12, mood: 4, trust: 6 }, { what: 'Vous couvrez les trois pièges.', why: 'Entités liées, agrément, jeune docteur : les vrais points d’un dossier biotech.', rule: 'Le salaire du docteur reste éligible ; le ×2, non.', codexUnlock: 'cdx_jeune_docteur' }, 'n4'),
        choice('acceptable', 'technique', 'On vérifiera l’agrément de la CRO et le lien avec la filiale ; pas de majoration docteur.', { security: 10, trust: 3 }, { what: 'Vous identifiez les points durs.', why: 'Bonne couverture technique.', rule: 'Entité liée = plafond abaissé à 2 M€.', codexUnlock: 'cdx_st_plafonds' }, 'n4'),
        choice('tempting', 'commercial', 'Les docteurs, on double leur salaire dans l’assiette : c’est très avantageux pour vous.', { relation: 4, security: -16 }, { what: 'Vous appliquez une règle abrogée.', why: 'La majoration jeune docteur est supprimée depuis le 15/02/2025.', rule: 'Le doublement d’assiette n’existe plus.', codexUnlock: 'cdx_supprimes' }, 'n4'),
        choice('poor', 'fermete', 'La filiale et la CRO, on met tout à fond dans l’assiette, sans se poser de question.', { security: -18 }, { what: 'Vous ignorez les plafonds.', why: 'Entité liée et 3ᵉ rang ont des règles strictes.', rule: 'La sous-traitance liée est fortement encadrée.' }, 'n4'),
      ],
    },
    {
      id: 'n4',
      speaker: 'Laurent Kaplan',
      expression: 'satisfait',
      text: 'Vous connaissez le sujet. Donnez-moi un montant net et le risque, franchement.',
      choices: [
        choice('optimal', 'synthese', 'Net des aides, je vise 400 à 550 k€, risque faible si la CRO est bien documentée.', { relation: 6, security: 6, profitability: 4, mood: 4, trust: 5 }, { what: 'Chiffre net + risque + calendrier.', why: 'Exactement ce qu’un CFO attend.', rule: 'Annoncer net, avec le risque, avec la date.', codexUnlock: 'cdx_estimer' }, null, { promise: { kind: 'range', min: 400000, max: 550000 } }),
        choice('acceptable', 'preuve', 'Je vous donnerai le net après avoir vu les conventions d’aide et l’agrément de la CRO.', { security: 6, mood: 2, trust: 2 }, { what: 'Vous conditionnez aux pièces.', why: 'Rigoureux.', rule: 'Le net se calcule sur pièces.' }, null),
        choice('tempting', 'commercial', 'Brut, on est à 700 k€ ! On regardera les déductions d’aides un peu plus tard.', { relation: 8, security: -14, mood: 3 }, { what: 'Vous annoncez le brut.', why: 'Un CFO retiendra 700 k€ et vous opposera le net au bilan.', rule: 'On annonce toujours le net d’aides.' }, null, { promise: { kind: 'precise', min: 700000, max: 700000 } }),
        choice('poor', 'empathie', 'Le risque est nul dans votre cas, franchement il n’y a pas de quoi s’inquiéter.', { relation: -6, security: -8, mood: -3 }, { what: 'Vous niez le risque.', why: 'Prétendre un risque nul décrédibilise devant un DAF.', rule: 'Le risque zéro n’existe pas ; le quantifier, si.' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};

export const BIOTECH_KICKOFF: Scenario = {
  id: 'sc_biotech_kick',
  type: 'KICKOFF',
  clientId: 'cli_biotech_cellvia',
  title: 'Kick-off — Cellvia',
  context: 'Laurent a réuni sa directrice scientifique. Objectif : sécuriser la sous-traitance et le traitement des aides.',
  objectives: ['Cadrer la sous-traitance (agrément, lien, rang)', 'Documenter les aides', 'Traiter correctement les docteurs'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Laurent Kaplan',
      expression: 'neutre',
      text: 'On a aussi fait appel à un prestataire qui sous-traite lui-même une partie. Ça se cumule ?',
      choices: [
        choice('optimal', 'preuve', 'La re-sous-traitance est admise au 2ᵉ rang ; le 3ᵉ rang, lui, n’est pas éligible.', { security: 12, relation: 2, mood: 3, trust: 4 }, { what: 'Vous coupez le 3ᵉ rang.', why: 'La cascade est limitée au 2ᵉ rang.', rule: '3ᵉ rang de sous-traitance = non éligible.', codexUnlock: 'cdx_st_cascade' }, 'n2'),
        choice('acceptable', 'synthese', 'Il faut tracer la chaîne : au-delà du 2ᵉ rang, on n’éligibilise plus la dépense.', { security: 8, trust: 2 }, { what: 'Vous demandez la chaîne.', why: 'Correct.', rule: 'On documente le rang de chaque prestataire.' }, 'n2'),
        choice('tempting', 'commercial', 'Tout ce qui est sous-traité, on le prend dans l’assiette, peu importe le rang.', { relation: 3, security: -14 }, { what: 'Vous ignorez la cascade.', why: 'Le 3ᵉ rang est explicitement exclu.', rule: 'La cascade a une limite légale.' }, 'n2'),
        choice('poor', 'fermete', 'La sous-traitance profite aussi du forfait de 40 %, on l’ajoute au calcul.', { security: -16 }, { what: 'Vous appliquez un forfait interdit.', why: 'Aucun forfait de fonctionnement sur la sous-traitance.', rule: 'Pas de forfait sur la sous-traitance.', codexUnlock: 'cdx_forfait' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Dr. Amina Sy (directrice scientifique)',
      expression: 'neutre',
      text: 'Nos docteurs sont récemment diplômés. On m’a parlé d’un avantage fiscal spécial pour eux ?',
      choices: [
        choice('optimal', 'preuve', 'Leur salaire est éligible au taux normal ; la majoration ×2 est supprimée depuis 2025.', { security: 12, relation: 2, mood: 3, trust: 4 }, { what: 'Vous corrigez le mythe.', why: 'Confondre suppression de la majoration et exclusion du salaire est le piège expert.', rule: 'Salaire du docteur : oui ; majoration ×2 : non.', codexUnlock: 'cdx_jeune_docteur' }, 'n3'),
        choice('acceptable', 'synthese', 'Le salaire compte normalement ; l’ancien doublement d’assiette, lui, n’existe plus.', { security: 8, trust: 2 }, { what: 'Vous distinguez bien.', why: 'Juste.', rule: 'Ne pas exclure le salaire par excès de prudence.' }, 'n3'),
        choice('tempting', 'commercial', 'Oui, on double leur assiette : c’est le fameux bonus jeune docteur, profitez-en.', { relation: 3, security: -16 }, { what: 'Vous appliquez une règle abrogée.', why: 'Le doublement est supprimé depuis 2025.', rule: 'La majoration jeune docteur n’existe plus.' }, 'n3'),
        choice('poor', 'fermete', 'Comme c’est compliqué à justifier, on les sort carrément de l’assiette du dossier.', { security: -10 }, { what: 'Vous surexcluez.', why: 'Sortir le salaire du docteur vous fait perdre une dépense légitime.', rule: 'La prudence excessive coûte aussi.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Laurent Kaplan',
      expression: 'satisfait',
      text: 'Impeccable. Quelles pièces pour tout sécuriser avant le dépôt ?',
      choices: [
        choice('optimal', 'preuve', 'Agréments MESR, conventions d’aide, comptes rendus d’essais de la CRO, feuilles de temps.', { relation: 5, security: 10, profitability: 2, mood: 3, trust: 5 }, { what: 'Vous listez le dossier.', why: 'Un dossier biotech vit et meurt par ses conventions et agréments.', rule: 'La preuve se planifie au kick-off.', codexUnlock: 'cdx_pieces' }, null),
        choice('acceptable', 'synthese', 'Surtout les conventions d’aide et les agréments : ce sont vos points de contrôle.', { security: 6, trust: 2 }, { what: 'Vous ciblez les points durs.', why: 'Pertinent.', rule: 'Conventions et agréments d’abord.' }, null),
        choice('tempting', 'commercial', 'Envoyez-moi simplement les factures des prestataires, je m’occupe de tout le reste.', { relation: 3, security: -8 }, { what: 'Vous réduisez à la facture.', why: 'Une facture sans convention ni agrément ne prouve rien.', rule: 'La facture ne suffit pas.' }, null),
        choice('poor', 'fermete', 'On verra les justificatifs plus tard, si jamais le fisc vient nous les réclamer.', { security: -14 }, { what: 'Vous repoussez au contrôle.', why: 'C’est l’erreur qui coûte le plus cher.', rule: 'La preuve se constitue avant, pas pendant le contrôle.', codexUnlock: 'cdx_preuve' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};
