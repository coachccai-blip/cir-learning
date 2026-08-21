import type { Scenario } from '../../engine/types';
import { choice, DEFAULT_OUTCOME } from './helpers';

// Solterra — Marion Vasseur, RUSHED (20 min chrono, coupe la parole, veut un chiffre).

export const GREEN_DISCOVERY: Scenario = {
  id: 'sc_green_disc',
  type: 'DISCOVERY',
  clientId: 'cli_green_solterra',
  title: 'Rendez-vous découverte — Solterra Materials',
  context: 'Marion Vasseur enchaîne les comités. Vingt minutes chrono. Elle veut une synthèse et un chiffre, tout de suite. Dossier piégeux : avance remboursable, consortium.',
  objectives: ['Synthétiser vite et juste', 'Ne pas céder au chiffre précis', 'Repérer l’avance remboursable'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Marion Vasseur',
      expression: 'agace',
      text: 'J’ai quinze minutes. Allez à l’essentiel : est-ce qu’on a droit au CIR, oui ou non, et combien ?',
      choices: [
        choice('optimal', 'synthese', 'Oui, sur votre R&D matériaux : verrou réel, essais documentés. Reste à traiter votre avance.', { relation: 6, security: 8, mood: 4, trust: 4 }, { what: 'Vous synthétisez sans vous piéger.', why: 'Le pressé veut une réponse nette, mais vous gardez la main sur le chiffre.', rule: 'Avec un pressé : synthèse ferme, chiffre encadré.', codexUnlock: 'cdx_client_difficile' }, 'n2'),
        choice('acceptable', 'preuve', 'Oui pour la R&D matériaux. Le chiffre, je vous le donne après un point sur vos aides.', { security: 8, relation: -2, mood: 1 }, { what: 'Vous conditionnez.', why: 'Juste, un peu frustrant pour elle.', rule: 'Le chiffre suit le traitement des aides.' }, 'n2'),
        choice('tempting', 'commercial', 'Oui ! Je dirais 400 k€ sans hésiter, on affinera les détails plus tard ensemble.', { relation: 10, security: -12, mood: 6 }, { what: 'Vous lâchez un chiffre précis.', why: 'Un pressé retiendra 400 k€ et l’écrira dans son prochain comité.', rule: 'Un chiffre donné à un pressé devient ferme.' }, 'n2', { promise: { kind: 'precise', min: 400000, max: 400000 } }),
        choice('poor', 'technique', 'Alors, il faut d’abord comprendre la limite proportionnelle de 3× et le plafond global…', { relation: -10, mood: -8 }, { what: 'Vous noyez la pressée.', why: 'Le mauvais registre au mauvais moment la fait décrocher.', rule: 'Un pressé veut une synthèse, pas un cours.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Marion Vasseur',
      expression: 'neutre',
      text: 'On a une avance remboursable et une subvention ADEME sur un projet à moitié R&D, moitié industrialisation. Vite, ça change quoi ?',
      choices: [
        choice('optimal', 'synthese', 'On déduit l’avance dès l’octroi, et la subvention pour sa seule part R&D.', { relation: 3, security: 12, mood: 3, trust: 4 }, { what: 'Vous traitez la quote-part.', why: 'Seule la fraction R&D d’une aide mixte se déduit.', rule: 'Quote-part R&D pour les aides mixtes.', codexUnlock: 'cdx_quotepart' }, 'n3'),
        choice('acceptable', 'preuve', 'Les deux se déduisent ; pour l’ADEME, uniquement la part affectée à la R&D.', { security: 8, mood: 1 }, { what: 'Vous annoncez la déduction.', why: 'Correct.', rule: 'Avance déduite à l’octroi.', codexUnlock: 'cdx_avances' }, 'n3'),
        choice('tempting', 'commercial', 'On garde l’assiette pleine pour l’instant, on verra pour les aides un peu plus tard.', { relation: 5, security: -14, mood: 2 }, { what: 'Vous repoussez la déduction.', why: 'Ne pas déduire une aide connue est un redressement certain.', rule: 'On déduit les aides tout de suite.' }, 'n3'),
        choice('poor', 'fermete', 'L’avance remboursable, comme on finit par la rembourser, on ne la déduit jamais.', { security: -12 }, { what: 'Vous vous trompez.', why: 'L’avance se déduit à l’octroi, puis se réintègre au remboursement.', rule: 'Avance : déduite d’abord, réintégrée ensuite.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Marion Vasseur',
      expression: 'neutre',
      text: 'On travaille aussi avec un partenaire de consortium. Ça, ça compte en sous-traitance ?',
      choices: [
        choice('optimal', 'preuve', 'Seulement s’il est agréé MESR : sans agrément, ce n’est pas éligible.', { relation: 3, security: 12, mood: 3, trust: 4 }, { what: 'Vous vérifiez l’agrément.', why: 'Le consortium ne dispense pas de l’agrément.', rule: 'Pas d’agrément = pas d’éligibilité.', codexUnlock: 'cdx_st_agrement' }, 'n4'),
        choice('acceptable', 'synthese', 'À vérifier : sans l’agrément MESR du partenaire, on ne retient pas cette dépense.', { security: 8 }, { what: 'Vous conditionnez.', why: 'Juste.', rule: 'On contrôle l’agrément avant de retenir.' }, 'n4'),
        choice('tempting', 'commercial', 'Un partenaire de consortium, c’est du sérieux : on le met dans l’assiette sans hésiter.', { relation: 4, security: -14 }, { what: 'Vous présumez l’agrément.', why: 'Le sérieux d’un partenaire ne vaut pas agrément.', rule: 'On ne présume jamais l’agrément.' }, 'n4'),
        choice('poor', 'fermete', 'Dans un consortium, tout est éligible pour tout le monde, c’est bien le principe.', { security: -16 }, { what: 'Vous inventez.', why: 'Chaque acteur a ses propres conditions d’éligibilité.', rule: 'Le consortium ne mutualise pas l’éligibilité.' }, 'n4'),
      ],
    },
    {
      id: 'n4',
      speaker: 'Marion Vasseur',
      expression: 'satisfait',
      text: 'Bon, efficace. Un ordre de grandeur pour mon comité de demain ?',
      choices: [
        choice('optimal', 'synthese', 'Net des aides, 260 à 380 k€. Notez « estimation provisoire » au comité.', { relation: 6, security: 4, profitability: 3, mood: 3, trust: 4 }, { what: 'Fourchette encadrée.', why: 'Vous rendez service au comité sans vous engager sur un chiffre ferme.', rule: 'Une fourchette qualifiée « provisoire » protège.', codexUnlock: 'cdx_estimer' }, null, { promise: { kind: 'range', min: 260000, max: 380000 } }),
        choice('acceptable', 'fermete', 'Je préfère vous confirmer le montant après vérification des aides : sous dix jours.', { security: 6, relation: -4, mood: -2 }, { what: 'Vous temporisez.', why: 'Prudent, frustrant pour un comité imminent.', rule: 'La rigueur doit composer avec le calendrier client.' }, null),
        choice('tempting', 'commercial', 'Mettez 450 k€ dans votre comité, ça passera sans aucun problème, croyez-moi.', { relation: 10, security: -12, mood: 5 }, { what: 'Vous gonflez pour le comité.', why: 'Un chiffre de comité devient un engagement.', rule: 'Ne jamais gonfler un chiffre destiné à être écrit.' }, null, { promise: { kind: 'precise', min: 450000, max: 450000 } }),
        choice('poor', 'empathie', 'Dites simplement à votre comité que ce sera un très bon montant cette année.', { relation: 4, security: -8 }, { what: 'Vous restez dans le flou.', why: 'Un flou en comité se retourne contre vous.', rule: 'Le flou n’aide pas un décideur pressé.' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};

export const GREEN_KICKOFF: Scenario = {
  id: 'sc_green_kick',
  type: 'KICKOFF',
  clientId: 'cli_green_solterra',
  title: 'Kick-off — Solterra',
  context: 'Marion vous accorde une demi-heure entre deux réunions. Il faut fiabiliser le taux industrialisation et cadrer la collecte, vite.',
  objectives: ['Distinguer R&D et industrialisation', 'Sécuriser la quote-part des aides', 'Obtenir un engagement de collecte'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Marion Vasseur',
      expression: 'neutre',
      text: 'Mon responsable industrialisation dit qu’il est à 60 % R&D. On valide et on avance ?',
      choices: [
        choice('optimal', 'preuve', 'L’industrialisation est en aval de la R&D : ses relevés montrent plutôt 25 %.', { security: 12, relation: 1, mood: 2, trust: 4 }, { what: 'Vous corrigez le taux.', why: 'Mettre l’industrialisation en R&D est le piège du dossier greentech.', rule: 'L’industrialisation n’est pas de la R&D.', codexUnlock: 'cdx_personnel' }, 'n2'),
        choice('acceptable', 'synthese', 'On s’appuie sur ses feuilles de temps réelles, pas sur une estimation de mémoire.', { security: 8, trust: 2 }, { what: 'Vous demandez la trace.', why: 'Juste.', rule: 'Le prorata se prouve.' }, 'n2'),
        choice('tempting', 'commercial', '60 %, c’est ce qu’il annonce lui-même : on gagne du temps et on valide comme ça.', { relation: 4, security: -12, mood: 1 }, { what: 'Vous validez pour aller vite.', why: 'La vitesse ne dispense pas de la preuve.', rule: 'Aller vite ≠ valider à l’aveugle.' }, 'n2'),
        choice('poor', 'fermete', 'Mettons 80 %, il est clé pour le projet et personne n’ira vérifier ce chiffre.', { security: -16 }, { what: 'Vous surévaluez.', why: 'Un poste d’aval majoritairement industriel ne peut être à 80 % R&D.', rule: 'L’importance n’est pas un taux.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Marion Vasseur',
      expression: 'agace',
      text: 'Pour l’ADEME, on met tout en déduction ou juste une partie ? Faites simple.',
      choices: [
        choice('optimal', 'preuve', 'Seule la part R&D de la subvention se déduit, ici 75 % : on documente la clé.', { security: 12, relation: 2, mood: 2, trust: 4 }, { what: 'Vous appliquez la quote-part.', why: 'Une aide mixte se déduit au prorata R&D.', rule: 'Quote-part R&D, clé documentée.', codexUnlock: 'cdx_quotepart' }, 'n3'),
        choice('acceptable', 'synthese', 'Juste la part R&D. Il nous faut la convention pour fixer le pourcentage exact.', { security: 8, trust: 2 }, { what: 'Vous demandez la convention.', why: 'Correct.', rule: 'La convention fixe la clé.' }, 'n3'),
        choice('tempting', 'commercial', 'On ne déduit qu’un petit bout de la subvention, comme ça le CIR est maximisé.', { relation: 3, security: -14 }, { what: 'Vous sous-déduisez.', why: 'Sous-déduire une aide affectée à la R&D est un redressement.', rule: 'On déduit la juste quote-part, ni plus ni moins.' }, 'n3'),
        choice('poor', 'fermete', 'On déduit 100 % de la subvention, comme ça il n’y aura aucune discussion.', { security: -6, profitability: -2 }, { what: 'Vous surdéduisez.', why: 'Déduire la part non-R&D vous fait perdre du CIR légitime.', rule: 'Surdéduire coûte aussi.' }, 'n3'),
      ],
    },
    {
      id: 'n3',
      speaker: 'Marion Vasseur',
      expression: 'satisfait',
      text: 'Parfait. Qu’est-ce qu’il me faut vous envoyer, en une liste courte ?',
      choices: [
        choice('optimal', 'synthese', 'Feuilles de temps par projet, convention ADEME, agrément de l’école.', { relation: 5, security: 8, profitability: 2, mood: 2, trust: 4 }, { what: 'Vous donnez une liste courte.', why: 'Un pressé exécute une liste courte, pas un cahier des charges.', rule: 'Adapter la forme de la demande au profil.', codexUnlock: 'cdx_pieces' }, null),
        choice('acceptable', 'preuve', 'Surtout les conventions d’aide et les feuilles de temps par projet, dès maintenant.', { security: 6, mood: 1 }, { what: 'Vous ciblez l’essentiel.', why: 'Pertinent.', rule: 'Les conventions d’abord.' }, null),
        choice('tempting', 'commercial', 'Envoyez-moi tout ce que vous avez sous la main, je ferai le tri de mon côté.', { relation: 4, security: -8 }, { what: 'Vous relâchez.', why: 'Sans liste, il manquera toujours une pièce clé.', rule: 'Une demande vague produit un dossier troué.' }, null),
        choice('poor', 'fermete', 'Pas besoin de liste de pièces, je reconstituerai tout ça à la fin de la mission.', { security: -14 }, { what: 'Vous repoussez la collecte.', why: 'Reconstituer à la fin, c’est perdre la preuve.', rule: 'La preuve se collecte au fil de l’eau.', codexUnlock: 'cdx_preuve' }, null),
      ],
    },
  ],
  outcome: DEFAULT_OUTCOME,
};
