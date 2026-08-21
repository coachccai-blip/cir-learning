# Journal des arbitrages — décisions non prévues par le brief

Ce fichier consigne les choix pris pendant le développement qui ne figurent pas
explicitement dans `docs/BRIEF.md`.

## Périmètre livré

Le brief découpe le projet en 11 lots (§19). Cette première livraison couvre
**l'ensemble de la boucle jouable** en une passe, plutôt qu'un lot isolé, pour
livrer un jeu complet et déployé :

- Moteur fiscal complet (`engine/cir`) + moteur de dialogue + économie + audit.
- 6 clients, 14 scénarios, ~60 cartes, 6 cas d'assiette, 30 fiches codex,
  12 événements, prospection procédurale.
- 15 écrans (E1–E15), thème jour/nuit animé, avatars SVG paramétriques.
- Tests unitaires (moteur fiscal + lint de contenu) et déploiement GitHub Pages.

Volume de contenu v1 : légèrement en deçà des cibles du §10.1 (24 scénarios,
90 cartes visés) au profit d'une boucle complète et polie. L'industrialisation
du contenu (lot 8) reste à mener pour atteindre les volumes cibles.

## Décisions techniques

1. **Routing** : plutôt que `react-router` en HashRouter, un routeur d'écran
   minimal piloté par le store Zustand (`view`). Zéro dépendance, fonctionne sur
   tout hébergement statique. L'esprit du brief (§14.1) est respecté.
2. **Animation** : `prefers-reduced-motion` et les transitions sont gérées en CSS
   pur, sans Framer Motion, pour tenir le budget de poids (JS gzip ≈ 110 ko, très
   en deçà des 1,2 Mo du §14.1).
3. **Validation de contenu** : réalisée par des tests Vitest (`tests/engine/
   content.test.ts`) qui rejouent les invariants du §18.2 (4 choix, rôles uniques,
   feedback complet, `next` valides, références codex existantes). Zod pourra
   remplacer/compléter ces gardes au build ultérieurement.
4. **Cas d'or** (§18.1) : les 6 cas d'assiette ont été recalculés par le moteur et
   figés dans `tests/engine/calculator.test.ts`. `case_agri` correspond aux
   valeurs illustratives du §15.3 (base 134 630 €, CIR 40 389 €).
5. **Points [À CONFIRMER] du §9.7** (déductibilité des honoraires de conseil,
   seuils d'états annexes, délais de rescrit) : **non implémentés**, conformément
   à R2 du §21. À revalider sur sources primaires avant codage.

## Décisions de design

6. **Polices** : Montserrat / Avenir Next ne sont pas auto-hébergées dans cette
   version ; la pile de fallback système documentée au §12.2 est utilisée
   (`Montserrat, "Helvetica Neue", Arial…` et `"Avenir Next", "Nunito Sans"…`).
   Cela garantit **zéro requête réseau tierce** (contrainte ferme §14.1). Auto-
   héberger les `.woff2` reste à faire pour fixer le rendu typographique exact.
7. **Jauges métier** : couleurs du §12.2 (cyan Relation, gradient vert→rouge
   Sécurité, orange Rentabilité). **À faire valider par un référent Leyton**
   (§12.2, R3 du §21) — fallback en opacités du bleu prévu si refus.
8. **Logo** : branding textuel « CIR QUEST » ; le logo Leyton officiel n'est pas
   reproduit (R4 du §21). Le « O » du favicon reprend le cercle ouvert orange.

## Itération « fun & pédagogie » (post-v1)

Quatre améliorations à fort levier, ajoutées après la première mise en ligne :

9. **Événements aléatoires déclenchés** (§10.4) : un tirage à 33 %/cycle, à
   l'entrée de la journée, présente un des 12 événements (filtré par cycle et par
   présence d'un client signé, sans répétition — `firedEvents`). Aucun moteur
   séparé : l'événement est un scénario à nœud unique (`eventToScenario`).
10. **Promesse sanctionnée au bilan** (§6.3) : au bilan de mission, l'écart entre
    le CIR réel et la fourchette promise applique un delta Relation/Rentabilité et
    déclenche un reproche nommé du PNJ ; un écart majeur provoque une chute de
    confiance (churn).
11. **Quiz avant/après** (§18.1) : 5 questions au démarrage et en fin de saison,
    avec une décomposition « ce que vous avez appris » sur l'écran de fin — la
    preuve mesurable de l'apprentissage attendue par un formateur.
12. **Alternative optimale** : après un choix de dialogue sous-optimal, le
    feedback montre la meilleure formulation possible — on apprend autant de
    l'erreur commentée que du succès.

Champs de sauvegarde ajoutés (`firedEvents`, `quizPre`, `quizPost`) avec backfill
défensif dans `migrateSave` : une sauvegarde v1 reste lisible.

## Itération « immersion & design » (post-v1.1)

13. **Historique des décisions exploité** : chaque choix joué est enregistré
    (texte figé, impact, règle). Le contrôle fiscal cite les décisions risquées
    mot pour mot (« Semaine N, vous aviez déclaré… ») et l'écran de fin livre un
    débrief nominatif (décisions les plus coûteuses + meilleurs réflexes).
14. **Mémoire relationnelle parlante** (§8.3) : les PNJ citent en ouverture la
    promesse chiffrée et les flags mémorisés (`src/data/recalls.ts`), avec un
    contexte d'ambiance par client pour les scénarios génériques.
15. **Scène de règlement de promesse** : le reproche du client est une vraie
    scène (portrait, réplique, deltas, leçon), plus un toast.
16. **Anneau d'humeur** : l'humeur de chaque client est portée par un anneau
    coloré autour de son portrait (arc proportionnel, rouge→ambre→cyan→vert),
    doublé d'un `role="meter"` accessible. La barre d'humeur est remplacée.
17. **Polices auto-hébergées** : Montserrat + Nunito Sans en fontes variables
    (latin, ~69 ko, licence OFL) dans `public/fonts/` — zéro requête tierce.
18. **HUD hiérarchisé + alerte J-2** : chips groupées (temps / ressources /
    progression discrète), échéance pulsante en rouge quand elle tombe dans la
    semaine ou la suivante.
19. **Transition jour/nuit ritualisée** : overlay plein écran ~1,1 s (« Semaine
    N — Nuit »), désactivé par `prefers-reduced-motion`.
20. **Boîte mail du jour** (§6.1) : `src/data/mails.ts`, mails contextuels par
    fenêtre de cycles, certains liés à une fiche codex (dont une fausse
    newsletter pré-2025 — piège pédagogique).
21. **Sons synthétisés WebAudio** (badge, validation, sonnerie, alerte), mute
    par défaut, pilotés par l'option volume. Aucun fichier audio.
22. **Sparklines de jauges** au bilan de cycle (une série par graphe, échelle
    fixe 0-100) et **comparateur visuel d'assiette** (barre = montant retenu,
    trait = montant juste, vert/rouge par poste).
23. **Défi quotidien réellement seedé** par la date (`daily-YYYY-MM-DD`) : même
    portefeuille et mêmes tirages pour tous les joueurs du jour.
24. **Streak « Le mot juste »** enfin alimentée (choix optimal/acceptable
    l'augmentent, tentant/mauvais la cassent) et affichée en dialogue (🔥 ×N).

Champs de sauvegarde ajoutés (`mailsRead`, `gaugeHistory`, enrichissement de
`history`) avec backfill défensif dans `migrateSave`.

## Passe lisibilité (écarts assumés à la charte, demandés par l'utilisateur)

25. **Contrastes renforcés au-delà de la charte** : encres de texte dédiées par
    thème (`--text-muted` ≥ 7:1), orange assombri `#B03A1E` (jour) / éclairci
    `#FFA07D` (nuit) pour le texte fin, encres `--pos`/`--neg` pour les deltas.
    Corps 16,5 px, interlignage 1,6, mesure limitée (62-72ch) sur les textes longs.
26. **Portraits 3D optionnels** : `src/avatars/portraits.ts` mappe les seeds vers
    `public/portraits/*.png` (nommage défini dans l'Excel
    « CIR-Quest-Personnages-Prompts.xlsx »). Si l'image existe, elle remplace
    l'avatar SVG (repli automatique) ; l'anneau d'humeur est superposé aux deux.

## Prospects anonymes et closing (demande utilisateur)

27. **Silhouette anonyme au téléphone** : les prospects apparaissent en
    silhouette H/F (`AnonymousAvatar`) tant qu'ils ne sont pas signés — on ne
    voit pas son interlocuteur au téléphone. Le genre est dérivé du prénom
    généré.
28. **Closing complété** (§16) : l'issue de l'appel dépend du choix final
    (flags `prospect_sign` / `prospect_maybe` / `prospect_decline`). Signé →
    mission conseil au portefeuille (CA via `resolveGenericMission`, pénalités
    si non éligible) avec un **portrait générique révélé** parmi 8 visuels
    (`prospect-f-01…04`, `prospect-m-01…04`), attribué par genre + seed.
    Refus propre d'un non-éligible → compte pour le badge « Non, c'est non ».
    L'Excel des personnages passe à 23 entrées (15 nommés + 8 génériques).

## Points à valider (rappel des risques §21)

- **R1/R3** : relecture métier des règles fiscales et des cas d'or par un
  consultant CIR senior ; validation de l'usage de la marque Leyton par la
  Direction Marque.
- **R2** : points [À CONFIRMER] du §9.7 avant implémentation.

## Marque fictive et vocabulaire métier (demande utilisateur)

29. **Aucune référence à une entreprise réelle** : le cabinet employeur est
    désormais **CIR Corp**, entreprise fictive. Remplacements effectués dans le
    contenu visible (tutoriel, chapitre 1, accroche d'accueil, mode
    « Onboarding »), les métadonnées (`package.json`) et les variables CSS
    (`--leyton-*` → `--brand-*`). Cela lève au passage le risque R3 du brief
    (validation de l'usage de la marque par la Direction Marque).
30. **Vocabulaire** : ne jamais qualifier le consultant de « technicien » —
    c'est péjoratif dans le métier. Le tutoriel dit désormais « bon commercial
    et bon consultant ». Attention : « chercheurs et **techniciens de
    recherche** » reste le terme légal du CGI pour le personnel éligible, et
    « technicien de labo » est un poste réel des cas — ces occurrences sont
    conservées telles quelles.

## Prospection : 14 situations d'appel distinctes (demande utilisateur)

31. **Fin de l'appel unique** : `sc_prospect_call` (un seul scénario générique
    servi à tous les prospects) est remplacé par **14 situations d'appel**
    (`src/data/scenarios/calls.ts`), chacune centrée sur une compétence
    téléphonique réelle :
    barrage de l'accueil · « on a déjà un cabinet » · peur du contrôle ·
    « on est trop petits » · objection prix · « envoyez une doc » ·
    « vous avez 30 secondes » · dirigeant excédé · recommandation ·
    « chez nous tout est innovant » · le DAF · non-éligible évident ·
    entreprise déjà redressée · le curieux mal informé.
32. **Sélection par profil** (`CALL_POOL`) : un prospect NOT_ELIGIBLE ne tire
    jamais un scénario supposant un vrai projet R&D, et inversement. La
    sélection se fait par **rotation** dans le pool (et non tirage aléatoire
    pur) : deux prospects consécutifs ne tombent jamais sur la même situation.
33. Chaque scénario conserve le patron du brief (4 choix, rôles uniques,
    feedback quoi/pourquoi/règle) et se termine par un flag d'issue
    (`prospect_sign` / `prospect_maybe` / `prospect_decline` /
    `prospect_decline_rude`) exploité par `resolveProspectCall`.

## Passe « ludique & lisible » (7 corrections demandées)

34. **Points d'action doublés** (`balance.json`) : 10 le jour, 8 la nuit
    (au lieu de 5 / 4). Un cycle permet désormais de mener une action
    commerciale *et* d'avancer un dossier la même journée, sans arbitrage
    frustrant. Les pastilles de PA du bandeau s'adaptent au nouveau maximum.
35. **Ordre des réponses aléatoire partout**. Le moteur de dialogue mélangeait
    déjà ses choix, mais trois écrans affichaient leurs options dans l'ordre de
    déclaration — donc la bonne réponse toujours en premier : le quiz
    (`QuizScreen`), le justificatif (`JustifScreen`) et les réponses au
    vérificateur (`AuditScreen`). Un helper commun `shuffleForDisplay(items,
    seed)` (`engine/rng.ts`) mélange de façon **déterministe par graine**, si
    bien qu'une partie reste reproductible et qu'un retour arrière ne rebat pas
    les cartes.
36. **Célébrations, sons et animations**. Un composant `Celebration` (confettis
    + bandeau, `tone: good | bad`) marque les moments qui comptent : badge
    obtenu, montée en grade, signature, assiette exacte ou ratée, contrôle
    fiscal validé ou redressé, qualification parfaite. La palette sonore passe
    de 4 à 9 bruitages synthétisés (WebAudio, aucun fichier). `AnimatedNumber`
    fait défiler les montants. Tout respecte `prefers-reduced-motion` et le son
    reste coupé par défaut.
37. **Assiette : tous les indices sont donnés**. Le mode « indices » optionnel
    disparaît au profit d'une colonne permanente « Ce que disent les pièces »,
    plus un encadré « La méthode, en 4 réflexes ». Chaque ligne piégée affiche
    désormais **le taux justifiable**, que la pièce ait été collectée ou non ;
    la pièce manquante reste signalée, car c'est elle qui rendra le taux
    opposable au contrôle. L'écran est vérifiable : un script qui ne lit que ce
    qui est affiché construit une assiette exacte à 100 %.
38. **Un seul suivi de mission par client**. Le suivi était la seule activité de
    jour qui ne faisait pas avancer `dossierState` : il se rejouait donc en
    boucle pour 1 PA. Le nouveau drapeau `ClientState.followupDone` le rend
    unique. La machine à états sort du composant React pour vivre dans
    `engine/activities.ts` (`nextClientAction`), conformément à la règle
    « toute la logique dans le moteur », et est verrouillée par
    `tests/engine/activities.test.ts`.
39. **Longueur des réponses équilibrée**. Mesure avant correction : sur les
    91 nœuds de dialogue, **100 %** avaient la bonne réponse comme réponse la
    plus longue (155 caractères en moyenne, contre 60 pour les mauvaises) — le
    jeu était gagnable sans lire. Les 4 formulations de chaque nœud ont été
    réécrites dans une bande resserrée. `tests/engine/balance-length.test.ts`
    verrouille durablement deux garde-fous : **écart max de 45 caractères** au
    sein d'un nœud, et **au plus 40 %** des nœuds où la bonne réponse est aussi
    la plus longue (le hasard donnerait 25 %). Même contrainte sur les blocs du
    justificatif et les propositions du quiz.

## Le portefeuille ne se tarit plus (demande utilisateur)

40. **Les leads du catalogue arrivent enfin.** `ClientDef.leadCycle` n'était lu
    nulle part : hors mode expert, le portefeuille était figé aux 4 premiers
    clients et **Solterra (S10) et Data-O (S16) n'étaient jamais joués** — six
    scénarios écrits, jamais servis. `advanceCycle` fait désormais entrer au
    CRM tout client dont le `leadCycle` est atteint.
41. **Un prospect signé peut devenir un vrai client.** Jusqu'ici, signer en
    prospection n'ajoutait qu'une ligne de chiffre d'affaires : une fois les
    quatre dossiers déposés, il ne restait plus rien à instruire la nuit.
    Une partie des signatures ouvre maintenant une **mission de fond** qui entre
    au portefeuille à l'état `SIGNED` et se joue entièrement (kick-off →
    qualification → assiette → justificatif → bilan).
42. **Certaines, pas toutes** (`prospectBecomesClient`) : jamais un prospect non
    éligible (il n'y a rien à instruire), jamais un dossier sous
    `minEstimatedCir` (l'enjeu ne justifie pas une mission), et au-delà un tirage
    déterministe à `conversionRatio`. Un plafond `maxActiveClients` évite que le
    portefeuille ne dépasse le budget d'actions. Toutes ces valeurs vivent dans
    `balance.json`.
43. **Dossier fabriqué, pas improvisé** (`engine/clientgen.ts`) : fiche client,
    cas d'assiette et jeu de cartes sont assemblés à partir des briques de
    `data/dossier-kit.ts` (par secteur), puis **recalés sur le CIR annoncé au
    téléphone** — les montants sont mis à l'échelle pour que le CIR légal réel
    tombe à ±15 % de l'estimation, sinon la promesse faite en prospection
    n'aurait aucun sens. Chaque dossier mêle toujours des postes sains et des
    postes piégés, et le tri de cartes n'est jamais gagnable en cochant une
    seule colonne. Tout est déterministe : même graine, même dossier.
44. **Deux scénarios génériques** (`sc_generic_discovery`, `sc_generic_kickoff`)
    complètent le suivi et le bilan déjà génériques, pour que ces dossiers se
    jouent avec le même moteur que les clients écrits à la main.
45. **Persistance** : les dossiers générés sont stockés dans
    `SaveGame.generatedClients` et réinjectés dans un registre runtime
    (`data/registry.ts`) au `boot`, avant qu'un écran ne tente de résoudre un
    `clientId`. Sans cela, un rechargement de page perdrait le client.
46. **Accord grammatical** : le prénom d'un membre d'équipe généré est tiré en
    accord avec le genre de l'intitulé de poste — pas de « Zoé Oliveira,
    Ingénieur matériaux ». Verrouillé par un test.

## Jeu « one-shot » : suppression du défi quotidien (demande utilisateur)

47. **Plus de défi quotidien.** Le brief prévoyait un défi seedé par la date.
    Learn CIR est un **parcours d'onboarding qui se joue d'une traite** : une
    saison complète, du premier appel au contrôle fiscal. Un rendez-vous
    quotidien suppose un joueur qui revient chaque jour — ce n'est pas la
    situation d'un consultant en cours d'intégration. Le §10.3 du brief est
    mis à jour en conséquence.
48. Le mode libre devient **« Rejouer une saison »** : une seule carte, qui
    relance les 24 semaines avec un portefeuille tiré différemment. L'accueil
    annonce désormais explicitement la promesse du parcours.

## Portraits, phases et accueil (demande utilisateur)

49. **Les 23 portraits 3D sont intégrés.** Livrés à la racine du dépôt avec une
    extension doublée (`dupuis-01.png.png`) et en 1254 × 1254, soit **41 Mo au
    total** — impubliable tel quel sur un site statique où chaque portrait
    s'affiche au plus grand en 150 px. Ils sont désormais dans
    `public/portraits/`, **recadrés tête-épaules** (détection du haut de tête et
    de la ligne de cou par le canal alpha, centrage sur le centroïde du visage —
    un cadrage centré sur l'image entière n'aurait montré que le buste dans le
    masque circulaire), réduits en 320 px et quantifiés : **41 Mo → 663 ko**.
    Les sources pleine résolution restent dans l'historique git.
50. Le mapping `src/avatars/portraits.ts` gagne `aubert-08` et expose
    `ALL_PORTRAITS` pour la scène d'accueil. L'avatar SVG paramétrique reste le
    repli si un fichier manque.

51. **« Jour / Nuit » devient « Relation client / Technique ».** La métaphore
    jour/nuit laissait entendre que le métier se fait la nuit — mauvais message
    pour un outil d'onboarding. L'alternance, les thèmes visuels et les budgets
    d'actions ne changent pas ; seuls les libellés, les pictogrammes (☀/☾ →
    🤝/🔬) et le texte du tutoriel (« deux casquettes ») sont réécrits. Les
    états moteur `DAY` / `NIGHT` restent tels quels : ce sont des identifiants,
    jamais affichés. Le §10.3 du brief porte l'arbitrage.

52. **Accueil refondu.** Un dégradé vivant (deux nappes teal et orange qui
    dérivent en 26 s, vignette, halo) et **seize bulles de tailles différentes**
    portant les portraits, qui flottent à des rythmes distincts — les grosses
    lentement, les petites plus vite et légèrement floutées, ce qui donne la
    profondeur de champ. La composition est **écrite à la main plutôt que tirée
    au hasard** : les bulles restent hors de la colonne centrale où vit le
    texte, et le placement ne bouge pas d'un chargement à l'autre. Sous 900 px,
    seules les grosses subsistent ; `prefers-reduced-motion` fige tout.

## Déploiement : les deux modes de GitHub Pages (incident)

53. **Le site servait une page blanche alors que tous les déploiements étaient
    verts.** `Settings → Pages → Source` valait « Deploy from a branch →
    `main` / `(root)` ». Dans ce mode, GitHub **ignore complètement** l'artefact
    produit par Actions et sert la **racine du dépôt** — dont `index.html` est
    l'entrée Vite de développement, qui charge `/src/main.tsx`, absent du build.
    D'où la page vide. Le workflow, lui, ne pouvait rien signaler : il publiait
    bien un artefact, que personne ne lisait.
54. **Le workflow publie désormais des deux façons** : l'artefact Pages (job
    `deploy`, pour le mode « GitHub Actions ») **et** une branche `gh-pages`
    (job `publish-branch`, pour le mode « Deploy from a branch »). Quel que soit
    le mode choisi, le site servi est le build — jamais la racine du dépôt.
    Le seul réglage restant est le choix de la source ; les deux options
    valides sont documentées dans le README.
55. `dist/.nojekyll` est ajouté au build : en mode branche, Pages fait passer le
    contenu par Jekyll, qui écarterait tout chemin commençant par un souligné.

## Deux modes, et le portrait qui disparaissait (demande utilisateur)

56. **Le mode « Découverte » est retiré.** Restent **Onboarding** (par défaut)
    et **Expert**. Un mode qui supprime le contrôle fiscal et tolère ±15 %
    d'erreur d'assiette enseigne l'inverse du métier — hors sujet pour un
    parcours d'onboarding de consultants. Le garde-fou « ce mode ne descend
    jamais sous la note C » disparaît avec lui, ainsi que ses barèmes dans
    `balance.json`. Le §6 du brief porte l'arbitrage.
57. **Les parties et les scores enregistrés en Découverte basculent sur
    Onboarding** (`migrateSave`, `loadLeaderboard`) : sans cela, une sauvegarde
    resterait sur un mode dont plus aucun barème n'existe, et
    `toleranceForMode` renverrait `undefined`. Verrouillé par
    `tests/engine/modes.test.ts`, qui vérifie aussi qu'aucun troisième mode ne
    subsiste dans les barèmes ni dans l'i18n.

58. **Bug corrigé : l'interlocuteur perdait nom et portrait sur le dernier
    écran d'un entretien.** `DialogueScreen` lisait le nœud courant via
    `session.currentNodeId`, qui passe à `null` dès qu'un choix mène à
    `next: null` — alors que le feedback de ce choix reste affiché. Le nom
    tombait donc à la chaîne vide et `avatarSeed` avec lui, d'où l'avatar SVG
    générique à la place de la photo. L'écran mémorise désormais le dernier
    nœud affiché et s'y rabat tant que le feedback est à l'écran.
<<<<<<< HEAD

## Une partie en une heure, et sept axes de jouabilité (demande utilisateur)

59. **La saison passe de 24 à 6 cycles, et le budget d'actions de 432 à 66 PA.**
    Le dimensionnement vient d'une mesure, pas d'une intuition : une action coûte
    au joueur ~1,5 minute, donc une heure de jeu borne la saison à une
    soixantaine d'actions. À 24 cycles, le contenu écrit à la main n'occupait que
    **19 %** du budget d'actions ; les 81 % restants se remplissaient de
    prospection en rotation et de réseautage — c'était la vraie source du
    sentiment de redondance. Vérifié en jouant la saison de bout en bout au
    navigateur : **33 actions, 73 nœuds de dialogue, six cycles**, soit ~50 min.
60. **Le portefeuille dépasse volontairement la capacité.** Les six clients
    arrivent entre les cycles 1 et 3, pour un budget qui permet d'en mener trois
    ou quatre. Un dossier laissé **deux cycles sans nouvelles part à la
    concurrence** (`neglectedClients`, `ClientState.lastTouchedCycle`). Il n'y
    avait jusqu'ici aucune décision qui engage : seulement des décisions qui
    notent.
61. **Chaque échéance du calendrier a une conséquence** (`engine/milestones.ts`).
    Sur onze jalons, un seul mordait — le bandeau annonçait « Prochaine
    échéance » toute la partie pour des dates où il ne se passait rien. Six
    jalons désormais, tous sanctionnés : pipeline non qualifié, kick-off en
    retard, feuilles de temps non collectées (les pièces deviennent
    inopposables), dépôt manqué. Le joueur à jour est récompensé, pas seulement
    épargné.
62. **Le contrôle fiscal arrive avant la fin.** Une demande d'information tombe
    au cycle 5 sur le dossier chiffré le plus faible : deux points, puis retour
    au bureau avec un cycle pour corriger les autres. Le contrôle final garde
    tout son poids. Auparavant, la seule tension du jeu tombait quand plus rien
    ne pouvait être corrigé — la mauvaise moitié du cycle apprentissage-erreur.
63. **Un justificatif par secteur** (six jeux, `JUSTIF_SETS`). Le même set
    générique était rejoué à l'identique pour les six clients : cinq blocs, vingt
    formulations, une fois par dossier. Les blocs restent les mêmes — c'est la
    structure qu'attend l'administration — mais les formulations parlent du
    métier du client. Les dossiers issus de prospection héritent du jeu de leur
    secteur. Un test interdit qu'une formulation se retrouve dans deux secteurs.
64. **Trois formes de nœud au lieu d'une.** Les 83 nœuds avaient tous exactement
    quatre choix et la même combinaison de rôles : la grille s'apprenait en deux
    minutes, après quoi le joueur cherchait le registre au lieu de lire. S'y
    ajoutent le **couperet** (2 choix sous pression, aucune sortie confortable)
    et l'**arbitrage** (deux réponses optimales qui s'excluent — sécuriser ou
    fidéliser). `maskedChoiceIndex` tirait un index sur 4 en dur : il prend
    maintenant la taille réelle du nœud, et ne masque rien en dessous de trois
    choix.
65. **Tri des travaux rééquilibré.** « Non éligible » représentait jusqu'à 8
    cartes sur 10 : tout classer là suffisait à passer le mini-jeu. Les cartes de
    remplissage (formation, veille, documentation) deviennent des cas
    d'innovation, qui font travailler la frontière CIR / CII. Aucun verdict ne
    dépasse désormais la moitié d'un paquet, et les trois sont représentés au
    moins deux fois — y compris dans les paquets générés, dont le tirage est
    devenu équilibré par verdict. Verrouillé par test.
66. **Finitions** : le quiz de sortie devient un jeu **jumeau** (mêmes notions,
    cas différents) — reposer les mêmes questions mesurait la mémoire d'un écran
    vu une heure plus tôt ; les trois fiches de codex inatteignables sont
    offertes au départ (`CODEX_STARTER`) puisqu'elles sont les fondamentaux ; le
    registre **technique**, absent de quatre kick-offs, est désormais proposé
    dans chaque scénario client — un test l'exige, et interdit qu'un registre
    monopolise plus de la moitié des choix.
=======
>>>>>>> origin/main
