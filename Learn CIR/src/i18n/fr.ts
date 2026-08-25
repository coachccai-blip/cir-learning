// Toutes les chaînes d'interface (chrome). Le contenu de jeu vit dans src/data.
// i18n dès le lot 1 (§17) : aucune chaîne visible codée en dur dans un composant.

export const STR = {
  appTitle: 'Learn CIR',
  appTagline: 'Une saison fiscale chez CIR Corp',
  // Une ligne, pas un paragraphe : l'accueil annonce le métier, il ne le
  // résume pas. Le détail de chaque saison vit sur l'écran de sélection.
  appPitch: 'Décrocher les clients. Monter des dossiers qui tiennent au contrôle.',
  disclaimer:
    'Les cas, entreprises et montants sont fictifs. Ce jeu est un outil pédagogique et ne constitue en aucun cas un conseil fiscal. Les barèmes reflètent l’état du droit au 20 août 2026 (LF 2026 promulguée le 19 février 2026).',
  music: {
    on: 'Couper la musique',
    off: 'Activer la musique',
  },
  menu: {
    newGame: 'Nouvelle partie',
    continue: 'Continuer',
    codex: 'Codex',
    options: 'Options',
  },
  /** Chapeaux d'écran de la saison. */
  season: {
    daySubtitle: 'Alimentez le portefeuille et entretenez la relation.',
    nightSubtitle: 'Transformez la matière collectée en dossier défendable.',
    quizTitle: 'Avant de commencer : où en êtes-vous ?',
    quizIntro:
      '5 questions rapides. Aucune bonne réponse attendue — c’est un point de départ pour mesurer votre progression.',
  },
  hud: {
    day: 'Relation client',
    night: 'Technique',
    cycle: 'Semaine',
    chapter: (n: number) => `Ch.${n}`,
    xp: 'XP',
    revenue: 'CA signé',
    nextDeadline: 'Prochaine échéance',
    toNight: 'Passer en phase Technique',
    toDay: 'Terminer la phase Technique',
    toBilan: 'Bilan de cycle',
  },
  gauges: {
    relation: 'Relation client',
    security: 'Sécurité fiscale',
    profitability: 'Rentabilité',
  },
  day: {
    title: 'Phase Relation client',
    agenda: 'Agenda de la semaine',
    crm: 'Portefeuille & prospects',
    prospects: 'Prospects',
    clients: 'Clients signés',
    noProspects: 'Aucun prospect. Faites de la prospection téléphonique ou du réseautage.',
    noClients:
      'Portefeuille vide : ici, personne ne vous confie de client. Appelez les pistes ci-contre pour décrocher un rendez-vous de découverte.',
    handledInTech: 'À traiter en phase Technique',
    inbox: 'Boîte de réception',
    unread: (n: number) => `${n} non lu${n > 1 ? 's' : ''}`,
    noMail: 'Rien de nouveau cette semaine.',
    linkedSheet: (title: string) => `Fiche liée : « ${title} »`,
    missionDone: 'Mission terminée',
    nothingToday: 'Rien à faire en phase Relation client sur ce dossier.',
  },
  milestones: {
    lostClient: (company: string) =>
      `${company} part à la concurrence : trop longtemps sans nouvelles de votre part.`,
    refusedTitle: (company: string) => `Mission refusée : ${company}`,
    refusedSubtitle:
      'Vous perdez le chiffre d’affaires et vous évitez un redressement. Savoir dire non fait partie du métier.',
  },
  prospects: {
    becameClient: (company: string, contact: string) =>
      `${company} entre au portefeuille — ${contact} attend son kick-off de mission.`,
    newClientTitle: (company: string) => `${company} rejoint le portefeuille`,
    newClientSubtitle: 'Une mission de fond à instruire : kick-off, qualification, assiette, justificatif.',
    newLead: (company: string, sector: string) =>
      `Nouveau lead au CRM : ${company} (${sector}). À qualifier en rendez-vous découverte.`,
    callBack: (company: string) =>
      `${company} : la porte n’est pas fermée, on peut rappeler cette semaine.`,
    newCall: (company: string, sector: string) =>
      `Nouvelle piste à appeler : ${company} (${sector}).`,
    meetingWon: (company: string, contact: string) =>
      `Rendez-vous décroché : ${contact} vous reçoit chez ${company}. Le dossier entre au CRM.`,
    // Issues d'un appel sur une piste générée : elles ne donnent jamais de
    // dossier, donc jamais de contrat — sauf le cas toxique, où l'on a bel et
    // bien signé quelque chose qui ne vaut rien.
    noDeal: (company: string) =>
      `${company} : pas de contrat signé. L’intérêt est là, le rendez-vous n’a pas été décroché.`,
    toxicSigned: (company: string) =>
      `${company} : contrat signé… mais rien d’éligible. Cette mission va vous coûter.`,
    declinedWell: 'Prospect non éligible écarté — bien vu.',
    noFollowUp: (company: string) => `${company} : pas de suite.`,
    meetingTitle: (company: string) => `Rendez-vous obtenu chez ${company}`,
    meetingSubtitle:
      'Un appel bien mené n’est pas une signature : c’est un rendez-vous de découverte à préparer.',
  },
  night: {
    title: 'Phase Technique',
    dossiers: 'Dossiers ouverts',
    noDossiers: 'Aucun dossier à monter pour l’instant. Signez des clients en phase Relation client.',
    tipDiscovery: (name: string) =>
      `Conseil : demain, faites le rendez-vous découverte avec ${name} pour ouvrir votre premier dossier.`,
    tipProposal: (name: string) =>
      `Conseil : demain, envoyez la proposition à ${name} pour ouvrir votre premier dossier.`,
    tipCodex: 'Profitez-en pour lire quelques fiches codex — ça rapporte de l’expérience.',
    investigateReopened: (n: number) =>
      `${n} carte${n > 1 ? 's' : ''} « à investiguer » rouverte${n > 1 ? 's' : ''} : du temps non facturable`,
    scoreQualif: (pct: number) => `Qualification ${pct} %`,
    scoreBase: (pct: number) => `Assiette ${pct} %`,
    scoreJustif: (n: number) => `Justificatif ${n}`,
    pieces: (n: number) => `${n} pièce${n > 1 ? 's' : ''}`,
    ready: 'Dossier prêt',
  },
  activities: {
    prospection: 'Prospection téléphonique',
    discovery: 'Rendez-vous découverte',
    proposal: 'Rédaction de proposition',
    kickoff: 'Kick-off de mission',
    followup: 'Suivi de mission',
    closing: 'Bilan de mission',
    networking: 'Réseautage / événement',
    qualification: 'Qualification d’éligibilité',
    base: 'Construction de l’assiette',
    justification: 'Rédaction du justificatif',
    review: 'Contrôle qualité croisé',
    training: 'Veille & formation',
  },
  dialogue: {
    objectives: 'Objectifs',
    whatHappened: 'Ce qui s’est passé',
    continue: 'Continuer',
    finish: 'Terminer l’entretien',
    codexUnlocked: 'Fiche débloquée',
    scoreLabel: 'Score de l’entretien',
    optimalWas: 'Le meilleur choix aurait été',
    event: 'Imprévu',
    readAloud: 'Écouter la réplique',
    callInProgress: 'Appel en cours — prospection téléphonique',
    streak: (n: number) => `Série ×${n}`,
    remembers: 'Il s’en souvient',
    stopReading: 'Arrêter la lecture',
  },
  quiz: {
    titlePost: 'Ce que vous avez appris',
    introPost: 'Les mêmes 5 questions qu’au départ. Comparons.',
    question: 'Question',
    validate: 'Valider mes réponses',
    seeResults: 'Voir ma progression',
    // Correction commentée, affichée avant d'entrer dans la partie.
    reviewTitle: 'Correction',
    reviewIntro: (score: number, total: number) =>
      `${score} bonne${score > 1 ? 's' : ''} réponse${score > 1 ? 's' : ''} sur ${total}. Voici ce que dit la règle, question par question — vous retrouverez chacune de ces notions en jeu.`,
    noAnswer: 'Sans réponse',
    explanation: 'La règle',
    startSeason: 'Commencer la saison',
    reviewAgain: 'Revoir mes réponses',
    your: 'Votre réponse',
    correct: 'Bonne réponse',
    before: 'Au départ',
    after: 'À l’arrivée',
    progress: 'Progression',
    scoreLine: 'bonnes réponses',
    skip: 'Passer',
  },
  qualification: {
    readSheet: (title: string) => `Lire « ${title} »`,
    title: 'Qualification d’éligibilité',
    intro: 'Classez chaque travaux du client dans la bonne colonne. Feedback immédiat.',
    columns: { RD: 'R&D éligible CIR', CII: 'Innovation (CII)', NONE: 'Non éligible', INVESTIGATE: 'À investiguer' },
    validate: 'Valider le tri',
    remaining: 'cartes à classer',
    result: 'Résultat de la qualification',
    investigateNote: '« À investiguer » n’est jamais faux : c’est une question reportée, qu’il faudra rouvrir la semaine suivante, sur du temps non facturable.',
  },
  base: {
    title: 'Construction de l’assiette',
    personnel: 'Dépenses de personnel',
    amortization: 'Amortissements',
    subcontracting: 'Sous-traitance',
    grants: 'Subventions & avances',
    decoys: 'Autres postes proposés',
    ratio: 'Taux R&D retenu',
    include: 'Retenir',
    deduct: 'Déduire',
    computedCir: 'CIR calculé',
    baseTotal: 'Assiette',
    validate: 'Valider l’assiette',
    result: 'Résultat de l’assiette',
    precision: 'Précision',
    deviations: 'Écarts détectés',
    noDeviation: 'Aucun écart. Assiette exacte.',
    hintClaimed: 'déclaré par le client',
    // En-têtes de colonnes et libellés d'état de l'écran d'assiette.
    colPerson: 'Personne',
    colAsset: 'Immobilisation',
    colProvider: 'Prestataire',
    colSource: 'Financement',
    colItem: 'Poste proposé',
    colAmount: 'Montant',
    colPayroll: 'Coût chargé',
    colDecision: 'Décision',
    colEvidence: 'Ce que disent les pièces',
    hintConsistent: 'Taux cohérent avec les pièces.',
    hintAssetOk: 'Équipement affecté à la recherche.',
    hintSubOk: (tier: number) => `Agréé MESR, rang ${tier} : dépense éligible.`,
    hintGrantDefault: 'Financement public : à déduire de l’assiette.',
    methodHelp:
      'La colonne « Ce que disent les pièces » donne l’information nécessaire ligne par ligne, et le crédit se recalcule à chaque modification.',
    compareTitle: 'Votre assiette, poste par poste',
    compareLegend:
      'La barre est votre montant retenu, le trait vertical le montant juste. Vert : poste exact. Rouge : écart.',
    rowOperating: 'Forfait de fonctionnement',
    rowDecoysIncluded: 'Postes supprimés retenus',
    rowDeductions: 'Déductions (aides publiques)',
    cirRetained: 'CIR retenu',
    cirTrue: 'Montant juste',
    subAgreed: 'Agréé MESR',
    subNotAgreed: 'Non agréé',
    subTier: (tier: number) => `rang ${tier}`,
    subRelated: 'entité liée',
    grantKind: { grant: 'Subvention', repayableAdvance: 'Avance remboursable' },
    grantShare: (pct: number) => `part R&D ${pct} %`,
    hintDefensible: 'Taux justifiable :',
    hintMissingPiece: 'Pièce à récupérer en suivi de mission pour rendre ce taux opposable.',
    hintLocked: 'Aucune pièce ne confirme ce taux : le chiffre exact s’obtient sur le terrain.',
    // Courbe d'apprentissage : les postes arrivent un par un.
    dossierNo: (n: number) => `Dossier n° ${n}`,
    toleranceTag: (t: number) => `Tolérance ±${Math.round(t * 100)} %`,
    newPoste: 'Nouveau poste à traiter',
    methodTitle: (n: number) => `La méthode, en ${n} réflexe${n > 1 ? 's' : ''}`,
    postes: {
      personnel: 'Personnel',
      amortization: 'Amortissements',
      subcontracting: 'Sous-traitance',
      grants: 'Aides publiques',
      decoys: 'Autres postes',
    },
    posteIntro: {
      personnel:
        'Tout part des dépenses de personnel : c’est le poste le plus lourd, et celui qui porte les taux d’affectation.',
      amortization:
        'Les amortissements entrent en jeu : seuls les équipements réellement affectés à la recherche comptent.',
      subcontracting:
        'La sous-traitance apparaît : l’agrément MESR et le rang de l’intervention décident de tout.',
      grants:
        'Les financements publics arrivent : subventions et avances minorent l’assiette, il faut penser à les déduire.',
      decoys:
        'Dernier étage : des postes que le client voudra ajouter alors qu’ils ont été supprimés de l’assiette.',
    },
    methode: {
      personnel: 'retenez le taux justifiable par les pièces, pas celui déclaré par le client.',
      amortization: 'ne retenez que les équipements réellement affectés aux travaux de recherche.',
      subcontracting: 'décochez tout prestataire non agréé MESR ou intervenant au-delà du 2ᵉ rang.',
      grants: 'cochez « Déduire » : subventions et avances minorent toujours l’assiette.',
      decoys: 'brevets et veille sont supprimés depuis 2025 : laissez-les décochés.',
    },
  },
  justif: {
    title: 'Rédaction du justificatif technique',
    intro: 'Pour chaque bloc, choisissez la formulation la plus solide face à un contrôle.',
    validate: 'Valider le justificatif',
    result: 'Qualité du justificatif',
    preview: 'Aperçu du document',
  },
  bilan: {
    title: 'Bilan de cycle',
    gaugeChanges: 'Évolution des jauges',
    revenue: 'Chiffre d’affaires',
    xp: 'Expérience',
    codex: 'Fiches débloquées',
    deadline: 'Échéance à venir',
    next: 'Semaine suivante',
    noChange: 'Aucune variation ce cycle.',
  },
  audit: {
    title: 'Contrôle fiscal',
    intro: 'Le vérificateur reprend vos décisions, une par une. Vos pièces disponibles sont affichées en permanence.',
    pieces: 'Pièces disponibles',
    noPieces: 'Aucune pièce collectée.',
    defend: 'Présenter la pièce',
    concede: 'Ne rien répondre',
    result: 'Résultat du contrôle',
    validated: 'CIR validé — aucun rappel',
    partial: 'Rappel partiel',
    total: 'Rappel important + intérêts',
    reassessed: 'Montant redressé',
    noAudit: 'Vos dossiers sont suffisamment solides : pas de rappel cette saison.',
    interimResult: 'Réponse à la demande d’information',
    noInterim: 'Aucun dossier chiffré à ce stade : l’administration attendra le dépôt.',
    backToWork: 'Retourner au bureau',
    question: 'Question',
    reread: 'Le vérificateur a relu vos échanges',
    verifier: 'Le vérificateur',
    verifierRole: 'Direction générale des finances publiques',
  },
  end: {
    learnedInGame: 'acquis pendant la partie',
    title: 'Fin de saison',
    grade: 'Grade de saison',
    breakdown: 'Décomposition du score',
    strengths: 'Points forts',
    improvements: 'Axes de progrès',
    badges: 'Badges obtenus',
    replay: 'Rejouer',
    home: 'Retour à l’accueil',
    penalties: 'Pénalités',
  },
  codex: {
    title: 'Codex',
    search: 'Rechercher une fiche…',
    all: 'Toutes',
    read: 'Lu',
    unread: 'Non lu',
    source: 'Source',
    example: 'Exemple',
    empty: 'Aucune fiche ne correspond.',
  },
  /**
   * La manager accompagne la phase Technique : ces écrans sont les plus denses
   * du jeu et les seuls sans interlocuteur. Elle rappelle la consigne, et la
   * lit à voix haute.
   */
  /**
   * Sortie proposée après deux missions menées au bilan : le joueur a vu tout
   * l'enchaînement du métier. On lui ouvre la porte, on ne la lui impose pas.
   */
  graduation: {
    title: 'Bravo ! Vous connaissez dans les grandes lignes l’activité de CIR Corp',
    body:
      'Deux missions conduites du premier appel jusqu’au bilan : vous avez parcouru toute la chaîne du métier — décrocher, cadrer, qualifier, chiffrer, rédiger, restituer, et défendre. Vous pouvez vous arrêter ici et recevoir votre bilan de saison, ou poursuivre : le reste du portefeuille de l’agence s’ouvre alors dans vos prospects.',
    quit: 'Terminer la saison',
    keepPlaying: 'Continuer à jouer',
    progress: (done: number, total: number) =>
      `${done} / ${total} mission${total > 1 ? 's' : ''} menée${done > 1 ? 's' : ''} au bilan`,
  },
  manager: {
    name: 'Amélie Roux',
    role: 'votre manager',
    brief: {
      // Phase Relation client : la consigne suit l'état réel de la journée.
      dayProspect:
        'Votre portefeuille est vide, et personne ne va le remplir à votre place. Prenez le téléphone et appelez vos prospects : chaque piste bien menée vous décroche un rendez-vous de découverte, et c’est ce rendez-vous qui fait le client. Deux suffisent pour commencer.',
      dayMeetings:
        'Vous avez des clients : menez-les jusqu’au bout de la journée. Rendez-vous de découverte, proposition, kick-off, suivi de mission — c’est là que se récoltent les pièces dont vous aurez besoin ce soir. Ne passez en phase Technique qu’une fois cette liste vide.',
      dayTechnique:
        'Plus rien à faire côté relation : vos kick-offs sont passés et vos suivis sont faits. Passez en phase Technique — c’est là qu’on trie les travaux, qu’on monte l’assiette et qu’on rédige le justificatif.',
      night:
        'Voilà vos dossiers ouverts. Prenez-les dans l’ordre : on trie les travaux, on monte l’assiette, on rédige le justificatif, et seulement ensuite on restitue au client. Chaque étape s’appuie sur la précédente — sauter le tri, c’est chiffrer à l’aveugle.',
      qualification:
        'On trie les travaux un par un. La question n’est jamais « est-ce technique ? » mais « qu’est-ce qu’on ne savait pas faire au départ ? ». Un verrou et une incertitude : c’est de la recherche. Un produit nouveau sans verrou : c’est de l’innovation, pas du CIR. Le reste, c’est du développement courant. Dans le doute, mettez à investiguer : la question se rouvrira la semaine prochaine, ce qui coûte du temps — jamais un redressement.',
      base:
        'On construit l’assiette. Voici les réflexes, dans l’ordre où je les vérifie moi-même quand je relis un dossier.',
      justif:
        'Le justificatif se lit par quelqu’un qui n’était pas là. Pour chaque bloc, choisissez la formulation qui tiendrait devant un vérificateur : ce qu’on cherchait, ce qui bloquait, ce qu’on a essayé, ce qu’on a obtenu. Les superlatifs ne prouvent rien ; les faits datés, si.',
    },
  },
  voices: {
    title: 'Voix de lecture',
    help:
      'Selon le système, une seule voix française est parfois installée : tous les personnages se ressemblent alors. Choisissez ici la voix de chaque genre.',
    female: 'Voix féminine',
    male: 'Voix masculine',
    auto: 'Automatique',
    test: 'Écouter',
    sampleF: 'Bonjour, je suis votre manager. On regarde ce dossier ensemble ?',
    sampleM: 'Bonjour, je dirige cette entreprise. Vous vouliez parler de nos travaux ?',
    none: 'Aucune voix française n’est installée sur ce système : la lecture à haute voix est indisponible.',
  },
  options: {
    title: 'Options',
    volume: 'Volume',
    reduceMotion: 'Réduire les animations',
    volumeHint: 'Retour sonore des boutons, des dialogues et des célébrations. La lecture à haute voix des répliques reste disponible même à zéro.',
    textSize: 'Taille du texte',
    resetSave: 'Réinitialiser la sauvegarde',
    exportSave: 'Exporter la partie',
    importSave: 'Importer une partie',
    confirmReset: 'Effacer la partie en cours ? Le codex et les badges sont conservés.',
    textSizes: { normal: '100 %', large: '125 %', xlarge: '150 %' },
  },
  common: {
    back: 'Retour',
    close: 'Fermer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    play: 'Jouer',
    locked: 'Verrouillé',
    client: 'Client',
    contact: 'Interlocuteur',
    sector: 'Secteur',
    difficulty: 'Difficulté',
    mood: 'Humeur',
    trust: 'Confiance',
    grade: 'Grade',
    of: 'sur',
    yes: 'Oui',
    no: 'Non',
    signed: 'Signé',
    notEligible: 'Non éligible',
    estimatedCir: 'CIR estimé',
    promise: 'Promesse en cours',
    promisePrecise: '(chiffre précis engagé)',
    promiseRange: '(fourchette annoncée)',
    pieces: 'Pièces collectées',
  },
} as const;
