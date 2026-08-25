import type { Scenario } from '../../engine/types';
import { choice } from './helpers';

// Suivis de mission, un par client.
//
// Tous les clients partageaient le même point d'étape : les mêmes phrases, les
// mêmes irritants, quel que soit le dossier. Le suivi devenait une formalité à
// cliquer, alors que c'est le moment où le métier se joue vraiment — la preuve
// se collecte pendant les travaux, jamais après.
//
// Chaque scène part donc de ce qui coince chez ce client-là : la famille qui ne
// note rien chez Dupuis, l'équipe qui documente le mauvais projet chez Nexalog,
// l'atelier qui range ses rebuts chez Mecaprécis, et ainsi de suite. Le
// locuteur reste « Le client » : l'affichage lui rend son nom et sa voix.

const OUT: Scenario['outcome'] = {
  scoreThresholds: { excellent: 75, good: 55 },
  unlocks: { excellent: ['piece_cr_essais', 'piece_feuilles_temps'], good: ['piece_feuilles_temps'], poor: [] },
};

// --------------------------------------------------------------- Maison Dupuis
export const FOLLOWUP_AGRI: Scenario = {
  id: 'sc_agri_followup',
  type: 'FOLLOWUP',
  title: 'Suivi — Maison Dupuis',
  context:
    'Trois semaines d’essais d’émulsion, et pas une ligne écrite. Chez Dupuis, on goûte, on ajuste, on recommence — la mémoire de l’atelier tient dans la tête du chef de production.',
  objectives: ['Faire écrire ce qui est déjà fait', 'Séparer l’essai de la production', 'Ménager une équipe artisanale'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Mes gars ont refait la recette onze fois depuis votre passage. Ça compte, ça, non ?',
      choices: [
        choice('optimal', 'preuve', 'Onze fois, oui — à condition qu’on sache ce qui changeait à chaque essai.', { relation: 3, security: 11, trust: 4 }, { what: 'Vous transformez le souvenir en preuve.', why: 'Onze essais sans paramètre noté ne se distinguent pas de onze fournées ratées.', rule: 'Un essai se prouve par ce qu’on faisait varier.', codexUnlock: 'cdx_preuve' }, 'n2'),
        choice('acceptable', 'synthese', 'Sûrement. Notez-moi la date et le paramètre modifié, même à la main.', { security: 8, relation: 2 }, { what: 'Vous demandez le minimum.', why: 'Un carnet d’atelier vaut mieux que rien, mais restera sommaire.', rule: 'Une trace pauvre reste une trace.' }, 'n2'),
        choice('tempting', 'commercial', 'Onze essais, c’est parfait, je mets tout : personne n’ira vérifier ça.', { relation: 5, security: -13 }, { what: 'Vous comptez sans preuve.', why: 'Le vérificateur demandera précisément ce que personne n’a écrit.', rule: 'On ne valorise pas ce qu’on ne peut pas montrer.' }, 'n2'),
        choice('poor', 'technique', 'Sans protocole formalisé et versionné, rien de tout cela n’est exploitable.', { relation: -7, mood: -5 }, { what: 'Vous parlez laboratoire à un artisan.', why: 'Exiger un protocole d’un atelier familial ferme la porte au lieu de l’ouvrir.', rule: 'On adapte l’exigence au terrain, pas l’inverse.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'agace',
      text: 'Vous voulez qu’on compte à part les heures d’essai et les heures de production normale. Mais chez moi, c’est le même atelier, les mêmes machines et les mêmes gars. Je fais comment ?',
      choices: [
        choice('optimal', 'synthese', 'Une ligne par jour d’essai suffit : le reste part en production, sans discussion.', { relation: 4, security: 10, trust: 3 }, { what: 'Vous tracez la frontière simplement.', why: 'Un partage grossier mais justifié tient mieux qu’un ratio flatteur et invérifiable.', rule: 'Mieux vaut un partage défendable qu’un partage avantageux.' }, null),
        choice('acceptable', 'preuve', 'On reprendra vos plannings d’atelier pour isoler les journées d’essai.', { security: 7, relation: 1 }, { what: 'Vous vous appuyez sur l’existant.', why: 'Le planning n’a pas été tenu pour ça, mais il date les journées.', rule: 'Une pièce née ailleurs peut servir de preuve.' }, null),
        choice('tempting', 'commercial', 'Mettons la moitié de l’atelier en R&D, ça passe très bien d’habitude.', { relation: 5, security: -14 }, { what: 'Vous inventez un ratio.', why: 'Cinquante pour cent sans justification est le premier chiffre que l’on raye.', rule: 'Un ratio rond et non justifié attire le contrôle.' }, null),
        choice('poor', 'fermete', 'Il faudrait deux ateliers séparés, sinon je ne peux rien retenir chez vous.', { relation: -9, trust: -4 }, { what: 'Vous posez une condition irréelle.', why: 'Aucune PME agroalimentaire ne double son atelier pour un crédit d’impôt.', rule: 'Une exigence intenable équivaut à un refus.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// -------------------------------------------------------------------- Nexalog
export const FOLLOWUP_SAAS: Scenario = {
  id: 'sc_saas_followup',
  type: 'FOLLOWUP',
  title: 'Suivi — Nexalog',
  context:
    'Elsa Brunet a fait documenter ses équipes avec zèle. Trente pages sont arrivées : elles décrivent surtout la refonte de l’interface, pas le moteur de prédiction.',
  objectives: ['Recentrer la preuve sur le verrou', 'Refuser le volume inutile', 'Garder une cliente enthousiaste'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'satisfait',
      text: 'On vous a tout documenté ! Trente pages, captures d’écran comprises. Ça devrait suffire ?',
      choices: [
        choice('optimal', 'technique', 'C’est du beau travail — sur l’interface. Le CIR se joue sur le moteur.', { relation: 2, security: 12, trust: 4 }, { what: 'Vous recentrez sans dévaloriser.', why: 'Un dossier épais sur le mauvais périmètre affaiblit le bon.', rule: 'Ce qui compte, c’est la trace du verrou, pas le volume.', codexUnlock: 'cdx_verrou' }, 'n2'),
        choice('acceptable', 'synthese', 'Gardons dix pages : celles qui parlent des essais d’algorithme.', { security: 9, relation: 2 }, { what: 'Vous triez.', why: 'Le tri est le bon réflexe ; reste à dire pourquoi ces dix-là.', rule: 'On sélectionne les pièces, on ne les empile pas.' }, 'n2'),
        choice('tempting', 'commercial', 'Trente pages, magnifique : plus le dossier est épais, mieux c’est reçu.', { relation: 6, security: -12 }, { what: 'Vous confondez volume et preuve.', why: 'Un vérificateur qui lit trente pages hors sujet doute de tout le reste.', rule: 'Le volume ne compense jamais le hors-sujet.' }, 'n2'),
        choice('poor', 'fermete', 'Tout est à refaire, ce n’est pas du tout ce que je vous avais demandé.', { relation: -9, mood: -6 }, { what: 'Vous balayez l’effort fourni.', why: 'Une équipe qui a travaillé pour vous et s’entend dire « à refaire » ne recommencera pas.', rule: 'On réoriente un effort, on ne l’annule pas.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Concrètement, qu’est-ce qui distingue notre moteur d’un développement classique ?',
      choices: [
        choice('optimal', 'preuve', 'Vos deux pistes abandonnées : elles prouvent que la solution n’était pas acquise.', { relation: 4, security: 11, trust: 5 }, { what: 'Vous valorisez les échecs.', why: 'Une impasse documentée est la meilleure preuve d’incertitude scientifique.', rule: 'Les tentatives ratées prouvent la recherche mieux que le résultat.' }, null),
        choice('acceptable', 'technique', 'L’écart entre vos temps de calcul visés et l’état de l’art publié.', { security: 8, trust: 2 }, { what: 'Vous comparez à l’état de l’art.', why: 'Juste, à condition de pouvoir citer les publications de référence.', rule: 'L’état de l’art se cite, il ne s’affirme pas.' }, null),
        choice('tempting', 'commercial', 'Rien à prouver : votre moteur est innovant, cela se voit tout de suite.', { relation: 5, security: -11 }, { what: 'Vous confondez innovation et R&D.', why: 'Innovant ne veut rien dire fiscalement : c’est l’incertitude levée qui compte.', rule: '« Innovant » n’est pas un critère du CIR.' }, null),
        choice('poor', 'empathie', 'Peu importe, je trouverai bien les mots qu’il faut pour le justificatif.', { relation: 1, security: -9, trust: -4 }, { what: 'Vous promettez de bien rédiger.', why: 'Un justificatif habile sur un fond vide se démonte en une question.', rule: 'La rédaction n’invente pas la matière.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------------------ Mecaprécis
export const FOLLOWUP_INDUS: Scenario = {
  id: 'sc_indus_followup',
  type: 'FOLLOWUP',
  title: 'Suivi — Mecaprécis',
  context:
    'Hervé Verdier a tout préparé, classeur à l’appui. Mais l’atelier a mis les pièces ratées au rebut : les prototypes hors cote sont partis à la benne la semaine dernière.',
  objectives: ['Sauver ce qui reste des essais', 'Rassurer un client échaudé', 'Documenter les bancs d’essais'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'agace',
      text: 'Les pièces hors cote sont parties au rebut. C’est grave ? Mon concurrent s’est fait redresser sur moins que ça.',
      choices: [
        choice('optimal', 'preuve', 'Les pièces, non. Les relevés de contrôle qui les ont recalées, oui.', { relation: 5, security: 11, trust: 5 }, { what: 'Vous déplacez la preuve.', why: 'Le rebut n’a jamais été la pièce à conviction : la mesure qui l’a écarté, si.', rule: 'On prouve un essai par sa mesure, pas par son objet.' }, 'n2'),
        choice('acceptable', 'synthese', 'On travaillera sur vos fiches de contrôle dimensionnel, elles sont datées.', { security: 8, relation: 3 }, { what: 'Vous ciblez une pièce existante.', why: 'Bonne source, à relier explicitement aux essais.', rule: 'Une pièce datée vaut mieux qu’un souvenir précis.' }, 'n2'),
        choice('tempting', 'commercial', 'Aucune importance, on décrira les essais de mémoire, personne n’ira vérifier.', { relation: 4, security: -14 }, { what: 'Vous reconstituez après coup.', why: 'Une reconstitution non sourcée est exactement ce qui a coulé son concurrent.', rule: 'On ne reconstitue pas une preuve absente.' }, 'n2'),
        choice('poor', 'fermete', 'C’est très embêtant : sans les pièces, votre dossier perd beaucoup de valeur.', { relation: -8, mood: -7 }, { what: 'Vous affolez un client déjà craintif.', why: 'Dramatiser sans solution transforme la peur du CIR en refus du CIR.', rule: 'On annonce un problème avec sa parade.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Et le banc d’essais qu’on a fabriqué en interne ? Il a coûté cher, celui-là.',
      choices: [
        choice('optimal', 'technique', 'Il entre par son amortissement, au prorata du temps passé en essais.', { relation: 3, security: 11, trust: 4 }, { what: 'Vous qualifiez correctement le banc.', why: 'Un équipement de R&D entre par la dotation aux amortissements, jamais par son prix d’achat.', rule: 'Un équipement se valorise par son amortissement, au prorata R&D.', codexUnlock: 'cdx_amortissements' }, null),
        choice('acceptable', 'preuve', 'On le retient sur la part R&D, avec le planning d’occupation à l’appui.', { security: 9, trust: 2 }, { what: 'Vous justifiez le prorata.', why: 'Le planning d’occupation est la bonne pièce ; encore faut-il l’avoir tenu.', rule: 'Un prorata s’appuie sur une trace d’usage.' }, null),
        choice('tempting', 'commercial', 'On passe le banc en totalité, il a été construit pour vos essais.', { relation: 4, security: -13 }, { what: 'Vous retenez tout l’équipement.', why: 'Le banc sert aussi au contrôle de série : le prorata n’est pas négociable.', rule: 'Un équipement mixte ne se retient jamais en totalité.' }, null),
        choice('poor', 'fermete', 'Le matériel fabriqué en interne pose trop de difficultés : on l’écarte.', { relation: -6, profitability: -4 }, { what: 'Vous renoncez à un poste légitime.', why: 'Écarter par confort ampute le client d’un montant auquel il a droit.', rule: 'La prudence n’est pas de tout retirer.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ---------------------------------------------------------- Cellvia Therapeutics
export const FOLLOWUP_BIOTECH: Scenario = {
  id: 'sc_biotech_followup',
  type: 'FOLLOWUP',
  title: 'Suivi — Cellvia Therapeutics',
  context:
    'Laurent Kaplan a besoin d’un chiffre pour son comité de trésorerie de vendredi. Entre-temps, une seconde tranche de subvention Bpifrance est tombée, et personne ne vous l’a signalée.',
  objectives: ['Récupérer la convention de la nouvelle tranche', 'Tenir la contrainte de trésorerie', 'Ne pas chiffrer trop tôt'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Il me faut un montant vendredi pour le comité. Vous pouvez me donner un chiffre ferme ?',
      choices: [
        choice('optimal', 'synthese', 'Vendredi, une fourchette basse assumée. Le chiffre ferme après vos conventions.', { relation: 3, security: 10, trust: 4 }, { what: 'Vous tenez l’échéance sans vous engager.', why: 'Une borne basse tient devant un comité ; un chiffre ferme prématuré devient une dette.', rule: 'On donne une borne, jamais un montant, avant les pièces.', codexUnlock: 'cdx_estimer' }, 'n2'),
        choice('acceptable', 'preuve', 'Je vous donne le calcul hors aides, et la déduction dès réception.', { security: 8, relation: 2 }, { what: 'Vous montrez le calcul en deux temps.', why: 'Honnête, mais un comité retient rarement la deuxième moitié de la phrase.', rule: 'Un chiffre provisoire s’annonce comme tel, deux fois.' }, 'n2'),
        choice('tempting', 'commercial', 'Comptez sur le haut de la fourchette, ça passera très bien en comité.', { relation: 6, security: -14, profitability: 2 }, { what: 'Vous donnez le chiffre qui arrange.', why: 'Un montant inscrit en comité devient un engagement dont personne ne vous déchargera.', rule: 'Ce qui entre en comité ne se corrige plus.' }, 'n2'),
        choice('poor', 'fermete', 'Aucun chiffre avant le dépôt : votre comité attendra la fin de la mission.', { relation: -8, trust: -4 }, { what: 'Vous ignorez la contrainte du client.', why: 'Une biotech pilote sa trésorerie au mois : refuser tout repère la met en danger.', rule: 'Refuser un chiffre n’exclut pas de donner un cadre.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Ah, et on a touché une seconde tranche Bpifrance en juin. C’est une bonne nouvelle, non ?',
      choices: [
        choice('optimal', 'technique', 'Bonne pour la trésorerie. Elle se déduit de l’assiette, à hauteur de sa part R&D.', { relation: 2, security: 12, trust: 4 }, { what: 'Vous annoncez la déduction sans détour.', why: 'Une aide publique non déduite est le redressement le plus mécanique qui soit.', rule: 'Toute aide publique se déduit à hauteur de sa part R&D.', codexUnlock: 'cdx_subventions' }, null),
        choice('acceptable', 'preuve', 'Envoyez-moi la convention : son affectation décide de ce qu’on déduit.', { security: 9, trust: 3 }, { what: 'Vous demandez la pièce.', why: 'La convention porte la clé de répartition ; sans elle, on déduit à l’aveugle.', rule: 'C’est la convention qui dit ce qui est affecté à la R&D.' }, null),
        choice('tempting', 'commercial', 'Excellente nouvelle, et sans impact : le CIR et l’aide sont deux choses.', { relation: 5, security: -16 }, { what: 'Vous ignorez la déduction.', why: 'Cumuler l’aide et le crédit sur la même dépense est un double financement.', rule: 'Une même dépense n’est jamais financée deux fois.' }, null),
        choice('poor', 'fermete', 'C’est une mauvaise nouvelle : cette aide va faire fondre votre crédit.', { relation: -6, mood: -5 }, { what: 'Vous présentez une aide comme une perte.', why: 'L’aide reste de l’argent reçu : la présenter comme un dommage sonne faux.', rule: 'Une déduction s’explique, elle ne se déplore pas.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ----------------------------------------------------------- Solterra Materials
export const FOLLOWUP_GREEN: Scenario = {
  id: 'sc_green_followup',
  type: 'FOLLOWUP',
  title: 'Suivi — Solterra Materials',
  context:
    'Marion Vasseur vous accorde quinze minutes entre deux comités. Le consortium européen a rendu son rapport intermédiaire, et l’avance remboursable vient d’être débloquée.',
  objectives: ['Aller à l’essentiel en quinze minutes', 'Traiter l’avance remboursable', 'Isoler la part Solterra du consortium'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'ferme',
      text: 'J’ai quinze minutes. Dites-moi les deux choses qui bloquent, et rien d’autre.',
      choices: [
        choice('optimal', 'synthese', 'Deux : votre part réelle dans le consortium, et l’avance débloquée en mai.', { relation: 5, security: 10, trust: 4 }, { what: 'Vous répondez au format demandé.', why: 'Avec un dirigeant pressé, la hiérarchisation vaut autant que le fond.', rule: 'On adapte le format, jamais le contenu.' }, 'n2'),
        choice('acceptable', 'preuve', 'Le rapport de consortium et la convention d’avance, avant vendredi.', { security: 8, relation: 3 }, { what: 'Vous demandez deux pièces.', why: 'Efficace, mais le client ne sait pas pourquoi elles comptent.', rule: 'Une demande sans motif se traite en dernier.' }, 'n2'),
        choice('tempting', 'commercial', 'Rien ne bloque, tout avance bien : je ne vais pas vous retenir.', { relation: 6, security: -13 }, { what: 'Vous n’utilisez pas le créneau.', why: 'Quinze minutes obtenues et gâchées, ce sont deux points durs reportés au dépôt.', rule: 'On ne rassure pas à la place d’informer.' }, 'n2'),
        choice('poor', 'technique', 'Reprenons depuis le début : le régime des avances remboursables prévoit…', { relation: -8, mood: -6 }, { what: 'Vous déroulez le régime juridique.', why: 'Quinze minutes annoncées, un exposé commencé : vous perdez le créneau et la cliente.', rule: 'Le temps du client est une contrainte, pas une suggestion.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'L’avance est remboursable, justement. Ce n’est pas une subvention, donc rien à déduire ?',
      choices: [
        choice('optimal', 'technique', 'Elle se déduit tant qu’elle n’est pas remboursée, puis se réintègre après.', { relation: 3, security: 12, trust: 5 }, { what: 'Vous décrivez le traitement en deux temps.', why: 'L’avance suit le sort d’une aide jusqu’au remboursement effectif, qui la libère.', rule: 'Une avance remboursable se déduit, puis se reprend au remboursement.', codexUnlock: 'cdx_subventions' }, null),
        choice('acceptable', 'preuve', 'L’échéancier de remboursement décidera de l’exercice où elle se reprend.', { security: 9, trust: 3 }, { what: 'Vous renvoyez à l’échéancier.', why: 'Exact sur la mécanique, un peu court sur l’année en cours.', rule: 'L’échéancier fixe l’exercice de reprise.' }, null),
        choice('tempting', 'commercial', 'Vous avez raison, remboursable veut dire prêt : on ne déduit rien.', { relation: 5, security: -16 }, { what: 'Vous suivez la cliente dans son erreur.', why: 'Tant qu’elle n’est pas remboursée, l’avance finance bien les travaux.', rule: 'Le nom de l’aide ne décide pas de son traitement.' }, null),
        choice('poor', 'fermete', 'Déduction totale et définitive : c’est la règle, on ne va pas en débattre.', { relation: -7, security: -4 }, { what: 'Vous tranchez faux, et sèchement.', why: 'Une reprise oubliée prive le client d’un crédit auquel il aura droit.', rule: 'Une règle mal citée coûte des deux côtés.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------------------- Data&Co
export const FOLLOWUP_SERVICES: Scenario = {
  id: 'sc_services_followup',
  type: 'FOLLOWUP',
  title: 'Suivi — Data&Co',
  context:
    'Paul Lenoir répond par oui ou par non. Le périmètre honnête s’est réduit à un seul chantier : le moteur d’anonymisation. Ses équipes, elles, continuent de remonter des heures sur tout le reste.',
  objectives: ['Faire parler un client silencieux', 'Tenir le périmètre réduit', 'Refuser les heures de prestation'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Mes chefs de projet ont saisi leurs heures. Presque tout le monde a mis du CIR.',
      choices: [
        choice('optimal', 'preuve', 'Sur quel chantier, précisément ? Seul l’anonymisation tenait la route.', { relation: 3, security: 12, trust: 4 }, { what: 'Vous ramenez au périmètre convenu.', why: 'Chez une ESN, les heures facturées au client se déguisent facilement en heures de R&D.', rule: 'Une heure de prestation vendue n’est jamais une heure de recherche.', codexUnlock: 'cdx_verrou' }, 'n2'),
        choice('acceptable', 'synthese', 'On ne garde que les heures rattachées au moteur d’anonymisation.', { security: 9, relation: 2 }, { what: 'Vous filtrez.', why: 'Le bon filtre, sans expliquer pourquoi les autres tombent.', rule: 'Un périmètre se défend en disant ce qu’il exclut.' }, 'n2'),
        choice('tempting', 'commercial', 'Parfait, on part de leurs saisies : elles sont dans votre outil, c’est carré.', { relation: 5, security: -15 }, { what: 'Vous prenez la saisie pour une preuve.', why: 'Un outil bien tenu qui enregistre le mauvais périmètre reste le mauvais périmètre.', rule: 'La rigueur de l’outil ne valide pas le contenu.' }, 'n2'),
        choice('poor', 'fermete', 'Vos équipes se trompent : chez une ESN, il n’y a jamais de R&D.', { relation: -9, trust: -5 }, { what: 'Vous niez le seul vrai sujet.', why: 'Le moteur d’anonymisation lève une vraie incertitude : le nier, c’est perdre le dossier.', rule: 'Un secteur n’est jamais éligible ou exclu en bloc.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'agace',
      text: 'Donc je paie une mission pour un seul chantier sur douze. Vous comprenez que ça m’ennuie ?',
      choices: [
        choice('optimal', 'preuve', 'Un chantier défendable rapporte plus que douze qu’on vous fera rendre.', { relation: 2, security: 12, trust: 5 }, { what: 'Vous chiffrez le risque, pas la vertu.', why: 'Un dirigeant silencieux entend l’argument économique bien mieux que l’argument moral.', rule: 'Le périmètre étroit est un calcul, pas une pudeur.' }, null),
        choice('acceptable', 'empathie', 'Je comprends. C’est aussi le chantier dont vous parlerez en clientèle.', { relation: 6, security: 3 }, { what: 'Vous cherchez la valeur ailleurs.', why: 'Vrai, mais un peu légère face à une facture qui, elle, est bien réelle.', rule: 'Un bénéfice indirect ne remplace pas la démonstration.' }, null),
        choice('tempting', 'commercial', 'On peut regarder les onze autres, on trouvera bien deux ou trois angles.', { relation: 6, security: -16 }, { what: 'Vous rouvrez le périmètre par confort.', why: 'Élargir pour justifier des honoraires est exactement ce qu’on vous paie à ne pas faire.', rule: 'On n’élargit jamais un périmètre pour justifier une facture.' }, null),
        choice('poor', 'fermete', 'C’est comme ça. Vous avez signé en connaissance de cause, il me semble.', { relation: -10, mood: -6 }, { what: 'Vous renvoyez au contrat.', why: 'Opposer la signature à un client mécontent n’a jamais retenu personne.', rule: 'Le contrat ne remplace pas l’explication.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

/** Tous les suivis propres à un client. */
export const FOLLOWUP_SCENARIOS: Scenario[] = [
  FOLLOWUP_AGRI,
  FOLLOWUP_SAAS,
  FOLLOWUP_INDUS,
  FOLLOWUP_BIOTECH,
  FOLLOWUP_GREEN,
  FOLLOWUP_SERVICES,
];
