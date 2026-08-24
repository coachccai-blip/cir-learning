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

## Retour sonore, animations et lecture à haute voix (demande utilisateur)

67. **Le son répond à toutes les interactions**, via un **écouteur unique en
    capture sur le document** (`app/uiSounds.ts`) plutôt qu'un `onClick` sonore
    dans chaque composant : le son suit la nature du contrôle, et aucun écran
    n'a à s'en préoccuper. Cinq nouveaux timbres — `tap`, `tapPrimary`,
    `toggle`, `back`, `deny` — s'ajoutent aux neuf existants. `pointerdown`
    plutôt que `click` : le son part à l'appui. Le clavier est couvert à part
    (Entrée / Espace), car il ne produit pas de `pointerdown`.
68. **Un contrôle désactivé sonne quand même** (`deny`, sourd) : le silence
    laisserait croire à un bug plutôt qu'à une action indisponible.
69. **Le son est désormais actif par défaut** (volume 35). Il était à zéro depuis
    l'origine (§12.4) ; avec un jeu qui répond à chaque interaction, un joueur
    qui n'ouvre jamais les options n'entendrait rien. Le curseur revient à zéro
    en un geste.
70. **Micro-réactions d'interface** : enfoncement des boutons, reflet lent sur
    l'action principale, entrée en cascade des réponses et des panneaux,
    transition des jauges, pastille de PA qui éclôt. Rien de gratuit : chaque
    animation rend lisible un changement d'état.
71. **Bug corrigé au passage : l'option « Réduire les animations » n'était
    appliquée nulle part.** Elle était stockée et affichée dans les options
    depuis le début, sans le moindre effet. Elle pose maintenant
    `data-reduce-motion` sur `<html>`, qui neutralise les mêmes règles que la
    préférence système.

72. **Lecture à haute voix des répliques** (`app/speech.ts`, `SpeakButton`) :
    un bouton haut-parleur dans la bulle du personnage, avec des ondes qui
    pulsent pendant la lecture. Web Speech API — aucun fichier audio, aucun
    service tiers, la voix est celle du système du joueur.
73. **Voix choisie selon le genre de l'interlocuteur.** Les six clients écrits
    portent désormais un `gender` explicite sur leur fiche ; les clients issus
    de prospection héritent de celui du prospect ; les PNJ récurrents ont une
    table dédiée (`data/voices.ts`), et « Le client » / « Le prospect »
    empruntent la voix de l'interlocuteur en cours. La sélection est extraite en
    fonction pure `pickVoice(voices, gender)` pour être testable sans
    navigateur — la disponibilité des voix dépend du système et n'est pas
    reproductible en test.
74. **Dégradations assumées** : sans voix française installée, le bouton **ne
    s'affiche pas** plutôt que de lire du français avec un accent anglais ;
    quand la voix retenue ne porte pas de genre, les hauteurs sont écartées pour
    que deux personnages ne se ressemblent pas ; et l'affectation de la voix est
    protégée, car un navigateur qui la refuse laissait le bouton bloqué sur
    « lecture en cours ».

## Le parcours en deux saisons (lot « Onboarding → Expert »)

75. **Le jeu devient un parcours ordonné, pas un curseur de difficulté.**
    Jusqu'ici « Expert » rejouait la campagne d'Onboarding avec une tolérance
    plus serrée et sans indices : le joueur revoyait les mêmes six clients, les
    mêmes dialogues, les mêmes pièges. On termine désormais la première saison
    pour ouvrir la seconde, et le parcours est déclaré complet quand les deux
    sont menées. L'avancement vit hors de la sauvegarde de partie
    (`cirquest.progress.v1`), au même titre que le codex lu : réinitialiser une
    partie ne reverrouille pas la saison acquise.
76. **La seconde saison a son propre portefeuille** (`clients-expert.ts`,
    `cases-expert.ts`, `cards-expert.ts`) : quatre entreprises inédites, quatre
    dossiers denses, quatre jeux de cartes. Les visages, eux, sont ceux déjà
    produits pour le jeu — les figures secondaires de la première saison
    (Nadia Cherif, Kevin Roy, Amina Sy, Bruno Meyer, Tom Aubert) passent au
    premier plan dans d'autres maisons et d'autres rôles. Aucun nouveau
    portrait n'a été nécessaire.
77. **Trois mécaniques réservées à la seconde saison**, chacune portée par du
    contenu écrit et non par un réglage :
    - *l'interlocuteur embellit* — le taux réellement opposable n'est plus
      affiché sur l'écran d'assiette ; il ne se révèle qu'à celui qui a
      rapporté la pièce (`piece_feuilles_temps`, `piece_registre`). Toute ligne
      piégée d'un dossier expert est donc adossée à une pièce : à ±1 % de
      tolérance, un piège sans pièce serait indevinable (test dédié) ;
    - *le dossier à refuser* — Forgeal Industries a un savoir-faire rare, un
      concurrent qui « prend tout », et presque rien d'éligible. Le refus est
      le choix optimal ; il sort le client du portefeuille (`refus_mission`),
      coûte du chiffre d'affaires et rapporte de la sécurité ;
    - *le contrôle contradictoire* — le vérificateur ne clôt plus un constat
      d'une seule question. Il relance : « que proposez-vous ? ». Reconnaître
      et rectifier n'efface pas le rappel, cela l'atténue (`audit.remedyRelief`
      dans `balance.json`). C'est ce que fait un consultant en séance.
78. **Courbe d'apprentissage de l'assiette** (`engine/progression.ts`). Le
    premier dossier d'une partie présentait d'un coup les cinq postes, avec la
    tolérance du dernier. Les postes arrivent maintenant dans l'ordre où on les
    apprend — personnel, amortissements, sous-traitance, aides publiques,
    postes supprimés — et l'exigence se resserre à chaque dossier (±15 % → ±5 %
    en Onboarding, ±3 % → ±1 % en Expert). Le rang du dossier est figé dans la
    sauvegarde (`ClientState.baseStep`) à la première ouverture de l'assiette :
    un dossier repris plus tard ne change ni de postes ni de tolérance.
79. **Le joueur et le corrigé travaillent sur le même cas restreint.**
    `restrictCase` vide les postes non introduits ; l'assiette juste d'un
    dossier « personnel seul » est bien celle du personnel seul. Le contrôle
    fiscal passe par la même résolution (`state/dossier.ts`), faute de quoi le
    vérificateur reprocherait une aide publique jamais affichée à l'écran.
80. **Les honoraires restent calculés sur le dossier complet.** La restriction
    est un dispositif pédagogique : elle ne change pas le crédit auquel le
    client a droit, ni ce qu'on lui facture. L'objectif de chiffre d'affaires
    de la saison devient en revanche propre au mode — la seconde compte moins
    de dossiers, à un taux d'honoraires plus bas.
81. **Les dossiers écrits varient d'une partie à l'autre** (`engine/casevar.ts`,
    `data/case-twists.ts`). Deux leviers tirés de la graine : les montants sont
    brouillés ligne par ligne (±12 %, arrondi à la centaine), et un « twist »
    déclaratif déplace les pièges — le prestataire agréé de la partie
    précédente ne l'est plus, l'aide change de nature, la personne « saine »
    devient le poste à corriger. Le dossier d'origine reste dans le tirage :
    c'est celui qui a été relu et équilibré.
82. **Aucun libellé de piège ne cite plus de pourcentage.** Les ratios changent
    d'une variante à l'autre : un piège qui écrivait « 35 % de R&D réelle, pas
    50 % » se serait désynchronisé du chiffre affiché. Les six formulations
    concernées ont été réécrites, et un test verrouille la règle.
83. **Rien de tout cela n'est persisté.** Les variantes se recalculent à
    l'identique depuis la graine à chaque chargement de page — même partie,
    même dossier, sans un octet de sauvegarde en plus.
84. **Conséquences annexes assumées** : le tutoriel ne se rejoue pas en seconde
    saison (le joueur est censé être en poste depuis un an) ; les chapitres de
    campagne ont leur propre récit en Expert ; un nœud de dialogue peut
    surcharger le portrait affiché (`DialogueNode.avatarSeed`), ce qui permet au
    technicien de contredire sa direction avec son propre visage ; et les
    options offrent une réinitialisation du parcours, pour refaire jouer les
    deux saisons à quelqu'un d'autre.

## Passe d'interface : lisibilité et pictogrammes

85. **Le texte ne se pose plus sur une surface colorée.** En phase Technique,
    les panneaux étaient bleu soutenu (`#0a3552`) et l'on y écrivait en vert,
    en orange et en rouge : deux couleurs superposées, sur les écrans les plus
    denses du jeu. Les surfaces de contenu sont désormais neutres — blanc le
    jour, ardoise la nuit — et le bleu de marque ne subsiste qu'en fond de page
    et dans le chrome. C'est un écart assumé à la charte CIR Corp, décidé pour
    la lisibilité, et `CLAUDE.md` porte la règle nouvelle.
86. **Les couleurs sémantiques ne portent plus de phrases.** Un avertissement
    d'assiette était un paragraphe entier en rouge ; c'est maintenant une note à
    encre courante, avec un liseré et un pictogramme colorés (`.note`). La
    couleur reste admise sur les chiffres courts — un « −10 » se lit d'un coup
    d'œil, pas une explication de trois lignes.
87. **Contrastes mesurés, pas estimés** (`tests/ui/readability.test.ts`). Le
    test lit `tokens.css` et calcule les rapports réels : 7:1 pour le texte
    courant et le texte secondaire, 4,5:1 pour les encres sémantiques, sur
    chacune des trois surfaces de contenu, dans les deux phases. Il vérifie
    aussi que ces surfaces restent quasi neutres (écart entre canaux ≤ 22) et
    que chaque rôle défini le jour l'est aussi la nuit.
88. **Un `var(--x)` sans définition ne lève aucune erreur** : la propriété est
    simplement ignorée. C'est ainsi que le bandeau de fin de saison s'est
    retrouvé transparent, son texte sombre posé sur le dégradé sombre de
    l'écran. Un test recense désormais les variables employées sans définition.
89. **Pictogrammes vectoriels** (`src/ui/Icon.tsx`, 43 tracés). Les émojis
    d'interface changeaient de dessin selon le système, ne se dimensionnaient
    pas et imposaient leur couleur. Les tracés suivent `currentColor`,
    s'alignent sur l'œil de la police et gardent la même graisse partout. Une
    variante pleine sert les étoiles de difficulté.
90. **Les émojis restent, mais à leur place** : célébrations plein écran et
    badges, jamais comme mobilier. Un test scanne écrans et composants et
    refuse tout émoji dans cette couche, ainsi que deux émojis sur une même
    ligne.
91. **Corrections de mise en page révélées par la passe** : les étiquettes
    n'étaient plus en capitales (un libellé de secteur y perdait le double de
    largeur), les lignes de portefeuille rejettent leur bloc d'actions à la
    ligne au lieu d'écraser le nom de l'entreprise, les montants s'alignent en
    chasse fixe, et l'alerte d'échéance ne se déclenche plus au coup d'envoi de
    saison — une échéance sans sanction affichée en rouge dès le premier écran
    apprend au joueur à ignorer l'alerte.
92. **La narration de dossier ne répète plus le nom du client.** L'écran
    d'assiette affichait « Ovalis Nutrition — Ovalis Nutrition cherche à… » ;
    le préfixe ne s'ajoute plus quand la narration commence déjà par le nom.

## Le retour du consultant : ce qui change en deuxième saison

93. **La deuxième saison ne rejoue pas l'arrivée du nouveau.** Le tutoriel
    d'accueil est remplacé par une scène de rentrée dans le bureau de la
    directrice de BU : elle confie un portefeuille à quelqu'un qui a déjà
    déposé une campagne, annonce qu'un des quatre dossiers ne devrait pas être
    signé, et demande un objectif chiffré — le même piège de surpromesse qu'un
    client tendrait, posé cette fois en interne.
94. **Le joueur revient avec une saison au compteur.** Il commençait « Stagiaire
    à 0 XP » en Expert, ce qui contredisait tout le reste. L'échelle de grades a
    été recalibrée sur les gains réels d'une saison (six niveaux au lieu de
    cinq) et la seconde démarre à « Consultant confirmé » — avec encore un
    grade à gagner d'ici l'épilogue, mesuré sur une partie complète.
95. **Deux boîtes mail.** Le cabinet souhaitait la bienvenue et donnait des
    conseils de premier rendez-vous à un consultant de deuxième année. Chaque
    saison a désormais ses messages : accueil et méthode d'un côté ; taux trop
    ronds, agréments qui expirent, relecture d'un dossier junior et préparation
    du contradictoire de l'autre. Deux messages restent communs.
96. **Bug corrigé au passage : la moitié des mails n'apparaissait jamais.**
    Leurs fenêtres de diffusion couvraient vingt-trois semaines, héritées d'un
    calendrier plus long ; la saison en compte six depuis la réduction à une
    heure de jeu. Cinq messages sur huit étaient donc injouables. Les fenêtres
    sont recalées, et un test vérifie que chaque semaine de chaque saison
    délivre au moins un message.
97. **Chapeaux d'écran et quiz d'entrée propres à la saison.** « Alimentez le
    portefeuille » ne décrit pas la posture de la seconde ; le quiz d'entrée
    n'est plus présenté comme un point de départ mais comme une reprise.

## Recommander plutôt qu'interdire, et corriger le quiz d'entrée

98. **La deuxième saison n'est plus verrouillée, elle est conseillée.** Fermer
    l'Expert écartait un cas réel : un consultant déjà en poste à qui l'on fait
    découvrir l'outil n'a pas à rejouer une saison d'apprentissage pour y
    accéder. La carte de saison porte désormais une recommandation explicite —
    « jouez d'abord l'Onboarding, cette saison-ci suppose ses réflexes acquis »
    — et le départ reste ouvert. `isUnlocked` devient `followsAdvice`, la garde
    du magasin disparaît, et le vocabulaire suit partout : plus de cadenas à
    l'accueil, plus de saison masquée en mode libre.
99. **Le quiz de positionnement corrige avant de laisser entrer.** Il mesurait
    sans rien enseigner : le joueur validait cinq réponses et se retrouvait en
    partie sans savoir lesquelles étaient fausses. Un écran de correction
    s'intercale — score, réponse donnée, bonne réponse, et la règle qui
    tranche — avant le bouton d'entrée. Le même écran sert au quiz de sortie,
    juste avant le bilan de saison.
100. **Arbitrage assumé sur la mesure.** Donner les bonnes réponses à l'entrée
     amorce légèrement le quiz de sortie. C'est accepté : les deux séries sont
     jumelles et non identiques — mêmes notions, cas différents — de sorte que
     la sortie mesure un transfert plutôt que le souvenir d'un item. Et un quiz
     de positionnement qui n'explique rien n'est pas un outil pédagogique.
101. **Bug corrigé au passage : la vignette de l'accueil était peinte par-dessus
     le contenu.** `.home::after` couvre toute la scène pour assombrir les
     bords ; les écrans qui réutilisent ce fond — sélection de saison, quiz,
     écran de fin — n'ayant pas de contexte d'empilement propre, leurs panneaux
     recevaient ce dégradé et perdaient du contraste. Le contenu passe
     au-dessus.
