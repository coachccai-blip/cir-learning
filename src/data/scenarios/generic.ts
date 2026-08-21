import type { Scenario } from '../../engine/types';
import { choice } from './helpers';

// Suivi de mission générique — relance des livrables, gestion des irritants.
export const GENERIC_FOLLOWUP: Scenario = {
  id: 'sc_generic_followup',
  type: 'FOLLOWUP',
  title: 'Suivi de mission',
  context: 'Point d’étape à mi-parcours. Il faut débloquer les pièces manquantes et gérer les irritants du client.',
  objectives: ['Récupérer les pièces manquantes', 'Traiter un irritant', 'Maintenir la relation'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Vous me redemandez des documents ? On vous a déjà tout donné, il me semble.',
      choices: [
        choice('optimal', 'empathie', 'Il me manque les feuilles de temps signées et deux comptes rendus d’essais.', { relation: 4, security: 10, trust: 4 }, { what: 'Vous relancez avec tact.', why: 'Relier la demande au contrôle donne du sens à l’effort.', rule: 'Une relance justifiée passe mieux.', codexUnlock: 'cdx_pieces' }, 'n2'),
        choice('acceptable', 'synthese', 'Presque tout est là. Il manque les pièces de la démarche : je vous fais une liste courte.', { security: 8, relation: 1 }, { what: 'Vous ciblez le manque.', why: 'Efficace.', rule: 'Une liste courte se traite.' }, 'n2'),
        choice('tempting', 'commercial', 'Ne vous embêtez pas pour ça, je ferai avec ce que vous m’avez déjà donné.', { relation: 5, security: -12 }, { what: 'Vous renoncez aux pièces.', why: 'Sans preuve, le dossier reste fragile.', rule: 'On ne lâche pas la collecte pour faire plaisir.' }, 'n2'),
        choice('poor', 'fermete', 'Il me faut tout, tout de suite, sinon je ne peux pas avancer du tout.', { relation: -8, mood: -5 }, { what: 'Vous braquez le client.', why: 'Une injonction sèche crée un irritant.', rule: 'La fermeté n’exclut pas le tact.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'agace',
      text: 'Franchement, ça prend du temps, votre affaire. J’espère que ça vaut le coup.',
      choices: [
        choice('optimal', 'preuve', 'Chaque pièce d’aujourd’hui, c’est un point de moins à défendre au contrôle.', { relation: 5, security: 8, trust: 3 }, { what: 'Vous donnez du sens.', why: 'Le client accepte l’effort s’il en comprend la valeur.', rule: 'Expliquer la valeur désamorce l’irritant.' }, null),
        choice('acceptable', 'empathie', 'Je comprends que ce soit prenant. On ira droit à l’essentiel.', { relation: 6, security: 1 }, { what: 'Vous rassurez.', why: 'Bon pour la relation, un peu court sur le fond.', rule: 'Reconnaître l’effort du client compte.' }, null),
        choice('tempting', 'commercial', 'C’est bientôt fini, et le montant sera énorme, vous verrez, faites-moi confiance !', { relation: 6, security: -8 }, { what: 'Vous surpromettez.', why: 'Promettre « énorme » recrée une dette de promesse.', rule: 'Ne pas relancer la surenchère en suivi.' }, null),
        choice('poor', 'fermete', 'C’est la procédure imposée, on n’y peut pas grand-chose.', { relation: -6 }, { what: 'Vous vous réfugiez derrière la procédure.', why: '« C’est la procédure » n’explique rien au client.', rule: 'On explique, on ne se retranche pas.' }, 'n3'),
      ],
    },
    {
      // Nœud d'arbitrage : deux réponses défendables qui s'excluent. Le joueur
      // ne cherche pas « la bonne » — il choisit ce qu'il accepte de perdre.
      id: 'n3',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Mon équipe est débordée. Je peux vous donner les feuilles de temps, ou vous laisser tranquilles jusqu’au dépôt. Pas les deux.',
      choices: [
        choice('optimal', 'preuve', 'Prenons les feuilles de temps : sans elles, votre assiette ne tient pas.', { relation: -4, security: 14, trust: 2 }, { what: 'Vous choisissez la preuve.', why: 'Vous sacrifiez du confort relationnel pour un dossier défendable — c’est un arbitrage, pas une erreur.', rule: 'Entre la preuve et le confort, la preuve se rattrape rarement après coup.' }, null),
        choice('optimal', 'empathie', 'Je vous laisse respirer, et je reviens avec une liste de trois pièces.', { relation: 10, security: 4, trust: 4 }, { what: 'Vous choisissez la relation.', why: 'Vous préservez un client à bout, au prix d’un dossier moins étayé.', rule: 'Un client qui tient jusqu’au bout vaut mieux qu’un dossier parfait abandonné.' }, null),
        choice('tempting', 'commercial', 'On se débrouillera sans, ne vous inquiétez pas pour ça du tout.', { relation: 5, security: -14 }, { what: 'Vous renoncez sans contrepartie.', why: 'Ce n’est pas un arbitrage : vous perdez la preuve sans rien gagner en échange.', rule: 'Renoncer n’est un choix que si l’on sait ce qu’on achète.' }, null),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 75, good: 55 },
    unlocks: { excellent: ['piece_cr_essais', 'piece_feuilles_temps'], good: ['piece_feuilles_temps'], poor: [] },
  },
};

// Bilan de mission générique — restitution du CIR, gestion de l'écart vs promesse.
export const GENERIC_CLOSING: Scenario = {
  id: 'sc_generic_closing',
  type: 'CLOSING',
  title: 'Bilan de mission',
  context: 'Vous restituez le CIR calculé. Selon l’écart avec votre promesse initiale, la conversation sera plus ou moins facile.',
  objectives: ['Restituer honnêtement', 'Gérer l’écart de promesse', 'Ouvrir la suite'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Alors, le verdict ? Vous m’aviez donné une idée du montant, j’espère qu’on y est.',
      choices: [
        choice('optimal', 'preuve', 'Voici le montant réel, poste par poste, et l’origine exacte de chaque écart.', { relation: 4, security: 8, profitability: 2, trust: 5 }, { what: 'Vous restituez avec transparence.', why: 'Montrer la trace limite le churn quand le chiffre déçoit.', rule: 'La transparence désamorce la déception.', codexUnlock: 'cdx_chiffre_decevant' }, 'n2'),
        choice('acceptable', 'synthese', 'On est dans l’ordre de grandeur annoncé. Je vous détaille le calcul.', { relation: 3, security: 4, profitability: 1 }, { what: 'Vous restituez sobrement.', why: 'Correct.', rule: 'Un calcul détaillé rassure.' }, 'n2'),
        choice('tempting', 'commercial', 'C’est un très bon résultat, ne nous attardons pas sur les écarts.', { relation: 4, security: -8 }, { what: 'Vous masquez les écarts.', why: 'Éviter le détail fragilise la confiance au moindre contrôle.', rule: 'On n’escamote pas les écarts.' }, 'n2'),
        choice('poor', 'fermete', 'C’est ce que c’est. Le chiffre est le chiffre, il n’y a rien à discuter.', { relation: -8 }, { what: 'Vous êtes sec.', why: 'Une restitution sans pédagogie abîme la relation.', rule: 'Restituer, c’est aussi expliquer.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'satisfait',
      text: 'D’accord. Et pour l’an prochain, on continue ensemble ?',
      choices: [
        choice('optimal', 'synthese', 'Volontiers. On repart plus tôt sur la collecte et on qualifie ce projet.', { relation: 6, security: 4, profitability: 5, trust: 4 }, { what: 'Vous ouvrez l’upsell qualifié.', why: 'Fidéliser sur du sérieux prépare un meilleur dossier.', rule: 'On prépare l’an prochain dès le bilan.' }, null),
        choice('acceptable', 'empathie', 'Avec plaisir. On refait le point ensemble à la rentrée.', { relation: 5, profitability: 2 }, { what: 'Vous entretenez le lien.', why: 'Bonne suite.', rule: 'La relation se cultive dans la durée.' }, null),
        choice('tempting', 'commercial', 'Oui ! Et je vous promets un montant encore plus gros l’an prochain, vous verrez !', { relation: 6, security: -10 }, { what: 'Vous repromettez du chiffre.', why: 'Promettre plus gros relance la dette de promesse.', rule: 'On ne surpromet pas la saison suivante.' }, null),
        choice('poor', 'fermete', 'On verra bien l’an prochain, mais rien n’est encore sûr.', { relation: -4, profitability: -2 }, { what: 'Vous refroidissez.', why: 'Un bilan est le moment de sécuriser la reconduction.', rule: 'Le bilan ouvre la suite, il ne la ferme pas.' }, 'n3'),
      ],
    },
    {
      // Couperet : deux choix, sous pression, aucune réponse confortable.
      id: 'n3',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Dernière chose. Mon expert-comptable veut inscrire le montant au bilan dès demain matin. Je lui dis quoi ?',
      choices: [
        choice('optimal', 'preuve', 'Qu’il provisionne le montant net, en le notant comme estimation non définitive.', { relation: 3, security: 10, trust: 4 }, { what: 'Vous cadrez l’écriture comptable.', why: 'Un montant provisionné et qualifié n’engage personne ; un montant ferme, si.', rule: 'Une estimation écrite comme telle protège le client et vous.' }, null),
        choice('poor', 'commercial', 'Qu’il inscrive le montant en produit acquis, c’est du solide.', { relation: 4, security: -16 }, { what: 'Vous faites inscrire un chiffre non définitif.', why: 'Si le contrôle rabote le crédit, c’est le bilan du client qu’il faut corriger.', rule: 'On ne fait jamais écrire un montant CIR comme certain avant le dépôt.' }, null),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 75, good: 55 },
    unlocks: { excellent: [], good: [], poor: [] },
  },
};

// Découverte générique — sert les dossiers signés en prospection, dont le
// périmètre reste à cadrer alors que le contrat est déjà là.
export const GENERIC_DISCOVERY: Scenario = {
  id: 'sc_generic_discovery',
  type: 'DISCOVERY',
  title: 'Rendez-vous de cadrage',
  context: 'Le contrat est signé au téléphone, mais rien n’est encore qualifié. Ce rendez-vous fixe le périmètre réel.',
  objectives: ['Chercher le verrou, pas le budget', 'Cadrer le périmètre', 'Ne rien promettre trop vite'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'On a signé, très bien. Concrètement, vous prenez tout ce qu’on fait de technique, c’est ça ?',
      choices: [
        choice('optimal', 'technique', 'Pas tout : ce qui levait une incertitude que l’état de l’art ne résolvait pas.', { relation: 3, security: 10, trust: 4 }, { what: 'Vous posez le bon critère.', why: 'Cadrer dès le premier rendez-vous évite de tout reprendre au montage.', rule: 'Le périmètre se définit par l’incertitude, pas par le budget.', codexUnlock: 'cdx_verrou' }, 'n2'),
        choice('acceptable', 'synthese', 'On va trier ensemble : tout le technique n’entre pas dans l’assiette du CIR.', { security: 7, relation: 2 }, { what: 'Vous annoncez le tri.', why: 'Correct.', rule: 'Le tri fait partie de la mission.' }, 'n2'),
        choice('tempting', 'commercial', 'On prend tout, on verra bien ce que l’administration voudra bien retenir.', { relation: 4, security: -12 }, { what: 'Vous ratissez large.', why: 'Un périmètre non trié se paie au premier contrôle.', rule: 'On ne met jamais « pour voir ».' }, 'n2'),
        choice('poor', 'fermete', 'C’est bien trop technique pour vous : laissez-moi faire ça tout seul de mon côté.', { relation: -8, trust: -4 }, { what: 'Vous excluez le client.', why: 'Sans lui, vous n’aurez ni les pièces ni les explications.', rule: 'Un dossier CIR se construit avec le client.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Et vous pensez qu’on arrive à quel montant, à la louche ?',
      choices: [
        choice('optimal', 'synthese', 'Une fourchette prudente d’abord, un chiffre ferme après les feuilles de temps.', { relation: 4, security: 8, profitability: 2, trust: 4 }, { what: 'Vous cadrez la promesse.', why: 'Une fourchette annoncée comme provisoire ne se transforme pas en dette.', rule: 'Fourchette maintenant, chiffre ferme sur pièces.', codexUnlock: 'cdx_estimer' }, null),
        choice('acceptable', 'preuve', 'Je vous réponds après avoir vu vos coûts salariaux et vos aides publiques.', { security: 6, trust: 2 }, { what: 'Vous conditionnez aux pièces.', why: 'Rigoureux, un peu frustrant pour le client.', rule: 'Le chiffre se calcule sur pièces.' }, null),
        choice('tempting', 'commercial', 'À vue de nez, je dirais que ce sera un très beau montant cette année, vous verrez.', { relation: 5, security: -10 }, { what: 'Vous lâchez une promesse floue.', why: '« Un très beau montant » sera retenu comme un engagement au bilan.', rule: 'Le flou vaut promesse.' }, null),
        choice('poor', 'fermete', 'Impossible de vous répondre, et cette question n’a pas de sens à ce stade.', { relation: -6 }, { what: 'Vous fermez la porte.', why: 'Refuser tout ordre de grandeur passe pour de l’incompétence.', rule: 'On donne un cadre, même sans chiffre.' }, 'n3'),
      ],
    },
    {
      // Couperet : le client force la main, il n'y a pas de sortie confortable.
      id: 'n3',
      speaker: 'Le client',
      expression: 'agace',
      text: 'On m’a dit que d’autres cabinets valorisent tout le service technique. Vous faites pareil, ou je me suis trompé de prestataire ?',
      choices: [
        choice('optimal', 'fermete', 'Je ne fais pas pareil, et c’est précisément ce que vous payez.', { relation: -2, security: 14, trust: 6 }, { what: 'Vous tenez la ligne.', why: 'Céder ici, c’est signer un dossier que vous ne pourrez pas défendre trois ans plus tard.', rule: 'Un désaccord assumé vaut mieux qu’un dossier indéfendable.' }, null),
        choice('tempting', 'commercial', 'On peut regarder large, comme eux, si c’est ce que vous attendez.', { relation: 6, security: -16, mood: 4 }, { what: 'Vous vous alignez sur le moins-disant.', why: 'Vous venez de laisser un concurrent fixer votre niveau de risque.', rule: 'Ne jamais laisser un autre cabinet définir votre périmètre.' }, null),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 75, good: 55 },
    unlocks: { excellent: [], good: [], poor: [] },
  },
};

// Kick-off générique — lancement d'une mission signée en prospection.
export const GENERIC_KICKOFF: Scenario = {
  id: 'sc_generic_kickoff',
  type: 'KICKOFF',
  title: 'Kick-off de mission',
  context: 'Première réunion de travail. Il faut organiser la collecte des preuves avant que les équipes ne passent à autre chose.',
  objectives: ['Organiser la collecte', 'Fixer les points durs', 'Impliquer les équipes'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Mes équipes sont déjà sous l’eau. Qu’est-ce que vous attendez d’elles, exactement ?',
      choices: [
        choice('optimal', 'preuve', 'Des feuilles de temps par projet et des comptes rendus datés, au fil de l’eau.', { relation: 3, security: 10, trust: 4 }, { what: 'Vous lancez la collecte.', why: 'Une preuve constituée pendant les travaux vaut dix reconstitutions après coup.', rule: 'La preuve se constitue au moment des travaux.', codexUnlock: 'cdx_preuve' }, 'n2'),
        choice('acceptable', 'synthese', 'Peu de choses, mais régulièrement : le temps passé et ce qui a été essayé.', { security: 7, relation: 3 }, { what: 'Vous allégez la demande.', why: 'Réaliste, un peu vague sur le format attendu.', rule: 'Une collecte régulière coûte moins qu’un rattrapage.' }, 'n2'),
        choice('tempting', 'commercial', 'Presque rien, on s’occupe de tout : vous n’aurez pas à lever le petit doigt.', { relation: 6, security: -12 }, { what: 'Vous promettez la passivité.', why: 'Sans les équipes, il n’y aura ni feuilles de temps ni comptes rendus.', rule: 'Un dossier CIR ne se monte pas à la place du client.' }, 'n2'),
        choice('poor', 'fermete', 'Tout, et rapidement : c’est le prix à payer pour un crédit d’impôt.', { relation: -8, mood: -5 }, { what: 'Vous braquez les équipes.', why: 'Une demande massive et sèche ne produit jamais de pièces.', rule: 'La collecte se négocie, elle ne s’impose pas.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Il y a des sujets sur lesquels vous voulez qu’on fasse attention ?',
      choices: [
        choice('optimal', 'technique', 'Les prestataires sans agrément MESR et toute aide publique reçue sur le projet.', { relation: 3, security: 12, trust: 4 }, { what: 'Vous ciblez les points durs.', why: 'Agrément et aides publiques concentrent l’essentiel des redressements.', rule: 'Agréments et aides : les deux vérifications qui sauvent un dossier.', codexUnlock: 'cdx_subventions' }, null),
        choice('acceptable', 'synthese', 'Surtout vos contrats de sous-traitance et vos conventions de financement.', { security: 8, trust: 2 }, { what: 'Vous demandez les bons documents.', why: 'Pertinent.', rule: 'Contrats et conventions d’abord.' }, null),
        choice('tempting', 'commercial', 'Rien de particulier, on regardera les détails au moment du dépôt du dossier.', { relation: 3, security: -12 }, { what: 'Vous repoussez les vérifications.', why: 'Découvrir une aide non déduite au dépôt oblige à tout refaire.', rule: 'Les points durs se traitent au lancement.' }, null),
        choice('poor', 'fermete', 'Vous verrez bien : je vous dirai ce qui ne va pas quand je l’aurai trouvé.', { relation: -6, trust: -3 }, { what: 'Vous gardez l’information.', why: 'Un client non prévenu ne prépare rien et découvre les mauvaises nouvelles tard.', rule: 'On annonce les points durs dès le départ.' }, null),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 75, good: 55 },
    unlocks: { excellent: ['piece_feuilles_temps'], good: [], poor: [] },
  },
};
