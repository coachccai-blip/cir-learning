import type { Scenario } from '../../engine/types';
import { choice } from './helpers';

// Bilans de mission, un par client.
//
// La restitution était la même pour tout le monde : « alors, le verdict ? »,
// puis « on continue l'an prochain ? ». Or c'est la scène où le client mesure
// ce qu'il a acheté — et elle ne ressemble pas à la même chose selon qu'on
// rende un beau chiffre à un artisan, un chiffre raboté à une biotech sous
// perfusion, ou un refus poli à un atelier qui espérait trois fois plus.
//
// Chaque bilan reprend donc le fil de son dossier : ce qui a été retiré, ce
// que le client en fera, et ce qu'on prépare pour l'an prochain.

const OUT: Scenario['outcome'] = {
  scoreThresholds: { excellent: 75, good: 55 },
  unlocks: { excellent: [], good: [], poor: [] },
};

// --------------------------------------------------------------- Maison Dupuis
export const CLOSING_AGRI: Scenario = {
  id: 'sc_agri_closing',
  type: 'CLOSING',
  title: 'Bilan — Maison Dupuis',
  context:
    'Marc Dupuis a réuni sa famille dans le bureau. Il a raconté à tout le monde que « le crédit d’impôt va payer la nouvelle ligne ». Le montant retenu ne couvre pas la moitié.',
  objectives: ['Restituer un chiffre plus petit qu’espéré', 'Nommer ce qui a été retiré', 'Préparer l’année suivante'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'enthousiaste',
      text: 'Alors ? Tout le monde attend. J’ai dit qu’on financerait la nouvelle ligne avec ça.',
      choices: [
        choice('optimal', 'preuve', 'Le montant retenu paie une partie. Voici ce qui est entré, et ce qui est sorti.', { relation: 3, security: 9, trust: 5 }, { what: 'Vous annoncez et vous montrez.', why: 'Devant une famille réunie, seul le détail poste par poste évite le sentiment d’avoir été berné.', rule: 'Un chiffre plus petit qu’espéré s’annonce avec sa décomposition.', codexUnlock: 'cdx_chiffre_decevant' }, 'n2'),
        choice('acceptable', 'synthese', 'Une partie de la ligne, oui. Le reste des essais n’était pas retenable.', { relation: 2, security: 6 }, { what: 'Vous êtes clair et bref.', why: 'Correct ; la brièveté laissera des questions sans réponse ce soir.', rule: 'Un écart annoncé se détaille dans la foulée.' }, 'n2'),
        choice('tempting', 'commercial', 'Un très beau montant ! On regardera les détails du calcul plus tard.', { relation: 6, security: -12, trust: -3 }, { what: 'Vous laissez croire au financement complet.', why: 'La déception arrivera au moment du devis, et elle sera pour vous.', rule: 'Repousser une mauvaise nouvelle la double.' }, 'n2'),
        choice('poor', 'technique', 'Le taux d’affectation réel des personnels a mécaniquement réduit l’assiette.', { relation: -7, mood: -6 }, { what: 'Vous répondez en jargon.', why: 'À un artisan qui attend un chiffre, « taux d’affectation » sonne comme une dérobade.', rule: 'On donne le chiffre avant la mécanique.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Bon. Et si on notait tout, l’an prochain, on aurait combien de plus ?',
      choices: [
        choice('optimal', 'synthese', 'Sensiblement plus, sans promesse : un carnet d’essais tenu change tout.', { relation: 5, security: 7, profitability: 5, trust: 4 }, { what: 'Vous transformez le regret en méthode.', why: 'Le meilleur moment pour lancer la collecte de l’an prochain est le jour où le client mesure ce qu’elle coûte.', rule: 'Le bilan est le meilleur point de départ de la campagne suivante.' }, null),
        choice('acceptable', 'preuve', 'Tout ce qu’on a écarté faute de trace redeviendrait discutable.', { relation: 3, profitability: 3 }, { what: 'Vous reliez la trace au montant.', why: 'Juste ; « discutable » reste un peu abstrait pour un dirigeant d’atelier.', rule: 'Ce qui est tracé se défend, ce qui ne l’est pas se retire.' }, null),
        choice('tempting', 'commercial', 'Le double, facilement ! Notez tout et vous verrez la différence.', { relation: 6, security: -11 }, { what: 'Vous promettez un multiple.', why: 'Annoncer le double crée la dette de promesse que vous venez tout juste de solder.', rule: 'On ne repart pas sur une promesse chiffrée.' }, null),
        choice('poor', 'fermete', 'Difficile à dire. On refera le calcul l’an prochain, si vous y tenez.', { relation: -5, profitability: -3 }, { what: 'Vous refroidissez la reconduction.', why: 'Un client prêt à changer ses habitudes vient de vous le dire : ne pas saisir la perche est une faute.', rule: 'Un client volontaire au bilan ne le sera plus en septembre.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// -------------------------------------------------------------------- Nexalog
export const CLOSING_SAAS: Scenario = {
  id: 'sc_saas_closing',
  type: 'CLOSING',
  title: 'Bilan — Nexalog',
  context:
    'Elsa Brunet a invité son directeur technique. Le moteur de prédiction a bien été retenu ; la refonte d’interface, sur laquelle l’équipe a passé l’essentiel de son temps, ne l’est pas.',
  objectives: ['Assumer un périmètre étroit', 'Répondre à un technique compétent', 'Cadrer la campagne suivante'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Vous avez retenu le moteur, très bien. Mais la refonte a mobilisé six personnes six mois. Rien du tout ?',
      choices: [
        choice('optimal', 'technique', 'Rien : refaire une interface, même bien, ne lève aucune incertitude.', { relation: 1, security: 10, trust: 5 }, { what: 'Vous tenez le critère devant un sachant.', why: 'Un directeur technique respecte davantage un critère tenu qu’un périmètre élargi pour lui plaire.', rule: 'Le CIR retient l’incertitude levée, pas l’effort consenti.', codexUnlock: 'cdx_verrou' }, 'n2'),
        choice('acceptable', 'preuve', 'Rien au CIR. Une part relèverait du CII, si le produit est nouveau.', { relation: 4, security: 8, profitability: 3 }, { what: 'Vous ouvrez la piste du CII.', why: 'Bonne piste, à condition de ne pas la vendre avant de l’avoir vérifiée.', rule: 'Le CII prend parfois le relais quand le CIR s’arrête.' }, 'n2'),
        choice('tempting', 'commercial', 'On aurait pu en prendre une part, c’est vrai. Je le note pour l’an prochain.', { relation: 5, security: -12 }, { what: 'Vous laissez entendre qu’on aurait pu.', why: 'Semer le doute sur votre propre périmètre invite le client à le rouvrir chaque année.', rule: 'Un périmètre tenu ne se regrette pas devant le client.' }, 'n2'),
        choice('poor', 'fermete', 'C’est le calcul, il n’y a rien à en dire. Passons à la suite du bilan.', { relation: -8, trust: -4 }, { what: 'Vous coupez court.', why: 'Six mois de travail balayés en une phrase, devant l’équipe qui les a faits.', rule: 'Un poste écarté se justifie, surtout devant ceux qui l’ont porté.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'satisfait',
      text: 'L’an prochain, on attaque le calcul distribué. Là, il y a de la vraie difficulté. On vous garde ?',
      choices: [
        choice('optimal', 'preuve', 'Volontiers, et cette fois on documente les impasses dès le premier sprint.', { relation: 6, security: 8, profitability: 5, trust: 4 }, { what: 'Vous embarquez la méthode dans la reconduction.', why: 'Chez un éditeur, la trace se produit toute seule si on la demande au bon moment : au départ.', rule: 'La collecte se cale au lancement du projet, pas au bilan.' }, null),
        choice('acceptable', 'synthese', 'Avec plaisir. On calera un point mensuel sur ce projet précis.', { relation: 5, profitability: 3 }, { what: 'Vous installez un rythme.', why: 'Un point mensuel aide ; il ne dit pas encore quoi tracer.', rule: 'Un rythme régulier vaut mieux qu’un rattrapage.' }, null),
        choice('tempting', 'commercial', 'Bien sûr, et là ce sera un tout autre montant, je vous le garantis !', { relation: 6, security: -12 }, { what: 'Vous garantissez un montant.', why: 'Un projet à forte incertitude est aussi celui qui peut être abandonné en juin.', rule: 'Plus le sujet est incertain, moins on chiffre à l’avance.' }, null),
        choice('poor', 'empathie', 'On verra ça à la rentrée, rien ne presse pour l’instant de ce côté-là.', { relation: -3, profitability: -4 }, { what: 'Vous repoussez le cadrage.', why: 'À la rentrée, le premier sprint sera passé, et sa trace avec.', rule: 'Ce qui n’est pas calé au bilan ne se cale plus.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------------------ Mecaprécis
export const CLOSING_INDUS: Scenario = {
  id: 'sc_indus_closing',
  type: 'CLOSING',
  title: 'Bilan — Mecaprécis',
  context:
    'Hervé Verdier a apporté le classeur du dossier et un stylo. Il ne veut pas d’un montant : il veut savoir ce qu’il répondra, ligne par ligne, si le vérificateur se présente.',
  objectives: ['Restituer sous l’angle du contrôle', 'Nommer les points faibles restants', 'Rassurer sans minimiser'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Le montant, je le verrai sur la déclaration. Ce que je veux savoir : qu’est-ce qui peut me tomber dessus ?',
      choices: [
        choice('optimal', 'preuve', 'Un point : le prorata du banc d’essais. Voici la pièce qui le tient.', { relation: 5, security: 11, trust: 6 }, { what: 'Vous nommez le point faible et sa parade.', why: 'À un client échaudé, un risque nommé et documenté vaut mieux que dix assurances.', rule: 'On désigne le point contestable et la pièce qui le défend.', codexUnlock: 'cdx_controle_deroule' }, 'n2'),
        choice('acceptable', 'synthese', 'Deux postes se discutent. Sur les deux, vous avez la trace datée.', { relation: 4, security: 8 }, { what: 'Vous cadrez le risque.', why: 'Rassurant et honnête ; il voudra les voir avant de vous croire.', rule: 'Un risque annoncé se montre.' }, 'n2'),
        choice('tempting', 'commercial', 'Rien du tout : votre dossier est parfaitement carré, dormez tranquille.', { relation: 5, security: -13, trust: -4 }, { what: 'Vous garantissez l’absence de risque.', why: 'Aucun dossier n’est incontestable, et il le sait mieux que vous : son concurrent l’a vécu.', rule: 'On ne promet jamais qu’un dossier est incontestable.' }, 'n2'),
        choice('poor', 'fermete', 'Impossible à prévoir : un contrôle, ça peut porter sur n’importe quoi.', { relation: -7, mood: -6 }, { what: 'Vous laissez le client dans le flou.', why: 'À quelqu’un qui a peur, « n’importe quoi peut arriver » est la pire réponse possible.', rule: 'On borne l’inquiétude en désignant les vrais points.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Et si un jour ils viennent, vous venez avec moi ? Ou je me débrouille ?',
      choices: [
        choice('optimal', 'synthese', 'Je viens. C’est prévu à la mission, et c’est le moment où l’on sert.', { relation: 7, security: 7, profitability: 4, trust: 6 }, { what: 'Vous engagez le cabinet sur la défense.', why: 'La promesse d’accompagnement au contrôle est ce qui fidélise un client craintif, bien plus que le montant.', rule: 'Un dossier se vend avec sa défense.' }, null),
        choice('acceptable', 'preuve', 'Je viens, avec le classeur : chaque question a déjà sa réponse dedans.', { relation: 6, security: 8, trust: 4 }, { what: 'Vous montrez la préparation.', why: 'Excellent réflexe ; l’engagement personnel compte autant que le classeur.', rule: 'Un dossier préparé se défend en une réunion.' }, null),
        choice('tempting', 'commercial', 'Si ça arrive on verra, mais franchement ce n’est pas près d’arriver.', { relation: 2, security: -9, trust: -5 }, { what: 'Vous esquivez l’engagement.', why: 'Le client entend que vous ne serez pas là le jour où il en aura besoin.', rule: 'On s’engage sur la défense avant qu’elle serve.' }, null),
        choice('poor', 'fermete', 'C’est une prestation distincte, qui fera l’objet d’un devis séparé.', { relation: -8, profitability: 2 }, { what: 'Vous facturez la peur.', why: 'Techniquement défendable, commercialement désastreux au moment précis du bilan.', rule: 'Le bilan n’est pas le moment de sortir un devis.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ---------------------------------------------------------- Cellvia Therapeutics
export const CLOSING_BIOTECH: Scenario = {
  id: 'sc_biotech_closing',
  type: 'CLOSING',
  title: 'Bilan — Cellvia Therapeutics',
  context:
    'Laurent Kaplan a son plan de trésorerie ouvert sur l’écran. La déduction des deux tranches Bpifrance a raboté le crédit, et il lui reste sept mois de runway.',
  objectives: ['Restituer un montant raboté par les aides', 'Traiter la question du préfinancement', 'Ne pas s’engager sur un calendrier'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'agace',
      text: 'Donc plus on obtient d’aides, moins on a de CIR. J’ai du mal à trouver ça logique.',
      choices: [
        choice('optimal', 'technique', 'C’est la logique : l’État ne finance pas deux fois la même dépense.', { relation: 2, security: 11, trust: 5 }, { what: 'Vous nommez le principe.', why: 'Un DAF accepte une règle dont il comprend la raison, bien plus qu’un chiffre qu’on lui impose.', rule: 'Une même dépense n’est jamais financée deux fois.', codexUnlock: 'cdx_subventions' }, 'n2'),
        choice('acceptable', 'preuve', 'Le cumul reste positif : voici l’aide, le crédit, et le total encaissé.', { relation: 4, security: 8 }, { what: 'Vous montrez le total.', why: 'L’argument qui parle à un DAF ; il ne répond pas encore au « pourquoi ».', rule: 'On compare les encaissements, pas les lignes isolées.' }, 'n2'),
        choice('tempting', 'commercial', 'On aurait pu ne déclarer qu’une tranche, personne n’aurait rien vu.', { relation: 4, security: -18, trust: -5 }, { what: 'Vous suggérez d’omettre une aide.', why: 'Les conventions Bpifrance sont connues de l’administration : l’omission se voit du premier coup d’œil.', rule: 'Une aide publique ne s’oublie jamais discrètement.' }, 'n2'),
        choice('poor', 'fermete', 'C’est la loi. Ce n’est ni à vous ni à moi d’en discuter la logique.', { relation: -8, trust: -3 }, { what: 'Vous invoquez la loi sans l’expliquer.', why: '« C’est la loi » à un financier qui cherche à comprendre passe pour de l’incompétence.', rule: 'On explique la règle, on ne la brandit pas.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Il me faut ce cash avant mars. Le remboursement, c’est quand exactement ?',
      choices: [
        choice('optimal', 'synthese', 'Après liquidation de l’impôt, sans date garantie. Le préfinancement, si.', { relation: 4, security: 10, trust: 5 }, { what: 'Vous distinguez la créance de sa date.', why: 'Promettre une date de remboursement fiscal est le meilleur moyen de faire rater un plan de trésorerie.', rule: 'On ne s’engage jamais sur une date de remboursement.' }, null),
        choice('acceptable', 'preuve', 'Votre statut de PME ouvre le remboursement immédiat, sous réserve d’instruction.', { relation: 3, security: 8 }, { what: 'Vous rappelez le régime PME.', why: 'Exact ; « sous réserve d’instruction » mérite d’être appuyé plus fort.', rule: 'Le remboursement immédiat reste soumis à instruction.' }, null),
        choice('tempting', 'commercial', 'Avant mars sans problème, c’est presque toujours réglé en deux mois.', { relation: 6, security: -15 }, { what: 'Vous datez un remboursement.', why: 'Une biotech qui cale son plan sur votre date et ne la voit pas arriver ne vous le pardonnera pas.', rule: 'Une date de trésorerie promise devient une dette.' }, null),
        choice('poor', 'fermete', 'Aucune idée, ça ne dépend pas de moi. Voyez cela avec votre banque.', { relation: -7, trust: -4 }, { what: 'Vous vous défaussez.', why: 'Le préfinancement de créance CIR fait partie de ce qu’un consultant sait expliquer.', rule: 'Ce qu’on ne garantit pas, on l’explique quand même.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ----------------------------------------------------------- Solterra Materials
export const CLOSING_GREEN: Scenario = {
  id: 'sc_green_closing',
  type: 'CLOSING',
  title: 'Bilan — Solterra Materials',
  context:
    'Marion Vasseur vous reçoit vingt minutes avant un comité d’investissement. Elle veut une phrase à dire à ses actionnaires, et le montant net après reprise de l’avance.',
  objectives: ['Donner une phrase juste et courte', 'Chiffrer net de l’avance', 'Ne pas laisser écrire un montant ferme'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'ferme',
      text: 'Donnez-moi une phrase pour mon comité. Une seule, que je puisse répéter sans me tromper.',
      choices: [
        choice('optimal', 'synthese', 'Un crédit net d’aides, sur un périmètre resserré et documenté cette année.', { relation: 6, security: 9, trust: 5 }, { what: 'Vous livrez la phrase demandée.', why: 'Une dirigeante qui répète votre phrase en comité vous engage : mieux vaut qu’elle soit exacte et courte.', rule: 'Une phrase de comité doit tenir sans note de bas de page.' }, 'n2'),
        choice('acceptable', 'preuve', 'Le montant net figure ici, avec la reprise d’avance en note de bas de page.', { relation: 3, security: 8 }, { what: 'Vous fournissez le chiffre sourcé.', why: 'Rigoureux ; ce n’était pas ce qu’elle demandait, et la note se perdra en séance.', rule: 'Ce qui est en note de bas de page ne sera pas dit.' }, 'n2'),
        choice('tempting', 'commercial', 'Dites-leur qu’on a sécurisé un beau crédit, ils n’iront pas plus loin.', { relation: 6, security: -12 }, { what: 'Vous fournissez une phrase creuse.', why: 'Un comité d’investissement demandera le net, et elle ne l’aura pas.', rule: 'Une formule vague se retourne en séance.' }, 'n2'),
        choice('poor', 'technique', 'C’est plus complexe qu’une phrase : il y a l’avance, le consortium, la quote-part…', { relation: -8, mood: -6 }, { what: 'Vous refusez de simplifier.', why: 'Un dirigeant pressé qui repart sans phrase en inventera une, et elle sera fausse.', rule: 'Si vous ne simplifiez pas, le client le fera à votre place.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Je le fais inscrire dans le prévisionnel qu’on envoie aux investisseurs. Montant ferme ?',
      choices: [
        choice('optimal', 'preuve', 'Ferme après dépôt, pas avant. D’ici là, inscrivez-le comme estimation.', { relation: 3, security: 12, trust: 5 }, { what: 'Vous cadrez ce qui part aux investisseurs.', why: 'Un montant CIR présenté comme acquis à des investisseurs engage la dirigeante bien au-delà du fiscal.', rule: 'Avant dépôt, un montant CIR reste une estimation, y compris à l’écrit.' }, null),
        choice('acceptable', 'synthese', 'Inscrivez la borne basse : elle tiendra quoi qu’il arrive au dépôt.', { relation: 4, security: 9 }, { what: 'Vous proposez la borne prudente.', why: 'Bon réflexe ; il faudrait aussi dire que c’est une borne, pas le montant.', rule: 'Une borne basse écrite protège mieux qu’un montant central.' }, null),
        choice('tempting', 'commercial', 'Ferme, oui. On l’a calculé au centime, autant en profiter maintenant.', { relation: 6, security: -17 }, { what: 'Vous laissez inscrire un montant ferme.', why: 'Si l’administration rabote, c’est le prévisionnel investisseurs qu’il faudra corriger.', rule: 'On ne fait jamais écrire un CIR comme certain avant le dépôt.' }, null),
        choice('poor', 'fermete', 'N’inscrivez rien du tout, c’est trop risqué tant que rien n’est déposé.', { relation: -6, profitability: -3 }, { what: 'Vous interdisez sans alternative.', why: 'Un prévisionnel sans le crédit sous-estime la trésorerie et fausse la levée en cours.', rule: 'On propose la bonne écriture, on n’interdit pas la ligne.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------------------- Data&Co
export const CLOSING_SERVICES: Scenario = {
  id: 'sc_services_closing',
  type: 'CLOSING',
  title: 'Bilan — Data&Co',
  context:
    'Paul Lenoir a fait le calcul : la mission lui a coûté plus cher que le crédit sur onze de ses douze chantiers. Il attend de savoir pourquoi il devrait recommencer l’an prochain.',
  objectives: ['Assumer un montant modeste', 'Défendre la valeur du refus', 'Décider honnêtement de la suite'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'ferme',
      text: 'Un seul chantier retenu. À ce compte-là, votre mission m’a coûté presque autant qu’elle rapporte.',
      choices: [
        choice('optimal', 'preuve', 'Presque. Et onze chantiers déclarés à tort, c’est un redressement, pas un gain.', { relation: 2, security: 12, trust: 5 }, { what: 'Vous chiffrez ce qui a été évité.', why: 'La valeur d’une mission honnête se mesure au redressement qui n’aura pas lieu, pas au crédit encaissé.', rule: 'Ce qu’on n’a pas déclaré fait partie du résultat.', codexUnlock: 'cdx_dire_non' }, 'n2'),
        choice('acceptable', 'synthese', 'C’est exact cette année. Vous savez maintenant où regarder l’an prochain.', { relation: 4, security: 7 }, { what: 'Vous déplacez la valeur vers l’avenir.', why: 'Vrai, mais un dirigeant qui compte n’achète pas un bénéfice futur avec une facture présente.', rule: 'La valeur d’apprentissage se démontre, elle ne s’affirme pas.' }, 'n2'),
        choice('tempting', 'commercial', 'On peut revoir la facture, et regarder les autres chantiers l’an prochain.', { relation: 6, security: -13, profitability: -5 }, { what: 'Vous cédez sur les deux tableaux.', why: 'Rabaisser la facture et rouvrir le périmètre valide l’idée que votre travail ne valait rien.', rule: 'On ne solde pas une mission honnête pour se faire pardonner.' }, 'n2'),
        choice('poor', 'fermete', 'La facture correspond au travail fourni. Je ne vois pas quoi ajouter.', { relation: -9, trust: -4 }, { what: 'Vous vous retranchez derrière la facture.', why: 'Le client ne conteste pas le travail : il ne voit pas ce qu’il a acheté. C’est à vous de le lui montrer.', rule: 'Une objection de valeur ne se traite pas par le contrat.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Soyons directs. L’an prochain, est-ce que ça vaut le coup qu’on recommence ?',
      choices: [
        choice('optimal', 'synthese', 'Si l’anonymisation continue, oui. Sinon, non — et je vous le dirai.', { relation: 5, security: 11, trust: 6 }, { what: 'Vous conditionnez la reconduction au fond.', why: 'Se dire prêt à refuser la mission suivante est ce qui rend crédible celle qu’on a menée.', rule: 'Un cabinet qui sait dire non l’an prochain est cru aujourd’hui.' }, null),
        choice('acceptable', 'preuve', 'Ça dépend de votre feuille de route technique. Montrez-la-moi en juin.', { relation: 4, security: 8 }, { what: 'Vous renvoyez à la matière.', why: 'Juste ; laisse le client sans réponse ce soir, ce qui n’aide pas un taciturne.', rule: 'La R&D de demain se lit dans la feuille de route.' }, null),
        choice('tempting', 'commercial', 'Bien sûr, on trouvera toujours de quoi faire un dossier chez vous.', { relation: 5, security: -16 }, { what: 'Vous promettez un dossier par principe.', why: '« On trouvera toujours » est la phrase qui a fabriqué toutes les missions toxiques de la profession.', rule: 'On ne promet jamais un dossier avant d’avoir vu la matière.' }, null),
        choice('poor', 'fermete', 'Franchement, chez vous, il n’y aura jamais grand-chose. À vous de voir.', { relation: -8, profitability: -5 }, { what: 'Vous fermez sans nuance.', why: 'Le chantier retenu était réel : le nier revient à désavouer votre propre travail.', rule: 'Refuser l’an prochain n’oblige pas à renier cette année.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

/** Tous les bilans propres à un client. */
export const CLOSING_SCENARIOS: Scenario[] = [
  CLOSING_AGRI,
  CLOSING_SAAS,
  CLOSING_INDUS,
  CLOSING_BIOTECH,
  CLOSING_GREEN,
  CLOSING_SERVICES,
];
