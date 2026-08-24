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

// ---------------------------------------------------------------------------
// Deuxième saison. Le bilan n'est plus une restitution : c'est une reddition de
// comptes, devant des interlocuteurs qui savent lire un tableau.
// ---------------------------------------------------------------------------

// ----------------------------------------------------------- Ovalis Nutrition
export const CLOSING_EXP_OVALIS: Scenario = {
  id: 'sc_exp_cl_ovalis',
  type: 'CLOSING',
  title: 'Bilan — Ovalis Nutrition',
  context:
    'Les taux ronds du tableau initial ont été ramenés à ce que les plannings d’atelier montrent. Nadia Cherif découvre un montant très inférieur à celui qu’elle avait annoncé en interne.',
  objectives: ['Assumer la correction des taux', 'Ne pas trahir la source', 'Rétablir une méthode pour l’an prochain'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'agace',
      text: 'Vous avez descendu tous mes taux. J’avais annoncé un montant à ma direction, moi.',
      choices: [
        choice('optimal', 'preuve', 'Je les ai alignés sur vos plannings. Voici, mois par mois, ce qu’ils montrent.', { relation: 1, security: 13, trust: 5 }, { what: 'Vous opposez la pièce, pas la personne.', why: 'Ramener la correction à un document évite d’accuser quiconque tout en tenant le chiffre.', rule: 'On corrige un taux avec une pièce, jamais avec un soupçon.' }, 'n2'),
        choice('acceptable', 'synthese', 'Ils ne tenaient pas. Le montant tient, lui : c’est ce qui compte au contrôle.', { relation: 2, security: 10 }, { what: 'Vous assumez la baisse.', why: 'Ferme et juste, un peu sec pour quelqu’un qui va devoir se dédire en interne.', rule: 'Un chiffre qui tient vaut mieux qu’un chiffre annoncé.' }, 'n2'),
        choice('tempting', 'commercial', 'On peut remonter un peu : personne n’ira comparer avec vos plannings.', { relation: 6, security: -19, trust: -5 }, { what: 'Vous rouvrez la porte que vous veniez de fermer.', why: 'Le vérificateur demande les plannings avant les tableaux : c’est la première pièce qu’il réclame.', rule: 'Un taux remonté sous pression se paie au premier contrôle.' }, 'n2'),
        choice('poor', 'fermete', 'Vos taux étaient faux, et vous le saviez très bien en me les envoyant.', { relation: -12, mood: -8, trust: -5 }, { what: 'Vous accusez au lieu de démontrer.', why: 'Même si c’est vrai, l’accusation transforme une correction technique en conflit personnel.', rule: 'On démontre l’erreur sans nommer l’intention.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Qui vous a donné les plannings ? Je veux savoir qui parle dans mon usine.',
      choices: [
        choice('optimal', 'fermete', 'Vos plannings sont un document de l’entreprise. Je les ai demandés, on me les a donnés.', { relation: -2, security: 12, trust: 6 }, { what: 'Vous protégez votre source.', why: 'Livrer la personne qui vous a aidé ferme définitivement l’accès au terrain, ici et ailleurs.', rule: 'On ne désigne jamais celui qui a fourni la pièce.' }, null),
        choice('acceptable', 'synthese', 'Peu importe la source : le document est le vôtre, et il est daté.', { relation: 1, security: 10, trust: 3 }, { what: 'Vous déplacez la question.', why: 'Bonne esquive ; elle laisse la question ouverte et la tension avec.', rule: 'Un document d’entreprise n’a pas d’auteur à dénoncer.' }, null),
        choice('tempting', 'commercial', 'C’est un technicien qui me les a sortis, il voulait bien faire.', { relation: 3, security: -14, trust: -6 }, { what: 'Vous livrez votre source.', why: 'La personne qui vous a aidé le paiera, et plus personne ne vous parlera dans cette usine.', rule: 'Une source livrée est une source perdue, et un terrain fermé.' }, null),
        choice('poor', 'empathie', 'Je comprends votre agacement, mais je préfère ne pas entrer là-dedans.', { relation: 2, security: 3, trust: -2 }, { what: 'Vous esquivez sans tenir.', why: 'Un refus mou invite à insister ; mieux vaut poser le principe une fois pour toutes.', rule: 'Un refus se pose, il ne se murmure pas.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// -------------------------------------------------------------------- Fluxym
export const CLOSING_EXP_FLUXYM: Scenario = {
  id: 'sc_exp_cl_fluxym',
  type: 'CLOSING',
  title: 'Bilan — Fluxym',
  context:
    'Le solveur a été retenu à hauteur de ce que le dépôt Git montre. Kevin Roy, enthousiaste comme toujours, veut déjà savoir ce qu’il pourra déclarer sur le projet suivant.',
  objectives: ['Restituer un ratio recalculé', 'Traiter la subvention déduite', 'Cadrer un client trop optimiste'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'enthousiaste',
      text: 'Bon, le ratio est plus bas que prévu, mais on a quand même un beau montant, non ?',
      choices: [
        choice('optimal', 'preuve', 'Un montant défendable, ce qui n’est pas la même chose qu’un beau montant.', { relation: 2, security: 11, trust: 5 }, { what: 'Vous corrigez le vocabulaire.', why: 'Chez un client qui s’emballe, laisser passer « beau montant » prépare la surenchère de l’an prochain.', rule: 'Un montant se qualifie par sa solidité, pas par sa taille.' }, 'n2'),
        choice('acceptable', 'synthese', 'Il est correct, et surtout il correspond à ce que vos commits montrent.', { relation: 3, security: 9 }, { what: 'Vous reliez le montant à la trace.', why: 'Bon lien ; le client entendra surtout « correct ».', rule: 'Un montant se relie toujours à sa preuve.' }, 'n2'),
        choice('tempting', 'commercial', 'Très beau montant ! Et l’an prochain, avec le nouveau projet, ce sera mieux.', { relation: 6, security: -13 }, { what: 'Vous relancez l’emballement.', why: 'Vous venez de passer une saison à ramener ce client au réel : cette phrase l’annule.', rule: 'On ne rouvre pas la surenchère au moment du bilan.' }, 'n2'),
        choice('poor', 'fermete', 'Non, il est faible. Vos équipes ont surtout fait de la maintenance cette année.', { relation: -9, mood: -7 }, { what: 'Vous dévalorisez le résultat.', why: 'Le solveur était un vrai sujet : le noyer dans la maintenance efface ce qui méritait d’être retenu.', rule: 'Corriger un ratio n’oblige pas à nier le travail.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Et la subvention région ? Elle a été déduite, mais on l’a bien touchée en plus, non ?',
      choices: [
        choice('optimal', 'synthese', 'Vous l’avez touchée, oui. Le total encaissé reste supérieur, voici le net.', { relation: 5, security: 9, trust: 4 }, { what: 'Vous montrez le cumul.', why: 'Le client ne voit que la ligne retirée : lui montrer le total encaissé remet la déduction à sa place.', rule: 'Une déduction s’explique par le total, pas par la ligne.' }, null),
        choice('acceptable', 'technique', 'Déduite de l’assiette, encaissée par ailleurs. Les deux flux sont distincts.', { relation: 2, security: 9 }, { what: 'Vous décrivez la mécanique.', why: 'Exact ; un dirigeant enthousiaste retiendra mieux un chiffre qu’une mécanique.', rule: 'Assiette et trésorerie sont deux plans distincts.' }, null),
        choice('tempting', 'commercial', 'On pourra sans doute la récupérer l’an prochain, je vais regarder ça.', { relation: 5, security: -14 }, { what: 'Vous laissez espérer une reprise.', why: 'Une subvention affectée à la R&D se déduit chaque année où elle finance les travaux.', rule: 'Une aide déduite ne se récupère pas l’année suivante.' }, null),
        choice('poor', 'fermete', 'Vous ne pouvez pas avoir les deux. C’est l’un ou l’autre, il faut choisir.', { relation: -7, trust: -4 }, { what: 'Vous énoncez une règle fausse.', why: 'Le cumul est parfaitement légal : c’est seulement le double financement qui ne l’est pas.', rule: 'Aide et CIR se cumulent ; c’est la même dépense qui ne se finance pas deux fois.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// --------------------------------------------------------- Forgeal Industries
export const CLOSING_EXP_FORGEAL: Scenario = {
  id: 'sc_exp_cl_forgeal',
  type: 'CLOSING',
  title: 'Bilan — Forgeal Industries',
  context:
    'Il n’y a presque rien à déclarer chez Forgeal, et vous le saviez depuis la découverte. Bruno Meyer vous reçoit une dernière fois, avec la proposition du confrère toujours sur son bureau.',
  objectives: ['Restituer un dossier quasi vide', 'Tenir le refus jusqu’au bout', 'Laisser le client capable de revenir'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'ferme',
      text: 'Vous me rendez un dossier de deux lignes. L’autre m’en promet trente. Expliquez-moi.',
      choices: [
        choice('optimal', 'preuve', 'Deux lignes que vous défendrez. Les trente autres, vous les rendrez.', { relation: 1, security: 14, trust: 6 }, { what: 'Vous tenez le refus avec un argument économique.', why: 'Un chef d’atelier taciturne entend le coût du redressement mieux que la morale professionnelle.', rule: 'Un dossier vrai se compare à un redressement, pas à une promesse.', codexUnlock: 'cdx_dire_non' }, 'n2'),
        choice('acceptable', 'synthese', 'Parce que votre savoir-faire est rare, et que le CIR ne finance pas cela.', { relation: 3, security: 10, trust: 3 }, { what: 'Vous distinguez l’excellence de l’éligibilité.', why: 'Juste et respectueux ; il attend aussi de savoir ce qu’il risque ailleurs.', rule: 'Un savoir-faire remarquable n’est pas une incertitude scientifique.' }, 'n2'),
        choice('tempting', 'commercial', 'On peut encore ajouter deux ou trois postes, si vous n’êtes pas satisfait.', { relation: 6, security: -19 }, { what: 'Vous craquez à la dernière minute.', why: 'Toute une mission passée à tenir la ligne, défaite dans la dernière réunion.', rule: 'Un refus qui cède au bilan n’a jamais existé.' }, 'n2'),
        choice('poor', 'technique', 'Parce que l’état de l’art de votre secteur ne présente aucune incertitude levée.', { relation: -7, mood: -6 }, { what: 'Vous répondez par une formule.', why: 'À un homme d’atelier, cette phrase dit surtout que vous ne connaissez pas son métier.', rule: 'Le vocabulaire du guide ne convainc pas l’atelier.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Et si je signe chez eux quand même ? Vous me direz quoi, dans trois ans ?',
      choices: [
        choice('optimal', 'synthese', 'Rien. Gardez seulement une trace écrite de ce que je vous ai dit aujourd’hui.', { relation: 4, security: 12, trust: 6 }, { what: 'Vous laissez partir sans rompre.', why: 'Un client qui garde votre avertissement écrit revient de lui-même quand le contrôle arrive.', rule: 'Un refus se laisse par écrit, sans menace ni triomphe.' }, null),
        choice('acceptable', 'empathie', 'C’est votre décision. Ma porte reste ouverte, avant comme après.', { relation: 6, security: 6, trust: 4 }, { what: 'Vous restez disponible.', why: 'Chaleureux ; sans trace écrite, personne ne se souviendra de l’avertissement.', rule: 'La disponibilité ne remplace pas la trace.' }, null),
        choice('tempting', 'commercial', 'Signez donc chez eux, et revenez me voir si l’administration proteste.', { relation: 3, security: -10, trust: -4 }, { what: 'Vous vous placez en recours.', why: 'Vous encouragez le dossier que vous venez de refuser, en espérant en récupérer les dégâts.', rule: 'On n’encourage pas un dossier qu’on refuse de monter.' }, null),
        choice('poor', 'fermete', 'Je vous dirai que je vous avais prévenu, et ce sera trop tard pour vous.', { relation: -11, trust: -5 }, { what: 'Vous prenez date contre lui.', why: 'La menace est le seul registre qui garantit qu’il ne reviendra jamais.', rule: 'On ne gagne rien à avoir raison contre son client.' }, null),
      ],
    },
  ],
  outcome: OUT,
};

// ------------------------------------------------------------------ Néorégén
export const CLOSING_EXP_NEOREGEN: Scenario = {
  id: 'sc_exp_cl_neoregen',
  type: 'CLOSING',
  title: 'Bilan — Néorégén',
  context:
    'Le plus gros dossier de la saison. Après le rang de trop, l’entité liée et la bascule vers la production de lots, le montant a fondu d’un tiers. Dr. Amina Sy a le calcul sous les yeux.',
  objectives: ['Défendre chaque retrait ligne à ligne', 'Résister à une contestation informée', 'Préparer le contrôle à venir'],
  entryNode: 'n1',
  nodes: [
    {
      id: 'n1',
      speaker: 'Le client',
      expression: 'ferme',
      text: 'Un tiers en moins. J’ai relu le texte hier soir : sur la sous-traitance, je crois que vous vous trompez.',
      choices: [
        choice('optimal', 'technique', 'Reprenons le texte ensemble. Le troisième rang y est exclu, sans exception.', { relation: 2, security: 14, trust: 6 }, { what: 'Vous acceptez la confrontation technique.', why: 'Avec une scientifique qui a lu le texte, esquiver le débat vaut aveu ; le tenir emporte la décision.', rule: 'Face à un client informé, on ouvre le texte, on ne le résume pas.', codexUnlock: 'cdx_st_cascade' }, 'n2'),
        choice('acceptable', 'preuve', 'Regardons vos factures : le rang s’y lit, et c’est lui qui décide.', { relation: 3, security: 11, trust: 4 }, { what: 'Vous revenez aux pièces.', why: 'Efficace ; elle a soulevé un point de droit, il faudra aussi y répondre.', rule: 'Une objection de droit appelle une réponse de droit.' }, 'n2'),
        choice('tempting', 'commercial', 'Vous avez peut-être raison, on peut réintégrer cette part au dossier.', { relation: 6, security: -20 }, { what: 'Vous cédez sur un point de droit établi.', why: 'Céder à la lecture du client sur un point clair est exactement ce que le contrôle ira chercher.', rule: 'On ne négocie pas une règle, même avec un client compétent.' }, 'n2'),
        choice('poor', 'fermete', 'Vous vous trompez. C’est mon métier, pas le vôtre, et le calcul est fait.', { relation: -11, trust: -6 }, { what: 'Vous opposez votre titre.', why: 'Une directrice scientifique qui a lu le texte attend un raisonnement, pas un argument d’autorité.', rule: 'L’autorité ne répond jamais à un argument technique.' }, 'n2'),
      ],
    },
    {
      id: 'n2',
      speaker: 'Le client',
      expression: 'neutre',
      text: 'Admettons. Avec un dossier de cette taille, on aura un contrôle. Vous êtes prêt ?',
      choices: [
        choice('optimal', 'preuve', 'Chaque retrait est documenté : c’est ce qui rend le reste incontestable.', { relation: 4, security: 13, trust: 6 }, { what: 'Vous montrez que les retraits sont la défense.', why: 'Un dossier où l’on voit ce qui a été écarté et pourquoi désarme la moitié des questions.', rule: 'Ce qu’on retire, documenté, protège ce qu’on garde.', codexUnlock: 'cdx_controle_deroule' }, null),
        choice('acceptable', 'synthese', 'Prêt : le dossier tient poste par poste, et je serai là ce jour-là.', { relation: 6, security: 9, trust: 4 }, { what: 'Vous vous engagez sur la défense.', why: 'Rassurant ; sur un dossier de cette taille, elle voudra voir la préparation.', rule: 'S’engager à défendre, c’est aussi montrer comment.' }, null),
        choice('tempting', 'commercial', 'Il n’y aura pas de contrôle : votre dossier est trop propre pour attirer l’œil.', { relation: 5, security: -15 }, { what: 'Vous pariez sur l’absence de contrôle.', why: 'Un dossier de cette taille est justement celui que l’administration regarde en priorité.', rule: 'Un gros dossier appelle le contrôle, la propreté n’y change rien.' }, null),
        choice('poor', 'fermete', 'On verra à ce moment-là. Rien ne sert d’y penser avant que ça n’arrive.', { relation: -8, security: -8, trust: -5 }, { what: 'Vous remettez la défense à plus tard.', why: 'La défense se prépare au dépôt : trois ans après, plus personne ne se souvient de rien.', rule: 'Un dossier se défend le jour où on le dépose.' }, null),
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
  CLOSING_EXP_OVALIS,
  CLOSING_EXP_FLUXYM,
  CLOSING_EXP_FORGEAL,
  CLOSING_EXP_NEOREGEN,
];
