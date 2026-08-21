import type { Scenario } from '../../engine/types';
import { choice, DEFAULT_OUTCOME } from './helpers';

// Data&Co — Paul Lenoir, SILENT (répond oui/non, ne documente rien).
// Chapitre « savoir dire non » : le dossier est majoritairement non éligible.

export const SERVICES_DISCOVERY: Scenario = {
  id: 'sc_services_disc',
  type: 'DISCOVERY',
  clientId: 'cli_services_datao',
  title: 'Rendez-vous découverte — Data&Co',
  context: 'Paul Lenoir, DirOps d’une ESN de 230 personnes, répond par oui ou par non. Le DG « a entendu dire que toutes les ESN font du CIR ». La vraie question : y a-t-il de la R&D ici ?',
  objectives: ['Faire parler un taiseux', 'Distinguer prestation et R&D interne', 'Savoir refuser si besoin'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Paul Lenoir',
      expression: 'neutre',
      text: 'Le DG veut du CIR. On fait de la tech pour nos clients. Ça suffit, non ?',
      choices: [
        choice('optimal', 'empathie', 'Y a-t-il des missions dont la faisabilité technique n’était pas acquise ?', { relation: 5, security: 8, mood: 4, trust: 4 }, { what: 'Vous ouvrez le taiseux.', why: 'Une question fermée puis ouverte fait parler un silencieux.', rule: 'Avec un taiseux : questions fermées puis ouvertes.', codexUnlock: 'cdx_client_difficile' }, 'n2'),
        choice('acceptable', 'synthese', 'Faire de la tech pour un client, c’est de la prestation. Cherchons une R&D interne réelle.', { security: 8, mood: 1 }, { what: 'Vous posez la distinction.', why: 'Juste, un peu frontal pour un premier contact.', rule: 'Prestation client ≠ R&D.', codexUnlock: 'cdx_dev_courant' }, 'n2'),
        choice('tempting', 'commercial', 'Oui, une ESN de cette taille, il y a forcément un très gros CIR à récupérer !', { relation: 8, security: -14, mood: 3 }, { what: 'Vous validez le mythe.', why: '« Toutes les ESN font du CIR » est faux et dangereux.', rule: 'La taille ne crée pas de R&D.' }, 'n2'),
        choice('poor', 'technique', 'On va éligibiliser vos prestations au titre du développement logiciel avancé.', { relation: 2, security: -12, mood: 1 }, { what: 'Vous inventez une catégorie.', why: 'Le « développement logiciel avancé » n’ouvre pas droit au CIR.', rule: 'Pas d’éligibilité sans incertitude scientifique.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Paul Lenoir',
      expression: 'neutre',
      text: 'Nos gens font surtout de l’intégration, du BI, du support. Un data scientist bricole parfois des trucs en interne.',
      choices: [
        choice('optimal', 'preuve', 'Intégration, BI, support : du développement courant, hors CIR.', { relation: 3, security: 12, mood: 3, trust: 5 }, { what: 'Vous isolez le seul vrai candidat.', why: 'Un petit périmètre solide vaut mieux qu’un grand périmètre creux.', rule: 'On resserre sur la R&D interne réelle.', codexUnlock: 'cdx_verrou' }, 'n3'),
        choice('acceptable', 'synthese', 'La prestation client, non. On regarde seulement le projet interne d’anonymisation.', { security: 8, trust: 2 }, { what: 'Vous ciblez juste.', why: 'Bon tri.', rule: 'Seul le projet interne peut être R&D.' }, 'n3'),
        choice('tempting', 'commercial', 'On peut mettre 60 % des développeurs en R&D, ça vous fera un joli dossier bien rond.', { relation: 6, security: -16 }, { what: 'Vous gonflez massivement.', why: 'Valoriser la prestation client en R&D est le redressement type des ESN.', rule: 'La prestation facturée n’est pas de la R&D.' }, 'n3'),
        choice('poor', 'fermete', 'On met tout le pôle technique dans l’assiette, on verra ce que le fisc conteste.', { security: -18 }, { what: 'Vous ratissez tout.', why: 'C’est exactement ce que le contrôle démonte en premier.', rule: 'On ne teste pas la patience du vérificateur.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Paul Lenoir',
      expression: 'ferme',
      text: 'Honnêtement, le projet interne, c’est deux semaines par an. Le DG, lui, veut un gros chiffre. Vous faites quoi ?',
      choices: [
        choice('optimal', 'fermete', 'Votre CIR réel est modeste : gonfler l’assiette vous exposerait.', { relation: 4, security: 14, profitability: -2, mood: 4, trust: 6 }, { what: 'Vous savez dire non.', why: 'Refuser une mission toxique protège le client et votre cabinet.', rule: 'Un petit CIR sûr vaut mieux qu’un gros CIR redressé.', codexUnlock: 'cdx_dire_non' }, 'n4', { flags: ['a_dit_non'] }),
        choice('acceptable', 'synthese', 'On peut faire un dossier honnête et petit sur le projet interne, et l’assumer devant le DG.', { relation: 3, security: 10, trust: 4 }, { what: 'Vous proposez l’honnête.', why: 'Bonne posture, un peu moins nette sur le refus du gonflage.', rule: 'Un dossier honnête se défend.' }, 'n4', { flags: ['a_dit_non'] }),
        choice('tempting', 'commercial', 'Le DG veut du chiffre ? On lui en donne : on valorise large, quitte à ajuster après.', { relation: 8, security: -16, profitability: 3 }, { what: 'Vous cédez au DG.', why: 'Valoriser large pour plaire est une mission toxique.', rule: 'Ne jamais gonfler pour satisfaire une commande interne.' }, 'n4'),
        choice('poor', 'empathie', 'Je ne veux pas vous décevoir, alors je vous promets un dossier vraiment conséquent.', { relation: 6, security: -14 }, { what: 'Vous surpromettez.', why: 'La peur de décevoir vous fait accepter l’inacceptable.', rule: 'Décevoir sur le montant vaut mieux que sur le contrôle.' }, 'n4'),
      ],
    },
    {
      id: 'n4',
      speaker: 'Paul Lenoir',
      expression: 'satisfait',
      text: 'C’est la première fois qu’un cabinet me dit qu’on n’a presque rien. Ça me rassure, bizarrement. On garde le contact ?',
      choices: [
        choice('optimal', 'empathie', 'On monte votre petit dossier proprement, et on verra si un vrai projet émerge un jour.', { relation: 8, security: 6, profitability: 1, mood: 4, trust: 5 }, { what: 'Vous gagnez la relation en perdant du CA.', why: 'Le refus honnête crée une relation durable — parfois un meilleur client demain.', rule: 'On peut gagner en refusant.', codexUnlock: 'cdx_dire_non' }, null),
        choice('acceptable', 'synthese', 'Volontiers. On formalise le périmètre réel et on reste en veille sur vos futurs projets.', { relation: 5, security: 4, trust: 3 }, { what: 'Vous entretenez le lien.', why: 'Bonne suite.', rule: 'Le contact se cultive même sans gros CA.' }, null),
        choice('tempting', 'commercial', 'Gardons le contact, et je retente de vous vendre un dossier plus ambitieux l’an prochain.', { relation: 2, security: -4, profitability: 2 }, { what: 'Vous repartez sur le volume.', why: 'Revenir à l’ambition annule la confiance que vous venez de gagner.', rule: 'Ne pas gâcher un refus réussi.' }, null),
        choice('poor', 'fermete', 'Franchement, si c’est si peu que ça, autant laisser complètement tomber l’affaire.', { relation: -8, profitability: -2 }, { what: 'Vous claquez la porte.', why: 'Un petit dossier honnête et une relation valent mieux que rien.', rule: 'Un petit oui vaut mieux qu’un non sec.' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};

export const SERVICES_KICKOFF: Scenario = {
  id: 'sc_services_kick',
  type: 'KICKOFF',
  clientId: 'cli_services_datao',
  title: 'Kick-off — Data&Co',
  context: 'Vous avez convaincu Paul de ne monter qu’un dossier honnête et resserré. Objectif : cadrer le tout petit périmètre réellement éligible.',
  objectives: ['Cadrer le seul projet interne', 'Exclure fermement la prestation client', 'Documenter le peu qu’il y a'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Rémi (data scientist)',
      expression: 'neutre',
      text: 'Mon projet d’anonymisation robuste, j’y ai vraiment passé du temps. Mais je fais aussi plein de missions client à côté.',
      choices: [
        choice('optimal', 'preuve', 'On ne retient que l’anonymisation : environ 15 % de votre année.', { security: 12, relation: 2, mood: 3, trust: 4 }, { what: 'Vous cadrez le vrai périmètre.', why: 'Seule la R&D interne compte, au prorata réel.', rule: 'La prestation client ne rentre jamais.', codexUnlock: 'cdx_personnel' }, 'n2'),
        choice('acceptable', 'synthese', 'On isole votre temps passé sur l’anonymisation, feuilles de temps à l’appui.', { security: 8, trust: 2 }, { what: 'Vous demandez la trace.', why: 'Juste.', rule: 'Le prorata se prouve.' }, 'n2'),
        choice('tempting', 'commercial', 'On vous met à 80 %, votre projet est de loin le plus important de l’année.', { relation: 4, security: -16 }, { what: 'Vous gonflez.', why: 'Un data scientist majoritairement en prestation ne peut être à 80 % R&D.', rule: 'On ne valorise pas la prestation en R&D.' }, 'n2'),
        choice('poor', 'fermete', 'Tant qu’à faire, on met toutes vos missions techniques dans l’assiette.', { security: -18 }, { what: 'Vous ré-intégrez la prestation.', why: 'Vous détruisez le dossier honnête que vous veniez de bâtir.', rule: 'Ne pas rouvrir la porte à la prestation.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Paul Lenoir',
      expression: 'neutre',
      text: 'Le DG relit par-dessus mon épaule. Il pousse pour ajouter « au moins les projets clients les plus innovants ».',
      choices: [
        choice('optimal', 'fermete', 'Non : un projet client, même innovant, reste une prestation.', { security: 12, relation: 3, mood: 3, trust: 5 }, { what: 'Vous tenez la ligne face au DG.', why: 'La nouveauté pour le client n’est pas de la R&D.', rule: 'Nouveauté client ≠ R&D éligible.', codexUnlock: 'cdx_nouveaute' }, 'n3'),
        choice('acceptable', 'synthese', 'On garde le périmètre resserré ; j’expliquerai au DG pourquoi c’est plus sûr.', { security: 8, trust: 2 }, { what: 'Vous maintenez le cap.', why: 'Bonne fermeté pédagogique.', rule: 'On explique le refus, on ne le subit pas.' }, 'n3'),
        choice('tempting', 'commercial', 'Pour ménager le DG, on ajoute quand même deux projets clients « innovants ».', { relation: 6, security: -16 }, { what: 'Vous cédez à la pression interne.', why: 'Deux prestations « innovantes » restent des prestations.', rule: 'Ménager le DG ne change pas la loi.' }, 'n3'),
        choice('poor', 'empathie', 'Bon, si ça peut aider tout le monde, on met les projets clients aussi.', { security: -14 }, { what: 'Vous flanchez.', why: 'Vous rouvrez la brèche par gentillesse.', rule: 'La bienveillance ne justifie pas le hors-champ.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Paul Lenoir',
      expression: 'satisfait',
      text: 'D’accord, on reste raisonnables. Il vous faut quoi ?',
      choices: [
        choice('optimal', 'preuve', 'Les relevés de temps de Rémi, ses notes et son état de l’art.', { relation: 4, security: 10, profitability: 1, mood: 2, trust: 4 }, { what: 'Vous documentez le peu qu’il y a.', why: 'Un petit dossier bien tracé passe le contrôle.', rule: 'Petit périmètre, mais opposable.', codexUnlock: 'cdx_pieces' }, null),
        choice('acceptable', 'synthese', 'Surtout les notes d’expérimentation de Rémi et ses relevés de temps datés.', { security: 6, mood: 1 }, { what: 'Vous ciblez l’essentiel.', why: 'Pertinent.', rule: 'La trace d’expérimentation prime.' }, null),
        choice('tempting', 'commercial', 'Pas grand-chose : un petit dossier n’a pas besoin de tout cet appareil.', { relation: 3, security: -10 }, { what: 'Vous négligez la preuve.', why: 'Un petit dossier est contrôlé comme un grand.', rule: 'La taille ne dispense pas de preuve.' }, null),
        choice('poor', 'fermete', 'Rien de spécial pour l’instant, on verra bien si le fisc en demande.', { security: -14 }, { what: 'Vous repoussez la preuve.', why: 'Même modeste, un dossier doit être tracé d’avance.', rule: 'La preuve se constitue avant le contrôle.', codexUnlock: 'cdx_preuve' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};
