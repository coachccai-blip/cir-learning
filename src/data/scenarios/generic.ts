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
        choice('optimal', 'empathie', 'Vous avez beaucoup fourni, merci. Il me manque juste les feuilles de temps signées et deux comptes rendus d’essais — ce sont eux qui rendront le dossier solide au contrôle.', { relation: 4, security: 10, trust: 4 }, { what: 'Vous relancez avec tact.', why: 'Relier la demande au contrôle donne du sens à l’effort.', rule: 'Une relance justifiée passe mieux.', codexUnlock: 'cdx_pieces' }, 'n2'),
        choice('acceptable', 'synthese', 'Presque tout est là. Il me manque les pièces qui prouvent la démarche : je vous fais une liste courte.', { security: 8, relation: 1 }, { what: 'Vous ciblez le manque.', why: 'Efficace.', rule: 'Une liste courte se traite.' }, 'n2'),
        choice('tempting', 'commercial', 'Ne vous embêtez pas, je ferai avec ce que j’ai.', { relation: 5, security: -12 }, { what: 'Vous renoncez aux pièces.', why: 'Sans preuve, le dossier reste fragile.', rule: 'On ne lâche pas la collecte pour faire plaisir.' }, 'n2'),
        choice('poor', 'fermete', 'Il me faut tout, tout de suite, sinon je ne peux rien faire.', { relation: -8, mood: -5 }, { what: 'Vous braquez le client.', why: 'Une injonction sèche crée un irritant.', rule: 'La fermeté n’exclut pas le tact.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'agace',
      text: 'Franchement, ça prend du temps, votre affaire. J’espère que ça vaut le coup.',
      choices: [
        choice('optimal', 'preuve', 'Chaque pièce collectée maintenant, c’est un point de moins à défendre au contrôle. C’est précisément ce qui protège votre crédit d’impôt.', { relation: 5, security: 8, trust: 3 }, { what: 'Vous donnez du sens.', why: 'Le client accepte l’effort s’il en comprend la valeur.', rule: 'Expliquer la valeur désamorce l’irritant.' }, null),
        choice('acceptable', 'empathie', 'Je comprends que ce soit prenant ; je vous promets qu’on va à l’essentiel.', { relation: 6, security: 1 }, { what: 'Vous rassurez.', why: 'Bon pour la relation, un peu court sur le fond.', rule: 'Reconnaître l’effort du client compte.' }, null),
        choice('tempting', 'commercial', 'Bientôt fini, et le chèque sera énorme, vous verrez !', { relation: 6, security: -8 }, { what: 'Vous surpromettez.', why: 'Promettre « énorme » recrée une dette de promesse.', rule: 'Ne pas relancer la surenchère en suivi.' }, null),
        choice('poor', 'fermete', 'C’est la procédure, on n’y peut rien.', { relation: -6 }, { what: 'Vous vous réfugiez derrière la procédure.', why: '« C’est la procédure » n’explique rien au client.', rule: 'On explique, on ne se retranche pas.' }, null),
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
        choice('optimal', 'preuve', 'Voici le montant réel, poste par poste. Là où c’est en dessous de mon estimation, je vous montre exactement pourquoi — les taux d’affectation réels étaient plus bas.', { relation: 4, security: 8, profitability: 2, trust: 5 }, { what: 'Vous restituez avec transparence.', why: 'Montrer la trace limite le churn quand le chiffre déçoit.', rule: 'La transparence désamorce la déception.', codexUnlock: 'cdx_chiffre_decevant' }, 'n2'),
        choice('acceptable', 'synthese', 'On est dans l’ordre de grandeur annoncé ; je vous détaille le calcul.', { relation: 3, security: 4, profitability: 1 }, { what: 'Vous restituez sobrement.', why: 'Correct.', rule: 'Un calcul détaillé rassure.' }, 'n2'),
        choice('tempting', 'commercial', 'C’est un très bon résultat, ne regardons pas le détail des écarts.', { relation: 4, security: -8 }, { what: 'Vous masquez les écarts.', why: 'Éviter le détail fragilise la confiance au moindre contrôle.', rule: 'On n’escamote pas les écarts.' }, 'n2'),
        choice('poor', 'fermete', 'C’est ce que c’est, le chiffre est le chiffre.', { relation: -8 }, { what: 'Vous êtes sec.', why: 'Une restitution sans pédagogie abîme la relation.', rule: 'Restituer, c’est aussi expliquer.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'satisfait',
      text: 'D’accord. Et pour l’an prochain, on continue ensemble ?',
      choices: [
        choice('optimal', 'synthese', 'Volontiers. On repart plus tôt sur la collecte, et on regardera ce nouveau projet dont vous m’avez parlé — après l’avoir qualifié, bien sûr.', { relation: 6, security: 4, profitability: 5, trust: 4 }, { what: 'Vous ouvrez l’upsell qualifié.', why: 'Fidéliser sur du sérieux prépare un meilleur dossier.', rule: 'On prépare l’an prochain dès le bilan.' }, null),
        choice('acceptable', 'empathie', 'Avec plaisir, on refait le point à la rentrée.', { relation: 5, profitability: 2 }, { what: 'Vous entretenez le lien.', why: 'Bonne suite.', rule: 'La relation se cultive dans la durée.' }, null),
        choice('tempting', 'commercial', 'Oui, et je vous promets un montant encore plus gros l’an prochain !', { relation: 6, security: -10 }, { what: 'Vous repromettez du chiffre.', why: 'Promettre plus gros relance la dette de promesse.', rule: 'On ne surpromet pas la saison suivante.' }, null),
        choice('poor', 'fermete', 'On verra l’an prochain, rien n’est sûr.', { relation: -4, profitability: -2 }, { what: 'Vous refroidissez.', why: 'Un bilan est le moment de sécuriser la reconduction.', rule: 'Le bilan ouvre la suite, il ne la ferme pas.' }, null),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 75, good: 55 },
    unlocks: { excellent: [], good: [], poor: [] },
  },
};
