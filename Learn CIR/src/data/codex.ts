// Fiches codex (§11). Chaque fiche tient sur un écran de téléphone.
// Sources indicatives ; à revalider sur sources primaires (§22).

import type { CodexEntry } from '../engine/types';

/**
 * Fiches acquises d'entrée de jeu. Ce sont les fondamentaux — ce que le CIR
 * est, ses taux, le cadre pédagogique du jeu — que le joueur doit pouvoir
 * consulter dès la première minute. Les rattacher à un choix de dialogue les
 * aurait rendues inatteignables pour qui ne tombe pas sur ce choix.
 */
export const CODEX_STARTER: string[] = ['cdx_objet', 'cdx_taux', 'cdx_disclaimer'];

export const CODEX: CodexEntry[] = [
  // --- Le dispositif ---
  { id: 'cdx_objet', category: 'dispositif', title: 'Le CIR, en une phrase', body: 'Le Crédit d’Impôt Recherche soutient les dépenses de R&D des entreprises : 30 % de l’assiette éligible jusqu’à 100 M€, 5 % au-delà.', example: 'Une assiette de 200 000 € génère 60 000 € de crédit d’impôt.', source: 'CGI art. 244 quater B' },
  { id: 'cdx_taux', category: 'dispositif', title: 'Les taux 2026', body: 'Métropole : 30 % jusqu’à 100 M€, 5 % au-delà. DOM : 50 %. La LF 2026 (promulguée le 19/02/2026) maintient ces taux.', example: 'Les barèmes du jeu reflètent l’état du droit au 20 août 2026.', source: 'LF 2026' },
  { id: 'cdx_calendrier', category: 'dispositif', title: 'Le calendrier déclaratif', body: 'Le 2069-A-SD se dépose avec la déclaration de résultats (mi-mai pour un exercice clos au 31/12). Le calendrier du jeu est une compression pédagogique assumée.', example: 'Deadline en jeu : 30 avril, semaine 22.', source: 'Formulaire 2069-A-SD' },
  { id: 'cdx_cii', category: 'dispositif', title: 'CIR ou CII ?', body: 'Le CII (20 %, PME seulement, plafond 400 k€, jusqu’au 31/12/2027) vise la conception de prototypes de nouveaux produits, sans verrou de recherche. Une même dépense ne peut aller dans les deux.', example: 'Prototype de produit nouveau sans incertitude scientifique → CII, pas CIR.', source: 'CGI art. 244 quater B bis' },

  // --- Éligibilité ---
  { id: 'cdx_verrou', category: 'eligibilite', title: 'Le verrou technique', body: 'Un verrou est un obstacle que l’état de l’art ne permet pas de franchir. Il doit être caractérisé et mesurable, pas « c’était difficile ».', example: 'Lever une latence < 20 ms qu’aucune méthode connue n’atteint : verrou. Manquer de temps : pas un verrou.', source: 'Guide CIR du MESR' },
  { id: 'cdx_incertitude', category: 'eligibilite', title: 'L’incertitude scientifique', body: 'L’incertitude porte sur l’aboutissement, pas sur le planning. On ne sait pas, au départ, si l’objectif est atteignable avec les connaissances disponibles.', example: 'On ignore si la molécule sera active : incertitude. On sait que ce sera long : pas d’incertitude.', source: 'BOI-BIC-RICI-10-10' },
  { id: 'cdx_etat_art', category: 'eligibilite', title: 'L’état de l’art', body: 'Il faut situer les travaux par rapport à ce qui est déjà connu et publié. Citer des sources réelles, pas une affirmation vague de nouveauté.', example: 'Publications, brevets, standards existants comparés au progrès visé.', source: 'Guide CIR du MESR' },
  { id: 'cdx_demarche', category: 'eligibilite', title: 'La démarche expérimentale', body: 'R&D = hypothèses, protocoles, itérations, résultats — y compris négatifs, à conserver. C’est la trace de la démarche qui fait la preuve.', example: 'Les essais qui échouent matérialisent l’incertitude : on les garde.', source: 'BOI-BIC-RICI-10-10' },
  { id: 'cdx_nouveaute', category: 'eligibilite', title: 'Nouveauté ≠ R&D', body: 'Une nouveauté pour l’entreprise (mais connue ailleurs) n’est pas de la R&D. Le progrès doit être par rapport à l’état de l’art, pas par rapport à ses propres pratiques.', example: 'Adopter une techno répandue : nouveau pour vous, pas R&D.', source: 'Guide CIR du MESR' },
  { id: 'cdx_dev_courant', category: 'eligibilite', title: 'Le développement courant', body: 'Intégration, portage, migration, paramétrage, mise en conformité : pas d’incertitude scientifique, donc hors R&D. C’est la frontière la plus fréquente à tenir.', example: 'Brancher une API documentée : développement courant.', source: 'BOI-BIC-RICI-10-10' },
  { id: 'cdx_echecs_eligibles', category: 'eligibilite', title: 'Les projets échoués comptent', body: 'Un projet R&D abandonné reste éligible : l’échec matérialise l’incertitude. En kick-off, on collecte large — y compris les projets qui n’ont pas abouti.', example: 'Une piste de recherche fermée après essais : éligible, si documentée.', source: 'Guide CIR du MESR' },

  // --- L'assiette ---
  { id: 'cdx_personnel', category: 'assiette', title: 'Dépenses de personnel', body: 'Salaires et charges des chercheurs et techniciens de recherche, au prorata du temps réellement affecté à la R&D. Les feuilles de temps font foi.', example: 'Un ingénieur à 80 % R&D : 80 % de son coût chargé.', source: 'CGI art. 244 quater B, II' },
  { id: 'cdx_forfait', category: 'assiette', title: 'Le forfait de fonctionnement', body: 'Calculé automatiquement : 40 % des dépenses de personnel retenues + 75 % des dotations aux amortissements retenues. Il couvre les frais indirects.', example: '100 000 € de personnel → 40 000 € de forfait.', source: 'CGI art. 244 quater B, II — réduit de 43 à 40 % par la LF 2025' },
  { id: 'cdx_amortissements', category: 'assiette', title: 'Amortissements', body: 'Dotations aux amortissements des immobilisations créées ou acquises, affectées à la R&D, au prorata de cet usage.', example: 'Un banc d’essais dédié R&D : dotation retenue à 100 %.', source: 'CGI art. 244 quater B, II' },
  { id: 'cdx_supprimes', category: 'assiette', title: 'Ce qui n’est plus éligible depuis 2025', body: 'Pour les dépenses exposées à compter du 15/02/2025 : frais de brevets et COV, veille technologique, et la majoration jeune docteur (doublement d’assiette) sont supprimés.', example: 'Intégrer des frais de brevet en 2025 = gonflement = redressement.', source: 'LF 2025 art. 55' },
  { id: 'cdx_jeune_docteur', category: 'assiette', title: 'Le piège du jeune docteur', body: 'Le salaire d’un jeune docteur reste éligible au taux normal. Seule la majoration (doublement d’assiette + forfait) est supprimée. Ne pas confondre suppression de la majoration et exclusion du salaire.', example: 'Docteur à 78 k€ : éligible. Le ×2 : non.', source: 'LF 2025 art. 55' },

  // --- Sous-traitance ---
  { id: 'cdx_st_agrement', category: 'soustraitance', title: 'L’agrément MESR', body: 'Depuis le 01/01/2022, tout sous-traitant (public comme privé) doit être agréé par le MESR pour que la dépense soit éligible. Sans agrément : rien.', example: 'Un labo privé non agréé : dépense exclue, même si les travaux sont réels.', source: 'CGI art. 244 quater B, II d/d bis' },
  { id: 'cdx_st_plafonds', category: 'soustraitance', title: 'Plafonds de sous-traitance', body: 'La sous-traitance retenue est limitée à 3 × les autres dépenses éligibles (appliqué en premier), puis plafonnée à 2 M€ (entités liées) ou 10 M€ (sans lien).', example: 'Autres dépenses 200 k€ → sous-traitance retenue ≤ 600 k€.', source: 'CGI art. 244 quater B, III' },
  { id: 'cdx_st_cascade', category: 'soustraitance', title: 'La cascade limitée', body: 'La re-sous-traitance est admise au 2ᵉ rang ; le 3ᵉ rang n’est pas éligible. Et pas de forfait de fonctionnement sur la sous-traitance.', example: 'Un prestataire de 3ᵉ rang : hors assiette.', source: 'Doctrine BOFiP' },

  // --- Financements publics ---
  { id: 'cdx_subventions', category: 'financements', title: 'Les subventions publiques', body: 'Les subventions publiques affectées aux projets R&D se déduisent de l’assiette, à hauteur de la quote-part R&D. Oublier de les déduire = redressement certain.', example: 'Subvention de 120 k€ sur un projet R&D : −120 k€ d’assiette.', source: 'CGI art. 244 quater B, III' },
  { id: 'cdx_avances', category: 'financements', title: 'Les avances remboursables', body: 'Une avance remboursable se déduit de l’assiette à l’octroi, puis se réintègre au fur et à mesure de son remboursement.', example: 'Avance de 60 k€ reçue : déduite l’année de l’octroi.', source: 'CGI art. 244 quater B, III' },
  { id: 'cdx_quotepart', category: 'financements', title: 'La quote-part R&D', body: 'Quand une aide finance un projet mixte, seule la fraction affectée à la R&D se déduit. Il faut documenter la clé de répartition.', example: 'Aide 80 k€, part R&D 75 % → 60 k€ déduits.', source: 'BOI-BIC-RICI-10-10' },

  // --- Posture consultant ---
  { id: 'cdx_estimer', category: 'posture', title: 'Estimer sans s’engager', body: 'Une estimation donnée en rendez-vous engage autant qu’un chiffre écrit. Annoncez une fourchette prudente ; un chiffre précis trop tôt crée une dette de promesse.', example: '« Entre 30 et 45 k€, à confirmer après les feuilles de temps » plutôt que « 60 k€ ».', source: 'Posture métier' },
  { id: 'cdx_kickoff', category: 'posture', title: 'Conduire un kick-off', body: 'Identifiez les bons interlocuteurs techniques, cadrez le périmètre, posez le calendrier de collecte. Collectez large, resserrez ensuite.', example: 'Demandez les projets abandonnés : ils sont souvent les plus éligibles.', source: 'Posture métier' },
  { id: 'cdx_client_difficile', category: 'posture', title: 'Le client difficile', body: 'Adaptez le registre à l’archétype : preuve pour le sceptique, synthèse pour le pressé, curiosité pour le techos. Ne sacrifiez jamais la sécurité fiscale à la relation.', example: 'Un sceptique se gagne par des références, pas par des promesses.', source: 'Posture métier' },
  { id: 'cdx_dire_non', category: 'posture', title: 'Savoir dire non', body: 'Refuser une mission non éligible protège le client et votre cabinet. On peut perdre du CA et gagner la relation — et éviter un redressement.', example: 'Une ESN sans R&D réelle : mieux vaut décliner, quitte à garder le contact.', source: 'Posture métier' },
  { id: 'cdx_chiffre_decevant', category: 'posture', title: 'Restituer un chiffre décevant', body: 'Quand le CIR réel est sous la promesse, expliquez la cause, montrez la trace, et proposez un plan. La transparence limite le churn ; le déni l’accélère.', example: 'Reliez l’écart aux taux d’affectation réels, pièces à l’appui.', source: 'Posture métier' },

  // --- Contrôle et sécurisation ---
  { id: 'cdx_preuve', category: 'controle', title: 'La preuve se constitue pendant les travaux', body: 'On ne fabrique pas une preuve au moment du contrôle. Comptes rendus d’essais, feuilles de temps, hypothèses : collectés au fil de l’eau, datés.', example: '« Voici le compte rendu d’essais du 14 mars » : disponible seulement si collecté.', source: 'Posture métier' },
  { id: 'cdx_pieces', category: 'controle', title: 'Les pièces à constituer', body: 'Feuilles de temps signées, comptes rendus d’essais, état de l’art documenté, conventions de subvention, agréments des sous-traitants.', example: 'Un dossier opposable est un dossier tracé.', source: 'Guide CIR du MESR' },
  { id: 'cdx_rescrit', category: 'controle', title: 'Le rescrit CIR', body: 'Le rescrit sécurise a priori l’éligibilité auprès de l’administration. Utile sur les cas limites, dans la fenêtre prévue. (Délais et effet du silence : à revalider.)', example: 'Un cas frontière R&D/CII gagne à être sécurisé par rescrit.', source: 'LPF art. L80 B — à confirmer' },
  { id: 'cdx_controle_deroule', category: 'controle', title: 'Le déroulé d’un contrôle', body: 'Le vérificateur reprend chaque décision : périmètre, taux, sous-traitance, financements. Chaque question renvoie à une preuve que vous avez — ou pas.', example: 'Le contrôle ne fait que révéler la qualité du travail déjà fait.', source: 'Posture métier' },
  { id: 'cdx_disclaimer', category: 'controle', title: 'Cadre pédagogique', body: 'Les cas, entreprises et montants du jeu sont fictifs. Ce jeu est un outil de formation et ne constitue pas un conseil fiscal. Les barèmes reflètent le droit au 20 août 2026.', example: 'Toujours revalider sur sources primaires avant un dossier réel.', source: 'Avertissement du brief' },
];

export function codexById(id: string): CodexEntry | undefined {
  return CODEX.find((c) => c.id === id);
}

export const CODEX_CATEGORIES: { id: CodexEntry['category']; label: string }[] = [
  { id: 'dispositif', label: 'Le dispositif' },
  { id: 'eligibilite', label: 'Éligibilité' },
  { id: 'assiette', label: 'L’assiette' },
  { id: 'soustraitance', label: 'Sous-traitance' },
  { id: 'financements', label: 'Financements publics' },
  { id: 'posture', label: 'Posture consultant' },
  { id: 'controle', label: 'Contrôle et sécurisation' },
];
