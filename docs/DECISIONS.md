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

## Points à valider (rappel des risques §21)

- **R1/R3** : relecture métier des règles fiscales et des cas d'or par un
  consultant CIR senior ; validation de l'usage de la marque Leyton par la
  Direction Marque.
- **R2** : points [À CONFIRMER] du §9.7 avant implémentation.
