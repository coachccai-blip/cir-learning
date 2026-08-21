import type { Scenario } from '../../engine/types';
import { choice, DEFAULT_OUTCOME } from './helpers';

// Nexalog — Elsa Brunet, GEEK (part dans le détail technique, adore son sujet).

export const SAAS_DISCOVERY: Scenario = {
  id: 'sc_saas_disc',
  type: 'DISCOVERY',
  clientId: 'cli_saas_nexalog',
  title: 'Rendez-vous découverte — Nexalog',
  context: 'Elsa Brunet, CTO, peut parler trois heures de son moteur de prédiction. Le défi : tenir la frontière R&D / développement courant sans la brusquer.',
  objectives: ['Canaliser la passion technique', 'Séparer R&D et dev courant', 'Repérer le vrai verrou algorithmique'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Elsa Brunet',
      expression: 'enthousiaste',
      text: 'Notre moteur de prédiction, c’est trois ans de travail. Je peux vous montrer l’architecture microservices, le pipeline de données, le front en temps réel…',
      choices: [
        choice('optimal', 'technique', 'Volontiers. Sur quel point avez-vous buté sans savoir si une solution existait ?', { relation: 5, security: 8, mood: 5, trust: 4 }, { what: 'Vous canalisez la passion.', why: 'Le GEEK s’ouvre par une vraie question technique, pas par une coupure.', rule: 'Avec un techos, la curiosité sincère ouvre les portes.', codexUnlock: 'cdx_verrou' }, 'n2'),
        choice('acceptable', 'synthese', 'Montrez-moi l’essentiel, puis les points où le résultat était incertain.', { security: 6, mood: 2 }, { what: 'Vous cadrez le temps.', why: 'Correct, un peu directif pour un passionné.', rule: 'Recadrer sans casser l’élan.' }, 'n2'),
        choice('tempting', 'empathie', 'Racontez-moi tout dans le détail, on a largement le temps devant nous !', { relation: 6, security: -4, profitability: -8, mood: 6 }, { what: 'Vous vous laissez embarquer.', why: 'Le kick-off déborde, vos PA fondent.', rule: 'Se laisser noyer par le GEEK coûte du temps facturable.' }, 'n2'),
        choice('poor', 'fermete', 'Pas le temps pour la technique : donnez-moi directement les chiffres.', { relation: -10, mood: -8 }, { what: 'Vous coupez le passionné.', why: 'Vous vous fermez la source d’information la plus riche.', rule: 'Couper un GEEK, c’est perdre la matière technique.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Elsa Brunet',
      expression: 'satisfait',
      text: 'Le vrai mur, c’était la prédiction sous données très bruitées : aucune méthode publiée ne convergeait à notre échelle. On a inventé notre propre approche.',
      choices: [
        choice('optimal', 'preuve', 'Voilà un verrou. Avez-vous gardé la trace de vos essais infructueux ?', { relation: 4, security: 12, mood: 4, trust: 5 }, { what: 'Vous qualifiez le verrou.', why: 'État de l’art + essais ratés conservés = dossier solide.', rule: 'Le progrès se mesure contre l’état de l’art externe.', codexUnlock: 'cdx_etat_art' }, 'n3'),
        choice('acceptable', 'technique', 'Documentez-moi les hypothèses testées et les résultats, même négatifs.', { security: 8, mood: 2 }, { what: 'Vous demandez la démarche.', why: 'Bonne piste sur la traçabilité.', rule: 'Les résultats négatifs sont des preuves.', codexUnlock: 'cdx_demarche' }, 'n3'),
        choice('tempting', 'commercial', 'Génial, ça c’est du lourd ! On n’a même pas besoin d’en savoir plus.', { relation: 6, security: -8, mood: 3 }, { what: 'Vous vous arrêtez au récit.', why: '« On a inventé » doit être étayé par des sources et des essais.', rule: 'Une belle histoire n’est pas encore une preuve.' }, 'n3'),
        choice('poor', 'empathie', 'Je vous crois volontiers sur parole : c’est sûrement éligible.', { relation: 4, security: -10 }, { what: 'Vous ne vérifiez rien.', why: 'La confiance ne remplace pas l’état de l’art.', rule: 'On étaye, on ne croit pas sur parole.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Elsa Brunet',
      expression: 'neutre',
      text: 'Après, il y a aussi tout le portage mobile, l’intégration des API clients, le nouveau thème sombre… ça compte aussi j’imagine ?',
      choices: [
        choice('optimal', 'preuve', 'Non : portage, intégration, thème sombre sont du développement courant.', { relation: 3, security: 12, trust: 4 }, { what: 'Vous tenez la frontière.', why: 'Le développement courant est la frontière la plus fréquente à défendre.', rule: 'Intégration et portage : hors R&D.', codexUnlock: 'cdx_dev_courant' }, 'n4'),
        choice('acceptable', 'synthese', 'Séparons le cœur algorithmique du reste : seul le premier ouvre le CIR.', { security: 8, trust: 2 }, { what: 'Vous distinguez les blocs.', why: 'Correct, à préciser poste par poste.', rule: 'On isole le noyau R&D du développement courant.' }, 'n4'),
        choice('tempting', 'commercial', 'Le développement, c’est technique aussi : mettons-le dans l’assiette.', { relation: 5, security: -14 }, { what: 'Vous confondez technique et R&D.', why: 'Tout ce qui est technique n’est pas de la recherche.', rule: 'Technique ≠ éligible.' }, 'n4'),
        choice('poor', 'fermete', 'Chez un éditeur, tout le développement est de la R&D, c’est connu.', { security: -16 }, { what: 'Vous récitez un mythe.', why: 'C’est l’erreur classique — et le motif de redressement — des dossiers SaaS.', rule: 'Non, tout le code n’est pas de la R&D.' }, 'n4'),
      ],
    },
    {
      id: 'n4',
      speaker: 'Elsa Brunet',
      expression: 'satisfait',
      text: 'OK, vous connaissez votre sujet. On parle d’un ordre de grandeur pour le CIR ?',
      choices: [
        choice('optimal', 'synthese', 'Sur le périmètre réellement R&D, je vise 350 à 480 k€, à affiner ensuite.', { relation: 5, security: 4, profitability: 5, trust: 4 }, { what: 'Fourchette étayée.', why: 'Vous engagez une fourchette, pas un chiffre magique.', rule: 'Une fourchette adossée au périmètre réel tient.', codexUnlock: 'cdx_estimer' }, null, { promise: { kind: 'range', min: 350000, max: 480000 } }),
        choice('acceptable', 'fermete', 'Je chiffrerai après avoir vu qui fait vraiment de la R&D, et à quel taux.', { security: 6, relation: -2 }, { what: 'Vous conditionnez aux feuilles de temps.', why: 'Rigoureux, un peu frustrant pour un profil vif.', rule: 'Le chiffre suit les taux d’affectation.' }, null),
        choice('tempting', 'commercial', 'Facile : plus de 600 k€. Votre moteur vaut de l’or, croyez-moi !', { relation: 10, security: -12, mood: 5 }, { what: 'Vous surchiffrez.', why: 'Vous incluez mentalement le dev courant que vous venez d’exclure.', rule: 'Ne pas se contredire entre le tri et le chiffre.' }, null, { promise: { kind: 'precise', min: 600000, max: 600000 } }),
        choice('poor', 'empathie', 'Ça va être énorme. Ne vous inquiétez pas une seconde du montant.', { relation: 6, security: -10 }, { what: 'Vous promettez du flou.', why: 'Un CTO exigeant retiendra « énorme ».', rule: 'Le flou optimiste devient une promesse au bilan.' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};

export const SAAS_KICKOFF: Scenario = {
  id: 'sc_saas_kick',
  type: 'KICKOFF',
  clientId: 'cli_saas_nexalog',
  title: 'Kick-off — Nexalog',
  context: 'Elsa a réuni son chercheur ML et un développeur front. Objectif : fixer les taux d’affectation réels et cadrer la collecte.',
  objectives: ['Fixer des taux d’affectation crédibles', 'Isoler le développement courant', 'Planifier la collecte des essais'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Elsa Brunet',
      expression: 'enthousiaste',
      text: 'Je me suis mise à 50 % de R&D, ça vous va ? Je code encore pas mal.',
      choices: [
        choice('optimal', 'preuve', 'Un CTO fait aussi du management. Vos feuilles de temps diront le taux réel.', { security: 12, relation: 2, trust: 4 }, { what: 'Vous fiabilisez le taux dirigeant.', why: 'Les taux des dirigeants sont les plus scrutés au contrôle.', rule: 'Un dirigeant à 50 % R&D doit se justifier à la pièce.', codexUnlock: 'cdx_personnel' }, 'n2'),
        choice('acceptable', 'synthese', 'Appuyons ce taux sur vos agendas et feuilles de temps, pas une impression.', { security: 8, trust: 2 }, { what: 'Vous demandez la trace.', why: 'Bon réflexe.', rule: 'Le prorata se prouve.' }, 'n2'),
        choice('tempting', 'commercial', '50 %, parfait : ça nous fait un très beau montant au final.', { relation: 4, security: -12 }, { what: 'Vous validez sans preuve.', why: 'Un taux de dirigeant gonflé est un aimant à redressement.', rule: 'On ne valide pas un taux sur une envie.' }, 'n2'),
        choice('poor', 'empathie', 'Vous êtes la CTO : mettez-vous à 100 %, vous le méritez bien.', { relation: 6, security: -16 }, { what: 'Vous flattez au lieu de fiabiliser.', why: 'Le mérite n’est pas un taux d’affectation.', rule: 'La reconnaissance ne se met pas dans l’assiette.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Kevin (développeur front)',
      expression: 'neutre',
      text: 'Moi je fais surtout l’intégration des écrans et le portage mobile. Ça compte comme R&D ?',
      choices: [
        choice('optimal', 'preuve', 'Non : intégration et portage sont du développement courant, donc hors assiette.', { security: 12, relation: 1, trust: 4 }, { what: 'Vous excluez à juste titre.', why: 'Inclure du front d’intégration est le piège classique du SaaS.', rule: 'Exclure le dev courant renforce le dossier.', codexUnlock: 'cdx_dev_courant' }, 'n3'),
        choice('acceptable', 'synthese', 'Sauf contribution au cœur algorithmique, votre temps reste hors assiette.', { security: 8 }, { what: 'Vous nuancez correctement.', why: 'Juste : seule la contribution R&D compterait.', rule: 'On regarde la nature de la tâche, pas le titre.' }, 'n3'),
        choice('tempting', 'commercial', 'Allez, on vous met à 70 %, comme dans notre estimation initiale.', { relation: 4, security: -14 }, { what: 'Vous cédez sur le front.', why: 'C’est exactement le poste qui saute au contrôle.', rule: 'Ne pas valoriser un développeur d’intégration en R&D.' }, 'n3'),
        choice('poor', 'fermete', 'Bien sûr : tout le code compte, on vous met directement à 100 %.', { security: -18 }, { what: 'Vous maximisez à tort.', why: 'Un front d’intégration à 100 % R&D est indéfendable.', rule: 'Le contrôle commence par les taux invraisemblables.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Elsa Brunet',
      expression: 'satisfait',
      text: 'D’accord, vous êtes carré. On collecte quoi, concrètement ?',
      choices: [
        choice('optimal', 'synthese', 'Feuilles de temps, journaux d’expériences avec les essais ratés, état de l’art.', { relation: 5, security: 8, profitability: 2, trust: 4 }, { what: 'Vous listez les pièces clés.', why: 'Les journaux d’expériences font la preuve de la démarche.', rule: 'La preuve se planifie dès le kick-off.', codexUnlock: 'cdx_pieces' }, null),
        choice('acceptable', 'technique', 'Surtout vos logs d’expérimentation et vos benchmarks face à l’existant.', { security: 6, mood: 2 }, { what: 'Vous ciblez la preuve technique.', why: 'Pertinent pour un dossier algorithmique.', rule: 'Les benchmarks documentent le progrès.' }, null),
        choice('tempting', 'commercial', 'Envoyez-moi ce que vous avez sous la main, ça ira très bien comme ça.', { relation: 4, security: -10 }, { what: 'Vous relâchez la collecte.', why: '« Ce qu’il y a sous la main » n’est pas un dossier.', rule: 'Une collecte non cadrée laisse des trous.' }, null),
        choice('poor', 'fermete', 'Pas besoin de documents : votre parole suffira pour l’état de l’art.', { security: -14 }, { what: 'Vous renoncez à la preuve.', why: 'Un dossier SaaS sans traces d’expériences ne tient pas.', rule: 'Sans logs, pas de démarche opposable.' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};
