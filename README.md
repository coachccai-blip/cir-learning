# Learn CIR

Serious game de simulation du métier de **consultant CIR** (Crédit d'Impôt
Recherche). Le jour, vous décrochez des clients ; la nuit, vous montez leurs
dossiers ; à la fin de la saison fiscale, l'administration vous dit si vous aviez
raison.

Vous êtes consultant chez **CIR Corp**, un cabinet de conseil fictif.

Site statique React + TypeScript + Vite, jouable depuis une simple URL, sans
compte et sans backend.

> ⚠️ Les cas, entreprises et montants sont **fictifs**. Ce jeu est un outil
> pédagogique et ne constitue **pas un conseil fiscal**. Les barèmes reflètent
> l'état du droit au 20 août 2026 (LF 2026 promulguée le 19 février 2026).

## Démarrer

```bash
npm install
npm run dev        # serveur de développement
npm run test       # tests (moteur fiscal + validation de contenu)
npm run build      # build statique dans dist/
```

## Architecture

```
src/
├── engine/     TypeScript pur, testable, sans React (calcul CIR, dialogue, économie, audit)
├── data/       contenu du jeu (règles, clients, scénarios, cartes, cas, codex, événements)
├── state/      store Zustand + sauvegarde localStorage
├── components/ UI réutilisable (jauges, HUD, toasts)
├── screens/    les 15 écrans E1–E15
├── avatars/    générateur d'avatars SVG paramétriques
└── i18n/        chaînes d'interface (fr-FR)
```

Le moteur fiscal (`src/engine/cir`) lit `src/data/rules/ruleset-2026.json` :
aucune règle n'est codée en dur. Faire évoluer la loi = ajouter un ruleset daté.

## Contenu

- **3 modes** : Découverte, Onboarding (défaut), Expert — même moteur, tolérances
  et aides différentes.
- **6 clients** combinant un archétype comportemental et un profil sectoriel.
- **Boucle jour/nuit** : prospection, découverte, kick-off, suivi, bilan / tri de
  cartes, construction d'assiette, justificatif technique.
- **Contrôle fiscal** de fin de saison, indexé sur vos décisions.
- **Codex** de 30 fiches, badges, leaderboard local (export/import JSON).

Voir `docs/BRIEF.md` (référence fonctionnelle) et `docs/DECISIONS.md` (arbitrages).

## Déploiement

Poussé sur la branche de développement, le workflow `.github/workflows/deploy.yml`
construit et publie sur **GitHub Pages**.
