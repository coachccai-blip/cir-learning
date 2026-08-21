import type { EligibilityProfile, Scenario } from '../../engine/types';
import { choice } from './helpers';

// Scénarios de prospection téléphonique (§6.2).
// Chaque appel met le joueur face à une SITUATION différente : barrage,
// objection, recommandation, prospect agressif, non-éligible… L'enjeu
// pédagogique est la conduite d'entretien téléphonique, pas la règle fiscale.
//
// Les choix du dernier nœud portent un flag d'issue :
//   prospect_sign | prospect_maybe | prospect_decline | prospect_decline_rude

const OUT: Scenario['outcome'] = {
  scoreThresholds: { excellent: 70, good: 50 },
  unlocks: { excellent: [], good: [], poor: [] },
};

// ---------------------------------------------------------------- 1. Le curieux
export const CALL_CURIEUX: Scenario = {
  id: 'sc_call_curieux',
  type: 'PROSPECT',
  title: 'Appel — « Je ne sais pas si on y a droit »',
  context: 'Un dirigeant curieux mais mal informé. Il a entendu parler du CIR sans savoir si son entreprise est concernée.',
  objectives: ['Qualifier avec une question simple', 'Ne pas survendre', 'Conclure honnêtement'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Le CIR ? On m’en a parlé. Mais je ne sais pas si on fait vraiment de la recherche, nous.',
      choices: [
        choice('optimal', 'synthese', 'C’est justement la bonne question. En deux mots : avez-vous eu un projet où vous ne saviez pas, au départ, si c’était techniquement faisable ?', { relation: 4, security: 6, mood: 3 }, { what: 'Vous qualifiez d’emblée.', why: 'Une question simple et concrète sépare les vrais candidats des autres en trente secondes.', rule: 'On qualifie avant de vendre.' }, 'n2'),
        choice('acceptable', 'empathie', 'Beaucoup d’entreprises se posent la question. Voyons ça ensemble, sans engagement.', { relation: 5, mood: 2 }, { what: 'Vous mettez à l’aise.', why: 'Bon pour le lien, mais vous n’avez encore rien appris sur son activité.', rule: 'Rassurer ne remplace pas qualifier.' }, 'n2'),
        choice('tempting', 'commercial', 'Tout le monde y a droit, croyez-moi, on va vous trouver un beau dossier.', { relation: 4, security: -10 }, { what: 'Vous survendez.', why: '« Tout le monde y a droit » est faux : le CIR suppose une incertitude scientifique.', rule: 'On ne promet jamais l’éligibilité au téléphone.' }, 'n2'),
        choice('poor', 'technique', 'Le CIR relève de l’article 244 quater B du CGI, sous conditions cumulatives d’éligibilité…', { relation: -6, mood: -4 }, { what: 'Vous récitez la loi.', why: 'Personne ne s’engage sur un article de loi au téléphone.', rule: 'Le bon registre avant le bon contenu.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Honnêtement, on fait surtout de l’intégration de solutions existantes pour nos clients.',
      choices: [
        choice('optimal', 'preuve', 'Alors soyons honnêtes : l’intégration pure n’ouvre pas le CIR. Si un projet interne sort du lot un jour, rappelez-moi — je ne vais pas vous vendre du vent.', { relation: 5, security: 8, mood: 3 }, { what: 'Vous refusez proprement.', why: 'Refuser un non-éligible protège le client et votre réputation.', rule: 'Dire non tôt évite une mission toxique.', codexUnlock: 'cdx_dire_non' }, null, { flags: ['prospect_decline'] }),
        choice('acceptable', 'synthese', 'Dans ce cas le potentiel est sans doute faible. On peut vérifier, mais je ne vous promets rien.', { relation: 3, security: 6 }, { what: 'Vous restez prudent.', why: 'Correct : vous ne vous engagez que si le potentiel se confirme.', rule: 'On tempère les attentes dès l’appel.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'On trouvera bien un angle pour éligibiliser tout ça, prenons rendez-vous !', { relation: 4, security: -12 }, { what: 'Vous forcez la signature.', why: 'Chercher un « angle » sur du non-éligible mène droit au redressement.', rule: 'On ne force jamais l’éligibilité.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'fermete', 'De l’intégration ? Aucun intérêt pour moi. Au revoir.', { relation: -8 }, { what: 'Vous raccrochez sèchement.', why: 'Un refus brutal ferme la porte pour toujours — y compris pour un vrai projet dans deux ans.', rule: 'On refuse sans claquer la porte.' }, null, { flags: ['prospect_decline_rude'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------------- 2. Le barrage
export const CALL_BARRAGE: Scenario = {
  id: 'sc_call_barrage',
  type: 'PROSPECT',
  title: 'Appel — Le barrage de l’accueil',
  context: 'L’assistante de direction filtre les appels. Vous n’avez pas encore le dirigeant au bout du fil.',
  objectives: ['Passer le barrage sans mentir', 'Respecter l’interlocutrice', 'Obtenir un créneau'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'L’assistante de direction',
      expression: 'neutre',
      text: 'C’est à quel sujet ? Monsieur le directeur ne prend pas les appels commerciaux.',
      choices: [
        choice('optimal', 'synthese', 'Vous avez raison de filtrer. C’est au sujet du crédit d’impôt recherche sur vos projets techniques — deux minutes lui suffiront pour dire si ça le concerne. Quand est-il joignable ?', { relation: 5, security: 3, mood: 4 }, { what: 'Vous êtes transparent et bref.', why: 'Reconnaître le rôle du filtre et annoncer la couleur passe mieux que de le contourner.', rule: 'On passe un barrage par la clarté, pas par la ruse.' }, 'n2'),
        choice('acceptable', 'empathie', 'Je comprends. Puis-je vous laisser mes coordonnées et rappeler à un moment qui vous arrange ?', { relation: 4, mood: 3 }, { what: 'Vous respectez le filtre.', why: 'Poli et sûr, mais vous laissez la main à l’autre.', rule: 'La politesse ouvre, l’initiative fait avancer.' }, 'n2'),
        choice('tempting', 'commercial', 'Dites-lui que c’est pour de l’argent qu’il peut récupérer, il voudra me parler.', { relation: -3, security: -6, mood: -4 }, { what: 'Vous appâtez.', why: 'L’accroche « argent facile » décrédibilise et braque les assistantes aguerries.', rule: 'Une accroche racoleuse fait passer pour un démarcheur.' }, 'n2'),
        choice('poor', 'fermete', 'C’est personnel, passez-le-moi directement.', { relation: -8, mood: -8 }, { what: 'Vous mentez au filtre.', why: 'Le mensonge se découvre en trente secondes et grille définitivement le contact.', rule: 'On ne ment jamais pour passer un barrage.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'L’assistante de direction',
      expression: 'neutre',
      text: 'Il est en réunion jusqu’à 17 h. Je peux prendre un message, mais soyez bref.',
      choices: [
        choice('optimal', 'synthese', 'Merci. Message : “Le CIR peut financer une partie de vos travaux techniques. Une question simple à lui poser, 5 minutes.” Je rappelle demain 9 h, ça vous va ?', { relation: 5, profitability: 3, mood: 3 }, { what: 'Message court + rappel programmé.', why: 'Vous laissez une trace utile ET vous gardez l’initiative du rappel.', rule: 'Un message se termine toujours par une date de rappel.' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'empathie', 'Merci beaucoup, dites-lui simplement que j’ai appelé au sujet du CIR. Je retenterai.', { relation: 3 }, { what: 'Message minimal.', why: 'Correct, mais un message sans accroche ni date se perd sur un post-it.', rule: 'Un message vague ne génère pas de rappel.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Je préfère lui expliquer moi-même, je rappellerai toutes les heures jusqu’à l’avoir.', { relation: -6, mood: -6 }, { what: 'Vous harcelez.', why: 'L’insistance mécanique transforme un filtre neutre en adversaire.', rule: 'La relance se planifie, elle ne se subit pas.' }, null, { flags: ['prospect_decline'] }),
        choice('poor', 'fermete', 'Laissez tomber, je vois qu’on ne veut pas de moi ici.', { relation: -8 }, { what: 'Vous abandonnez avec humeur.', why: 'Vous perdez le contact ET laissez une mauvaise impression à celle qui tient l’agenda.', rule: 'L’assistante est une alliée, jamais un obstacle.' }, null, { flags: ['prospect_decline_rude'] }),
      ],
    },
  ],
  outcome: OUT,
};

// --------------------------------------------------- 3. « On a déjà un cabinet »
export const CALL_CONCURRENT: Scenario = {
  id: 'sc_call_concurrent',
  type: 'PROSPECT',
  title: 'Appel — « On a déjà un cabinet »',
  context: 'Le prospect travaille avec un concurrent. L’objection la plus fréquente en prospection.',
  objectives: ['Ne pas dénigrer', 'Trouver la faille sans agresser', 'Rester en veille'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'agace',
      text: 'On a déjà un cabinet qui s’occupe de notre CIR depuis trois ans. Merci, au revoir.',
      choices: [
        choice('optimal', 'synthese', 'Très bien, c’est rassurant. Juste une question avant de vous laisser : sur les trois ans, avez-vous déjà eu un contrôle ou une demande d’information de l’administration ?', { relation: 4, security: 6, mood: 3 }, { what: 'Vous posez LA question utile.', why: 'Un dossier jamais contrôlé n’est pas un dossier prouvé — ça ouvre une vraie conversation.', rule: 'Face au concurrent : une question ouverte vaut mieux qu’un argument.' }, 'n2'),
        choice('acceptable', 'empathie', 'Je comprends. Puis-je vous rappeler dans un an, au moment de votre prochaine campagne ?', { relation: 4, mood: 2 }, { what: 'Vous vous mettez en veille.', why: 'Respectueux et réaliste — mais vous ne saurez rien de sa situation.', rule: 'Le bon timing est une stratégie valable.' }, 'n2'),
        choice('tempting', 'commercial', 'Combien vous prennent-ils ? Je suis certain de faire moins cher.', { relation: -2, profitability: -6, mood: -3 }, { what: 'Vous vous positionnez sur le prix.', why: 'Attaquer par le tarif installe une relation de prestataire interchangeable.', rule: 'On ne gagne pas un dossier CIR sur le prix.' }, 'n2'),
        choice('poor', 'fermete', 'Trois ans avec eux ? Ils ont dû vous laisser passer beaucoup de choses.', { relation: -10, mood: -8 }, { what: 'Vous dénigrez.', why: 'Attaquer le confrère vous décrédibilise plus que lui, et insulte le choix du client.', rule: 'On gagne sur ses preuves, jamais sur le dénigrement.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Non, jamais de contrôle. Cela dit… je ne saurais pas vous dire ce qu’il y a dans le dossier, pour être franc.',
      choices: [
        choice('optimal', 'preuve', 'C’est le point qui compte. Le jour d’un contrôle, c’est vous qui répondez, pas votre cabinet. Je peux vous faire une relecture gratuite de votre dernier dossier — vous verrez de quoi il est fait.', { relation: 6, security: 8, profitability: 2, mood: 4 }, { what: 'Vous créez de la valeur sans attaquer.', why: 'Un diagnostic gratuit déplace le débat du prix vers la sécurité — votre terrain.', rule: 'La sécurité fiscale est un argument, pas une menace.', codexUnlock: 'cdx_preuve' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'C’est fréquent. Gardez au moins ce réflexe : demandez-leur votre dossier justificatif complet.', { relation: 5, security: 5, mood: 3 }, { what: 'Vous rendez service gratuitement.', why: 'Vous ne signez pas aujourd’hui, mais vous devenez la personne de confiance.', rule: 'Rendre service crée la relance de demain.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Alors changez pour nous, on fera mieux. Je vous envoie un contrat ?', { relation: -4, security: -6, mood: -5 }, { what: 'Vous brûlez l’étape.', why: 'Passer d’un aveu de doute à un contrat en une phrase fait fuir.', rule: 'Un doute exprimé n’est pas une intention d’achat.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'fermete', 'Vous prenez un vrai risque, vous savez. Ça peut vous coûter très cher.', { relation: -8, mood: -6 }, { what: 'Vous jouez sur la peur.', why: 'La peur agressive braque et fait perdre toute crédibilité de conseil.', rule: 'On informe du risque, on ne l’instrumentalise pas.' }, null, { flags: ['prospect_decline'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------ 4. La peur du contrôle
export const CALL_PEUR: Scenario = {
  id: 'sc_call_peur',
  type: 'PROSPECT',
  title: 'Appel — « Le CIR, ça attire les contrôles »',
  context: 'Le prospect est éligible mais paralysé par la peur du fisc. Un cas très courant chez les PME.',
  objectives: ['Prendre la peur au sérieux', 'Rassurer par la méthode', 'Ne pas nier le risque'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'ferme',
      text: 'Franchement, le CIR, ça attire les contrôles. Un confrère s’est fait redresser. Je préfère ne rien demander.',
      choices: [
        choice('optimal', 'empathie', 'Votre prudence est saine, et je la partage. Ce qui fait redresser, ce n’est pas de demander le CIR : c’est de le demander sans preuves. La différence se joue sur la documentation.', { relation: 6, security: 8, mood: 5 }, { what: 'Vous validez la peur et la recadrez.', why: 'Distinguer « demander » et « demander mal » désamorce l’objection sans la nier.', rule: 'On ne combat pas une peur, on la précise.', codexUnlock: 'cdx_preuve' }, 'n2'),
        choice('acceptable', 'preuve', 'Le risque existe, je ne vais pas vous dire le contraire. Il se maîtrise par un dossier documenté au fil de l’eau.', { relation: 4, security: 6, mood: 2 }, { what: 'Vous êtes honnête.', why: 'Juste, mais un peu froid face à quelqu’un qui exprime une inquiétude.', rule: 'L’honnêteté rassure — l’écoute davantage.' }, 'n2'),
        choice('tempting', 'commercial', 'Avec nous, aucun risque, on n’a jamais eu de redressement.', { relation: 2, security: -12, mood: -2 }, { what: 'Vous promettez le risque zéro.', why: 'Le risque zéro n’existe pas ; le promettre détruit votre crédibilité dès la première question.', rule: 'Jamais de garantie absolue face à l’administration.' }, 'n2'),
        choice('poor', 'fermete', 'Vous laissez de l’argent sur la table par frilosité, c’est dommage.', { relation: -8, mood: -8 }, { what: 'Vous culpabilisez.', why: 'Juger la prudence d’un dirigeant est le meilleur moyen de le braquer.', rule: 'On ne moque jamais la prudence d’un client.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Admettons. Concrètement, qu’est-ce qui ferait qu’un contrôle se passe bien chez moi ?',
      choices: [
        choice('optimal', 'preuve', 'Trois choses : des feuilles de temps réelles, des comptes rendus d’essais datés, et un périmètre resserré sur ce qui lève une vraie incertitude. Si on travaille ensemble, c’est ça que je vous fais construire.', { relation: 6, security: 8, profitability: 3, mood: 4 }, { what: 'Vous répondez par la méthode.', why: 'Une réponse concrète en trois points transforme l’anxiété en plan d’action.', rule: 'La preuve se constitue pendant les travaux, pas au contrôle.', codexUnlock: 'cdx_pieces' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'Un dossier documenté et un périmètre prudent. C’est exactement notre méthode de travail.', { relation: 4, security: 6, mood: 3 }, { what: 'Vous synthétisez.', why: 'Correct, mais moins marquant qu’une liste concrète et vérifiable.', rule: 'Le concret rassure plus que le principe.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Ne vous inquiétez pas, on gère tout de A à Z, vous n’aurez rien à faire.', { relation: 3, security: -10 }, { what: 'Vous promettez la passivité.', why: 'Le client DOIT produire ses feuilles de temps : lui dire l’inverse prépare un dossier vide.', rule: 'Un dossier CIR se construit avec le client, pas à sa place.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'technique', 'Il faudra respecter le BOI-BIC-RICI-10-10 et produire les états annexes réglementaires.', { relation: -5, mood: -5 }, { what: 'Vous jargonnez face à une inquiétude.', why: 'Répondre à une peur par des références administratives l’amplifie.', rule: 'Le jargon nourrit l’angoisse au lieu de l’apaiser.' }, null, { flags: ['prospect_maybe'] }),
      ],
    },
  ],
  outcome: OUT,
};

// -------------------------------------------------------- 5. « On est trop petits »
export const CALL_TROP_PETIT: Scenario = {
  id: 'sc_call_trop_petit',
  type: 'PROSPECT',
  title: 'Appel — « On est trop petits pour ça »',
  context: 'Une TPE technique persuadée que le CIR est réservé aux grands groupes.',
  objectives: ['Corriger une idée fausse', 'Chiffrer sans promettre', 'Valoriser le remboursement PME'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'On est huit. Le crédit d’impôt recherche, c’est pour les grands groupes, non ?',
      choices: [
        choice('optimal', 'synthese', 'C’est l’idée reçue la plus répandue. Le CIR n’a aucun seuil de taille — et les PME ont même un avantage : le remboursement immédiat du crédit non imputé, donc de la trésorerie directe.', { relation: 5, security: 6, mood: 4 }, { what: 'Vous corrigez avec un bénéfice concret.', why: 'Le remboursement immédiat parle bien plus à une TPE qu’un taux abstrait.', rule: 'Une idée fausse se corrige par un avantage concret.', codexUnlock: 'cdx_calendrier' }, 'n2'),
        choice('acceptable', 'preuve', 'Non, il n’y a pas de seuil de taille. Deux ingénieurs sur un vrai verrou technique suffisent à ouvrir un dossier.', { relation: 4, security: 6, mood: 3 }, { what: 'Vous corrigez factuellement.', why: 'Juste et clair, mais sans l’argument trésorerie qui fait mouche en TPE.', rule: 'Le CIR n’a pas de seuil de taille.' }, 'n2'),
        choice('tempting', 'commercial', 'Au contraire, les petites structures récupèrent des sommes énormes !', { relation: 3, security: -8, mood: 2 }, { what: 'Vous exagérez.', why: '« Des sommes énormes » sur huit salariés est invraisemblable et vous décrédibilise.', rule: 'Un ordre de grandeur faux se retourne toujours contre vous.' }, 'n2'),
        choice('poor', 'fermete', 'Effectivement, à huit, ça vaut rarement le coup de monter un dossier.', { relation: -4, profitability: -6, mood: -4 }, { what: 'Vous confirmez l’idée fausse.', why: 'Vous perdez un dossier potentiellement solide — et vous renforcez un mythe.', rule: 'Ne jamais valider une idée fausse par confort.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'satisfait',
      text: 'Ah bon ? On a deux ingénieurs à plein temps sur un capteur qui ne marche toujours pas comme on veut. Ça donnerait quoi ?',
      choices: [
        choice('optimal', 'synthese', '« Qui ne marche pas comme on veut » est exactement le vocabulaire de l’incertitude. Sur deux ingénieurs, l’ordre de grandeur se compte en dizaines de milliers d’euros — je vous confirme après avoir vu les postes.', { relation: 5, security: 6, profitability: 4, mood: 4 }, { what: 'Fourchette prudente et qualifiée.', why: 'Vous donnez un ordre de grandeur utile sans vous engager sur un chiffre ferme.', rule: 'Estimer sans s’engager.', codexUnlock: 'cdx_estimer' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'preuve', 'Ça sent le vrai projet R&D. Je préfère voir vos coûts salariaux avant d’avancer un chiffre.', { relation: 4, security: 6, mood: 2 }, { what: 'Vous conditionnez le chiffre.', why: 'Rigoureux ; un ordre de grandeur aurait aidé à décider.', rule: 'Le chiffre suit les pièces.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Facile, je vous dis 60 000 € les yeux fermés. On signe ?', { relation: 6, security: -12, mood: 5 }, { what: 'Vous lâchez un chiffre ferme.', why: 'Un montant précis annoncé sans données devient une promesse dont vous répondrez au bilan.', rule: 'Un chiffre précis trop tôt coûte cher.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'empathie', 'Difficile à dire… ça dépend de beaucoup de choses, vous savez.', { relation: -4, mood: -4 }, { what: 'Vous restez vague.', why: 'Le flou total sur une question directe donne l’impression que vous ne maîtrisez pas.', rule: 'Une fourchette prudente vaut mieux qu’un « ça dépend ».' }, null, { flags: ['prospect_maybe'] }),
      ],
    },
  ],
  outcome: OUT,
};

// --------------------------------------------------------------- 6. Le prix
export const CALL_PRIX: Scenario = {
  id: 'sc_call_prix',
  type: 'PROSPECT',
  title: 'Appel — « Vous prenez combien ? »',
  context: 'Le prospect coupe court et va droit aux honoraires, avant même de parler de son activité.',
  objectives: ['Assumer son prix', 'Ramener sur la valeur', 'Ne pas brader'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Avant tout : vous prenez combien ? J’ai eu des cabinets à 30 %, c’est du vol.',
      choices: [
        choice('optimal', 'synthese', 'Je vous réponds franchement : autour de 20 % du CIR effectivement obtenu, au succès. Si vous ne touchez rien, vous ne payez rien — et je ne facture pas un dossier que je ne pourrais pas défendre.', { relation: 5, security: 4, profitability: 5, mood: 3 }, { what: 'Vous assumez le prix.', why: 'Répondre franchement à une question de prix crée plus de confiance que l’esquive.', rule: 'Un taux assumé se négocie mieux qu’un taux caché.' }, 'n2'),
        choice('acceptable', 'preuve', 'Au succès, un pourcentage du montant obtenu. Le taux dépend de la complexité — voyons d’abord votre dossier.', { relation: 3, profitability: 3 }, { what: 'Vous conditionnez.', why: 'Correct, mais un interlocuteur direct entend une esquive.', rule: 'À une question directe, une réponse directe.' }, 'n2'),
        choice('tempting', 'commercial', 'Pour vous ce sera 10 %, c’est exceptionnel, j’ai vraiment envie de travailler avec vous.', { relation: 4, profitability: -10, mood: 3 }, { what: 'Vous bradez immédiatement.', why: 'Casser son prix avant toute négociation détruit la marge et signale que le tarif était gonflé.', rule: 'On ne remise jamais avant d’avoir été challengé.' }, 'n2'),
        choice('poor', 'fermete', 'C’est le marché, à prendre ou à laisser.', { relation: -8, mood: -6 }, { what: 'Vous fermez le dialogue.', why: 'Une réponse méprisante sur le prix termine l’appel — et la relation.', rule: 'Fermeté n’est pas brutalité.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'agace',
      text: '20 %, c’est encore beaucoup pour remplir un formulaire, non ?',
      choices: [
        choice('optimal', 'preuve', 'Le formulaire prend une heure. Ce que vous payez, c’est le dossier qui tient au contrôle trois ans plus tard — et le tri de ce qu’il ne faut surtout pas y mettre.', { relation: 5, security: 8, profitability: 4, mood: 3 }, { what: 'Vous déplacez sur la valeur réelle.', why: 'La valeur du conseil CIR est dans le tri et la preuve, pas dans la déclaration.', rule: 'On vend la sécurité du dossier, pas le formulaire.' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'Le travail réel, c’est la qualification des projets et la constitution des preuves. Le formulaire n’est que la dernière étape.', { relation: 4, security: 5, profitability: 2 }, { what: 'Vous expliquez le travail.', why: 'Juste et pédagogique.', rule: 'Expliquer le travail justifie le prix.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Bon, disons 12 % et on n’en parle plus.', { relation: 3, profitability: -12, mood: 2 }, { what: 'Vous cédez sous la pression.', why: 'Céder à la première objection apprend au client que tout est négociable.', rule: 'Une remise non contrepartie détruit la marge.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'fermete', 'Si vous croyez que c’est simple, faites-le vous-même.', { relation: -10, mood: -8 }, { what: 'Vous vous vexez.', why: 'L’orgueil professionnel n’a jamais signé un dossier.', rule: 'On répond à une objection, on ne s’en offusque pas.' }, null, { flags: ['prospect_decline_rude'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------ 7. « Envoyez une doc »
export const CALL_DOC: Scenario = {
  id: 'sc_call_doc',
  type: 'PROSPECT',
  title: 'Appel — « Envoyez-moi une documentation »',
  context: 'L’esquive polie classique : demander une plaquette pour terminer l’appel sans dire non.',
  objectives: ['Reconnaître l’esquive', 'Obtenir un engagement concret', 'Rester courtois'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Écoutez, envoyez-moi une documentation par mail, je regarderai à l’occasion.',
      choices: [
        choice('optimal', 'synthese', 'Je vous l’envoie avec plaisir. Pour qu’elle vous serve vraiment : une seule question, votre équipe a-t-elle buté cette année sur un problème technique sans solution connue ? J’adapterai le document.', { relation: 5, security: 5, profitability: 3, mood: 3 }, { what: 'Vous acceptez ET vous qualifiez.', why: 'Accepter l’esquive tout en posant une question garde la conversation vivante.', rule: 'Une plaquette envoyée sans question ne sera jamais lue.' }, 'n2'),
        choice('acceptable', 'empathie', 'Bien sûr. Je vous rappelle la semaine prochaine pour recueillir vos impressions, ça vous va ?', { relation: 4, mood: 2 }, { what: 'Vous programmez la relance.', why: 'Mieux que rien : sans date de rappel, une plaquette est un enterrement poli.', rule: 'Toujours repartir avec une date.' }, 'n2'),
        choice('tempting', 'commercial', 'Une doc ne servira à rien, prenons plutôt rendez-vous tout de suite.', { relation: -4, mood: -4 }, { what: 'Vous forcez le passage.', why: 'Refuser la demande du prospect pour imposer la vôtre crispe immédiatement.', rule: 'On avance avec l’objection, pas contre elle.' }, 'n2'),
        choice('poor', 'fermete', 'Très bien, je vous envoie ça. Bonne journée.', { relation: 1, profitability: -6 }, { what: 'Vous subissez l’esquive.', why: 'Sans question ni date, cet appel est perdu et vous le savez déjà.', rule: 'Un appel sans prochaine étape est un appel gâché.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Buté sur un problème technique… Oui, sur la tenue en température d’un de nos produits. On n’a toujours pas tranché.',
      choices: [
        choice('optimal', 'preuve', 'Voilà qui change tout : « on n’a pas tranché », c’est le mot exact de l’incertitude technique. Vingt minutes en visio la semaine prochaine et je vous dis si c’est un dossier.', { relation: 6, security: 6, profitability: 4, mood: 4 }, { what: 'Vous transformez l’esquive en rendez-vous.', why: 'La question qualifiante a fait surgir un vrai sujet — c’est là que l’appel bascule.', rule: 'Une bonne question vaut dix plaquettes.', codexUnlock: 'cdx_incertitude' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'Intéressant. Je vous envoie la doc et j’y ajoute un exemple de dossier sur un sujet similaire.', { relation: 4, profitability: 2 }, { what: 'Vous personnalisez l’envoi.', why: 'Bien mieux qu’une plaquette générique, mais vous restez en attente.', rule: 'Un document personnalisé se lit ; un générique se classe.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Parfait, c’est éligible à coup sûr ! Je prépare le contrat.', { relation: 3, security: -12, mood: 2 }, { what: 'Vous concluez sur une phrase.', why: 'Une difficulté évoquée en trente secondes ne prouve pas l’éligibilité.', rule: 'Une phrase au téléphone n’est pas une qualification.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'empathie', 'Ah, tant mieux ! Bon, je vous laisse regarder la doc tranquillement.', { relation: 1, profitability: -6 }, { what: 'Vous laissez filer le signal.', why: 'Le prospect vient de vous offrir une ouverture et vous ne la saisissez pas.', rule: 'On rebondit sur un signal, on ne le range pas.' }, null, { flags: ['prospect_decline'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------------- 8. Le pressé
export const CALL_PRESSE: Scenario = {
  id: 'sc_call_presse',
  type: 'PROSPECT',
  title: 'Appel — « Vous avez trente secondes »',
  context: 'Le dirigeant décroche entre deux réunions. Tout se joue sur la concision.',
  objectives: ['Aller à l’essentiel', 'Créer un accroche en une phrase', 'Obtenir un créneau'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'agace',
      text: 'Je suis entre deux réunions. Vous avez trente secondes, allez-y.',
      choices: [
        choice('optimal', 'synthese', 'Trente secondes, parfait. Si vos équipes ont passé du temps cette année sur un problème technique sans solution toute faite, l’État peut en financer 30 %. Une question suffit à savoir si ça vous concerne — quand puis-je vous la poser ?', { relation: 5, security: 4, profitability: 4, mood: 5 }, { what: 'Pitch calibré et demande claire.', why: 'Bénéfice + preuve de brièveté + demande précise : le format qui marche sur un pressé.', rule: 'Un pressé accorde du temps à qui n’en fait pas perdre.' }, 'n2'),
        choice('acceptable', 'commercial', 'Le crédit d’impôt recherche finance 30 % de vos dépenses de R&D. Je peux vous expliquer en dix minutes.', { relation: 3, mood: 2 }, { what: 'Pitch correct.', why: 'Clair, mais impersonnel : rien ne lui dit que ça le concerne, lui.', rule: 'Un pitch générique obtient un « rappelez-moi ».' }, 'n2'),
        choice('tempting', 'commercial', 'C’est de l’argent que vous laissez à l’État chaque année, il faut vraiment qu’on se voie !', { relation: -3, security: -6, mood: -4 }, { what: 'Vous forcez l’urgence.', why: 'L’urgence artificielle est le marqueur du démarchage — il raccroche.', rule: 'On ne fabrique pas d’urgence pour un pressé.' }, 'n2'),
        choice('poor', 'technique', 'Alors, le CIR est un dispositif fiscal codifié à l’article 244 quater B qui prévoit plusieurs assiettes…', { relation: -10, mood: -10 }, { what: 'Vous perdez les trente secondes.', why: 'Le mauvais registre au pire moment : il a déjà décroché mentalement.', rule: 'Un pressé veut une synthèse, jamais un cours.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Bon. Mardi 8 h 30, quinze minutes, pas une de plus. Et vous m’envoyez l’ordre du jour avant.',
      choices: [
        choice('optimal', 'synthese', 'Noté : mardi 8 h 30, quinze minutes. Ordre du jour ce soir en trois lignes. Je viendrai avec deux questions, pas avec une présentation.', { relation: 6, security: 4, profitability: 4, mood: 4 }, { what: 'Vous confirmez et vous engagez sur le format.', why: 'Reformuler l’engagement et promettre un format court sécurise le rendez-vous.', rule: 'Avec un pressé, le format compte autant que le fond.' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'empathie', 'Parfait, mardi 8 h 30. Je vous envoie ça dans la journée, merci de votre temps.', { relation: 4, profitability: 2 }, { what: 'Vous confirmez simplement.', why: 'Correct, sans l’engagement de format qui rassure ce profil.', rule: 'Confirmer une date est le minimum.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Quinze minutes ce sera un peu court, prévoyons plutôt une heure.', { relation: -6, mood: -6 }, { what: 'Vous renégociez son temps.', why: 'Discuter le format qu’il vient de fixer annule le bénéfice de votre concision.', rule: 'On accepte le cadre du pressé, on l’exploite bien.' }, null, { flags: ['prospect_maybe'] }),
        choice('poor', 'fermete', 'D’accord, mais je préviens : en quinze minutes on ne pourra pas tout traiter.', { relation: -5, mood: -5 }, { what: 'Vous commencez par une réserve.', why: 'Ouvrir sur une limite donne envie d’annuler le rendez-vous.', rule: 'On ne plombe pas un accord obtenu.' }, null, { flags: ['prospect_maybe'] }),
      ],
    },
  ],
  outcome: OUT,
};

// --------------------------------------------------------- 9. Le sur-sollicité
export const CALL_AGRESSIF: Scenario = {
  id: 'sc_call_agressif',
  type: 'PROSPECT',
  title: 'Appel — Le dirigeant excédé',
  context: 'Il reçoit dix appels de démarchage par semaine. Vous êtes le onzième et il vous le fait savoir.',
  objectives: ['Encaisser sans se braquer', 'Se différencier en une phrase', 'Savoir abréger'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'ferme',
      text: 'Encore un ! Vous êtes le troisième cette semaine à m’appeler pour le CIR. Vous vous passez mon numéro entre vous ou quoi ?',
      choices: [
        choice('optimal', 'empathie', 'Je comprends votre agacement, et je ne vais pas prétendre être différent en trois mots. Une seule question et je vous laisse tranquille : les autres vous ont-ils demandé ce que vous fabriquez, ou seulement combien vous dépensez ?', { relation: 6, security: 4, mood: 6 }, { what: 'Vous encaissez et vous vous différenciez.', why: 'Reconnaître la saturation puis poser une question de fond vous sort du lot des démarcheurs.', rule: 'Face à l’agacement : accuser réception, puis une seule question.', codexUnlock: 'cdx_client_difficile' }, 'n2'),
        choice('acceptable', 'synthese', 'Je vous crois volontiers, et je ne vais pas insister. Souhaitez-vous que je vous rappelle à une période plus calme ?', { relation: 4, mood: 3 }, { what: 'Vous désamorcez poliment.', why: 'Respectueux, mais vous quittez l’appel sans avoir rien appris.', rule: 'Le retrait poli préserve la relation future.' }, 'n2'),
        choice('tempting', 'commercial', 'Justement, les autres ne font pas ce qu’on fait. Laissez-moi trois minutes pour vous le prouver.', { relation: -4, mood: -6 }, { what: 'Vous insistez comme les autres.', why: '« Nous, c’est différent » est exactement la phrase des dix appels précédents.', rule: 'Se dire différent ne différencie pas.' }, 'n2'),
        choice('poor', 'fermete', 'Si vous étiez mieux conseillé, vous ne recevriez pas autant d’appels.', { relation: -12, mood: -12 }, { what: 'Vous répondez à l’agressivité par l’agressivité.', why: 'Vous perdez le prospect et il en parlera autour de lui.', rule: 'On n’a jamais gagné un dossier en ayant le dernier mot.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'agace',
      text: '… Non. Aucun ne m’a demandé ce qu’on fabrique. Ils voulaient tous mon chiffre de masse salariale.',
      choices: [
        choice('optimal', 'preuve', 'C’est bien le problème : la masse salariale ne dit rien de l’éligibilité. Racontez-moi votre dernier vrai casse-tête technique — c’est là-dessus que se décide un dossier, et ça prend cinq minutes.', { relation: 6, security: 8, profitability: 3, mood: 5 }, { what: 'Vous prouvez la différence par la méthode.', why: 'Partir de la technique et non du chiffre est la vraie marque du conseil CIR sérieux.', rule: 'L’éligibilité se juge sur les travaux, jamais sur la masse salariale.' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'C’est révélateur. L’éligibilité se juge sur la nature des travaux, pas sur des ratios financiers.', { relation: 4, security: 6, mood: 3 }, { what: 'Vous posez le principe.', why: 'Juste, mais vous ne l’invitez pas à parler de son sujet.', rule: 'Après le principe, la question.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Donnez-la-moi quand même, votre masse salariale, je vous fais une estimation tout de suite.', { relation: -6, security: -10, mood: -6 }, { what: 'Vous faites exactement ce qu’il reproche aux autres.', why: 'Vous veniez de vous différencier ; vous rejoignez le lot en une phrase.', rule: 'Ne jamais démentir sa propre différence.' }, null, { flags: ['prospect_decline'] }),
        choice('poor', 'fermete', 'Vous voyez bien que les autres sont mauvais. Signez avec moi.', { relation: -10, mood: -10 }, { what: 'Vous concluez brutalement.', why: 'Passer d’un aveu à une demande de signature est le réflexe qui fait raccrocher.', rule: 'Un point marqué n’est pas une signature.' }, null, { flags: ['prospect_decline_rude'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ---------------------------------------------------- 10. La recommandation
export const CALL_RECOMMANDATION: Scenario = {
  id: 'sc_call_recommandation',
  type: 'PROSPECT',
  title: 'Appel — Recommandé par un client',
  context: 'Un de vos clients a donné votre nom. L’appel démarre en terrain favorable — à ne pas gâcher.',
  objectives: ['Honorer la recommandation', 'Ne pas relâcher la qualification', 'Protéger le prescripteur'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'satisfait',
      text: 'Bonjour ! C’est un confrère qui m’a donné votre nom, il dit le plus grand bien de votre travail.',
      choices: [
        choice('optimal', 'empathie', 'Ça me touche, merci de me le dire. Je vais essayer d’être à la hauteur : parlez-moi de ce qui vous a donné envie d’appeler.', { relation: 6, security: 4, mood: 5 }, { what: 'Vous accueillez et vous ouvrez.', why: 'Une recommandation se honore par l’écoute, pas par un pitch immédiat.', rule: 'Sur un lead chaud, on écoute d’abord.' }, 'n2'),
        choice('acceptable', 'synthese', 'Ravi de l’entendre. Dites-moi en deux mots où vous en êtes sur vos projets techniques.', { relation: 4, security: 4, mood: 3 }, { what: 'Vous entrez dans le sujet.', why: 'Efficace, un peu rapide sur le remerciement.', rule: 'La recommandation mérite un temps d’arrêt.' }, 'n2'),
        choice('tempting', 'commercial', 'Excellent ! Alors on peut aller vite, je vous envoie une proposition dès aujourd’hui.', { relation: 2, security: -10, profitability: 3 }, { what: 'Vous brûlez la qualification.', why: 'Une recommandation ouvre la porte, elle ne prouve pas l’éligibilité du nouveau dossier.', rule: 'Un lead chaud se qualifie comme un lead froid.' }, 'n2'),
        choice('poor', 'fermete', 'Il exagère toujours. Bon, votre masse salariale R&D, c’est combien ?', { relation: -8, mood: -8 }, { what: 'Vous cassez l’ambiance et le prescripteur.', why: 'Dévaloriser la recommandation vexe le prospect ET votre client prescripteur.', rule: 'On ne moque jamais celui qui vous a recommandé.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'enthousiaste',
      text: 'Il m’a dit qu’il avait touché 180 000 €. On est dans le même secteur, donc je me dis qu’on doit être dans les mêmes eaux, non ?',
      choices: [
        choice('optimal', 'fermete', 'Attention à cette comparaison : son montant dépend de SES projets et de SES équipes. Le vôtre peut être très différent, dans les deux sens. Regardons vos travaux avant tout rapprochement.', { relation: 4, security: 10, mood: 3 }, { what: 'Vous coupez court à l’ancrage.', why: 'Laisser s’installer le chiffre d’un autre crée une promesse implicite que vous ne tiendrez peut-être pas.', rule: 'Le montant d’un confrère n’est jamais une référence.', codexUnlock: 'cdx_estimer' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'Même secteur ne veut pas dire même dossier. Voyons vos projets, je vous donnerai une fourchette propre.', { relation: 4, security: 8, mood: 3 }, { what: 'Vous recadrez.', why: 'Juste et clair.', rule: 'Chaque assiette est spécifique.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Vous devriez être dans les mêmes ordres de grandeur, oui, autour de 180 000 € !', { relation: 8, security: -14, mood: 6 }, { what: 'Vous validez le chiffre d’un autre.', why: 'Vous venez de promettre 180 000 € sans avoir vu une seule ligne de son dossier.', rule: 'Ne jamais reprendre à son compte le chiffre d’un autre client.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'empathie', 'Sûrement, ne vous inquiétez pas pour le montant.', { relation: 4, security: -10 }, { what: 'Vous laissez faire.', why: 'Le silence complice vaut acceptation : il retiendra 180 000 €.', rule: 'Ne pas démentir, c’est promettre.' }, null, { flags: ['prospect_sign'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ----------------------------------------------------- 11. Le sur-estimateur
export const CALL_SURESTIME: Scenario = {
  id: 'sc_call_surestime',
  type: 'PROSPECT',
  title: 'Appel — « Chez nous, tout est innovant »',
  context: 'Le prospect est enthousiaste et persuadé que toute son activité relève de la R&D. Le piège inverse du sceptique.',
  objectives: ['Tempérer sans vexer', 'Séparer innovation et R&D', 'Éviter la mission toxique'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'enthousiaste',
      text: 'Vous tombez bien ! Chez nous tout est innovant : nouveau site, nouveaux packagings, nouvelle organisation. On doit avoir un CIR énorme.',
      choices: [
        choice('optimal', 'empathie', 'Votre énergie fait plaisir. Il faut juste que je vous prévienne : « innovant » au sens commercial et « R&D » au sens fiscal, ce sont deux choses différentes. On va trier ensemble — et le tri, c’est ce qui protège votre dossier.', { relation: 4, security: 10, mood: 3 }, { what: 'Vous tempérez avec bienveillance.', why: 'Poser la distinction dès l’appel évite une déception majeure au bilan.', rule: 'Nouveauté commerciale ≠ R&D éligible.', codexUnlock: 'cdx_nouveaute' }, 'n2'),
        choice('acceptable', 'synthese', 'Il faudra distinguer ce qui relève du CIR de ce qui n’en relève pas. Site web et packaging, par exemple, sortent du périmètre.', { relation: 2, security: 8, mood: 1 }, { what: 'Vous triez d’emblée.', why: 'Correct et factuel, un peu abrupt pour un enthousiaste.', rule: 'Le tri est le cœur du métier.' }, 'n2'),
        choice('tempting', 'commercial', 'Formidable ! Avec autant d’innovation, on va monter un très gros dossier.', { relation: 8, security: -14, mood: 6 }, { what: 'Vous surfez sur l’enthousiasme.', why: 'Vous venez de valider mentalement une assiette gonflée — et il s’en souviendra.', rule: 'Dire oui à tout crée une dette payée au contrôle.' }, 'n2'),
        choice('poor', 'fermete', 'Un site web, ce n’est pas de la recherche. Vous confondez tout.', { relation: -10, mood: -10 }, { what: 'Vous humiliez.', why: 'Avoir raison sur le fond ne sert à rien si vous perdez l’interlocuteur.', rule: 'On corrige une erreur sans rabaisser la personne.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Ah… mais alors qu’est-ce qui compte, chez nous ? On a quand même passé six mois sur une recette qui ne tenait pas au froid.',
      choices: [
        choice('optimal', 'preuve', 'Ça, ça m’intéresse beaucoup plus que le site web. « Qui ne tenait pas », six mois d’essais : c’est le profil d’un vrai verrou. C’est ce projet-là qu’on va documenter.', { relation: 6, security: 8, profitability: 3, mood: 5 }, { what: 'Vous recentrez sur le vrai sujet.', why: 'Le prospect vient de livrer le seul projet réellement éligible : il fallait le repérer.', rule: 'Un vrai verrou vaut mieux qu’un large périmètre creux.', codexUnlock: 'cdx_verrou' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'Ce projet-là est le bon candidat. On construira le dossier autour de lui, pas autour du reste.', { relation: 4, security: 8, mood: 3 }, { what: 'Vous resserrez le périmètre.', why: 'Juste : mieux vaut un petit dossier solide.', rule: 'Périmètre resserré = dossier défendable.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Celui-là et tous les autres ! On met tout, on verra bien ce que le fisc conteste.', { relation: 5, security: -16 }, { what: 'Vous ratissez large.', why: 'Tester la patience du vérificateur est la stratégie qui coûte le plus cher.', rule: 'On ne met jamais « pour voir ».' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'fermete', 'Six mois sur une recette, ce n’est pas non plus de la recherche fondamentale.', { relation: -8, security: -4, mood: -8 }, { what: 'Vous excluez à tort.', why: 'Le CIR ne demande pas de la recherche fondamentale : un verrou industriel documenté suffit.', rule: 'La prudence excessive fait perdre des dossiers légitimes.' }, null, { flags: ['prospect_decline'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------------- 12. Le DAF
export const CALL_DAF: Scenario = {
  id: 'sc_call_daf',
  type: 'PROSPECT',
  title: 'Appel — Le directeur financier',
  context: 'Un DAF au téléphone : il veut des montants, des délais et un risque chiffré. Pas d’histoires.',
  objectives: ['Parler trésorerie', 'Donner un cadre chiffré honnête', 'Quantifier le risque'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Je suis le DAF. Trois questions : combien, quand, et quel risque. Dans cet ordre.',
      choices: [
        choice('optimal', 'synthese', 'Parfait, je réponds dans cet ordre. Combien : 30 % des dépenses R&D retenues. Quand : imputation ou remboursement l’année suivant les dépenses, immédiat si vous êtes PME. Risque : proportionnel à la qualité des preuves — c’est le seul levier, et c’est le mien.', { relation: 6, security: 6, profitability: 4, mood: 5 }, { what: 'Vous répondez dans son ordre.', why: 'Reprendre la structure de la question d’un DAF est la marque du bon interlocuteur.', rule: 'Avec un financier : montant, délai, risque — dans cet ordre.', codexUnlock: 'cdx_calendrier' }, 'n2'),
        choice('acceptable', 'preuve', '30 % de l’assiette éligible, restituable l’année suivante, avec un risque maîtrisable par la documentation.', { relation: 4, security: 5, mood: 3 }, { what: 'Vous couvrez les trois points.', why: 'Juste, mais sans la structure explicite qu’il a demandée.', rule: 'Épouser la structure de la question rassure.' }, 'n2'),
        choice('tempting', 'commercial', 'Beaucoup, vite, et sans risque avec nous.', { relation: -6, security: -12, mood: -8 }, { what: 'Vous répondez en slogan.', why: 'Un DAF entend « je n’ai pas les chiffres » et met fin à l’entretien.', rule: 'Un financier ne s’achète pas avec des adjectifs.' }, 'n2'),
        choice('poor', 'empathie', 'C’est un peu tôt pour ces questions, apprenons d’abord à nous connaître.', { relation: -8, mood: -8 }, { what: 'Vous esquivez.', why: 'Refuser de répondre à un DAF sur les chiffres est disqualifiant.', rule: 'On ne repousse pas la question chiffrée d’un financier.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Et si l’administration remet en cause le dossier deux ans plus tard, il se passe quoi pour ma trésorerie ?',
      choices: [
        choice('optimal', 'preuve', 'Vous remboursez la fraction rejetée, avec intérêts de retard. C’est pour ça que je préfère un dossier plus petit et incontestable qu’un dossier maximal : le coût d’un rappel dépasse toujours le gain du gonflage.', { relation: 5, security: 10, profitability: 2, mood: 4 }, { what: 'Vous quantifiez le risque honnêtement.', why: 'Nommer les intérêts de retard prouve que vous connaissez le coût réel d’un redressement.', rule: 'Le coût d’un rappel dépasse le gain d’une assiette gonflée.', codexUnlock: 'cdx_controle_deroule' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'La part rejetée est à rembourser. D’où l’intérêt d’une assiette prudente et documentée.', { relation: 4, security: 8, mood: 3 }, { what: 'Vous répondez juste.', why: 'Correct, sans la mention des intérêts qui marque un DAF.', rule: 'Le remboursement porte sur la part rejetée.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Ça n’arrivera pas, nos dossiers passent toujours.', { relation: -4, security: -12, mood: -6 }, { what: 'Vous niez le risque.', why: 'Affirmer l’infaillibilité devant un DAF revient à avouer qu’on ne mesure rien.', rule: 'Le risque zéro n’existe pas ; le quantifier, si.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'technique', 'Il faudrait voir le régime des intérêts moratoires et la doctrine applicable au cas d’espèce…', { relation: -5, mood: -5 }, { what: 'Vous noyez la réponse.', why: 'Une question de trésorerie appelle un chiffre, pas une dissertation.', rule: 'À une question de cash, une réponse de cash.' }, null, { flags: ['prospect_maybe'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------- 13. Le non-éligible
export const CALL_NON_ELIGIBLE: Scenario = {
  id: 'sc_call_non_eligible',
  type: 'PROSPECT',
  title: 'Appel — Le prospect clairement non éligible',
  context: 'Une entreprise de négoce sans aucune activité technique. Le CIR n’a rien à faire ici.',
  objectives: ['Diagnostiquer vite', 'Refuser sans humilier', 'Laisser une bonne image'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'enthousiaste',
      text: 'On a refait tout notre site e-commerce cette année, et on a changé de logiciel de caisse. Mon comptable dit que c’est du CIR !',
      choices: [
        choice('optimal', 'empathie', 'Votre comptable part d’une bonne intention, mais je vais être direct : refonte de site et changement de logiciel, c’est du développement courant, sans incertitude scientifique. Ce n’est pas du CIR.', { relation: 4, security: 10, mood: 2 }, { what: 'Vous diagnostiquez immédiatement.', why: 'Laisser durer l’illusion coûterait des semaines à tout le monde.', rule: 'Intégration et refonte : développement courant, hors CIR.', codexUnlock: 'cdx_dev_courant' }, 'n2'),
        choice('acceptable', 'preuve', 'Ces travaux relèvent du développement courant. Y a-t-il, ailleurs dans l’entreprise, un sujet technique non résolu ?', { relation: 4, security: 8, mood: 2 }, { what: 'Vous excluez puis vous vérifiez.', why: 'Bonne rigueur : on exclut, mais on laisse une chance à un autre projet.', rule: 'Exclure un projet n’exclut pas l’entreprise.' }, 'n2'),
        choice('tempting', 'commercial', 'Votre comptable a raison ! On peut valoriser tout ça, prenons rendez-vous.', { relation: 6, security: -16 }, { what: 'Vous validez une erreur.', why: 'Vous embarquez le client vers un redressement certain — et vous le savez.', rule: 'On ne vend jamais un dossier qu’on sait faux.' }, 'n2'),
        choice('poor', 'fermete', 'Votre comptable raconte n’importe quoi, il ne connaît manifestement rien au CIR.', { relation: -10, mood: -8 }, { what: 'Vous attaquez son conseil.', why: 'Le comptable est souvent un prescripteur : le dénigrer se paie deux fois.', rule: 'On corrige un confrère sans le démolir.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'agace',
      text: 'Donc j’ai investi 200 000 € en informatique pour rien ? Vous ne pouvez vraiment rien faire ?',
      choices: [
        choice('optimal', 'empathie', 'Pas pour rien — mais pas pour le CIR. Je préfère vous le dire aujourd’hui plutôt que vous facturer un dossier qui sauterait au contrôle. Si vous lancez un jour un vrai développement technique risqué, appelez-moi.', { relation: 6, security: 10, mood: 4 }, { what: 'Vous refusez et vous gardez le lien.', why: 'Un refus honnête et expliqué transforme un non en relation durable.', rule: 'On peut gagner en refusant.', codexUnlock: 'cdx_dire_non' }, null, { flags: ['prospect_decline'] }),
        choice('acceptable', 'synthese', 'Pas sur le CIR, non. D’autres dispositifs existent peut-être, mais ce n’est pas mon domaine — je ne vais pas vous vendre du vent.', { relation: 4, security: 8, mood: 3 }, { what: 'Vous refusez proprement.', why: 'Honnête, et vous ne sortez pas de votre expertise.', rule: 'On refuse aussi ce qu’on ne maîtrise pas.' }, null, { flags: ['prospect_decline'] }),
        choice('tempting', 'commercial', 'Écoutez, on peut toujours tenter le coup. Au pire, l’administration ne dira rien.', { relation: 5, security: -18 }, { what: 'Vous pariez sur l’inattention du fisc.', why: 'C’est exactement la faute professionnelle qui déclenche les redressements.', rule: 'On ne mise jamais sur l’absence de contrôle.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'fermete', 'Rien du tout. Vous me faites perdre mon temps, au revoir.', { relation: -12, mood: -12 }, { what: 'Vous humiliez un prospect de bonne foi.', why: 'Il parlera de vous — en mal — à tout son réseau professionnel.', rule: 'Un non se dit avec respect, toujours.' }, null, { flags: ['prospect_decline_rude'] }),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------ 14. L’ancien redressé
export const CALL_REDRESSE: Scenario = {
  id: 'sc_call_redresse',
  type: 'PROSPECT',
  title: 'Appel — « On s’est déjà fait redresser »',
  context: 'L’entreprise a subi un redressement CIR il y a deux ans. Elle est éligible, mais échaudée.',
  objectives: ['Comprendre ce qui a échoué', 'Ne pas accuser le prédécesseur', 'Proposer une méthode différente'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'ferme',
      text: 'On a fait du CIR il y a deux ans. Résultat : redressement de 80 000 €. Alors le CIR, chez nous, c’est terminé.',
      choices: [
        choice('optimal', 'preuve', 'Je comprends que ça vous ait vacciné. Pour savoir si c’est réellement terminé, une question : le rappel portait-il sur la nature des projets, ou sur l’absence de justificatifs ?', { relation: 5, security: 8, mood: 4 }, { what: 'Vous cherchez la cause exacte.', why: 'Un rejet pour défaut de preuve se corrige ; un rejet sur la nature des travaux, non.', rule: 'Un redressement a une cause précise — il faut la connaître.' }, 'n2'),
        choice('acceptable', 'empathie', 'Quatre-vingt mille euros, c’est une somme, je comprends votre réaction. Que vous avait-on reproché exactement ?', { relation: 5, security: 6, mood: 4 }, { what: 'Vous compatissez et vous ouvrez.', why: 'L’écoute désamorce ; la question précise viendra ensuite.', rule: 'On écoute avant de diagnostiquer.' }, 'n2'),
        choice('tempting', 'commercial', 'Votre ancien cabinet a mal travaillé, c’est évident. Avec nous ça n’arriverait pas.', { relation: -4, security: -8, mood: -5 }, { what: 'Vous accusez sans savoir.', why: 'Vous ignorez le dossier — et le client a peut-être lui-même forcé la main.', rule: 'On ne juge pas un dossier qu’on n’a pas lu.' }, 'n2'),
        choice('poor', 'fermete', 'C’est dommage de renoncer, vous perdez de l’argent chaque année.', { relation: -8, mood: -8 }, { what: 'Vous ignorez le traumatisme.', why: 'Parler d’argent perdu à quelqu’un qui vient d’en rembourser 80 000 € est indécent.', rule: 'On ne relativise jamais la perte d’un client.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Sur les justificatifs. Le vérificateur a demandé nos feuilles de temps, on n’en avait aucune. Les projets, eux, il ne les a pas contestés.',
      choices: [
        choice('optimal', 'preuve', 'C’est une excellente nouvelle, aussi étrange que ça paraisse : vos projets étaient éligibles, seule la preuve manquait. Ça, ça se corrige — feuilles de temps dès janvier, comptes rendus datés. Le fond était bon.', { relation: 7, security: 10, profitability: 3, mood: 6 }, { what: 'Vous transformez le traumatisme en diagnostic.', why: 'Distinguer « projets rejetés » et « preuves manquantes » redonne une perspective réaliste.', rule: 'La preuve se constitue pendant les travaux, pas au contrôle.', codexUnlock: 'cdx_preuve' }, null, { flags: ['prospect_maybe'] }),
        choice('acceptable', 'synthese', 'Donc le problème était documentaire, pas fiscal. C’est le plus facile à corriger.', { relation: 5, security: 8, mood: 4 }, { what: 'Vous posez le bon diagnostic.', why: 'Juste, sans l’effet rassurant du détail concret.', rule: 'Un défaut de preuve se corrige par la méthode.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'Alors reprenons tout de suite, et on récupérera même les années passées !', { relation: 3, security: -12, mood: 2 }, { what: 'Vous précipitez et vous promettez du rétroactif.', why: 'Relancer un contribuable déjà redressé sans méthode consolidée est irresponsable.', rule: 'Après un redressement, on reconstruit avant de redemander.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'fermete', 'Sans feuilles de temps, vous n’auriez jamais dû déposer. C’était une faute.', { relation: -10, mood: -10 }, { what: 'Vous donnez une leçon.', why: 'Le client le sait déjà et l’a payé 80 000 € — le lui rappeler ne sert à rien.', rule: 'On ne fait pas la leçon à quelqu’un qui a déjà payé.' }, null, { flags: ['prospect_decline'] }),
      ],
    },
  ],
  outcome: OUT,
};

export const CALL_SCENARIOS: Scenario[] = [
  CALL_CURIEUX,
  CALL_BARRAGE,
  CALL_CONCURRENT,
  CALL_PEUR,
  CALL_TROP_PETIT,
  CALL_PRIX,
  CALL_DOC,
  CALL_PRESSE,
  CALL_AGRESSIF,
  CALL_RECOMMANDATION,
  CALL_SURESTIME,
  CALL_DAF,
  CALL_NON_ELIGIBLE,
  CALL_REDRESSE,
];

/**
 * Pool de situations d'appel par profil d'éligibilité du prospect.
 * Un prospect non éligible ne doit jamais tomber sur un scénario dont
 * le contenu suppose un vrai projet R&D, et inversement.
 */
export const CALL_POOL: Record<EligibilityProfile, string[]> = {
  ELIGIBLE: [
    'sc_call_recommandation',
    'sc_call_daf',
    'sc_call_trop_petit',
    'sc_call_peur',
    'sc_call_redresse',
    'sc_call_presse',
    'sc_call_prix',
    'sc_call_barrage',
  ],
  BORDERLINE: [
    'sc_call_curieux',
    'sc_call_concurrent',
    'sc_call_doc',
    'sc_call_agressif',
    'sc_call_surestime',
    'sc_call_presse',
    'sc_call_prix',
    'sc_call_barrage',
    'sc_call_peur',
  ],
  NOT_ELIGIBLE: [
    'sc_call_non_eligible',
    'sc_call_surestime',
    'sc_call_curieux',
    'sc_call_doc',
    'sc_call_agressif',
  ],
};
