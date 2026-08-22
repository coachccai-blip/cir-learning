// Scénarios réservés à la deuxième saison (mode Expert).
//
// En Onboarding, le client se trompe de bonne foi et l'écran d'assiette affiche
// le taux justifiable. En Expert, plus rien n'est donné : l'interlocuteur
// embellit sciemment, la preuve se gagne sur le terrain, et un dossier au moins
// doit être refusé. Ces scènes portent ces trois mécaniques.

import type { Scenario } from '../../engine/types';
import { choice } from './helpers';

/** Le travail de terrain paie : ces entretiens rapportent les pièces qui, en
 *  Expert, sont la seule façon de connaître les taux réellement opposables. */
const FIELD_OUTCOME: Scenario['outcome'] = {
  scoreThresholds: { excellent: 78, good: 58 },
  unlocks: {
    excellent: ['piece_feuilles_temps', 'piece_registre', 'piece_cr_essais'],
    good: ['piece_feuilles_temps'],
    poor: [],
  },
};

// --- Découverte : le dirigeant qui embellit -------------------------------

export const EXPERT_DISCOVERY: Scenario = {
  id: 'sc_exp_disc_embellie',
  type: 'DISCOVERY',
  title: 'Rendez-vous de cadrage — des chiffres trop ronds',
  context:
    'Votre interlocuteur a préparé son dossier. Trop bien préparé : les taux annoncés sont ronds, homogènes, et personne n’a encore ouvert un fichier de temps.',
  objectives: [
    'Distinguer le déclaré du démontrable',
    'Obtenir l’accès aux pièces sources',
    'Ne valider aucun taux sur parole',
  ],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le dirigeant',
      expression: 'satisfait',
      text: 'J’ai fait le calcul avec mon comptable : toute l’équipe technique est à 80 % de R&D. C’est carré, non ?',
      choices: [
        choice(
          'optimal',
          'preuve',
          'Carré, oui. Reste à voir sur quoi ce quatre-vingts pour cent s’appuie.',
          { relation: 1, security: 12, trust: 4 },
          {
            what: 'Vous séparez le chiffre de sa preuve.',
            why: 'Un taux uniforme sur toute une équipe ne sort jamais d’un relevé réel : il sort d’une moyenne de confort.',
            rule: 'Un taux n’existe que s’il est adossé à une pièce.',
            codexUnlock: 'cdx_personnel',
          },
          'n2',
        ),
        choice(
          'acceptable',
          'technique',
          'Un taux unique pour toute l’équipe, c’est rare. On va devoir le ventiler.',
          { security: 8, relation: 1 },
          {
            what: 'Vous annoncez la ventilation.',
            why: 'Juste sur le fond, mais vous laissez le chiffre initial dans la conversation.',
            rule: 'Ventiler par personne, jamais par équipe.',
          },
          'n2',
        ),
        choice(
          'tempting',
          'commercial',
          'Très bien, on part là-dessus, et on affinera plus tard si besoin.',
          { relation: 6, security: -14, mood: 3 },
          {
            what: 'Vous entérinez un taux non démontré.',
            why: 'Ce que vous acceptez au cadrage, vous le défendrez seul devant le vérificateur.',
            rule: 'Un chiffre accepté sans pièce devient votre chiffre.',
          },
          'n2',
        ),
        choice(
          'poor',
          'fermete',
          'Votre comptable n’a aucune compétence pour évaluer un taux de R&D.',
          { relation: -9, mood: -6, trust: -3 },
          {
            what: 'Vous disqualifiez son conseil habituel.',
            why: 'Attaquer le comptable ferme l’accès aux fichiers que vous allez lui demander.',
            rule: 'On conteste un chiffre, jamais la personne.',
          },
          'n2',
        ),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le dirigeant',
      expression: 'neutre',
      text: 'Les feuilles de temps, on n’en tient pas vraiment. Mais je connais mes équipes, je sais ce qu’elles font.',
      choices: [
        choice(
          'optimal',
          'technique',
          'Reconstituons depuis les tickets projet et le registre du personnel.',
          { relation: 3, security: 12, trust: 5 },
          {
            what: 'Vous cherchez une source de second rang.',
            why: 'À défaut de feuilles de temps, une trace produite au moment des travaux vaut mieux qu’une déclaration.',
            rule: 'Faute de feuilles de temps, on remonte aux traces d’activité.',
            codexUnlock: 'cdx_pieces',
          },
          'n3',
        ),
        choice(
          'acceptable',
          'empathie',
          'Je vous crois. Il me faut quand même de quoi l’écrire dans le dossier.',
          { relation: 5, security: 6, mood: 2 },
          {
            what: 'Vous ménagez sans céder.',
            why: 'Correct, mais vous ne dites pas encore quelle pièce vous voulez.',
            rule: 'Une demande de preuve doit nommer la pièce attendue.',
          },
          'n3',
        ),
        choice(
          'tempting',
          'synthese',
          'Signez-moi une attestation sur l’honneur, ça fera l’affaire au dossier.',
          { relation: 4, security: -16 },
          {
            what: 'Vous fabriquez une preuve à la place du client.',
            why: 'Une attestation rédigée après coup n’a aucune valeur probante : elle en a même une négative.',
            rule: 'On ne reconstitue jamais une preuve après les travaux.',
            codexUnlock: 'cdx_preuve',
          },
          'n3',
        ),
        choice(
          'poor',
          'fermete',
          'Sans feuilles de temps, il n’y a pas de dossier. Point final.',
          { relation: -8, mood: -5 },
          {
            what: 'Vous claquez la porte trop tôt.',
            why: 'Beaucoup de PME n’ont pas de feuilles de temps et disposent pourtant de traces exploitables.',
            rule: 'L’absence de feuilles de temps n’est pas l’absence de preuve.',
          },
          'n3',
        ),
      ],
    },
    {
      // Couperet : il propose ouvertement de forcer le trait. Aucune sortie neutre.
      id: 'n3',
      speaker: 'Le dirigeant',
      expression: 'ferme',
      text: 'Soyons pragmatiques. On met 80 % partout, et si l’administration coupe, elle coupera. C’est mon risque, pas le vôtre.',
      choices: [
        choice(
          'optimal',
          'fermete',
          'Le mien aussi : je signe le dossier. Ce sera le taux démontrable.',
          { relation: -3, security: 18, trust: 7 },
          {
            what: 'Vous refusez de porter un taux indéfendable.',
            why: 'Le conseil qui monte le dossier engage sa responsabilité : « c’est mon risque » est faux.',
            rule: 'Le risque d’un dossier gonflé est partagé — donc il se refuse.',
            codexUnlock: 'cdx_dire_non',
          },
          null,
        ),
        choice(
          'tempting',
          'commercial',
          'Comme vous voulez : c’est vous qui déclarez, et vous qui assumerez.',
          { relation: 7, security: -20, mood: 5 },
          {
            what: 'Vous vous défaussez sur le client.',
            why: 'Vous venez d’accepter de produire un chiffre que vous savez faux, en espérant qu’on ne vous le reproche pas.',
            rule: 'Se défausser ne protège ni le client ni le cabinet.',
          },
          null,
        ),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 78, good: 58 },
    unlocks: { excellent: ['piece_registre'], good: [], poor: [] },
  },
};

// --- Découverte : le dossier qu'il faut refuser ---------------------------

export const EXPERT_REFUSAL: Scenario = {
  id: 'sc_exp_disc_refus',
  type: 'DISCOVERY',
  clientId: 'cli_exp_forgeal',
  title: 'Rendez-vous découverte — Forgeal Industries',
  context:
    'Bruno Meyer a repris l’atelier de son ancien employeur. Il parle peu, montre beaucoup, et ce qu’il montre est impressionnant — mais ressemble à de la production.',
  objectives: [
    'Chercher l’incertitude, pas la prouesse',
    'Distinguer le CIR du CII',
    'Assumer un refus si le dossier n’existe pas',
  ],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Bruno Meyer',
      expression: 'neutre',
      text: 'Regardez cette pièce. Personne dans la région ne sait l’usiner. Ça, c’est de la recherche, non ?',
      choices: [
        choice(
          'optimal',
          'technique',
          'Personne dans la région, ou personne au monde ? Ce n’est pas pareil.',
          { relation: 2, security: 12, trust: 4 },
          {
            what: 'Vous ramenez le débat à l’état de l’art.',
            why: 'Un savoir-faire rare localement peut être parfaitement documenté ailleurs : le progrès s’apprécie face à l’état de l’art, pas face aux voisins.',
            rule: 'Le référentiel, c’est l’état de l’art mondial.',
            codexUnlock: 'cdx_etat_art',
          },
          'n2',
        ),
        choice(
          'acceptable',
          'preuve',
          'Belle pièce. Qu’est-ce que vous ne saviez pas faire avant de la lancer ?',
          { security: 9, relation: 2, mood: 2 },
          {
            what: 'Vous cherchez le point de départ incertain.',
            why: 'Bonne question, mais vous laissez passer la comparaison régionale.',
            rule: 'On qualifie par ce qui était inconnu au départ.',
          },
          'n2',
        ),
        choice(
          'tempting',
          'commercial',
          'Magnifique. Avec ça, on vous monte un très beau dossier CIR.',
          { relation: 8, security: -14, mood: 5 },
          {
            what: 'Vous qualifiez sur une impression.',
            why: 'La difficulté d’exécution n’est pas une incertitude scientifique — et vous venez de promettre un dossier.',
            rule: 'La prouesse technique n’est pas la recherche.',
          },
          'n2',
        ),
        choice(
          'poor',
          'synthese',
          'De l’usinage, donc. On est très loin du CIR, je le crains.',
          { relation: -7, mood: -6 },
          {
            what: 'Vous concluez avant d’avoir regardé.',
            why: 'Un atelier peut abriter un vrai verrou : trancher en dix secondes vous fera rater le seul projet éligible.',
            rule: 'On instruit avant de conclure, dans les deux sens.',
          },
          'n2',
        ),
      ],
    },
    {
      id: 'n2',
      speaker: 'Bruno Meyer',
      expression: 'neutre',
      text: 'On a conçu notre propre bâti pour tenir la pièce. Rien n’existait sur le marché, alors on l’a fait nous-mêmes.',
      choices: [
        choice(
          'optimal',
          'technique',
          'Un premier exemplaire de matériel nouveau : cela ressemble au CII, pas au CIR.',
          { relation: 3, security: 12, trust: 5 },
          {
            what: 'Vous nommez le bon dispositif.',
            why: 'Un prototype de produit nouveau sans verrou de recherche relève du crédit innovation, avec ses propres règles.',
            rule: 'Prototype sans incertitude scientifique : CII, pas CIR.',
            codexUnlock: 'cdx_cii',
          },
          'n3',
        ),
        choice(
          'acceptable',
          'preuve',
          'Avez-vous essayé des solutions qui n’ont pas fonctionné, et gardé les traces ?',
          { security: 9, trust: 3 },
          {
            what: 'Vous cherchez la démarche expérimentale.',
            why: 'Pertinent : les essais ratés matérialisent l’incertitude. Mais vous n’avez pas encore nommé le CII.',
            rule: 'Les échecs documentés sont la preuve de l’incertitude.',
          },
          'n3',
        ),
        choice(
          'tempting',
          'commercial',
          'Fabriquer soi-même son outil, c’est exactement ce que finance le CIR.',
          { relation: 6, security: -14 },
          {
            what: 'Vous validez un contresens.',
            why: 'Fabriquer un outil parce qu’il n’existe pas dans le commerce ne crée aucune incertitude scientifique.',
            rule: 'Indisponibilité commerciale ≠ verrou technique.',
          },
          'n3',
        ),
        choice(
          'poor',
          'empathie',
          'Vous avez bien fait. On verra plus tard dans quelle case ça rentre.',
          { relation: 4, security: -10 },
          {
            what: 'Vous repoussez la qualification.',
            why: 'La case détermine le dispositif, le taux et les pièces : la choisir tard fait tout refaire.',
            rule: 'La qualification se fait au cadrage, pas au montage.',
          },
          'n3',
        ),
      ],
    },
    {
      // Couperet : signer un dossier qui n'existe pas, ou perdre le client.
      id: 'n3',
      speaker: 'Bruno Meyer',
      expression: 'ferme',
      text: 'Un autre cabinet m’a dit qu’il prenait tout, sans discuter. Vous me faites un dossier ou je vais chez eux ?',
      choices: [
        choice(
          'optimal',
          'fermete',
          'Pas de CIR ici. Je vous prépare un dossier CII, honnête et plus petit.',
          { relation: -2, security: 20, profitability: -6, trust: 8 },
          {
            what: 'Vous refusez le dossier CIR et proposez le bon dispositif.',
            why: 'Refuser coûte du chiffre d’affaires immédiat et vous évite un redressement qui vous coûterait le client et la réputation.',
            rule: 'Refuser un dossier inexistant fait partie du métier.',
            codexUnlock: 'cdx_dire_non',
          },
          null,
          { flags: ['refus_mission', 'a_dit_non'] },
        ),
        choice(
          'acceptable',
          'technique',
          'Allons voir vos essais avant de trancher : je ne signerai pas à l’aveugle.',
          { relation: 1, security: 10, trust: 4 },
          {
            what: 'Vous gagnez du temps sans céder.',
            why: 'Défendable, mais vous laissez ouverte l’idée qu’un dossier CIR existe peut-être.',
            rule: 'Temporiser vaut mieux que signer, moins bien que trancher.',
          },
          null,
        ),
        choice(
          'poor',
          'commercial',
          'On prend tout, comme eux. On verra bien ce que l’administration retient.',
          { relation: 7, security: -22, profitability: 4 },
          {
            what: 'Vous signez un dossier que vous savez vide.',
            why: 'Vous venez d’acheter un contrôle : l’assiette ne contient rien de défendable.',
            rule: 'Aligner son périmètre sur le moins-disant, c’est acheter un redressement.',
          },
          null,
        ),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 78, good: 58 },
    unlocks: { excellent: [], good: [], poor: [] },
  },
};

// --- Kick-off expert : organiser une collecte contradictoire ---------------

export const EXPERT_KICKOFF: Scenario = {
  id: 'sc_exp_kickoff',
  type: 'KICKOFF',
  title: 'Kick-off — croiser les sources',
  context:
    'La mission est lancée. En deuxième saison, on ne collecte plus seulement : on recoupe ce que dit la direction avec ce que disent les équipes et les fichiers.',
  objectives: [
    'Accéder aux sources sans passer par la direction',
    'Vérifier les agréments avant le montage',
    'Fixer une collecte contradictoire',
  ],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le dirigeant',
      expression: 'neutre',
      text: 'Pour gagner du temps, passez par moi : je centralise, je vous transmets, vous n’embêtez personne.',
      choices: [
        choice(
          'optimal',
          'technique',
          'J’ai besoin des équipes elles-mêmes : c’est là que sont les détails.',
          { relation: -1, security: 14, trust: 4 },
          {
            what: 'Vous exigez l’accès direct.',
            why: 'Une information filtrée par la direction arrive lissée : les écarts entre déclaré et réel disparaissent en route.',
            rule: 'Le montage se construit avec ceux qui ont fait les travaux.',
            codexUnlock: 'cdx_kickoff',
          },
          'n2',
        ),
        choice(
          'acceptable',
          'synthese',
          'Un point avec vous, puis un atelier d’une heure avec chacune des équipes.',
          { relation: 2, security: 10 },
          {
            what: 'Vous obtenez l’accès en douceur.',
            why: 'Bonne méthode, un peu lente si le calendrier est serré.',
            rule: 'Un atelier par équipe suffit souvent.',
          },
          'n2',
        ),
        choice(
          'tempting',
          'commercial',
          'Parfait, c’est plus simple pour tout le monde. On fait comme ça.',
          { relation: 7, security: -14 },
          {
            what: 'Vous acceptez le filtre.',
            why: 'Vous ne verrez que ce que la direction veut bien montrer, et vous le découvrirez au contrôle.',
            rule: 'Une source unique n’est jamais contradictoire.',
          },
          'n2',
        ),
        choice(
          'poor',
          'fermete',
          'Non. Je veux voir tout le monde, sans vous, dès cette semaine.',
          { relation: -10, mood: -6, trust: -4 },
          {
            what: 'Vous imposez sans expliquer.',
            why: 'Un dirigeant mis à l’écart de sa propre maison bloquera les rendez-vous.',
            rule: 'L’accès direct se négocie, il ne s’arrache pas.',
          },
          'n2',
        ),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le dirigeant',
      expression: 'neutre',
      text: 'Pour les prestataires, ne vous inquiétez pas : ce sont des labos sérieux, on travaille avec eux depuis des années.',
      choices: [
        choice(
          'optimal',
          'preuve',
          'Sérieux ne veut pas dire agréé. Il me faut l’attestation de chacun.',
          { relation: 1, security: 15, trust: 4 },
          {
            what: 'Vous demandez les agréments.',
            why: 'L’agrément MESR se vérifie année par année : un partenaire historique peut avoir laissé expirer le sien.',
            rule: 'Pas d’attestation d’agrément, pas de dépense retenue.',
            codexUnlock: 'cdx_st_agrement',
          },
          'n3',
        ),
        choice(
          'acceptable',
          'technique',
          'Je vais vérifier leur agrément et le rang de chaque intervention.',
          { security: 12, relation: 1 },
          {
            what: 'Vous couvrez agrément et cascade.',
            why: 'Complet, mais vous ne demandez pas la pièce au client : vous ferez le travail seul.',
            rule: 'Agrément et rang se contrôlent ensemble.',
          },
          'n3',
        ),
        choice(
          'tempting',
          'empathie',
          'Je vous fais confiance sur ce point, on regardera si l’on a le temps.',
          { relation: 5, security: -15 },
          {
            what: 'Vous reportez la vérification.',
            why: 'L’agrément manquant est le premier motif de redressement, et il se découvre toujours trop tard.',
            rule: 'La vérification d’agrément passe avant le montage.',
          },
          'n3',
        ),
        choice(
          'poor',
          'commercial',
          'De toute façon, l’administration ne va pas vérifier chaque facture.',
          { security: -18, relation: 2 },
          {
            what: 'Vous pariez sur l’inattention du contrôle.',
            why: 'La liste des organismes agréés est publique : c’est la première chose qu’un vérificateur recoupe.',
            rule: 'On ne construit pas un dossier sur l’espoir de ne pas être lu.',
          },
          'n3',
        ),
      ],
    },
    {
      // Arbitrage : deux collectes défendables, un seul créneau disponible.
      id: 'n3',
      speaker: 'Le dirigeant',
      expression: 'agace',
      text: 'Je peux libérer une demi-journée. Soit vos ateliers avec les équipes, soit l’extraction complète de nos fichiers. Choisissez.',
      choices: [
        choice(
          'optimal',
          'preuve',
          'Les fichiers : une extraction datée se recoupe et se défend au contrôle.',
          { relation: -2, security: 16, trust: 3 },
          {
            what: 'Vous choisissez la trace.',
            why: 'Une donnée produite pendant les travaux est opposable ; un souvenir d’atelier, non. Vous perdez en finesse ce que vous gagnez en solidité.',
            rule: 'Entre le récit et la trace datée, la trace gagne au contrôle.',
          },
          null,
        ),
        choice(
          'optimal',
          'empathie',
          'Les ateliers : les équipes savent ce que les fichiers ne disent pas.',
          { relation: 5, security: 10, trust: 5 },
          {
            what: 'Vous choisissez le terrain.',
            why: 'Les projets abandonnés et les essais ratés n’apparaissent dans aucun export : ils se racontent. Vous gagnez du périmètre, vous perdez de la trace.',
            rule: 'Ce qui n’est pas dans les fichiers ne s’obtient qu’en parlant aux équipes.',
          },
          null,
        ),
        choice(
          'poor',
          'synthese',
          'Ni l’un ni l’autre : envoyez-moi simplement ce que vous avez sous la main.',
          { relation: 1, security: -14 },
          {
            what: 'Vous renoncez à la demi-journée offerte.',
            why: 'Ce n’est pas un arbitrage : vous perdez les deux sources sans rien obtenir en échange.',
            rule: 'Un créneau offert ne se refuse jamais sur un dossier CIR.',
          },
          null,
        ),
      ],
    },
  ],
  outcome: FIELD_OUTCOME,
};

// --- Suivi expert : le technicien contredit la direction ------------------

export const EXPERT_FOLLOWUP: Scenario = {
  id: 'sc_exp_followup',
  type: 'FOLLOWUP',
  title: 'Suivi de mission — la version de l’atelier',
  context:
    'Vous passez récupérer les pièces. Tom Aubert, technicien, vous croise dans le couloir et vous glisse que les chiffres transmis ne ressemblent pas à son année.',
  objectives: [
    'Recouper la version de la direction',
    'Protéger la source sans étouffer l’information',
    'Repartir avec des pièces opposables',
  ],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Tom Aubert',
      avatarSeed: 'aubert-08',
      expression: 'neutre',
      text: 'On m’a compté à 80 % sur le projet. Moi, j’ai passé la moitié de l’année sur la ligne de production.',
      choices: [
        choice(
          'optimal',
          'preuve',
          'Merci. Vous auriez de quoi le montrer : plannings, tickets, cahiers ?',
          { relation: 2, security: 14, trust: 5 },
          {
            what: 'Vous transformez un témoignage en pièce.',
            why: 'Une contradiction orale ne se met pas dans un dossier : c’est la trace qu’elle désigne qui compte.',
            rule: 'Un témoignage vaut par la pièce qu’il permet de trouver.',
            codexUnlock: 'cdx_preuve',
          },
          'n2',
        ),
        choice(
          'acceptable',
          'empathie',
          'C’est important, ce que vous me dites. Racontez-moi votre année.',
          { relation: 5, security: 9, trust: 3 },
          {
            what: 'Vous écoutez avant de qualifier.',
            why: 'Bonne posture : vous obtiendrez le détail. Il faudra ensuite la pièce.',
            rule: 'Écouter d’abord, documenter ensuite.',
          },
          'n2',
        ),
        choice(
          'tempting',
          'synthese',
          'Votre direction a dû arrondir. Je garde le taux qu’elle m’a donné.',
          { relation: -1, security: -18 },
          {
            what: 'Vous écartez la contradiction.',
            why: 'Vous savez maintenant que le taux est faux : le retenir n’est plus une erreur, c’est un choix.',
            rule: 'Une contradiction connue et ignorée devient une faute.',
          },
          'n2',
        ),
        choice(
          'poor',
          'fermete',
          'Je vais en parler tout de suite à votre direction, en vous citant nommément.',
          { relation: -6, security: -6, trust: -5 },
          {
            what: 'Vous exposez votre source.',
            why: 'Le technicien se rétractera, et plus personne ne vous parlera dans cette entreprise.',
            rule: 'On ne brûle jamais la source qui vient de sauver le dossier.',
          },
          'n2',
        ),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le dirigeant',
      expression: 'agace',
      text: 'On me dit que vous interrogez mes équipes dans les couloirs. Vous doutez de ce que je vous ai transmis ?',
      choices: [
        choice(
          'optimal',
          'technique',
          'Je recoupe, c’est la méthode. Vos chiffres en sortiront renforcés.',
          { relation: 2, security: 14, trust: 5 },
          {
            what: 'Vous assumez le recoupement comme une méthode.',
            why: 'Présenté comme un contrôle qualité et non comme une suspicion, le recoupement devient un argument de vente.',
            rule: 'Recouper n’est pas soupçonner : c’est sécuriser.',
            codexUnlock: 'cdx_controle_deroule',
          },
          'n3',
        ),
        choice(
          'acceptable',
          'preuve',
          'Le vérificateur ira voir vos équipes. Autant le faire avant lui.',
          { relation: 1, security: 12, trust: 3 },
          {
            what: 'Vous invoquez le contrôle à venir.',
            why: 'Efficace, mais fonder sa méthode sur la peur du contrôle finit par lasser.',
            rule: 'Anticiper le vérificateur reste un bon réflexe.',
          },
          'n3',
        ),
        choice(
          'tempting',
          'commercial',
          'Pas du tout, simple politesse de couloir. Vos chiffres me conviennent.',
          { relation: 6, security: -16, mood: 4 },
          {
            what: 'Vous mentez pour éviter la friction.',
            why: 'Vous perdez l’accès aux équipes et gardez un taux que vous savez faux : le pire des deux mondes.',
            rule: 'Éviter la friction au cadrage la reporte au contrôle.',
          },
          'n3',
        ),
        choice(
          'poor',
          'fermete',
          'Oui, je doute : vos taux ne tiennent pas debout une seconde.',
          { relation: -11, mood: -8, trust: -4 },
          {
            what: 'Vous accusez frontalement.',
            why: 'Vous aviez raison sur le fond et vous venez de perdre la coopération dont vous avez besoin.',
            rule: 'Avoir raison ne dispense pas de ménager l’interlocuteur.',
          },
          'n3',
        ),
      ],
    },
    {
      // Couperet : corriger le taux coûte cher au client, et il le sait.
      id: 'n3',
      speaker: 'Le dirigeant',
      expression: 'ferme',
      text: 'Si vous descendez ce taux, je perds une somme considérable. Vous êtes sûr de vouloir faire ça pour un bavardage de couloir ?',
      choices: [
        choice(
          'optimal',
          'preuve',
          'Ce n’est plus un bavardage : les plannings le confirment, je corrige.',
          { relation: -3, security: 20, trust: 6 },
          {
            what: 'Vous corrigez, pièce en main.',
            why: 'Le crédit perdu aujourd’hui est infiniment moins cher que le rappel, les intérêts et la pénalité dans trois ans.',
            rule: 'Un taux corrigé avant dépôt ne coûte que du crédit ; après, il coûte la relation.',
          },
          null,
        ),
        choice(
          'tempting',
          'commercial',
          'Vous avez raison, gardons votre taux. Un couloir n’est pas une preuve.',
          { relation: 8, security: -22, mood: 6 },
          {
            what: 'Vous cédez à l’argument financier.',
            why: 'Vous avez la pièce contraire dans votre dossier : c’est exactement ce que le vérificateur trouvera.',
            rule: 'Le montant en jeu n’a jamais changé ce qui est démontrable.',
          },
          null,
        ),
      ],
    },
  ],
  outcome: FIELD_OUTCOME,
};


// --- Ouverture de la deuxième saison --------------------------------------

/**
 * Le tutoriel n'a plus lieu d'être : le joueur a mené une saison entière. Cette
 * scène le remet en selle autrement — elle rappelle ce qui change quand on
 * cesse d'apprendre le métier pour devoir le tenir devant quelqu'un qui le
 * conteste.
 */
export const EXPERT_OPENING: Scenario = {
  id: 'sc_exp_opening',
  type: 'INTERNAL',
  title: 'Rentrée — le bureau de Sophie Meyer',
  context:
    'Une saison derrière vous, vos dossiers déposés. Sophie Meyer vous reçoit sans préambule : elle a des dossiers à confier, et ce ne sont pas ceux qu’on donne à un débutant.',
  objectives: [
    'Comprendre ce qui change en deuxième saison',
    'Accepter un portefeuille plus dur',
    'Ne pas rejouer le commercial de première année',
  ],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Sophie Meyer (directrice de BU)',
      expression: 'neutre',
      text: 'Votre première saison est derrière vous. Cette année, je vous confie les dossiers que je ne donne pas aux nouveaux. Vous savez pourquoi ?',
      choices: [
        choice(
          'optimal',
          'synthese',
          'Parce qu’ils ne se montent pas : ils se défendent, ligne par ligne.',
          { relation: 4, security: 8, trust: 4 },
          {
            what: 'Vous nommez ce qui change.',
            why: 'Un dossier facile se monte ; un dossier dur se défend devant quelqu’un qui le conteste, pièce en main.',
            rule: 'La deuxième saison ne teste plus le montage, mais la défense.',
          },
          'n2',
        ),
        choice(
          'acceptable',
          'preuve',
          'Parce qu’ils demandent des pièces qu’un débutant n’ose pas réclamer.',
          { relation: 2, security: 7 },
          {
            what: 'Vous voyez l’enjeu de la collecte.',
            why: 'Juste, mais ce n’est qu’une partie : il faudra aussi tenir la ligne en séance.',
            rule: 'Réclamer une pièce est un geste qui s’apprend.',
          },
          'n2',
        ),
        choice(
          'tempting',
          'commercial',
          'Parce que j’ai fait du chiffre l’an dernier et que ça se voit.',
          { relation: 3, security: -8, profitability: 2 },
          {
            what: 'Vous lisez la promotion comme une récompense commerciale.',
            why: 'On vous confie des dossiers durs pour votre rigueur, pas pour votre volume : le malentendu se paiera au contrôle.',
            rule: 'Un portefeuille difficile n’est pas une prime au chiffre.',
          },
          'n2',
        ),
        choice(
          'poor',
          'fermete',
          'Franchement non. Je prends ce qu’on me donne et je le monte.',
          { relation: -6, security: -4 },
          {
            what: 'Vous refusez de vous situer.',
            why: 'Prendre un dossier sans savoir pourquoi il vous échoit, c’est découvrir sa difficulté au pire moment.',
            rule: 'On mesure la difficulté d’un dossier avant de l’accepter.',
          },
          'n2',
        ),
      ],
    },
    {
      id: 'n2',
      speaker: 'Sophie Meyer (directrice de BU)',
      expression: 'ferme',
      text: 'Quatre dossiers. Je vous préviens : il y en a un que je n’aurais pas signé. À vous de me dire lequel, et de me dire non.',
      choices: [
        choice(
          'optimal',
          'fermete',
          'Entendu. Je vous dirai non par écrit, avec le motif d’éligibilité.',
          { relation: 3, security: 12, trust: 5 },
          {
            what: 'Vous acceptez de refuser, et vous le tracez.',
            why: 'Un refus motivé par écrit protège le cabinet et vaut argument commercial : le client comprend ce qu’il achète.',
            rule: 'Un refus se motive et se garde par écrit.',
            codexUnlock: 'cdx_dire_non',
          },
          'n3',
        ),
        choice(
          'acceptable',
          'technique',
          'D’accord. J’instruis les quatre avant de trancher lequel écarter.',
          { relation: 2, security: 9 },
          {
            what: 'Vous instruisez avant de trancher.',
            why: 'Prudent et juste, mais vous dépenserez du temps sur un dossier que vous écarterez.',
            rule: 'Instruire avant de conclure, dans les deux sens.',
          },
          'n3',
        ),
        choice(
          'tempting',
          'commercial',
          'Quatre facturés, c’est mieux que trois. Je trouverai un angle.',
          { relation: 4, security: -14, profitability: 3 },
          {
            what: 'Vous cherchez à sauver le dossier de trop.',
            why: '« Trouver un angle » sur un dossier sans R&D, c’est écrire soi-même le redressement de l’an prochain.',
            rule: 'On ne fabrique pas d’éligibilité par l’angle de présentation.',
          },
          'n3',
        ),
        choice(
          'poor',
          'empathie',
          'Si vous avez signé, c’est qu’il y avait une raison. Je le monte.',
          { relation: 1, security: -10, trust: -3 },
          {
            what: 'Vous vous en remettez à la signature.',
            why: 'Elle vient de vous dire qu’elle n’aurait pas signé : c’est le test, et vous venez de le manquer.',
            rule: 'La signature d’un supérieur ne vaut pas qualification.',
          },
          'n3',
        ),
      ],
    },
    {
      // Couperet : elle demande un engagement chiffré, comme un client le ferait.
      id: 'n3',
      speaker: 'Sophie Meyer (directrice de BU)',
      expression: 'neutre',
      text: 'Dernier point. Le comité me demande votre objectif de saison. Vous me donnez un chiffre maintenant ?',
      choices: [
        choice(
          'optimal',
          'synthese',
          'Une fourchette aujourd’hui, un chiffre ferme après les kick-offs.',
          { relation: 3, security: 10, profitability: 2, trust: 4 },
          {
            what: 'Vous appliquez en interne ce que vous exigez en clientèle.',
            why: 'Un consultant qui surpromet à son comité finira par surpromettre à son client : la discipline vaut des deux côtés du bureau.',
            rule: 'La prudence d’estimation ne s’arrête pas à la porte du cabinet.',
            codexUnlock: 'cdx_estimer',
          },
          null,
        ),
        choice(
          'tempting',
          'commercial',
          'Je m’engage tout de suite, et je ferai le nécessaire pour y arriver.',
          { relation: 5, security: -14, profitability: 4 },
          {
            what: 'Vous vous engagez avant d’avoir instruit.',
            why: '« Faire le nécessaire » pour tenir un chiffre annoncé trop tôt, c’est exactement ce qui gonfle une assiette.',
            rule: 'Un engagement chiffré sans dossier instruit devient une pression sur l’assiette.',
          },
          null,
        ),
      ],
    },
  ],
  outcome: {
    scoreThresholds: { excellent: 78, good: 58 },
    unlocks: { excellent: [], good: [], poor: [] },
  },
};

export const EXPERT_SCENARIOS: Scenario[] = [
  EXPERT_OPENING,
  EXPERT_DISCOVERY,
  EXPERT_REFUSAL,
  EXPERT_KICKOFF,
  EXPERT_FOLLOWUP,
];
