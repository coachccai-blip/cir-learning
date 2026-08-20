import type { Scenario } from '../../engine/types';
import { choice, DEFAULT_OUTCOME } from './helpers';

// Maison Dupuis — Marc Dupuis, DREAMER (« tout est de la R&D »).

export const AGRI_DISCOVERY: Scenario = {
  id: 'sc_agri_disc',
  type: 'DISCOVERY',
  clientId: 'cli_agri_dupuis',
  title: 'Rendez-vous découverte — Maison Dupuis',
  context: 'Marc Dupuis vous reçoit dans son laboratoire agroalimentaire. Il est enthousiaste, persuadé que toute son activité relève de la R&D.',
  objectives: ['Qualifier le périmètre réel', 'Ne pas gonfler les attentes', 'Repérer un vrai verrou'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Marc Dupuis',
      expression: 'enthousiaste',
      text: 'Bienvenue ! Ici, on innove sur toute la ligne : nouvelles recettes, nouveaux packs, nouveau site web. C’est 100 % de la R&D, non ?',
      choices: [
        choice('optimal', 'empathie', 'Votre énergie fait plaisir à voir. Distinguons ensemble ce qui lève une vraie incertitude scientifique de ce qui est du développement produit — les deux sont utiles, mais un seul ouvre le CIR.', { relation: 5, security: 10, profitability: -1, mood: 3, trust: 5 }, { what: 'Vous recadrez avec bienveillance.', why: 'Le rôle du consultant est de trier, pas de flatter.', rule: 'Nouveauté commerciale ≠ R&D éligible.', codexUnlock: 'cdx_nouveaute' }, 'n2'),
        choice('acceptable', 'synthese', 'On va regarder projet par projet ; certains relèveront du CIR, d’autres non.', { relation: 2, security: 6, mood: 1 }, { what: 'Vous posez la méthode.', why: 'Correct, un peu sec pour un enthousiaste.', rule: 'Trier tôt évite les déceptions tardives.' }, 'n2'),
        choice('tempting', 'commercial', 'Absolument, avec un tel dynamisme il y a un gros CIR à la clé !', { relation: 10, security: -12, mood: 6 }, { what: 'Vous surfez sur l’enthousiasme.', why: 'Vous venez de valider mentalement une assiette gonflée.', rule: 'Dire oui à tout crée une dette payée au contrôle.' }, 'n2'),
        choice('poor', 'technique', 'Alors, au sens du BOI-BIC-RICI-10-10, l’état de l’art conditionne l’éligibilité intrinsèque des travaux…', { relation: -8, mood: -5 }, { what: 'Vous jargonnez.', why: 'Marc n’est pas technique : vous le perdez.', rule: 'Adapter le registre au profil non technique.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Marc Dupuis',
      expression: 'satisfait',
      text: 'Le vrai casse-tête cette année, c’était de stabiliser notre émulsion végétale sans additif. On a galéré des mois.',
      choices: [
        choice('optimal', 'preuve', 'Ça, c’est intéressant : qu’est-ce qui rendait le résultat incertain ? Y avait-il une solution connue que vous ne pouviez pas simplement appliquer ?', { relation: 4, security: 10, mood: 4, trust: 4 }, { what: 'Vous cherchez le verrou.', why: 'L’incertitude sur l’aboutissement est le cœur de l’éligibilité.', rule: 'Un verrou se caractérise par une question, pas par « on a galéré ».', codexUnlock: 'cdx_verrou' }, 'n3'),
        choice('acceptable', 'technique', 'Décrivez-moi les essais que vous avez menés et ce que vous avez conservé.', { security: 8, profitability: -1, mood: 1 }, { what: 'Vous creusez la démarche.', why: 'Bonne piste, un peu abrupte.', rule: 'Les essais tracés font la preuve.' }, 'n3'),
        choice('tempting', 'commercial', 'Parfait, ça suffira pour un beau dossier, ne cherchons pas plus loin.', { relation: 6, security: -8 }, { what: 'Vous vous contentez d’un récit.', why: '« On a galéré » n’est pas encore une preuve.', rule: 'Un récit d’effort ne caractérise pas un verrou.' }, 'n3'),
        choice('poor', 'fermete', 'Si vous avez galéré, c’est sûrement éligible, on met tout.', { security: -12, mood: 2 }, { what: 'Vous concluez trop vite.', why: 'La difficulté ne suffit pas à qualifier de la R&D.', rule: 'Difficulté ≠ incertitude scientifique.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Marc Dupuis',
      expression: 'neutre',
      text: 'Et là, mon commercial me dit qu’on peut aussi mettre le nouveau site web et le dépôt de brevet dans le dossier. C’est vrai ?',
      choices: [
        choice('optimal', 'preuve', 'Non : le site web est du développement courant, et depuis 2025 les frais de brevet ne sont plus dans l’assiette. Les y mettre vous exposerait à un redressement.', { relation: 3, security: 12, trust: 6 }, { what: 'Vous protégez le client.', why: 'Frais de brevet et veille sont supprimés depuis le 15/02/2025.', rule: 'Postes supprimés = pièges à redressement.', codexUnlock: 'cdx_supprimes' }, 'n4'),
        choice('acceptable', 'synthese', 'Le site non ; pour le brevet, je vérifie, mais je crois que ce n’est plus éligible.', { security: 6, trust: 2 }, { what: 'Vous restez prudent.', why: 'Prudent, mais vous savez déjà : le brevet est exclu.', rule: 'Mieux vaut trancher clairement quand on sait.' }, 'n4'),
        choice('tempting', 'commercial', 'Le brevet, pourquoi pas, on tentera. Le site, on verra.', { relation: 6, security: -14 }, { what: 'Vous laissez la porte ouverte.', why: 'Intégrer un poste supprimé est un redressement quasi certain.', rule: 'On ne « tente » pas un poste exclu par la loi.' }, 'n4'),
        choice('poor', 'fermete', 'Oui, mettez tout, l’administration ne regardera pas dans le détail.', { security: -18 }, { what: 'Vous pariez sur l’inattention du fisc.', why: 'Les postes supprimés sont précisément ce que le contrôle cible.', rule: 'Ne jamais miser sur l’absence de contrôle.' }, 'n4'),
      ],
    },
    {
      id: 'n4',
      speaker: 'Marc Dupuis',
      expression: 'enthousiaste',
      text: 'Bon, vous m’avez l’air sérieux. Ça donnerait combien, à la louche, mon crédit d’impôt ?',
      choices: [
        choice('optimal', 'synthese', 'Sur ce que j’ai vu, je table sur une fourchette prudente de 60 à 90 k€, à confirmer après les feuilles de temps. Je préfère m’engager sur du solide.', { relation: 6, security: 4, mood: 3, trust: 4 }, { what: 'Vous annoncez une fourchette.', why: 'Une fourchette prudente coûte peu et protège.', rule: 'Estimer sans s’engager sur un chiffre précis.', codexUnlock: 'cdx_estimer' }, 'n5', { promise: { kind: 'range', min: 60000, max: 90000 } }),
        choice('acceptable', 'fermete', 'Je ne m’avance pas avant d’avoir les feuilles de temps. Laissez-moi deux semaines.', { security: 6, relation: -3, mood: -2 }, { what: 'Vous temporisez.', why: 'Rigoureux, un peu frustrant pour un optimiste.', rule: 'La prudence doit rester chaleureuse.' }, 'n5'),
        choice('tempting', 'commercial', 'Facile : au moins 120 000 €, vous pouvez compter dessus !', { relation: 12, security: -10, mood: 8 }, { what: 'Vous lâchez un chiffre précis et haut.', why: 'Marc retiendra 120 k€ — et vous le reprochera au bilan.', rule: 'Un chiffre précis trop tôt devient une promesse.' }, 'n5', { promise: { kind: 'precise', min: 120000, max: 120000 } }),
        choice('poor', 'empathie', 'Oh, ça peut aller très haut, ne vous inquiétez de rien !', { relation: 8, security: -12, mood: 6 }, { what: 'Vous promettez du vent.', why: 'Une promesse floue et haute est la pire des dettes.', rule: 'Le flou optimiste se paie cash au bilan.' }, 'n5'),
      ],
    },
    {
      id: 'n5',
      speaker: 'Marc Dupuis',
      expression: 'satisfait',
      text: 'Très bien ! On signe ? Vos honoraires, c’est quoi le principe ?',
      choices: [
        choice('optimal', 'synthese', 'Au succès : un pourcentage du CIR réellement obtenu. Vous ne payez que si vous touchez. On finalise la proposition cette semaine.', { relation: 6, security: 4, profitability: 6, trust: 4 }, { what: 'Vous cadrez le modèle.', why: 'Le succès aligne vos intérêts sur ceux du client.', rule: 'Transparence sur les honoraires = confiance durable.' }, null),
        choice('acceptable', 'commercial', 'On est au succès, 20 % du CIR obtenu. Je vous envoie ça.', { profitability: 6, relation: 2 }, { what: 'Vous annoncez le taux.', why: 'Clair et efficace.', rule: 'Un taux annoncé franchement se négocie mieux.' }, null),
        choice('tempting', 'commercial', 'On verra les honoraires plus tard, signons d’abord.', { relation: 4, profitability: -4 }, { what: 'Vous éludez le prix.', why: 'Repousser le sujet honoraires affaiblit votre marge.', rule: 'Le cadrage financier fait partie du kick-off.' }, null),
        choice('poor', 'fermete', 'Ce sera un forfait fixe, payable maintenant.', { relation: -6, profitability: 2 }, { what: 'Vous changez de modèle.', why: 'Un forfait payable d’avance sur un CIR incertain inquiète le client.', rule: 'Le modèle au succès rassure sur un dispositif incertain.' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};

export const AGRI_KICKOFF: Scenario = {
  id: 'sc_agri_kick',
  type: 'KICKOFF',
  clientId: 'cli_agri_dupuis',
  title: 'Kick-off — Maison Dupuis',
  context: 'Vous avez signé la semaine dernière. Marc a réuni sa responsable qualité et son technicien de labo.',
  objectives: ['Identifier les interlocuteurs techniques', 'Cadrer le périmètre 2025', 'Poser le calendrier de collecte'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Marc Dupuis',
      expression: 'enthousiaste',
      text: 'On est prêts ! Je vous ai tout préparé : on a innové sur toute la ligne cette année.',
      choices: [
        choice('optimal', 'empathie', 'Formidable. Avant les chiffres, listons les projets un par un — y compris ceux qui n’ont pas abouti.', { relation: 5, security: 10, profitability: -2, mood: 4, trust: 6 }, { what: 'Vous ouvrez large.', why: 'Les projets abandonnés matérialisent l’incertitude et sont souvent les plus éligibles.', rule: 'En kick-off, on collecte large puis on resserre.', codexUnlock: 'cdx_echecs_eligibles' }, 'n2', { flags: ['a_demande_les_echecs'] }),
        choice('acceptable', 'synthese', 'Parfait. Qui sont les personnes qui ont réellement mené les travaux techniques ?', { security: 8, mood: 1, trust: 3 }, { what: 'Vous identifiez les interlocuteurs.', why: 'Bon réflexe : on parle aux bonnes personnes.', rule: 'Le kick-off identifie les référents techniques.', codexUnlock: 'cdx_kickoff' }, 'n2'),
        choice('tempting', 'commercial', 'Super, on prend tout ce que vous avez préparé, ça ira !', { relation: 6, security: -10, mood: 4 }, { what: 'Vous prenez sans trier.', why: 'Ce que le client a « préparé » n’est pas forcément éligible.', rule: 'Collecter n’est pas valider.' }, 'n2'),
        choice('poor', 'fermete', 'Donnez-moi juste les montants, on ira vite.', { relation: -6, security: -6 }, { what: 'Vous sautez le cadrage.', why: 'Sans périmètre ni interlocuteurs, l’assiette sera fragile.', rule: 'Pas de chiffre sans cadrage.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Nadia Cherif (responsable qualité)',
      expression: 'neutre',
      text: 'Moi je passe la moitié de mon temps sur le contrôle qualité des lots. Ça compte, non ?',
      choices: [
        choice('optimal', 'preuve', 'Le contrôle qualité de production, non : ce n’est pas de la R&D. En revanche, si vous avez participé aux essais de l’émulsion, ce temps-là compte.', { security: 12, relation: 2, trust: 4 }, { what: 'Vous distinguez production et R&D.', why: 'Le contrôle qualité courant n’entre pas dans l’assiette.', rule: 'Seul le temps affecté à la R&D est retenu.', codexUnlock: 'cdx_personnel' }, 'n3'),
        choice('acceptable', 'synthese', 'Distinguons votre temps R&D de votre temps production, feuilles de temps à l’appui.', { security: 8, trust: 2 }, { what: 'Vous demandez la trace.', why: 'Correct : la preuve, ce sont les feuilles de temps.', rule: 'Le prorata se justifie par pièce.' }, 'n3'),
        choice('tempting', 'commercial', 'Mettons 50 %, ça semble raisonnable.', { relation: 4, security: -10 }, { what: 'Vous posez un taux sans preuve.', why: 'Un taux « raisonnable » non justifié tombe au contrôle.', rule: 'Un taux se prouve, il ne s’estime pas au doigt mouillé.' }, 'n3'),
        choice('poor', 'empathie', 'Bien sûr, si vous vous sentez impliquée, on met 100 %.', { relation: 6, security: -15 }, { what: 'Vous validez du ressenti.', why: 'Le sentiment d’implication n’est pas un taux d’affectation.', rule: 'On ne valorise pas un ressenti.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Marc Dupuis',
      expression: 'satisfait',
      text: 'On a aussi fait appel à un labo extérieur pour des analyses. C’est dans le dossier ?',
      choices: [
        choice('optimal', 'preuve', 'Seulement s’il est agréé par le MESR. Sans agrément, la dépense n’est pas éligible, même si les travaux sont réels. Vous avez son numéro d’agrément ?', { security: 12, trust: 4 }, { what: 'Vous vérifiez l’agrément.', why: 'Depuis 2022, tout sous-traitant doit être agréé.', rule: 'Pas d’agrément MESR = dépense exclue.', codexUnlock: 'cdx_st_agrement' }, 'n4'),
        choice('acceptable', 'synthese', 'Notez-le, mais je devrai vérifier son agrément avant de le retenir.', { security: 8 }, { what: 'Vous conditionnez.', why: 'Bon réflexe de vérification.', rule: 'La sous-traitance se retient sous condition d’agrément.' }, 'n4'),
        choice('tempting', 'commercial', 'Un labo, ça passe toujours, on le met.', { relation: 3, security: -12 }, { what: 'Vous présumez l’agrément.', why: 'INRAE agréé oui, mais un labo privé quelconque, souvent non.', rule: 'On ne présume jamais l’agrément.' }, 'n4'),
        choice('poor', 'fermete', 'La sous-traitance, on double même le montant, c’est avantageux.', { security: -16 }, { what: 'Vous inventez une règle.', why: 'Aucun doublement de sous-traitance n’existe, et elle est plafonnée.', rule: 'La sous-traitance est plafonnée, jamais majorée.', codexUnlock: 'cdx_st_plafonds' }, 'n4'),
      ],
    },
    {
      id: 'n4',
      speaker: 'Marc Dupuis',
      expression: 'neutre',
      text: 'Parfait. On se cale comment pour la suite ?',
      choices: [
        choice('optimal', 'synthese', 'Je vous envoie une liste de pièces à réunir — feuilles de temps signées, comptes rendus d’essais — et on fait un point de suivi dans trois semaines.', { relation: 5, security: 8, profitability: 2, trust: 4 }, { what: 'Vous posez le calendrier.', why: 'La preuve se collecte au fil de l’eau, pas à la fin.', rule: 'Un plan de collecte daté sécurise le dossier.', codexUnlock: 'cdx_pieces' }, null),
        choice('acceptable', 'fermete', 'Rassemblez vos justificatifs, je reviens vers vous.', { security: 5, relation: 1 }, { what: 'Vous déléguez la collecte.', why: 'Correct mais un peu vague sur le « quoi » et le « quand ».', rule: 'Un plan précis vaut mieux qu’un « rassemblez tout ».' }, null),
        choice('tempting', 'commercial', 'Ne vous embêtez pas, je me débrouillerai avec ce que vous avez.', { relation: 6, security: -10 }, { what: 'Vous renoncez à la collecte.', why: 'Sans pièces, le dossier ne sera pas opposable.', rule: 'Pas de collecte = pas de preuve.' }, null),
        choice('poor', 'empathie', 'On verra les documents plus tard, l’important c’est d’avancer.', { relation: 4, security: -12 }, { what: 'Vous repoussez la preuve.', why: 'Repousser la collecte, c’est la perdre.', rule: 'La preuve différée est une preuve perdue.' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};
