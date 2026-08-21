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

## Points à valider (rappel des risques §21)

- **R1/R3** : relecture métier des règles fiscales et des cas d'or par un
  consultant CIR senior ; validation de l'usage de la marque Leyton par la
  Direction Marque.
- **R2** : points [À CONFIRMER] du §9.7 avant implémentation.
