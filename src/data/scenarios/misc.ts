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
        choice('optimal', 'synthese', 'Oui : promettre trop le jour crée une dette qu’on paie la nuit.', { relation: 4, security: 6, trust: 3 }, { what: 'Vous saisissez le cœur du jeu.', why: 'La tension commercial/technique est le cœur du métier.', rule: 'Ce qu’on promet le jour se paie la nuit.', codexUnlock: 'cdx_estimer' }, 'n2'),
        choice('acceptable', 'empathie', 'Je crois : il faut être bon commercial et bon consultant.', { relation: 3, security: 2 }, { what: 'Vous comprenez l’idée.', why: 'Correct.', rule: 'Deux costumes, un seul métier.' }, 'n2'),
        choice('tempting', 'commercial', 'Facile : je vends fort le jour et je gère la nuit ensuite.', { relation: 2, security: -6 }, { what: 'Vous sous-estimez la dette.', why: 'Vendre fort sans penser au dossier prépare des ennuis.', rule: 'La vente et la preuve ne se séparent pas.' }, 'n2'),
        choice('poor', 'fermete', 'Le commercial ne m’intéresse pas, je ferai de la technique.', { relation: -4 }, { what: 'Vous refusez la moitié du métier.', why: 'Sans clients, pas de dossiers.', rule: 'Les deux phases sont indissociables.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Amélie Roux (manager)',
      expression: 'neutre',
      text: 'Tu piloteras trois jauges : Relation client, Sécurité fiscale, Rentabilité. Devine laquelle je regarde en premier.',
      choices: [
        choice('optimal', 'preuve', 'La Sécurité : un dossier qui tombe au contrôle nous coûte tout.', { relation: 3, security: 8, trust: 3 }, { what: 'Vous priorisez la sécurité.', why: 'La sécurité pèse le plus dans le score final.', rule: 'La sécurité fiscale prime sur le reste.', codexUnlock: 'cdx_preuve' }, 'n3'),
        choice('acceptable', 'synthese', 'Les trois comptent, mais la Sécurité porte les deux autres.', { security: 6, relation: 1 }, { what: 'Vous équilibrez.', why: 'Juste.', rule: 'Les jauges interagissent.' }, 'n3'),
        choice('tempting', 'commercial', 'La Rentabilité : c’est elle qui fait tourner le cabinet.', { profitability: 4, security: -6 }, { what: 'Vous placez la marge d’abord.', why: 'La rentabilité seule mène aux missions toxiques.', rule: 'La marge ne passe pas avant la sécurité.' }, 'n3'),
        choice('poor', 'empathie', 'La Relation : si le client est content, le reste suivra.', { relation: 4, security: -6 }, { what: 'Vous surpondérez la relation.', why: 'Un client content d’un dossier faux reste un dossier faux.', rule: 'Plaire ne sécurise pas.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Amélie Roux (manager)',
      expression: 'satisfait',
      text: 'Dernière chose, la plus importante. Quand le vérificateur arrive, qu’est-ce qui te sauve ?',
      choices: [
        choice('optimal', 'preuve', 'La preuve collectée pendant les travaux, datée. Rien après coup.', { relation: 3, security: 10, trust: 4 }, { what: 'Vous avez tout compris.', why: 'La preuve se constitue au moment des travaux, pas du contrôle.', rule: 'La preuve d’avant sauve au contrôle.', codexUnlock: 'cdx_preuve' }, null),
        choice('acceptable', 'synthese', 'Un dossier documenté, cohérent et facile à relire.', { security: 6 }, { what: 'Vous visez juste.', why: 'Correct.', rule: 'La documentation fait le dossier.' }, null),
        choice('tempting', 'commercial', 'Un bon relationnel avec l’administration fiscale.', { security: -8 }, { what: 'Vous vous trompez de levier.', why: 'Le vérificateur juge la preuve, pas la sympathie.', rule: 'On ne charme pas un contrôle.' }, null),
        choice('poor', 'fermete', 'De la chance : espérer passer entre les gouttes du contrôle.', { security: -10 }, { what: 'Vous pariez sur la chance.', why: 'Compter sur l’absence de contrôle est la pire stratégie.', rule: 'On ne mise jamais sur la chance.' }, null),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 70, good: 50 },
    unlocks: { excellent: [], good: [], poor: [] },
  },
};
