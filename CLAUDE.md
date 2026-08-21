# Learn CIR — repère projet

Le document de référence fonctionnel est **`docs/BRIEF.md`**. Toute décision de
gameplay, de données ou de design doit s'y conformer ; si une ambiguïté apparaît,
la lever explicitement avec l'utilisateur et mettre à jour le brief.

## Règles non négociables

- `src/engine/` est du **TypeScript pur**, sans aucun import React, entièrement
  testable sans navigateur. Toute la logique de jeu et de calcul y vit.
- **Aucune règle fiscale codée en dur** : tout vient de
  `src/data/rules/ruleset-2026.json`. Faire évoluer la loi = créer un nouveau
  ruleset daté.
- **Aucune chaîne de texte visible codée en dur** dans un composant : le chrome
  d'UI vit dans `src/i18n/fr.ts`, le contenu de jeu dans `src/data/`.
- Charte de marque **CIR Corp** (entreprise fictive) : `#002C49` dominant, `#FF6633` en accent seulement. Aucune référence à une entreprise réelle dans le contenu.
- TypeScript strict, aucun `any`.

## Commandes

- `npm run dev` — serveur de développement
- `npm run test` — tests unitaires (moteur fiscal + lint de contenu)
- `npm run typecheck` — vérification de types
- `npm run build` — build statique (sortie `dist/`)

## Avertissement in-game

Les cas, entreprises et montants sont fictifs. Le jeu est un outil pédagogique et
ne constitue pas un conseil fiscal. Les barèmes reflètent l'état du droit au
20 août 2026 (LF 2026 promulguée le 19 février 2026).

Voir `docs/DECISIONS.md` pour le journal des arbitrages hors brief.
