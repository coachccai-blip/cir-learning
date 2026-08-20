import type { Scenario } from '../../engine/types';
import { choice, DEFAULT_OUTCOME } from './helpers';

// Mecaprécis — Hervé Verdier, SCEPTIC (peur du redressement, exige des preuves).

export const INDUS_DISCOVERY: Scenario = {
  id: 'sc_indus_disc',
  type: 'DISCOVERY',
  clientId: 'cli_indus_verdier',
  title: 'Rendez-vous découverte — Mecaprécis',
  context: 'Hervé Verdier vous reçoit, bras croisés. Un concurrent redressé lui a laissé une peur bleue du CIR. Il veut des références et du texte de loi.',
  objectives: ['Établir la crédibilité par la preuve', 'Ne pas rassurer trop vite', 'Repérer les vrais travaux R&D'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Hervé Verdier',
      expression: 'ferme',
      text: 'Je vais être direct : un confrère s’est fait redresser de 200 000 € sur son CIR. Pourquoi je vous ferais confiance ?',
      choices: [
        choice('optimal', 'preuve', 'Vous avez raison d’être prudent. Justement, mon travail est de ne retenir que ce qui tient devant un vérificateur — je vous montrerai chaque règle appliquée, texte à l’appui.', { relation: 6, security: 8, mood: 5, trust: 6 }, { what: 'Vous validez sa prudence.', why: 'Le sceptique se gagne par la rigueur, pas par les promesses.', rule: 'Face au sceptique : preuve, références, cadre légal.', codexUnlock: 'cdx_client_difficile' }, 'n2'),
        choice('acceptable', 'technique', 'Je m’appuie sur le CGI 244 quater B et le guide du MESR. Chaque poste retenu sera justifié.', { security: 8, mood: 3, trust: 3 }, { what: 'Vous citez le cadre.', why: 'Solide, un peu frontal d’entrée.', rule: 'Citer la source rassure un sceptique.' }, 'n2'),
        choice('tempting', 'commercial', 'Ne vous inquiétez pas, avec moi il n’y a aucun risque, c’est du solide !', { relation: -6, security: -8, mood: -6 }, { what: 'Vous rassurez trop vite.', why: 'Promettre « aucun risque » à un sceptique détruit votre crédibilité.', rule: 'Le zéro risque n’existe pas — et il le sait.' }, 'n2'),
        choice('poor', 'empathie', 'Je comprends votre peur, mais faites-moi confiance, ça ira.', { relation: -4, mood: -5 }, { what: 'Vous demandez une confiance non méritée.', why: '« Faites-moi confiance » est exactement ce qu’il refuse d’entendre.', rule: 'La confiance se prouve, elle ne se réclame pas.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Hervé Verdier',
      expression: 'agace',
      text: 'On usine des pièces. Où est la « recherche » là-dedans, concrètement ?',
      choices: [
        choice('optimal', 'preuve', 'Dans la mise au point d’un procédé pour usiner un alliage réfractaire que personne ne maîtrisait — pas dans la production série. Le banc d’essais que vous avez construit en est la trace.', { relation: 4, security: 12, mood: 4, trust: 5 }, { what: 'Vous pointez le verrou réel.', why: 'Vous séparez R&D et production, ce qu’un vérificateur exigera.', rule: 'Seule la mise au point du procédé est R&D.', codexUnlock: 'cdx_verrou' }, 'n3'),
        choice('acceptable', 'technique', 'La R&D est dans les prototypes et les essais de procédé, pas dans la série. Montrez-moi vos comptes rendus d’essais.', { security: 10, mood: 2, trust: 3 }, { what: 'Vous demandez la preuve.', why: 'Juste et rigoureux.', rule: 'Prototypes et essais tracés = cœur du dossier.' }, 'n3'),
        choice('tempting', 'commercial', 'Toute votre production de haute précision, c’est de la R&D, croyez-moi.', { relation: -4, security: -14, mood: -4 }, { what: 'Vous surqualifiez.', why: 'Assimiler la production série à de la R&D est faux — et il le sent.', rule: 'La production série n’est jamais de la R&D.' }, 'n3'),
        choice('poor', 'fermete', 'Peu importe le détail, on mettra tout l’atelier dans l’assiette.', { security: -16, mood: -6 }, { what: 'Vous ratissez tout.', why: 'C’est précisément ce qui a fait redresser son confrère.', rule: 'Ratisser large = redressement large.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Hervé Verdier',
      expression: 'neutre',
      text: 'On a aussi acheté une machine-outil neuve pour la série. Vous allez me dire qu’elle compte ?',
      choices: [
        choice('optimal', 'preuve', 'Non. Une machine de production série n’est pas affectée à la R&D : sa dotation ne rentre pas. Seul le banc d’essais dédié compte.', { relation: 5, security: 12, mood: 4, trust: 6 }, { what: 'Vous excluez la bonne ligne.', why: 'Un sceptique qui vous voit refuser une dépense vous fait davantage confiance.', rule: 'Seules les immobilisations affectées à la R&D comptent.', codexUnlock: 'cdx_amortissements' }, 'n4'),
        choice('acceptable', 'synthese', 'La machine série, non. On ne garde que ce qui est dédié aux essais.', { security: 8, mood: 2, trust: 2 }, { what: 'Vous tranchez juste.', why: 'Clair et correct.', rule: 'Le prorata d’affectation R&D fait foi.' }, 'n4'),
        choice('tempting', 'commercial', 'Une machine neuve, on peut la mettre à 100 %, ça gonfle bien l’assiette.', { relation: -6, security: -14, mood: -5 }, { what: 'Vous gonflez.', why: 'Un actif de production à 100 % R&D est indéfendable.', rule: 'On ne valorise pas un actif de série.' }, 'n4'),
        choice('poor', 'fermete', 'Bien sûr, tout le parc machine passe dans le forfait.', { security: -16 }, { what: 'Vous inventez.', why: 'Le forfait porte sur le personnel et les amortissements R&D, pas sur tout le parc.', rule: 'Le forfait a une base précise, pas « tout ».', codexUnlock: 'cdx_forfait' }, 'n4'),
      ],
    },
    {
      id: 'n4',
      speaker: 'Hervé Verdier',
      expression: 'satisfait',
      text: 'Bon. Vous, au moins, vous savez dire non. Ça donnerait quoi, prudemment ?',
      choices: [
        choice('optimal', 'preuve', 'Sur le périmètre solide, je table sur 200 à 300 k€, et je documente chaque euro pour qu’il tienne au contrôle. Pas de chiffre gonflé chez moi.', { relation: 6, security: 6, profitability: 3, mood: 4, trust: 5 }, { what: 'Fourchette prudente et argumentée.', why: 'Le sceptique achète la prudence, pas l’optimisme.', rule: 'Prudence chiffrée = crédibilité.', codexUnlock: 'cdx_estimer' }, null, { promise: { kind: 'range', min: 200000, max: 300000 } }),
        choice('acceptable', 'technique', 'Je vous chiffrerai après avoir vu les feuilles de temps et les comptes rendus d’essais.', { security: 6, mood: 2, trust: 2 }, { what: 'Vous conditionnez.', why: 'Cohérent avec sa demande de rigueur.', rule: 'Le chiffre suit la preuve.' }, null),
        choice('tempting', 'commercial', 'Facile, 400 k€, vous verrez, c’est du tout cuit.', { relation: -8, security: -12, mood: -6 }, { what: 'Vous cassez tout.', why: 'Un chiffre haut et sûr ruine la crédibilité que vous veniez de bâtir.', rule: 'Ne jamais surchiffrer devant un sceptique.' }, null, { promise: { kind: 'precise', min: 400000, max: 400000 } }),
        choice('poor', 'empathie', 'Ça sera un très bon montant, ne vous en faites pas.', { relation: -4, mood: -4 }, { what: 'Vous retombez dans le flou.', why: 'Le flou rassurant est ce qu’il déteste le plus.', rule: 'Avec un sceptique, précis et prudent, jamais flou.' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};

export const INDUS_KICKOFF: Scenario = {
  id: 'sc_indus_kick',
  type: 'KICKOFF',
  clientId: 'cli_indus_verdier',
  title: 'Kick-off — Mecaprécis',
  context: 'Hervé a réuni son ingénieure matériaux et son chef d’atelier. Il surveille chaque décision.',
  objectives: ['Cadrer la frontière procédé/série', 'Fiabiliser le taux du chef d’atelier', 'Vérifier l’agrément du CETIM'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Bruno (chef d’atelier)',
      expression: 'neutre',
      text: 'Moi je suis à la fois sur la mise au point du procédé et sur la production. On me met à combien ?',
      choices: [
        choice('optimal', 'preuve', 'Seul votre temps sur la mise au point compte — vos feuilles de temps montrent environ 20 %. La production série reste dehors.', { security: 12, relation: 2, mood: 3, trust: 4 }, { what: 'Vous fixez un taux crédible.', why: 'Distinguer procédé et série protège tout le dossier.', rule: 'Seul le temps de mise au point est R&D.', codexUnlock: 'cdx_personnel' }, 'n2'),
        choice('acceptable', 'synthese', 'On sépare votre temps procédé de votre temps production, pièces à l’appui.', { security: 8, trust: 2 }, { what: 'Vous demandez la trace.', why: 'Correct.', rule: 'Le prorata se prouve par feuille de temps.' }, 'n2'),
        choice('tempting', 'commercial', 'Disons 50 %, c’est un bon compromis.', { relation: 3, security: -12, mood: -3 }, { what: 'Vous négociez un taux.', why: 'Un taux de compromis non prouvé tombe au contrôle — et Hervé le voit.', rule: 'Un taux n’est pas une négociation.' }, 'n2'),
        choice('poor', 'fermete', 'Vous êtes essentiel, on vous met à 80 %.', { security: -16, mood: -4 }, { what: 'Vous surévaluez.', why: 'Un chef d’atelier majoritairement en production ne peut être à 80 % R&D.', rule: 'On ne récompense pas l’importance par un taux.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Hervé Verdier',
      expression: 'agace',
      text: 'On a sous-traité des essais au CETIM. Vous allez me dire que ça pose problème ?',
      choices: [
        choice('optimal', 'preuve', 'Au contraire : le CETIM est agréé MESR, donc éligible. C’est justement ce qu’il faut vérifier — et ici, c’est bon.', { security: 12, relation: 3, mood: 4, trust: 5 }, { what: 'Vous vérifiez et validez.', why: 'Montrer que vous contrôlez l’agrément rassure le sceptique.', rule: 'Sous-traitance agréée = éligible, sous condition de preuve.', codexUnlock: 'cdx_st_agrement' }, 'n3'),
        choice('acceptable', 'synthese', 'C’est éligible si l’agrément est valide ; je confirme avec leur attestation.', { security: 8, trust: 2 }, { what: 'Vous conditionnez à la pièce.', why: 'Rigueur appréciée.', rule: 'On archive l’attestation d’agrément.' }, 'n3'),
        choice('tempting', 'commercial', 'Un organisme comme le CETIM, ça passe tout seul, pas besoin de vérifier.', { relation: 2, security: -8, mood: -3 }, { what: 'Vous présumez.', why: 'Même un organisme réputé doit avoir son agrément documenté.', rule: 'On ne présume jamais, on archive.' }, 'n3'),
        choice('poor', 'fermete', 'La sous-traitance, on la double, c’est plus avantageux.', { security: -16, mood: -5 }, { what: 'Vous inventez une majoration.', why: 'La sous-traitance est plafonnée, jamais doublée.', rule: 'Sous-traitance plafonnée, pas majorée.', codexUnlock: 'cdx_st_plafonds' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Hervé Verdier',
      expression: 'satisfait',
      text: 'Vous êtes sérieux. Qu’est-ce que je dois vous fournir pour être blindé ?',
      choices: [
        choice('optimal', 'preuve', 'Feuilles de temps signées, comptes rendus d’essais datés, l’attestation d’agrément du CETIM, et l’état de l’art sur l’alliage. Avec ça, vous êtes opposable.', { relation: 5, security: 10, profitability: 2, mood: 3, trust: 5 }, { what: 'Vous listez le dossier opposable.', why: 'Un sceptique veut savoir exactement quoi réunir.', rule: 'Un dossier opposable est un dossier tracé.', codexUnlock: 'cdx_pieces' }, null),
        choice('acceptable', 'technique', 'Surtout vos comptes rendus d’essais et l’agrément du sous-traitant.', { security: 6, mood: 2 }, { what: 'Vous ciblez l’essentiel.', why: 'Pertinent.', rule: 'La preuve d’essais est centrale en industrie.' }, null),
        choice('tempting', 'commercial', 'Rassemblez ce que vous pouvez, on complétera si besoin.', { relation: 2, security: -8 }, { what: 'Vous relâchez.', why: 'Un sceptique attend un plan précis, pas un « ce que vous pouvez ».', rule: 'La collecte se cadre nommément.' }, null),
        choice('poor', 'fermete', 'Pas besoin de grand-chose, je m’occupe de tout justifier a posteriori.', { security: -14, mood: -4 }, { what: 'Vous promettez de la preuve tardive.', why: 'Justifier a posteriori est exactement ce qui échoue au contrôle.', rule: 'La preuve se constitue pendant les travaux.', codexUnlock: 'cdx_preuve' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};
