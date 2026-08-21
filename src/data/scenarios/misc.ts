import type { Scenario } from '../../engine/types';
import { choice } from './helpers';

// Tutoriel (chapitre 1) — Amélie Roux explique le double jeu jour/nuit.
export const TUTORIAL: Scenario = {
  id: 'sc_tutorial',
  type: 'INTERNAL',
  title: 'Bienvenue chez CIR Corp',
  context: 'Votre premier jour. Amélie Roux, votre manager, vous accueille et pose les règles du métier.',
  objectives: ['Comprendre le double jeu jour/nuit', 'Comprendre les trois jauges', 'Comprendre la valeur de la preuve'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Amélie Roux (manager)',
      expression: 'satisfait',
      text: 'Bienvenue ! Ici, le jour on décroche des clients, la nuit on monte leurs dossiers. Le métier, c’est de tenir les deux. Tu vois la tension ?',
      choices: [
        choice('optimal', 'synthese', 'Oui : promettre trop le jour crée une dette qu’il faut payer la nuit — et devant le vérificateur.', { relation: 4, security: 6, trust: 3 }, { what: 'Vous saisissez le cœur du jeu.', why: 'La tension commercial/technique est le cœur du métier.', rule: 'Ce qu’on promet le jour se paie la nuit.', codexUnlock: 'cdx_estimer' }, 'n2'),
        choice('acceptable', 'empathie', 'Je crois, oui : il faut être bon commercial et bon consultant à la fois.', { relation: 3, security: 2 }, { what: 'Vous comprenez l’idée.', why: 'Correct.', rule: 'Deux costumes, un seul métier.' }, 'n2'),
        choice('tempting', 'commercial', 'Facile : je vends fort le jour, je gère la nuit après.', { relation: 2, security: -6 }, { what: 'Vous sous-estimez la dette.', why: 'Vendre fort sans penser au dossier prépare des ennuis.', rule: 'La vente et la preuve ne se séparent pas.' }, 'n2'),
        choice('poor', 'fermete', 'Le commercial ne m’intéresse pas, je ferai que de la technique.', { relation: -4 }, { what: 'Vous refusez la moitié du métier.', why: 'Sans clients, pas de dossiers.', rule: 'Les deux phases sont indissociables.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Amélie Roux (manager)',
      expression: 'neutre',
      text: 'Tu piloteras trois jauges : Relation client, Sécurité fiscale, Rentabilité. Devine laquelle je regarde en premier.',
      choices: [
        choice('optimal', 'preuve', 'La Sécurité fiscale : un dossier qui ne tient pas au contrôle nous coûte tout, y compris la relation.', { relation: 3, security: 8, trust: 3 }, { what: 'Vous priorisez la sécurité.', why: 'La sécurité pèse le plus dans le score final.', rule: 'La sécurité fiscale prime sur le reste.', codexUnlock: 'cdx_preuve' }, 'n3'),
        choice('acceptable', 'synthese', 'Les trois comptent, mais la Sécurité conditionne les deux autres.', { security: 6, relation: 1 }, { what: 'Vous équilibrez.', why: 'Juste.', rule: 'Les jauges interagissent.' }, 'n3'),
        choice('tempting', 'commercial', 'La Rentabilité, c’est ça qui fait tourner la boîte.', { profitability: 4, security: -6 }, { what: 'Vous placez la marge d’abord.', why: 'La rentabilité seule mène aux missions toxiques.', rule: 'La marge ne passe pas avant la sécurité.' }, 'n3'),
        choice('poor', 'empathie', 'La Relation, il faut que le client soit content, le reste suivra.', { relation: 4, security: -6 }, { what: 'Vous surpondérez la relation.', why: 'Un client content d’un dossier faux reste un dossier faux.', rule: 'Plaire ne sécurise pas.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Amélie Roux (manager)',
      expression: 'satisfait',
      text: 'Dernière chose, la plus importante. Quand le vérificateur arrive, qu’est-ce qui te sauve ?',
      choices: [
        choice('optimal', 'preuve', 'La preuve collectée pendant les travaux : feuilles de temps, comptes rendus d’essais, datés. On ne fabrique rien après coup.', { relation: 3, security: 10, trust: 4 }, { what: 'Vous avez tout compris.', why: 'La preuve se constitue au moment des travaux, pas du contrôle.', rule: 'La preuve d’avant sauve au contrôle.', codexUnlock: 'cdx_preuve' }, null),
        choice('acceptable', 'synthese', 'Un dossier bien documenté et cohérent.', { security: 6 }, { what: 'Vous visez juste.', why: 'Correct.', rule: 'La documentation fait le dossier.' }, null),
        choice('tempting', 'commercial', 'Un bon relationnel avec l’administration.', { security: -8 }, { what: 'Vous vous trompez de levier.', why: 'Le vérificateur juge la preuve, pas la sympathie.', rule: 'On ne charme pas un contrôle.' }, null),
        choice('poor', 'fermete', 'De la chance : espérer ne pas être contrôlé.', { security: -10 }, { what: 'Vous pariez sur la chance.', why: 'Compter sur l’absence de contrôle est la pire stratégie.', rule: 'On ne mise jamais sur la chance.' }, null),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 70, good: 50 },
    unlocks: { excellent: [], good: [], poor: [] },
  },
};

// Prospection téléphonique — mini-dialogue court (3 nœuds).
export const PROSPECT_CALL: Scenario = {
  id: 'sc_prospect_call',
  type: 'PROSPECT',
  title: 'Prospection téléphonique',
  context: 'Un prospect au bout du fil. Trois échanges pour qualifier et, peut-être, décrocher un rendez-vous.',
  objectives: ['Qualifier vite', 'Repérer le non-éligible', 'Décrocher un RDV si pertinent'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Le CIR ? On m’en a parlé. Mais je ne sais pas si on fait vraiment de la recherche, nous.',
      choices: [
        choice('optimal', 'synthese', 'C’est justement la bonne question. En deux mots : avez-vous eu un projet où le résultat technique était incertain au départ ?', { relation: 4, security: 6, mood: 3 }, { what: 'Vous qualifiez d’emblée.', why: 'Une question simple sépare les vrais candidats des autres.', rule: 'On qualifie avant de vendre.' }, 'n2'),
        choice('acceptable', 'empathie', 'Beaucoup d’entreprises se posent la question. Voyons ça ensemble sans engagement.', { relation: 5, mood: 2 }, { what: 'Vous mettez à l’aise.', why: 'Bon pour la relation, un peu moins tranchant.', rule: 'La qualification peut être douce.' }, 'n2'),
        choice('tempting', 'commercial', 'Tout le monde y a droit, croyez-moi, on va vous trouver un beau dossier.', { relation: 4, security: -10 }, { what: 'Vous survendez.', why: '« Tout le monde y a droit » est faux.', rule: 'On ne promet pas l’éligibilité au téléphone.' }, 'n2'),
        choice('poor', 'technique', 'Le CIR relève de l’article 244 quater B du CGI, sous conditions cumulatives d’éligibilité…', { relation: -6, mood: -4 }, { what: 'Vous récitez la loi.', why: 'Personne ne signe sur un article de loi au téléphone.', rule: 'Le bon registre d’abord.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le prospect',
      expression: 'neutre',
      text: 'Honnêtement, on fait surtout de l’intégration de solutions existantes pour nos clients.',
      choices: [
        choice('optimal', 'preuve', 'Alors soyons honnêtes : l’intégration pure n’ouvre pas le CIR. Si un projet interne sort du lot un jour, rappelez-moi — je ne vais pas vous vendre du vent.', { relation: 5, security: 8, mood: 3 }, { what: 'Vous refusez proprement.', why: 'Refuser un non-éligible protège votre réputation.', rule: 'Dire non tôt évite une mission toxique.', codexUnlock: 'cdx_dire_non' }, null, { flags: ['prospect_decline'] }),
        choice('acceptable', 'synthese', 'Dans ce cas, le potentiel est sans doute faible. On peut vérifier, mais je ne vous promets rien.', { relation: 3, security: 6 }, { what: 'Vous restez prudent.', why: 'Correct : vous ne signez que si le potentiel se confirme.', rule: 'On tempère les attentes.' }, null, { flags: ['prospect_maybe'] }),
        choice('tempting', 'commercial', 'On trouvera bien un angle pour éligibiliser tout ça, prenons rendez-vous !', { relation: 4, security: -12 }, { what: 'Vous forcez la signature.', why: 'Chercher un « angle » pour du non-éligible mène au redressement.', rule: 'On ne force pas l’éligibilité.' }, null, { flags: ['prospect_sign'] }),
        choice('poor', 'fermete', 'De l’intégration ? Aucun intérêt, au revoir.', { relation: -8 }, { what: 'Vous raccrochez sèchement.', why: 'Un refus brutal ferme une porte pour toujours.', rule: 'On refuse sans claquer la porte.' }, null, { flags: ['prospect_decline_rude'] }),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 70, good: 50 },
    unlocks: { excellent: [], good: [], poor: [] },
  },
};
