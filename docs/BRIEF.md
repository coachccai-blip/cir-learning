# CIR LEARNING — Brief fonctionnel
### Serious game de simulation du métier de consultant CIR (Leyton France)

| | |
|---|---|
| **Version du brief** | 1.0 |
| **Date** | 20 août 2026 |
| **Auteur** | Brief rédigé à destination de Claude Code |
| **Statut** | Prêt pour développement — lot 0 à démarrer |
| **Nom de code** | `cir-learning` |

---

## 0. Comment utiliser ce document avec Claude Code

Ce fichier est le **document de référence unique** du projet.

1. Créer le repo, déposer ce fichier en `docs/BRIEF.md`.
2. Créer un `CLAUDE.md` à la racine contenant : « Le document de référence fonctionnel est `docs/BRIEF.md`. Toute décision de gameplay, de données ou de design doit s'y conformer ; si une ambiguïté apparaît, la lever explicitement avec l'utilisateur et mettre à jour le brief. »
3. Attaquer le **backlog §19**, lot par lot. Un lot = une session Claude Code = une PR.
4. Toute règle fiscale codée en dur est **interdite** : elle vit dans `src/data/rules/ruleset-2026.json` (§9.6).

> ⚠️ **Avertissement à afficher dans le jeu** : les cas, entreprises et montants sont fictifs. Le jeu est un outil pédagogique et ne constitue en aucun cas un conseil fiscal. Les barèmes reflètent l'état du droit au 20 août 2026 (LF 2026 promulguée le 19 février 2026).

---

## 1. Vision

**Pitch (une phrase)** — Vous êtes consultant CIR chez Leyton France : le jour vous décrochez des clients, la nuit vous montez leurs dossiers de crédit d'impôt recherche, et à la fin de la saison fiscale l'administration vous dira si vous aviez raison.

**Fantasme de joueur** — celui du double jeu : le costume commercial le jour, la rigueur scientifique et fiscale la nuit. La tension entre les deux **est** le cœur du jeu, parce qu'elle est le cœur du métier. Promettre trop en rendez-vous crée une dette qu'il faudra payer dans le montage du dossier — et éventuellement devant un vérificateur.

**Ce que le jeu n'est pas** : un simulateur de calcul fiscal, un quiz déguisé, ni un outil de production. C'est un jeu de décision sous contrainte, où les bonnes décisions sont celles d'un bon consultant.

### 1.1 Objectifs pédagogiques (mesurables)

À la fin de la campagne, le joueur doit être capable de :

| # | Objectif | Vérifié par |
|---|---|---|
| OP1 | Distinguer R&D éligible / développement courant / innovation (CII) à partir d'une description projet | Mini-jeu de qualification, quiz de fin de chapitre |
| OP2 | Nommer les critères d'éligibilité : état de l'art, verrou technique, incertitude scientifique, démarche expérimentale, progrès | Dialogue + codex |
| OP3 | Construire une assiette : personnel, forfait de fonctionnement, amortissements, sous-traitance agréée, et appliquer les plafonds | Mini-jeu d'assiette (score d'écart) |
| OP4 | Déduire correctement subventions et avances remboursables | Cas dédiés, écart de calcul |
| OP5 | Mener un kick-off : cadrer le périmètre, identifier les bons interlocuteurs, poser les jalons | Scoring de dialogue |
| OP6 | Gérer un client difficile sans sacrifier la sécurité fiscale | Jauge Relation ET jauge Sécurité conjointes |
| OP7 | Constituer une documentation opposable en cas de contrôle | Résolution de l'événement Contrôle fiscal |
| OP8 | Qualifier un prospect et savoir dire non à une mission non éligible | Événements de prospection, malus « mission toxique » |

### 1.2 Principe de conception directeur

> **Aucun choix « évidemment bon ».** Chaque situation oppose au moins deux valeurs légitimes (relation client / sécurité fiscale / rentabilité). Le joueur apprend l'arbitrage, pas la bonne réponse.

Corollaire : les 4 réponses d'un dialogue ne sont **jamais** « 1 bonne + 3 absurdes ». Le patron est plutôt : 1 optimale, 1 acceptable avec effet de bord, 1 tentante mais risquée, 1 franchement mauvaise mais plausible (c'est ce qu'un junior dirait vraiment).

---

## 2. Public cible

Learn CIR s'adresse aux **nouveaux consultants** (semaines 1 à 4) et à
quiconque veut **découvrir l'activité CIR** : une saison, un seul niveau, les
règles réelles. Tolérance ±5 % sur l'assiette, tous les indices affichés à
l'écran, contrôle fiscal en fin de saison si la sécurité a lâché, échéances
fermes.

> **Arbitrage du 21/08/2026 — le mode Découverte est retiré.** Le brief prévoyait
> un troisième mode, plus permissif, pour les candidats et les écoles. Un mode
> qui supprime le contrôle fiscal et tolère ±15 % d'erreur d'assiette enseigne
> l'inverse du métier.

> **Arbitrage du 24/08/2026 — le mode Expert est retiré à son tour.** La
> deuxième saison doublait le contenu (quatre clients inédits, séance
> contradictoire, interlocuteurs qui embellissent) pour un public qui n'était
> pas celui du jeu. Learn CIR redevient ce qu'il doit être : **un petit jeu
> pour découvrir l'activité, en une saison**. Il ne reste ni sélection de mode,
> ni parcours, ni progression entre saisons. Les sauvegardes qui portaient un
> mode sont relues sans lui.

---

## 3. Cadre fictionnel et personnages

### 3.1 Cadre

Le joueur rejoint l'agence **Leyton France** comme consultant CIR junior. Le jeu couvre une **saison fiscale** : de septembre (prospection et cadrage) à mai (dépôt du 2069-A-SD avec la liasse), puis un épilogue de contrôle.

### 3.2 PNJ internes (l'agence)

| PNJ | Rôle | Fonction ludique |
|---|---|---|
| **Amélie Roux** — Manager | Votre N+1 | Donne les objectifs de chapitre, débriefe en fin de mission, arbitre les conflits relation/sécurité |
| **Karim Bensaïd** — Consultant senior | Mentor technique | Fiches codex, indices sur les cas techniques, ton bienveillant et direct |
| **Sophie Meyer** — Directrice de BU | Pression business | Fixe les objectifs de CA, réagit aux résultats trimestriels |
| **Le vérificateur** — DGFiP | Antagoniste de fin | Apparaît lors de l'événement Contrôle. Neutre, méthodique, implacable sur la preuve |

> Ces PNJ sont **fictifs**. Ne jamais utiliser de vrais noms de collaborateurs Leyton sans accord écrit.

### 3.3 Clients — 6 archétypes

Chaque client combine **1 archétype** (comportement en dialogue) + **1 profil d'entreprise** (difficulté technique du dossier). Les deux axes sont indépendants : un client aimable peut avoir un dossier piégeux.

| Code | Archétype | Comportement | Registre de réponse qui marche | Piège |
|---|---|---|---|---|
| `SCEPTIC` | Le sceptique | A entendu parler de redressements, doute du dispositif | Preuve, références, cadre légal cité | Le rassurer trop vite = perte de crédibilité |
| `RUSHED` | Le pressé | 20 min chrono, coupe la parole, veut un chiffre | Synthèse, chiffre encadré, jalons courts | Donner un montant sans réserve = dette de promesse |
| `GEEK` | Le techos passionné | Part dans le détail technique, adore son sujet | Curiosité sincère, reformulation technique, questions ouvertes | Se laisser noyer = kick-off qui déborde, PA perdus |
| `CFO` | Le DAF méfiant | Veut du cash, des délais, un risque quantifié | Chiffres, trésorerie, calendrier de remboursement, risque assumé | Minimiser le risque = bombe à retardement au contrôle |
| `DREAMER` | L'optimiste irréaliste | « Tout ce qu'on fait c'est de la R&D » | Pédagogie ferme, recadrage bienveillant, exemples contrastés | Dire oui à tout = assiette gonflée = redressement |
| `SILENT` | Le taiseux | Répond par oui/non, ne documente rien | Questions fermées puis ouvertes, relances écrites, cadrage des livrables | Renoncer à collecter = dossier non opposable |

### 3.4 Profils d'entreprise (difficulté du dossier)

| Code | Secteur | Difficulté technique | Notions travaillées |
|---|---|---|---|
| `SAAS` | Éditeur logiciel B2B | ★★☆ | Frontière R&D / développement courant, état de l'art logiciel |
| `INDUS` | Mécanique de précision | ★★☆ | Amortissements, prototypes, frontière CIR/CII |
| `BIOTECH` | Biotech pré-clinique | ★★★ | Sous-traitance agréée, subventions Bpifrance, docteurs |
| `AGRI` | Agroalimentaire | ★☆☆ | Cas d'école : R&D produit, essais, plans d'expérience |
| `GREENTECH` | Cleantech / matériaux | ★★★ | Avances remboursables, consortium, entités liées |
| `SERVICES` | ESN / conseil | ★☆☆ | Cas majoritairement **non éligible** → apprendre à dire non |

---

## 4. Boucle de jeu

### 4.1 Structure temporelle

```
SAISON (campagne) = 9 CHAPITRES = ~24 CYCLES
                    │
CHAPITRE = 2 à 4 CYCLES + 1 débrief manager
                    │
CYCLE = PHASE JOUR (5 PA) → TRANSITION → PHASE NUIT (4 PA) → BILAN DE CYCLE
```

Un cycle représente une semaine de travail. La date en jeu avance d'une semaine par cycle, sur un vrai calendrier fiscal (§4.4).

### 4.2 Points d'action (PA)

- **Jour** : 5 PA de base. **Nuit** : 4 PA de base.
- Chaque activité coûte 1 à 3 PA (§6, §7).
- Les PA non dépensés ne se reportent pas, **mais** finir un cycle avec ≥ 2 PA restants la nuit donne +5 Énergie.

### 4.3 Énergie et fatigue

Jauge `energy` de 0 à 100, départ 100.

| Événement | Effet |
|---|---|
| Fin de nuit avec 0 PA restant (nuit « à fond ») | −12 Énergie |
| Nuit normale | −6 Énergie |
| Action « Heures sup » (+2 PA nuit, hors budget) | −20 Énergie |
| Week-end (fin de cycle) | +10 Énergie |
| Action « Souffler » (1 PA jour) | +15 Énergie |
| Débrief manager réussi | +8 Énergie |

**Effets de seuil** (visibles pour le joueur) :

| Énergie | État | Effet mécanique |
|---|---|---|
| 80-100 | En forme | +1 PA jour |
| 50-79 | Normal | — |
| 25-49 | Fatigué | 1 option de dialogue sur 4 est masquée (grisée « vous n'y pensez pas ») ; −10 % de précision affichée dans le mini-jeu d'assiette |
| 0-24 | Épuisé | −1 PA jour ET nuit ; malus −15 % sur tous les scores de dialogue ; risque d'erreur automatique dans l'assiette |

> **Intention pédagogique** : le burn-out de saison fiscale est un vrai risque du métier. Le jeu le rend lisible sans le moraliser.

### 4.4 Calendrier fiscal et deadlines

Le calendrier est un fichier de contenu (`src/data/calendar.json`), pas du code. Événements datés d'une saison type (exercice clos au 31/12) :

| Semaine (cycle) | Date en jeu | Événement | Conséquence si raté |
|---|---|---|---|
| 1 | 1ᵉʳ sept. | Ouverture de saison — objectifs annuels de Sophie | — |
| 3 | 15 sept. | Deadline : remise des 2 premières propositions commerciales | −1 client au portefeuille |
| 6 | 6 oct. | Kick-off obligatoire du client A | Client A quitte le portefeuille, −CA |
| 9 | 27 oct. | Point d'étape trimestriel (CA) | Malus XP, dialogue tendu avec Sophie |
| 12 | 17 nov. | Collecte des temps passés (feuilles de temps) | Assiette personnel plafonnée à 80 % de sa valeur réelle |
| 15 | 8 déc. | Clôture de l'exercice client | Verrouille les dépenses collectables |
| 17 | 5 janv. | Fenêtre de rescrit fiscal (optionnelle) | Opportunité perdue de sécuriser un cas limite |
| 20 | 2 mars | Revue qualité interne des dossiers | Erreurs non corrigées passent en dossier final |
| 22 | 30 avril | **Dépôt du 2069-A-SD** avec la liasse fiscale | Dossier non déposé = 0 CA sur ce client, gros malus |
| 23 | 15 mai | Demande de remboursement immédiat (PME) | Le client attend l'imputation, jauge Relation −20 |
| 24 | Épilogue | Résultat + éventuel contrôle fiscal | Score final |

> Le dépôt du 2069-A-SD se fait avec la déclaration de résultats (mi-mai pour les exercices clos au 31/12). Le calendrier ci-dessus est une **compression pédagogique** assumée : le dire dans le codex.

### 4.5 Bilan de cycle

Écran de fin de cycle, toujours dans cet ordre :

1. Δ des 3 jauges métier, avec la cause de chaque variation (« +8 Sécurité : vous avez exigé les comptes rendus d'essais »).
2. CA encaissé / facturable.
3. XP gagné, barre de grade.
4. Fiches codex débloquées.
5. Alerte deadline à J-2 le cas échéant.

---

## 5. Systèmes de score

### 5.1 Les trois jauges métier (0-100, départ 50)

| Jauge | Nom en jeu | Ce qu'elle mesure | Monte quand | Descend quand |
|---|---|---|---|---|
| `relation` | **Relation client** | Confiance et satisfaction du portefeuille | Écoute active, transparence, respect des jalons, pédagogie | Promesses non tenues, jargon, retards, pression commerciale |
| `security` | **Sécurité fiscale** | Robustesse des dossiers face à un contrôle | Preuves collectées, périmètre resserré, doutes tracés, rescrit | Dépenses gonflées, absence de justificatif, verrou technique non caractérisé, subvention non déduite |
| `profitability` | **Rentabilité** | Marge de la mission | Efficacité, réutilisation de méthodo, cadrage du périmètre | Sur-service, allers-retours, temps passé non facturé |

**Jauge de portefeuille = moyenne pondérée** des jauges par client (pondérée par le CA du client).

### 5.2 CA et business

- Modèle d'honoraires : **au succès**, pourcentage du CIR obtenu (paramétrable, défaut 20 % HT). Un client peut négocier à la baisse (12-18 %) — arbitrage Relation / Rentabilité.
- KPI suivis : CA signé, CA encaissé, taux de conversion prospect→client, panier moyen, taux d'attrition.
- Objectif de saison : **300 000 € de CA signé** et **≥ 4 clients déposés**.

> ⚠️ Point à vérifier avant implémentation : les dépenses de conseil facturées pour l'obtention du CIR sont, au-delà d'un seuil, **déductibles de l'assiette** du client (CGI art. 244 quater B, III). Si confirmé, en faire un mini-système : plus le consultant facture cher, plus l'assiette du client se réduit. C'est un excellent moment pédagogique. Voir §9.7.

### 5.3 XP, grades, badges

**XP** gagné par : bonne réponse de dialogue (10-50), assiette juste (100-300 selon difficulté), dossier déposé (500), contrôle fiscal passé (800), fiche codex lue (5).

| Grade | XP requis | Déblocage |
|---|---|---|
| Stagiaire | 0 | — |
| Consultant Junior | 800 | 2ᵉ client simultané |
| Consultant | 2 200 | Mini-jeu de rescrit fiscal |
| Consultant Senior | 4 500 | 3ᵉ client, action « Déléguer » |
| Manager | 8 000 | Grade le plus élevé de la saison |

**Badges** (≈ 20, chacun = 1 notion maîtrisée) — exemples :

| Badge | Condition |
|---|---|
| *Verrou levé* | Caractériser correctement 5 verrous techniques |
| *Le mot juste* | 10 dialogues d'affilée sans jargon face à un profil non technique |
| *Non, c'est non* | Refuser 3 missions non éligibles |
| *Assiette au gramme près* | 3 assiettes exactes à ±1 % |
| *Rien à déclarer* | Passer un contrôle fiscal sans aucun rappel |
| *Le sceptique converti* | Signer un `SCEPTIC` depuis une humeur < 20 |
| *Nuit blanche… une seule* | Terminer la saison sans jamais descendre sous 25 d'Énergie |

### 5.4 Score final et grade de saison

```
Score = 0.30 × Sécurité + 0.25 × Relation + 0.20 × Rentabilité
      + 0.15 × (CA / objectif, plafonné à 1.2)
      + 0.10 × (précision moyenne des assiettes)
      − pénalités (deadlines ratées, redressements)
```

Grades : **S / A / B / C / D**. Le grade S exige d'avoir passé le contrôle fiscal sans rappel.

### 5.5 Leaderboard local

- 100 % côté navigateur (`localStorage`), segmenté par mode de difficulté.
- Le joueur saisit un pseudo **en fin de partie seulement** (pas de compte, pas de collecte de données personnelles).
- Export/import du classement en JSON pour qu'un formateur puisse agréger une promo manuellement.

---

## 6. Phase JOUR — le costume de commercial

**Objectif** : alimenter le portefeuille et entretenir la relation.

### 6.1 Écran

Un bureau de jour : agenda de la semaine (les créneaux = PA), CRM (liste prospects/clients), boîte mail, téléphone.

### 6.2 Activités

| Activité | Coût PA | Description | Effets |
|---|---|---|---|
| **Prospection téléphonique** | 1 | 1 mini-dialogue court (3 nœuds) avec un prospect généré | +prospect qualifié ou refus |
| **Rendez-vous découverte** | 2 | Dialogue complet (8-12 nœuds) | Qualification du prospect, estimation de CIR potentiel |
| **Rédaction de proposition** | 1 | Choix de taux d'honoraires + périmètre + engagement | Détermine CA et attentes du client |
| **Kick-off de mission** | 2 | Dialogue long : cadrage, interlocuteurs, jalons, collecte | Détermine la qualité de départ du dossier (bonus/malus assiette) |
| **Suivi de mission** | 1 | Point d'étape : relance des livrables, gestion des irritants | Débloque les pièces manquantes pour la nuit |
| **Bilan de mission** | 2 | Restitution du CIR calculé, gestion des écarts vs promesse | Fixe la Relation finale, ouvre l'upsell |
| **Réseautage / événement** | 2 | Salon, webinar, recommandation | 2-3 prospects tièdes, +Relation portefeuille |
| **Souffler** | 1 | Pause | +15 Énergie |

### 6.3 Système de promesse (mécanique signature)

Toute estimation chiffrée donnée en rendez-vous crée un objet `Promise` :

```
Promise { clientId, montantAnnoncé, fourchette: [min, max], cycleDePromesse }
```

Au bilan de mission, l'écart entre le CIR réellement calculé et la promesse produit :

| Écart | Effet Relation |
|---|---|
| Dans la fourchette annoncée | +15 |
| Réel < min, écart < 15 % | −10 |
| Réel < min, écart ≥ 15 % | −35, risque de churn |
| Réel > max | +5 (bonne surprise, mais crédibilité de l'estimation entamée : −5 Rentabilité, le client négociera les honoraires) |

> **Leçon** : annoncer une fourchette prudente coûte peu ; annoncer un chiffre précis trop tôt coûte cher.

---

## 7. Phase NUIT — le costume de consultant technique

**Objectif** : transformer la matière collectée en dossier CIR défendable.

### 7.1 Écran

Bureau de nuit (palette sombre, gradient `#002235 → #002C49`) : dossiers ouverts, tableur d'assiette, éditeur de justificatif technique, codex.

### 7.2 Activités

| Activité | Coût PA | Mini-système |
|---|---|---|
| **Qualification d'éligibilité** | 2 | Tri de cartes (§7.3) |
| **Construction de l'assiette** | 2 | Tableur guidé (§7.4) |
| **Rédaction du justificatif technique** | 2 | Construction argumentaire (§7.5) |
| **Analyse documentaire** | 1 | Lecture de pièces client, extraction d'indices |
| **Contrôle qualité croisé** | 1 | Relecture d'un dossier : détecter 3 erreurs sur 6 candidates |
| **Préparation de rescrit** | 2 | Rédiger la question au fisc (débloqué grade Consultant) |
| **Veille & formation** | 1 | +XP, débloque une fiche codex |
| **Heures sup** | 0 | +2 PA immédiats, −20 Énergie |

### 7.3 Mini-jeu — Qualification d'éligibilité

Le joueur reçoit **8 à 12 cartes « travaux »** décrivant des activités réelles du client (ex. « portage de l'application sur Android », « conception d'un algorithme de compression pour lever la latence < 20 ms sur réseau contraint », « mise à jour du site vitrine »).

Il les trie dans 4 colonnes : **R&D éligible CIR** / **Innovation (CII)** / **Non éligible** / **À investiguer**.

- Chaque carte porte des indices : présence d'un verrou, incertitude sur le résultat, état de l'art documenté, démarche expérimentale, nouveauté pour l'entreprise seulement (→ pas R&D).
- **Feedback immédiat carte par carte** dès validation, avec renvoi à la fiche codex correspondante.
- Placer une carte non éligible dans « R&D » gonfle l'assiette → **Sécurité −**, et sera sanctionné au contrôle.
- « À investiguer » n'est jamais faux mais coûte 1 PA de suivi client au cycle suivant : c'est l'option prudente et coûteuse. Excellente pédagogie.

### 7.4 Mini-jeu — Construction de l'assiette

Un tableur simplifié, lignes à remplir. Le joueur choisit **quoi retenir** et **à quelle hauteur** ; le moteur calcule.

Postes à traiter :

1. **Dépenses de personnel** — chercheurs et techniciens de recherche, au prorata du temps R&D (le joueur applique les taux d'affectation issus des feuilles de temps collectées le jour).
2. **Forfait de fonctionnement** — calculé automatiquement mais le joueur doit **savoir** ce qu'il recouvre (question de contrôle).
3. **Amortissements** des immobilisations affectées à la R&D.
4. **Sous-traitance agréée** — vérifier l'agrément MESR, appliquer les plafonds et la limite proportionnelle.
5. **Déductions** — subventions publiques, avances remboursables.

Chaque poste comporte **1 à 3 pièges** contextualisés (un salarié à 100 % R&D alors que le compte rendu montre 40 % de support ; un sous-traitant sans agrément ; une subvention Bpifrance oubliée ; une facture de sous-traitance de 3ᵉ rang).

**Scoring** : `précision = 1 − |CIR_joueur − CIR_juste| / CIR_juste`, comparée à la tolérance du mode (§2). Le feedback détaille **poste par poste** l'écart et sa cause.

### 7.5 Mini-jeu — Rédaction du justificatif technique

Le joueur assemble un argumentaire en choisissant, pour chaque bloc, parmi 4 formulations :

| Bloc | Ce qui est évalué |
|---|---|
| **État de l'art** | Sources réelles citées vs affirmation vague |
| **Verrou technique** | Verrou caractérisé et mesurable vs « c'était difficile » |
| **Incertitude scientifique** | Incertitude sur l'aboutissement vs incertitude de planning |
| **Démarche expérimentale** | Itérations, hypothèses, protocoles, résultats négatifs conservés |
| **Résultat et progrès** | Progrès par rapport à l'état de l'art vs nouveauté interne |

Le score de ce mini-jeu **pondère fortement** la résolution du contrôle fiscal (§8.5).

---

## 8. Moteur de dialogue

### 8.1 Structure

Un **scénario** = un graphe de nœuds. Chaque nœud = une réplique PNJ + 4 choix. Pas de branches infinies : le graphe **converge** tous les 3-4 nœuds vers un nœud pivot (maintenabilité du contenu).

### 8.2 Les 4 choix — patron obligatoire

| Rôle | Étiquette interne | Effet type |
|---|---|---|
| A | `optimal` | +Relation, +Sécurité, coût en temps |
| B | `acceptable` | Gain sur une jauge, effet de bord sur une autre |
| C | `tempting` | Gain court terme (Relation ou Rentabilité), dette différée (Sécurité, Promesse) |
| D | `poor` | Erreur réaliste de junior : jargon, promesse non tenue, complaisance |

**L'ordre est randomisé** à l'affichage (seed stockée pour la reproductibilité du debrief).

### 8.3 Humeur et mémoire relationnelle

Chaque client porte :

```
mood        : 0-100, initialisée par l'archétype (SCEPTIC 35, DREAMER 75…)
trust       : 0-100, mémoire longue, persiste d'un RDV à l'autre
flags       : ["a_ete_coupe", "promesse_chiffree_S6", "n_a_pas_recu_le_CR"]
```

- **Humeur** : varie à chaque choix (±3 à ±15), modulée par l'archétype. Chaque archétype définit une **table de sensibilité** par registre de réponse (`preuve`, `synthese`, `empathie`, `technique`, `fermete`, `commercial`).
- **Seuils d'humeur** : < 20 → le client se ferme (options de dialogue perdues, refus de fournir des pièces) ; > 80 → il s'ouvre (révèle un projet R&D supplémentaire = CA additionnel).
- **Confiance** : mémoire d'un rendez-vous à l'autre. Les `flags` sont **cités explicitement** par le PNJ au RDV suivant (« La dernière fois vous m'aviez dit 180 000 € »). C'est ce qui rend la relation crédible.

### 8.4 Feedback immédiat

Après chaque choix, un panneau apparaît **avant** la réplique suivante :

```
┌─ Ce qui s'est passé ─────────────────────────────┐
│  Relation −8   Sécurité +12   Rentabilité −3     │
│                                                   │
│  Vous avez refusé de chiffrer avant d'avoir vu   │
│  les feuilles de temps. Marc l'a mal pris — mais │
│  vous venez d'éviter une promesse intenable.     │
│                                                   │
│  💡 Une estimation donnée en découverte engage    │
│     autant qu'un chiffre écrit.                   │
│                                                   │
│  📄 Fiche débloquée : « Estimer sans s'engager »  │
└───────────────────────────────────────────────────┘
```

Trois niveaux obligatoires : **quoi** (les deltas), **pourquoi** (la logique métier), **la règle générale** (transférable). Jamais de « Bravo ! » seul.

### 8.5 Événement Contrôle fiscal (épilogue)

Déclenché sur les dossiers dont la **Sécurité < 60**. Une saison bien tenue s'achève sans visite — c'est la récompense. Format : dialogue de 10 nœuds face au vérificateur, où **chaque question porte sur une décision réellement prise par le joueur** pendant la partie.

- Si le joueur a collecté la pièce → l'option « Voici le compte rendu d'essais du 14 mars » est **disponible**.
- Sinon → seules des options faibles sont proposées. La partie est déjà jouée : le contrôle ne fait que révéler la qualité du travail.

Résultat : `CIR validé / rappel partiel / rappel total + intérêts`, avec impact sur le CA (honoraires au succès remboursés) et la Relation.

> C'est le moment pédagogique le plus fort du jeu : **la preuve se constitue au moment des travaux, pas au moment du contrôle.**

---

## 9. Modèle fiscal simulé — règles applicables

> **Sources et statut de vérification en §22.** Toutes les valeurs ci-dessous sont externalisées dans `ruleset-2026.json`.

### 9.1 Taux (CIR, métropole, 2026)

| Assiette | Taux |
|---|---|
| Jusqu'à 100 M€ | **30 %** |
| Au-delà de 100 M€ | **5 %** |
| DOM | 50 % |

### 9.2 Assiette — postes retenus

| Poste | Règle |
|---|---|
| **Personnel de recherche** | Salaires + charges sociales des chercheurs et techniciens, au prorata du temps affecté à la R&D |
| **Forfait de fonctionnement** | **40 %** des dépenses de personnel retenues **+ 75 %** des dotations aux amortissements retenues |
| **Amortissements** | Dotations des immobilisations affectées à la R&D |
| **Sous-traitance agréée** | Voir §9.3 |

### 9.3 Sous-traitance

- **Agrément MESR obligatoire pour tous les sous-traitants** (publics comme privés) depuis le 1ᵉʳ janvier 2022. Sans agrément → dépense non éligible.
- **Limite proportionnelle** : la sous-traitance retenue ne peut excéder **3 ×** le total des autres dépenses éligibles. *Appliquée en premier.*
- **Plafond global annuel** : **2 M€** s'il existe un lien de dépendance entre donneur d'ordre et sous-traitant ; **10 M€** en l'absence de lien.
- **Pas de forfait de fonctionnement** sur la sous-traitance.
- **Cascade limitée** : la re-sous-traitance au 3ᵉ rang n'est pas éligible.
- Le sous-traitant agréé doit déduire de sa propre assiette les sommes reçues (pas de double emploi).

### 9.4 Déductions

- **Subventions publiques** : déduites de l'assiette, à hauteur de la quote-part affectée aux projets R&D.
- **Avances remboursables** : déduites à l'octroi, réintégrées au fur et à mesure du remboursement.

### 9.5 Postes SUPPRIMÉS — pièges volontaires du jeu

Depuis la loi de finances 2025, pour les dépenses exposées **à compter du 15 février 2025** :

| Poste | Statut |
|---|---|
| Frais de brevets et COV (prise, maintenance, défense) | ❌ **Supprimé** |
| Veille technologique | ❌ **Supprimé** |
| Majoration « jeune docteur » (doublement d'assiette) | ❌ **Supprimée** — non rétablie par la LF 2026 (promulguée le 19 février 2026) |
| Forfait de fonctionnement | Réduit de 43 % → **40 %** |

> ⚠️ **Mécanique de jeu à en tirer** : dans plusieurs cas, le client (ou un collègue mal informé) proposera d'intégrer des frais de brevet ou de la veille. Accepter = gonflement d'assiette = redressement au contrôle. Le salaire d'un jeune docteur reste éligible **au taux normal**, sans majoration : cette nuance est un excellent piège.

### 9.6 CII (crédit d'impôt innovation) — pour l'articulation

| Paramètre | Valeur |
|---|---|
| Bénéficiaires | PME uniquement (< 250 salariés, CA < 50 M€ ou bilan < 43 M€) |
| Assiette | Conception de prototypes / installations pilotes de nouveaux produits |
| Taux métropole | **20 %** |
| Plafond de dépenses | **400 000 € / an** → crédit max **80 000 €** |
| DOM | 60 % — Corse : 40 % (< 50 sal.) / 35 % (50-250 sal.) |
| Échéance du dispositif | **31 décembre 2027** |
| Cumul | ❌ Une même dépense ne peut être valorisée en CIR **et** en CII |

### 9.7 Déclaration

- Formulaire **2069-A-SD**, déposé avec la déclaration de résultats.
- **Remboursement immédiat** du solde non imputé pour les PME.
- États annexes descriptifs des travaux au-delà de certains seuils de dépenses → **[À CONFIRMER]** avant implémentation (seuils de 10 M€ / 100 M€ à revalider sur le BOFiP).
- Déductibilité des **dépenses de conseil** pour l'obtention du CIR au-delà d'un seuil → **[À CONFIRMER]** (CGI 244 quater B III). Si confirmé : implémenter comme mécanique de §5.2.
- **Rescrit CIR** : sécurisation a priori auprès de l'administration, délai de réponse et effet du silence à revalider → **[À CONFIRMER]**.

### 9.8 Structure du ruleset

```jsonc
// src/data/rules/ruleset-2026.json
{
  "version": "2026.1",
  "effectiveFrom": "2026-01-01",
  "legalBasis": "LF 2026 promulguée le 19/02/2026 ; LF 2025 art. 55",
  "cir": {
    "rates": [
      { "upTo": 100000000, "rate": 0.30 },
      { "upTo": null,      "rate": 0.05 }
    ],
    "ratesDom": [{ "upTo": null, "rate": 0.50 }],
    "operatingAllowance": { "onPersonnel": 0.40, "onAmortization": 0.75 },
    "subcontracting": {
      "agreementRequired": true,
      "proportionalCapMultiplier": 3,
      "annualCapRelated": 2000000,
      "annualCapUnrelated": 10000000,
      "maxTier": 2,
      "operatingAllowanceApplies": false
    },
    "removedItems": [
      { "id": "patents",           "removedFrom": "2025-02-15" },
      { "id": "techWatch",         "removedFrom": "2025-02-15" },
      { "id": "youngDoctorBonus",  "removedFrom": "2025-02-15" }
    ],
    "deductions": ["publicGrants", "repayableAdvances"]
  },
  "cii": {
    "rate": 0.20, "expenseCap": 400000, "smeOnly": true, "expiresOn": "2027-12-31"
  }
}
```

Le moteur de calcul lit ce fichier. **Créer un `ruleset-2027.json` doit suffire** à faire évoluer le jeu quand la loi change.

---

## 10. Contenu de la v1

### 10.1 Volume cible

| Élément | Quantité v1 | Quantité v2 |
|---|---|---|
| Clients jouables | 6 (1 par profil §3.4) | 12 |
| Scénarios de dialogue | 24 (4 par client : découverte, kick-off, suivi, bilan) | 48 |
| Nœuds de dialogue | ~240 (≈10 par scénario) | ~500 |
| Cartes de qualification | 90 (15 par client) | 180 |
| Cas d'assiette | 6 complets + 12 variantes | 30 |
| Fiches codex | 35 | 60 |
| Événements aléatoires | 20 | 40 |
| Prospects génériques (prospection tél.) | 30 modèles + variables | 60 |

### 10.2 Campagne — 9 chapitres

| Ch. | Titre | Client focus | Notion pédagogique dominante | Objectif |
|---|---|---|---|---|
| 1 | *Bienvenue chez Leyton* | — | Vocabulaire, rôle du consultant, déroulé d'une mission | Tutoriel : 1 jour + 1 nuit guidés |
| 2 | *Le premier appel* | `AGRI` / `DREAMER` | Qualifier un prospect, ce qui est R&D et ce qui ne l'est pas | Signer 1 client |
| 3 | *Cadrer, c'est protéger* | `AGRI` | Kick-off : interlocuteurs, périmètre, collecte | Kick-off réussi (score ≥ 70) |
| 4 | *La ligne de partage* | `SAAS` / `GEEK` | R&D vs développement courant vs CII | Qualification ≥ 85 % de justesse |
| 5 | *Le chiffre qui engage* | `SAAS` / `RUSHED` | Estimer sans promettre, construire l'assiette | Assiette dans la tolérance |
| 6 | *Argent public* | `BIOTECH` / `CFO` | Subventions, avances remboursables, sous-traitance agréée | Déductions exactes |
| 7 | *Savoir dire non* | `SERVICES` / `DREAMER` | Refuser une mission non éligible, préserver la relation | Refuser sans perdre le contact |
| 8 | *La course au dépôt* | Tout le portefeuille | Gestion des deadlines, priorisation, qualité sous pression | Déposer ≥ 4 dossiers dans les délais |
| 9 | *Le vérificateur* | Le dossier le plus faible | Documentation opposable, preuve | Contrôle fiscal + score final |

> Chapitre 7 est délibérément **le chapitre où on peut gagner en perdant du CA**. Il faut qu'un joueur qui refuse la mission finisse mieux classé qu'un joueur qui l'accepte.

### 10.3 Mode libre

Accessible dès le chapitre 3 terminé. Le joueur choisit :

- **Un cas isolé** : rejouer n'importe quel RDV, n'importe quelle assiette, n'importe quel contrôle, sans conséquence sur la campagne.
- **Une saison libre** : portefeuille tiré aléatoirement (3 à 6 clients, archétypes et profils mélangés), une saison complète, pas de scénarisation. C'est le mode de rejouabilité et le mode leaderboard principal.

> **Arbitrage du 21/08/2026 — « Jour / Nuit » devient « Relation client /
> Technique ».** Le brief nomme les deux phases *jour* et *nuit*. La métaphore
> laisse entendre que le métier se fait la nuit, ce qui envoie le mauvais
> message à des consultants en intégration. Les deux phases gardent leur
> alternance, leur thème visuel et leur budget d'actions, mais s'appellent
> désormais **Relation client** (🤝) et **Technique** (🔬). Les états internes
> du moteur (`DAY` / `NIGHT`) sont inchangés : ce sont des identifiants, pas du
> texte affiché.

> **Arbitrage du 21/08/2026 — une partie tient en une heure.** La saison
> passe de 24 à **6 cycles**, et le budget d'actions de 432 à **66 PA**. Le
> calcul est simple : une action coûte au joueur ~1,5 minute, donc une heure de
> jeu borne la saison à une soixantaine d'actions. À 24 cycles, le contenu écrit
> n'occupait que 19 % du budget et les 81 % restants se remplissaient de
> répétitions. Le portefeuille dépasse maintenant volontairement la capacité :
> six clients pour ce qu'il faut de PA pour en mener trois ou quatre, et un
> dossier laissé deux cycles sans nouvelles part à la concurrence. Choisir qui
> l'on sert devient une décision de jeu.

> **Arbitrage du 21/08/2026 — pas de défi quotidien.** Le brief prévoyait
> initialement un défi quotidien seedé par la date. Learn CIR est un **parcours
> d'onboarding qui se joue d'une traite** : une saison complète, du premier
> appel au contrôle fiscal. Un rendez-vous quotidien suppose un joueur qui
> revient chaque jour, ce qui n'est pas la situation d'un consultant en cours
> d'intégration. Le mode libre se réduit donc au fait de **rejouer une saison
> entière** avec un autre portefeuille.

### 10.4 Événements aléatoires (1 chance sur 3 par cycle)

Exemples à décliner : le CTO référent démissionne / une subvention Bpifrance arrive en cours de mission / un concurrent (autre cabinet) approche votre client / le client demande un chiffre pour son banquier demain matin / un collègue vous demande une relecture (coût PA, gain Relation interne + XP) / les feuilles de temps sont manifestement fausses / le commissaire aux comptes pose une question sur le CIR provisionné.

Chaque événement = 1 nœud de dialogue à 4 choix. Format identique aux scénarios : **pas de moteur séparé**.

---

## 11. Codex et fiches mémo

Bibliothèque consultable à tout moment (raccourci `C`), enrichie par le jeu.

**Catégories** :

1. **Le dispositif** — objet du CIR, taux, bénéficiaires, articulation CIR/CII, calendrier déclaratif
2. **Éligibilité** — état de l'art, verrou, incertitude, démarche expérimentale, progrès, R&D vs innovation vs développement courant
3. **L'assiette** — chaque poste, une fiche ; les postes supprimés, une fiche « ce qui n'est plus éligible depuis 2025 »
4. **Sous-traitance** — agrément, plafonds, cascade, entités liées
5. **Financements publics** — subventions, avances remboursables, cumuls
6. **Posture consultant** — conduite d'un kick-off, questions à poser, gestion d'un client difficile, dire non, restituer un chiffre décevant
7. **Contrôle et sécurisation** — pièces à constituer, rescrit, déroulé d'un contrôle

**Format d'une fiche** : titre, 3 à 6 lignes maximum, un exemple concret tiré du jeu, la source (article du CGI / BOFiP / guide MESR), un lien vers le cas jouable qui l'illustre.

**Règle rédactionnelle** : une fiche tient sur un écran de téléphone. Si elle déborde, la scinder.

---

## 12. Direction artistique

### 12.1 Parti pris

**Hybride bureau + portraits**, professionnel et épuré, sous charte Leyton V01.2026.

- **Jour** : interface claire, fond blanc/gris très clair, bleu `#002C49` dominant, orange `#FF6633` uniquement pour les accents (bouton principal, alerte deadline, badge débloqué).
- **Nuit** : inversion — fond en gradient `#002235 → #002C49`, texte blanc, accents orange. Même grille, même composants : c'est **un thème**, pas un second design.
- La transition jour→nuit est animée (600 ms, fondu de gradient + bascule des tokens de couleur). C'est la signature visuelle du jeu.

### 12.2 Charte Leyton (source : guidelines V01.2026)

```css
:root {
  --leyton-blue-main:   #002C49;
  --leyton-blue-dark:   #002235;
  --leyton-orange-main: #FF6633;
  --leyton-orange-dark: #C34024;
  --leyton-font-title:  "Avenir Next", "Avenir", Helvetica, Arial, sans-serif;
  --leyton-font-body:   Montserrat, "Helvetica Neue", Arial, sans-serif;
}
```

**Règle d'or à respecter partout** : le bleu domine, l'orange n'accentue que des éléments secondaires. Ne jamais utiliser les couleurs complémentaires de Business Unit (`#FBB61A`, `#7EBD4B`, `#EE6784`, `#A038BD`, `#29B8C9`) sans validation d'un référent — **sauf** pour un usage fonctionnel neutre : les 3 jauges métier. Proposition :

| Jauge | Couleur | Justification |
|---|---|---|
| Relation client | `#29B8C9` (cyan) | Neutre, lisible sur les deux thèmes |
| Sécurité fiscale | `#7EBD4B` → `#C34024` (gradient selon la valeur) | Vert = sûr, rouge foncé = danger |
| Rentabilité | `#FF6633` | L'accent de marque, réservé au business |

→ **À faire valider par un référent Leyton** avant le lot 3. Fallback si refus : décliner les trois jauges en opacités du bleu + orange pour la seule jauge critique.

**Typographie** : Montserrat est disponible gratuitement sur Google Fonts — **l'auto-héberger** (`/public/fonts/`) plutôt que d'appeler Google Fonts, pour que le jeu fonctionne hors ligne et sans requête tierce. Avenir Next n'étant pas librement distribuable, prévoir un fallback assumé : `"Avenir Next", "Avenir", "Nunito Sans", Helvetica, sans-serif`, avec Nunito Sans auto-hébergé comme substitut géométrique proche.

**Logo** : les fichiers logo ne sont pas fournis. Deux options — (a) demander les SVG à `designteam@leyton.com`, (b) branding textuel « LEYTON » en Avenir Next Heavy avec le « O » traité en cercle ouvert orange, en respectant l'interdiction de rotation/déformation et la zone de protection de 1× la taille du O. **Ne pas recréer le logo à main levée.**

### 12.3 Personnages — système d'avatars vectoriels

Aucun asset illustré n'est fourni et le jeu doit rester un site statique léger. Solution : **avatars SVG paramétriques générés à la volée**, style flat professionnel épuré, monochrome bleu Leyton + un accent orange.

```
Avatar = composition de couches SVG :
  silhouette (buste, 4 variantes) 
+ coiffure (10 variantes)
+ traits du visage (6 variantes, minimalistes : yeux + sourcils + bouche)
+ tenue (6 variantes : costume, chemise, blouse labo, polo, pull, veste technique)
+ accessoire optionnel (lunettes, badge, casque, écharpe)
+ palette (déclinaisons d'opacité du bleu Leyton)
```

- **Expressions** : 5 états (neutre, satisfait, agacé, fermé, enthousiaste) pilotés par la jauge d'humeur — seuls les sourcils et la bouche changent. C'est ce qui fait vivre les dialogues à coût nul.
- Génération **déterministe** : `hash(clientId) → combinaison`, pour qu'un client ait toujours le même visage.
- Diversité par construction : la table de variantes doit couvrir des morphologies, coiffures, tons de peau et âges variés. Ne pas produire un casting uniforme.
- Poids cible : < 8 ko par avatar rendu, aucun binaire.

> Alternative si un budget design existe : commander 12 portraits illustrés (6 clients + PNJ internes) × 5 expressions au format WebP. Le système d'avatars SVG reste alors le fallback pour les prospects générés.

### 12.4 Motion & feedback

- Deltas de jauges : compteur animé 400 ms + micro-shake sur variation négative forte.
- Panneau de feedback : slide-up 250 ms, jamais de modale bloquante.
- Déblocage de badge : toast en haut à droite, 3 s, son court optionnel (mute par défaut).
- **Respecter `prefers-reduced-motion`** : toutes les animations deviennent des transitions d'opacité de 100 ms.

---

## 13. Écrans et UX

### 13.1 Liste des écrans

| # | Écran | Contenu |
|---|---|---|
| E1 | Accueil | Titre, Nouvelle partie / Continuer / Mode libre / Codex / Classement / Options, disclaimer |
| E2 | Sélection de mode | 3 modes de difficulté, description honnête de chacun |
| E3 | Bureau — Jour | Agenda (PA), CRM portefeuille, mails, jauges, date, bouton « Passer à la nuit » |
| E4 | Bureau — Nuit | Dossiers ouverts, tableur, éditeur, codex, jauges, bouton « Terminer la nuit » |
| E5 | Dialogue | Portrait + humeur, réplique, 4 choix, panneau de feedback |
| E6 | Qualification (cartes) | 4 colonnes, cartes à trier, validation, feedback |
| E7 | Assiette (tableur) | Postes, saisie, calcul en direct, alertes de plafond, validation |
| E8 | Justificatif | 5 blocs, 4 formulations par bloc, aperçu du document produit |
| E9 | Bilan de cycle | Deltas, CA, XP, fiches, prochaine deadline |
| E10 | Fiche client | Identité, humeur, confiance, historique des échanges, pièces collectées, promesse en cours |
| E11 | Codex | Recherche, catégories, fiches, indicateur lu/non lu |
| E12 | Contrôle fiscal | Variante de E5, ambiance sobre, pièces disponibles affichées en permanence |
| E13 | Fin de partie | Grade S-D, décomposition du score, badges, points forts / axes de progrès, saisie du pseudo, export |
| E14 | Classement | Local, filtré par mode, export/import JSON |
| E15 | Options | Volume, réduction des animations, taille de texte, réinitialiser la sauvegarde, export/import de partie |

### 13.2 Règles UX transverses

- **Toujours visible** : date en jeu, PA restants, prochaine deadline, les 3 jauges.
- **Aucune action irréversible sans confirmation** — sauf les choix de dialogue, qui sont définitifs **par principe** (c'est le sel du jeu). Le dire au tutoriel.
- **Pas de game over.** Une mauvaise saison se termine et se débriefe. On n'humilie pas un apprenant.
- **Sauvegarde automatique** à chaque fin de phase.
- **Clavier** : 1-4 pour les choix de dialogue, `Espace` pour avancer, `C` pour le codex, `Échap` pour le menu.
- **Mobile** : le jeu doit être jouable sur téléphone en portrait. Le tableur d'assiette passe en mode « une carte par poste » sous 768 px.

---

## 14. Architecture technique

### 14.1 Stack

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | **React 18 + TypeScript** | États complexes, contenu dynamique, écosystème |
| Build | **Vite** | Rapide, build statique pur |
| Styles | **Tailwind CSS** + tokens CSS de la charte | Vitesse, thème jour/nuit par classe `data-phase` |
| État | **Zustand** (+ `immer`) | Simple, sérialisable, parfait pour une sauvegarde |
| Routing | **react-router** en `HashRouter` | Fonctionne sur tout hébergement statique, même sans réécriture d'URL |
| Animation | **Framer Motion** | Transitions jour/nuit, feedback |
| Tests | **Vitest** + **Testing Library** + **Playwright** | Moteur de calcul et parcours critiques |
| Validation contenu | **Zod** | Le contenu JSON est validé au build : un scénario cassé ne part pas en prod |
| Hébergement | **Site statique** (Netlify / Vercel / GitHub Pages / intranet Leyton) | Objectif : **une URL, zéro compte, zéro backend** |

**Contraintes fermes** :
- Aucun appel réseau à l'exécution. Le jeu doit fonctionner hors ligne (PWA, service worker de cache).
- Aucune donnée personnelle collectée ni transmise. Pas d'analytics tiers. (Si un besoin de mesure apparaît : Plausible auto-hébergé, à arbitrer avec le DPO.)
- Budget : **< 1,2 Mo** de JS+CSS gzippés au premier chargement, contenu chargé en lazy par chapitre.

### 14.2 Arborescence

```
cir-quest/
├── CLAUDE.md
├── docs/
│   ├── BRIEF.md                    ← ce document
│   ├── CONTENT_GUIDE.md            ← comment écrire un scénario (lot 4)
│   └── DECISIONS.md                ← journal des arbitrages
├── public/
│   ├── fonts/                      ← Montserrat + fallback titre, auto-hébergés
│   └── manifest.webmanifest
├── src/
│   ├── main.tsx
│   ├── app/                        ← routing, providers, thème jour/nuit
│   ├── engine/                     ← ⚠ AUCUN import React ici
│   │   ├── cir/
│   │   │   ├── calculator.ts       ← calcul de l'assiette et du CIR
│   │   │   ├── validators.ts       ← plafonds, agréments, cascade
│   │   │   └── scoring.ts          ← précision, écarts par poste
│   │   ├── dialogue/
│   │   │   ├── runner.ts           ← parcours du graphe
│   │   │   ├── mood.ts             ← humeur, confiance, flags
│   │   │   └── effects.ts          ← application des deltas
│   │   ├── economy/                ← PA, énergie, CA, XP, grades
│   │   ├── calendar/               ← cycles, deadlines, événements
│   │   └── audit/                  ← résolution du contrôle fiscal
│   ├── state/                      ← stores Zustand + (dé)sérialisation
│   ├── components/                 ← UI réutilisable (Gauge, Choice, Portrait…)
│   ├── screens/                    ← E1 à E15
│   ├── avatars/                    ← générateur SVG paramétrique
│   └── data/
│       ├── rules/ruleset-2026.json
│       ├── clients/*.json
│       ├── scenarios/*.json
│       ├── cards/*.json
│       ├── cases/*.json            ← cas d'assiette + corrigés
│       ├── codex/*.json
│       ├── events/*.json
│       └── calendar.json
└── tests/
    ├── engine/                     ← unitaires, prioritaires
    └── e2e/
```

### 14.3 Règle d'architecture non négociable

> **`src/engine/` est du TypeScript pur, testable sans navigateur, sans dépendance React.** Toute la logique de jeu et de calcul y vit. L'UI ne fait qu'afficher et appeler. C'est ce qui rend le moteur fiscal auditable par un expert métier, et ce qui permettra de réutiliser le calculateur ailleurs.

---

## 15. Schémas de données

### 15.1 Client

```jsonc
{
  "id": "cli_agri_dupuis",
  "name": "Maison Dupuis",
  "sector": "AGRI",
  "profileDifficulty": 1,
  "headcount": 48,
  "isSme": true,
  "contact": {
    "name": "Marc Dupuis",
    "role": "Directeur général",
    "archetype": "DREAMER",
    "avatarSeed": "dupuis-01",
    "initialMood": 75,
    "initialTrust": 50
  },
  "moodSensitivity": {
    "preuve": 0, "synthese": 1, "empathie": 2,
    "technique": -1, "fermete": -2, "commercial": 1
  },
  "fees": { "successRate": 0.20, "negotiable": true, "floorRate": 0.14 },
  "caseId": "case_agri_2025",
  "scenarios": ["sc_agri_decouverte", "sc_agri_kickoff", "sc_agri_suivi", "sc_agri_bilan"],
  "cardsetId": "cards_agri"
}
```

### 15.2 Scénario de dialogue

```jsonc
{
  "id": "sc_agri_kickoff",
  "type": "KICKOFF",
  "clientId": "cli_agri_dupuis",
  "title": "Kick-off — Maison Dupuis",
  "context": "Vous avez signé la semaine dernière. Marc a réuni son responsable qualité et sa DAF.",
  "objectives": ["Identifier les interlocuteurs techniques", "Cadrer le périmètre 2025", "Poser le calendrier de collecte"],
  "entryNode": "n1",
  "nodes": [
    {
      "id": "n1",
      "speaker": "Marc Dupuis",
      "expression": "enthousiaste",
      "text": "Alors, on est prêts ! Je vous ai tout préparé : on a innové sur toute la ligne cette année.",
      "choices": [
        {
          "id": "n1c1",
          "role": "optimal",
          "register": "empathie",
          "text": "Formidable. Avant de parler chiffres, j'aimerais qu'on liste ensemble les projets, un par un — y compris ceux qui n'ont pas abouti.",
          "effects": { "relation": 5, "security": 10, "profitability": -2, "mood": 4, "trust": 6 },
          "flags": ["a_demande_les_echecs"],
          "feedback": {
            "what": "Vous ouvrez le périmètre sans le valider.",
            "why": "Les projets abandonnés sont souvent les plus éligibles : l'échec matérialise l'incertitude scientifique.",
            "rule": "En kick-off, on collecte large puis on resserre. L'inverse fait perdre de la matière.",
            "codexUnlock": "cdx_echecs_eligibles"
          },
          "next": "n2"
        }
        // … 3 autres choix : acceptable / tempting / poor
      ]
    }
  ],
  "outcome": {
    "scoreThresholds": { "excellent": 80, "good": 60, "poor": 40 },
    "unlocks": { "excellent": ["piece_cr_essais", "piece_feuilles_temps"], "good": ["piece_feuilles_temps"], "poor": [] }
  }
}
```

### 15.3 Cas d'assiette (avec corrigé)

```jsonc
{
  "id": "case_agri_2025",
  "fiscalYear": 2025,
  "rulesetVersion": "2026.1",
  "narrative": "Maison Dupuis a travaillé sur la stabilisation d'une émulsion végétale sans additif.",
  "personnel": [
    { "id": "p1", "name": "Léa Ferrand", "role": "Ingénieure R&D", "grossCost": 62000,
      "claimedRdRatio": 1.0, "trueRdRatio": 0.8,
      "evidence": "piece_feuilles_temps",
      "trap": "Le DG déclare 100 % ; les feuilles de temps montrent 20 % de support production." },
    { "id": "p2", "name": "Tom Aubert", "role": "Technicien labo", "grossCost": 41000,
      "claimedRdRatio": 0.6, "trueRdRatio": 0.6 },
    { "id": "p3", "name": "Nadia Cherif", "role": "Responsable qualité", "grossCost": 55000,
      "claimedRdRatio": 0.5, "trueRdRatio": 0.0,
      "trap": "Contrôle qualité de production : ce n'est pas de la R&D." }
  ],
  "amortization": [
    { "id": "a1", "asset": "Rhéomètre", "annualDepreciation": 9000, "rdRatio": 1.0 }
  ],
  "subcontracting": [
    { "id": "s1", "provider": "INRAE Transfert", "amount": 35000, "hasMesrAgreement": true,  "related": false, "tier": 1 },
    { "id": "s2", "provider": "LaboPrivé SAS",  "amount": 18000, "hasMesrAgreement": false, "related": false, "tier": 1,
      "trap": "Pas d'agrément MESR → dépense non éligible depuis 2022." }
  ],
  "grants": [
    { "id": "g1", "source": "Région", "amount": 20000, "rdAllocationRatio": 1.0, "type": "grant" }
  ],
  "decoys": [
    { "id": "d1", "label": "Dépôt de brevet — 4 200 €", "reason": "Supprimé de l'assiette depuis le 15/02/2025" },
    { "id": "d2", "label": "Abonnement veille normative — 2 800 €", "reason": "Veille technologique supprimée depuis le 15/02/2025" }
  ],
  "expected": {
    "personnel": 74200,
    "amortization": 9000,
    "operatingAllowance": 36430,
    "subcontracting": 35000,
    "grantsDeducted": 20000,
    "base": 134630,
    "cir": 40389
  }
}
```

> ⚠️ Les valeurs de `expected` ci-dessus sont **illustratives**. Le lot 2 doit les recalculer avec le moteur et les figer comme cas d'or (§18).

### 15.4 Sauvegarde

```jsonc
{
  "schemaVersion": 1,
  "seed": "a3f9d2",
  "createdAt": "2026-09-01T00:00:00.000Z",
  "cycle": 7,
  "phase": "NIGHT",
  "actionPoints": 3,
  "energy": 62,
  "gauges": { "relation": 58, "security": 71, "profitability": 44 },
  "xp": 1840,
  "grade": "junior",
  "revenue": { "signed": 128000, "collected": 0 },
  "portfolio": [
    { "clientId": "cli_agri_dupuis", "mood": 68, "trust": 62,
      "flags": ["a_demande_les_echecs"],
      "promise": { "min": 30000, "max": 45000, "cycle": 4 },
      "piecesCollected": ["piece_feuilles_temps"],
      "dossierState": "BASE_IN_PROGRESS",
      "scores": { "kickoff": 78, "qualification": 91, "base": null, "justification": null } }
  ],
  "codexUnlocked": ["cdx_echecs_eligibles", "cdx_verrou"],
  "badges": ["non_c_est_non"],
  "history": [{ "cycle": 4, "nodeId": "n1", "choiceId": "n1c3" }]
}
```

`history` alimente le débrief final : il permet de dire au joueur *quelle décision précise* lui a coûté le contrôle fiscal. Le conserver intégralement (poids négligeable).

**Migration** : toute évolution de schéma incrémente `schemaVersion` et fournit une fonction de migration. Une sauvegarde illisible ne doit jamais crasher le jeu — proposer de repartir à zéro en gardant le codex et les badges.

---

## 16. Génération procédurale des prospects

Pour la prospection téléphonique (§6.2), 30 modèles combinés à des variables :

```jsonc
{
  "id": "prospect_tpl_saas_01",
  "sectorPool": ["SAAS", "GREENTECH"],
  "sizeRange": [15, 120],
  "eligibilityProfile": "BORDERLINE",   // ELIGIBLE | BORDERLINE | NOT_ELIGIBLE
  "hooks": ["Ils recrutent 3 profils R&D", "Ils viennent de lever 4 M€"],
  "objections": ["obj_deja_un_cabinet", "obj_trop_petit", "obj_peur_du_controle"],
  "estimatedCirRange": [25000, 90000]
}
```

Règle d'équilibrage : **1 prospect sur 4 doit être non éligible**. Un joueur qui signe tout doit finir moins bien qu'un joueur qui trie.

---

## 17. Accessibilité et internationalisation

- **WCAG 2.1 AA** visé : contraste ≥ 4,5:1 en thème jour **et** nuit (vérifier `#FF6633` sur blanc — insuffisant pour du texte fin, le réserver aux surfaces et bordures, ou l'assombrir en `#C34024` pour le texte).
- Navigation clavier complète, focus visible, ordre de tabulation cohérent.
- Rôles ARIA sur les jauges (`role="meter"` + `aria-valuenow` + libellé textuel du delta).
- **Ne jamais coder une information par la seule couleur** : les jauges portent un chiffre et une étiquette.
- Taille de texte ajustable (100 / 125 / 150 %) sans casse de mise en page.
- **i18n dès le lot 1** : tout le texte dans les fichiers de contenu, aucune chaîne codée en dur dans les composants. `fr-FR` en v1 ; `en-GB` envisageable pour les autres entités du groupe Leyton.

---

## 18. Tests

### 18.1 Moteur fiscal — priorité absolue

- **Cas d'or** : chaque cas de `src/data/cases/` a un test qui recalcule le CIR et le compare à `expected`. Un changement de moteur qui casse un cas d'or est un bug bloquant.
- **Tests de règles isolées** : limite proportionnelle 3× appliquée **avant** le plafond global ; plafond 2 M€ vs 10 M€ selon le lien de dépendance ; absence de forfait sur la sous-traitance ; sous-traitant sans agrément exclu ; 3ᵉ rang exclu ; subvention déduite ; brevets/veille/majoration JD rejetés ; franchissement du seuil de 100 M€ (calcul par tranches).
- **Property-based testing** sur le calculateur : pour toute entrée valide, `cir ≥ 0`, `base ≥ 0`, monotonie (ajouter une dépense éligible n'abaisse jamais le CIR).
- **Revue métier obligatoire** : un consultant CIR expérimenté relit `calculator.ts` et les cas d'or avant le lot 6. Le brief ne remplace pas cette validation.

### 18.2 Contenu

- Validation Zod de **tous** les JSON au build (CI bloquante).
- Lint de contenu : chaque nœud a exactement 4 choix ; chaque choix a un `role` unique parmi les 4 ; chaque choix a un `feedback` complet (what/why/rule) ; tout `next` pointe vers un nœud existant ; aucun nœud orphelin ; toute `codexUnlock` référence une fiche existante.

### 18.3 E2E (Playwright)

Parcours critiques : nouvelle partie → tutoriel → 1 cycle complet → sauvegarde → rechargement → état identique ; campagne complète en mode découverte (script rapide) ; export/import de sauvegarde ; jeu au clavier seul.

---

## 19. Backlog de développement

Chaque lot = une session Claude Code = une PR. **Definition of Done commune** : typé strictement, testé, contenu validé Zod, build vert, aucun `any`, aucune chaîne de texte codée en dur.

### Lot 0 — Socle (½ j)
Init Vite + React + TS + Tailwind + Zustand + Vitest. Tokens de charte Leyton. Thème jour/nuit commutable. HashRouter. Squelette des écrans E1/E3/E4 vides. CI GitHub Actions (typecheck, lint, test, build). **DoD** : `npm run dev` affiche l'accueil, la bascule jour/nuit fonctionne.

### Lot 1 — Moteur fiscal ⭐ *le lot le plus important*
`ruleset-2026.json` + `engine/cir/*`. Calcul complet de l'assiette et du CIR, tous plafonds et exclusions. Aucune UI. **DoD** : ≥ 40 tests unitaires verts, 3 cas d'or figés, couverture > 95 % sur `engine/cir`.

### Lot 2 — Moteur de dialogue
`engine/dialogue/*` : parcours de graphe, effets, humeur, confiance, flags, sensibilité par archétype. Schémas Zod. Un scénario de test complet. **DoD** : un scénario se joue en console via un script de test, l'humeur évolue conformément à la table.

### Lot 3 — UI de dialogue (E5)
Portrait + avatar SVG paramétrique + expressions, 4 choix randomisés, panneau de feedback 3 niveaux, jauges animées, clavier 1-4. **DoD** : le scénario du lot 2 est jouable à la souris et au clavier, accessible au lecteur d'écran.

### Lot 4 — Économie et boucle de cycle
PA, énergie et seuils, calendrier, deadlines, événements aléatoires, CA, XP, grades, badges, bilan de cycle (E9). Sauvegarde `localStorage` + migration. **DoD** : 3 cycles s'enchaînent, la sauvegarde survit à un rechargement.

### Lot 5 — Phase Jour (E3, E10)
Bureau de jour, agenda, CRM, mails, toutes les activités du §6, système de Promesse, prospection procédurale. **DoD** : un cycle jour complet est jouable, une promesse est enregistrée et rappelée par le PNJ au RDV suivant.

### Lot 6 — Phase Nuit (E4, E6, E7, E8)
Mini-jeu de cartes, tableur d'assiette branché sur le moteur du lot 1, éditeur de justificatif, contrôle qualité. **DoD** : un dossier complet se monte de bout en bout, le scoring de précision fonctionne, le feedback est poste par poste.

### Lot 7 — Codex, contrôle fiscal, fin de partie (E11, E12, E13, E14)
35 fiches codex, dialogue de contrôle indexé sur les décisions passées, score final et grade, débrief avec l'historique des décisions, leaderboard local, export/import. **DoD** : une partie se termine avec un débrief exploitable en entretien de formation.

### Lot 8 — Contenu de la campagne
Les 9 chapitres, 6 clients, 24 scénarios, 90 cartes, 6 cas d'assiette, 20 événements. **DoD** : la campagne se termine en ~2 h ; volume conforme au §10.1.

### Lot 9 — Mode libre, polish, PWA
Saison libre, cas isolés, service worker, budget de perf, passe d'accessibilité, passe d'équilibrage. **DoD** : Lighthouse ≥ 90 sur les 4 axes, jouable hors ligne, budget JS respecté.

### Lot 10 — Recette métier
Playtests avec 5 consultants Leyton + 3 nouveaux arrivants. Grille de recueil : justesse métier, difficulté ressentie, clarté des feedbacks, notions retenues (quiz avant/après). Corrections d'équilibrage.

---

## 20. Équilibrage — valeurs de départ à ajuster

Toutes ces valeurs vivent dans `src/data/balance.json`, jamais dans le code.

| Paramètre | Valeur initiale |
|---|---|
| PA jour / nuit | 5 / 4 |
| Delta jauge par choix | optimal +8/+12, acceptable +4/−3, tempting +10/−12, poor −10/−8 |
| Tolérance d'assiette par mode | 15 % / 5 % / 1 % |
| Probabilité d'événement aléatoire | 33 % par cycle |
| Seuil de déclenchement du contrôle | Sécurité < 60 |
| Taux d'honoraires par défaut | 20 % HT du CIR obtenu |
| Objectif de CA de saison | 300 000 € |
| Ratio de prospects non éligibles | 25 % |

**Cible d'équilibrage** : un joueur attentif mais débutant doit finir en **B**. Le **S** doit exiger une seconde partie. Le mode découverte ne doit jamais descendre sous **C**.

---

## 21. Risques et points ouverts

| # | Risque / question | Impact | Action |
|---|---|---|---|
| R1 | **Validation métier des règles fiscales** | Élevé — un jeu qui enseigne une règle fausse est pire qu'aucun jeu | Faire relire §9 et les cas d'or par un consultant CIR senior **avant le lot 6** |
| R2 | **Points [À CONFIRMER] du §9.7** | Moyen | Vérifier sur le BOFiP et le CGI avant de coder les mécaniques concernées ; en attendant, ne pas les implémenter |
| R3 | **Usage de la marque Leyton** | Élevé (juridique) | Faire valider le principe, le nom, l'usage du logo et les couleurs par la Direction Marque / Communication. Prévoir une variante « cabinet fictif » si refus |
| R4 | **Logos et polices non fournis** | Faible | Demander à `designteam@leyton.com` ; fallback textuel documenté §12.2 |
| R5 | **Obsolescence des barèmes** | Moyen, certain | Le ruleset daté et versionné (§9.8) + une bannière « barèmes au JJ/MM/AAAA » dans le jeu. Prévoir une revue annuelle en février |
| R6 | **Volume de contenu** | Moyen | Le lot 8 est le plus long. Écrire d'abord 1 client complet de bout en bout, le faire valider, puis industrialiser |
| R7 | **Leaderboard local = pas de suivi de promo** | Faible | Assumé en v1 (zéro compte). Export JSON pour agrégation manuelle. Si un vrai suivi devient nécessaire, prévoir un backend en v2 avec passage DPO |
| R8 | **Réalisme vs plaisir de jeu** | Moyen | Trancher toujours en faveur de la justesse métier sur les **règles**, en faveur du jeu sur les **rythmes** (compression du calendrier, PA) |
| R9 | Anonymisation des cas | Élevé si des cas réels sont réutilisés plus tard | Aucun cas client réel sans anonymisation validée. Les 6 cas v1 sont inventés |

---

## 22. Sources et statut de vérification des règles fiscales

État du droit au **20 août 2026**. La loi de finances pour 2026 a été promulguée le **19 février 2026** et maintient le CIR à 30 %.

| Règle | Valeur | Statut |
|---|---|---|
| Taux CIR métropole | 30 % jusqu'à 100 M€, 5 % au-delà | ✅ Recoupé |
| Taux DOM | 50 % | ✅ |
| Forfait de fonctionnement | 40 % du personnel + 75 % des amortissements | ✅ Recoupé (réduit de 43 % par la LF 2025) |
| Suppression brevets / veille / majoration jeune docteur | Dépenses exposées à compter du 15/02/2025 | ✅ Recoupé |
| Non-rétablissement du jeune docteur en LF 2026 | Confirmé | ✅ |
| Agrément MESR obligatoire pour tous les sous-traitants | Depuis le 01/01/2022 | ✅ |
| Sous-traitance : limite 3× les autres dépenses | Appliquée avant le plafond global | ✅ |
| Sous-traitance : plafonds 2 M€ (lié) / 10 M€ (non lié) | Ancien plafond de 12 M€ obsolète | ✅ |
| Cascade de sous-traitance limitée au 2ᵉ rang | Confirmé | ✅ |
| CII : 20 %, plafond 400 k€, PME, jusqu'au 31/12/2027 | Confirmé | ✅ |
| Formulaire 2069-A-SD, remboursement immédiat PME | Confirmé | ✅ |
| Seuils des états annexes descriptifs (10 M€ / 100 M€) | — | ⚠️ **À confirmer** |
| Déductibilité des dépenses de conseil CIR (seuil 15 k€ / 5 %) | — | ⚠️ **À confirmer** |
| Rescrit CIR : délai de réponse et effet du silence | — | ⚠️ **À confirmer** |

**À vérifier systématiquement sur les sources primaires avant implémentation** : CGI art. 244 quater B, BOFiP (BOI-BIC-RICI-10-10), guide du CIR du MESR (édition en vigueur).

Sources consultées pour ce brief :

- [Crédit d'impôt recherche (CIR) et innovation (CII) 2026 — Compta Online](https://www.compta-online.com/credit-impot-recherche-ao483)
- [CIR 2026 : le dispositif tient bon, mais le périmètre se resserre — ABV Group](https://www.abv-group.com/2026/06/04/cir-2026-perimetre-eligibilite-evolution/)
- [Sous-traitance du CIR : agrément, plafonds 2/10 M€ — Cireka](https://cireka.fr/guide/cir/sous-traitance/)
- [CIR 2026 : comment sécuriser son dossier malgré un PLF en débat — Leyton France](https://leyton.com/fr/insights/articles/cir-2026-plf-debats-securisation/)
- [Dispositif Jeune Docteur et CIR : où en est-on en 2026 ? — Compass Financement](https://compass-financement.com/cir-jeune-docteur/)
- [Crédit d'Impôt Innovation (CII) Guide 2026 — Leyton France](https://leyton.com/fr/insights/articles/credit-impot-innovation-cii-guide-complet-2026/)
- [Notion de premier recrutement d'un jeune docteur — BOFiP](https://bofip.impots.gouv.fr/bofip/11534-PGP.html/identifiant=BOI-RES-BIC-000017-20250813)

---

## 23. Prompt de démarrage pour Claude Code

À coller en première instruction du repo :

```
Lis docs/BRIEF.md en entier avant toute action.

Nous construisons CIR QUEST, un serious game React + TypeScript + Vite,
site statique, sans backend, jouable depuis une simple URL.

Commence par le LOT 0 (§19) uniquement. Ne code pas les lots suivants.

Règles non négociables :
- src/engine/ est du TypeScript pur, sans React, entièrement testable.
- Aucune règle fiscale codée en dur : tout vient de src/data/rules/ruleset-2026.json.
- Aucune chaîne de texte visible codée en dur dans un composant.
- Charte Leyton : #002C49 dominant, #FF6633 en accent seulement.
- TypeScript strict, aucun `any`.

À la fin du lot, liste les décisions que tu as prises et qui ne figurent
pas dans le brief, et propose une mise à jour de docs/DECISIONS.md.
```

---

*Fin du brief — v1.0*


