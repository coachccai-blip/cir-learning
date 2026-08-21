// Matière première des dossiers générés (§16 étendu) : quand un prospect signe
// une mission de fond, son dossier est assemblé à partir de ces briques.
// Aucune règle fiscale ici — uniquement du contenu (noms, postes, pièges
// rédigés, travaux à trier). Le calcul reste dans le moteur et le ruleset.

import type { CardVerdict, DecoyLine, GrantLine, Sector } from '../engine/types';

export interface PersonnelBrick {
  role: string;
  /**
   * Genre grammatical de l'intitulé de poste. Le prénom est tiré en accord,
   * sinon on afficherait « Zoé Oliveira — Ingénieur matériaux ».
   * 'N' = intitulé épicène, n'importe quel prénom convient.
   */
  g: 'F' | 'M' | 'N';
  /** Part du budget personnel du dossier (poids relatif, normalisé ensuite). */
  weight: number;
  claimedRdRatio: number;
  trueRdRatio: number;
  trap?: string;
  /** Pièce qui rendra le taux opposable au contrôle. */
  evidence?: string;
}

export interface SubcontractingBrick {
  provider: string;
  weight: number;
  hasMesrAgreement: boolean;
  related: boolean;
  tier: 1 | 2 | 3;
  trap?: string;
}

export interface GrantBrick {
  source: string;
  weight: number;
  rdAllocationRatio: number;
  type: GrantLine['type'];
  trap?: string;
}

export interface DecoyBrick {
  label: string;
  weight: number;
  removedItemId: DecoyLine['removedItemId'];
  reason: string;
}

export interface CardBrick {
  title: string;
  description: string;
  clues: string[];
  verdict: Exclude<CardVerdict, 'INVESTIGATE'>;
  explanation: string;
  codexRef?: string;
}

export interface SectorKit {
  /** Intitulé lisible du secteur, réutilisé sur la fiche client. */
  label: string;
  /** Projet-cadre du dossier, injecté dans le récit de l'assiette. */
  projects: string[];
  /** Équipements amortissables typiques du secteur. */
  assets: string[];
  /** Postes sains : toujours au moins un dans le dossier. */
  cleanRoles: PersonnelBrick[];
  /** Postes piégés : au moins un, jamais tous. */
  trappedRoles: PersonnelBrick[];
  providers: SubcontractingBrick[];
  cards: CardBrick[];
}

/** Prénoms des équipes générées, séparés par genre pour accorder les intitulés. */
export const TEAM_FIRST_NAMES_F = [
  'Sarah', 'Aïcha', 'Manon', 'Salomé', 'Rachida', 'Jeanne', 'Zoé', 'Inès',
];
export const TEAM_FIRST_NAMES_M = [
  'Bastien', 'Hugo', 'Idriss', 'Victor', 'Adrien', 'Louis', 'Ousmane', 'Paul',
];
export const TEAM_LAST_NAMES = [
  'Aubry', 'Perrin', 'Sylla', 'Girard', 'Meunier', 'Kessler', 'Barreau',
  'Lacombe', 'Hamon', 'Vasseur', 'Bonnet', 'Thibault', 'Rey', 'Oliveira',
];

/** Aides publiques : communes à tous les secteurs, tirées avec parcimonie. */
export const GRANT_BRICKS: GrantBrick[] = [
  { source: 'Bpifrance', weight: 0.16, rdAllocationRatio: 1, type: 'grant', trap: 'Subvention R&D : à déduire intégralement de l’assiette.' },
  { source: 'Région', weight: 0.12, rdAllocationRatio: 0.8, type: 'grant', trap: 'Financement public : à déduire à hauteur de sa part R&D (80 %).' },
  { source: 'ADEME', weight: 0.14, rdAllocationRatio: 0.7, type: 'repayableAdvance', trap: 'Avance remboursable : à déduire dès l’octroi, sans attendre le remboursement.' },
  { source: 'Bpifrance (avance)', weight: 0.18, rdAllocationRatio: 1, type: 'repayableAdvance', trap: 'Avance remboursable : elle se déduit dès l’octroi.' },
];

/** Postes hors assiette proposés par le client — supprimés depuis le 15/02/2025. */
export const DECOY_BRICKS: DecoyBrick[] = [
  { label: 'Dépôt et maintien de brevet', weight: 0.035, removedItemId: 'patents', reason: 'Frais de brevet supprimés de l’assiette depuis le 15/02/2025.' },
  { label: 'Abonnements de veille technologique', weight: 0.022, removedItemId: 'techWatch', reason: 'Veille technologique supprimée depuis le 15/02/2025.' },
  { label: 'Honoraires conseil en propriété industrielle', weight: 0.028, removedItemId: 'patents', reason: 'Rattaché aux frais de brevet : hors assiette depuis le 15/02/2025.' },
];

const COMMON_CARDS: CardBrick[] = [
  { title: 'Formation de l’équipe à un outil du marché', description: 'Montée en compétence sur un logiciel existant, sans développement.', clues: ['Formation'], verdict: 'NONE', explanation: 'La formation est hors assiette du CIR.' },
  { title: 'Refonte du site vitrine', description: 'Nouveau design, mêmes contenus et mêmes fonctions.', clues: ['Communication', 'Aucun verrou'], verdict: 'NONE', explanation: 'Travail de communication : aucune incertitude technique.', codexRef: 'cdx_dev_courant' },
  { title: 'Mise en conformité réglementaire', description: 'Application d’une norme publiée, sans marge d’interprétation technique.', clues: ['Norme existante', 'Aucune incertitude'], verdict: 'NONE', explanation: 'Appliquer une norme connue n’est pas de la R&D.', codexRef: 'cdx_dev_courant' },
];

export const SECTOR_KITS: Record<Sector, SectorKit> = {
  SAAS: {
    label: 'Éditeur logiciel',
    projects: [
      'un moteur de recommandation temps réel dont aucune méthode publiée ne tient la latence visée',
      'un algorithme de détection d’anomalies sur des données très bruitées',
      'un système de synchronisation hors-ligne sans perte de cohérence',
    ],
    assets: ['Cluster de calcul GPU', 'Baie de serveurs de test', 'Banc de charge réseau'],
    cleanRoles: [
      { role: 'Chercheuse en apprentissage automatique', g: 'F', weight: 0.3, claimedRdRatio: 0.9, trueRdRatio: 0.9 },
      { role: 'Ingénieur R&D backend', g: 'M', weight: 0.26, claimedRdRatio: 0.8, trueRdRatio: 0.8 },
      { role: 'Ingénieur données', g: 'M', weight: 0.22, claimedRdRatio: 0.6, trueRdRatio: 0.6 },
    ],
    trappedRoles: [
      { role: 'Directeur technique', g: 'M', weight: 0.34, claimedRdRatio: 0.8, trueRdRatio: 0.4, evidence: 'piece_feuilles_temps', trap: 'Un CTO fait aussi du management et de l’avant-vente : les feuilles de temps donnent 40 %.' },
      { role: 'Développeur front', g: 'M', weight: 0.22, claimedRdRatio: 0.7, trueRdRatio: 0, trap: 'Intégration d’écrans et portage mobile : développement courant, pas de R&D.' },
      { role: 'Ingénieur support niveau 2', g: 'M', weight: 0.2, claimedRdRatio: 0.5, trueRdRatio: 0, trap: 'Support client sur un produit livré : hors R&D.' },
    ],
    providers: [
      { provider: 'Laboratoire d’informatique universitaire', weight: 0.18, hasMesrAgreement: true, related: false, tier: 1 },
      { provider: 'AlgoLab SAS', weight: 0.14, hasMesrAgreement: false, related: false, tier: 1, trap: 'Pas d’agrément MESR → dépense de sous-traitance non éligible.' },
      { provider: 'Filiale technique du groupe', weight: 0.16, hasMesrAgreement: true, related: true, tier: 1, trap: 'Entité liée : le plafond annuel de sous-traitance tombe à 2 M€.' },
    ],
    cards: [
      { title: 'Modèle prédictif sous forte incertitude', description: 'Aucune méthode connue ne converge sur des données aussi bruitées ; l’équipe teste plusieurs familles de modèles.', clues: ['Verrou algorithmique', 'Incertitude sur l’aboutissement'], verdict: 'RD', explanation: 'Verrou caractérisé et incertitude scientifique : R&D éligible.', codexRef: 'cdx_verrou' },
      { title: 'Intégration d’une API de facturation', description: 'Branchement d’un service tiers entièrement documenté.', clues: ['API documentée', 'Techniques standard'], verdict: 'NONE', explanation: 'Intégration standard : développement courant.', codexRef: 'cdx_dev_courant' },
      { title: 'Prototype d’assistant embarqué dans le produit', description: 'Nouvelle fonction pour le marché de l’entreprise, sans verrou de recherche.', clues: ['Prototype de nouveau produit', 'PME'], verdict: 'CII', explanation: 'Nouveau produit sans verrou scientifique : innovation (CII), pas CIR.', codexRef: 'cdx_cii' },
      { title: 'Campagne d’expérimentations sur le moteur de calcul', description: 'Hypothèses testées une à une, résultats négatifs conservés et datés.', clues: ['Protocole', 'Résultats négatifs archivés'], verdict: 'RD', explanation: 'Démarche expérimentale tracée : R&D.', codexRef: 'cdx_demarche' },
      { title: 'Migration de la base vers un nouveau moteur', description: 'Changement de fournisseur, fonctionnalités identiques.', clues: ['Migration', 'Aucune incertitude'], verdict: 'NONE', explanation: 'Migration technique : hors R&D.', codexRef: 'cdx_dev_courant' },
      { title: 'Prototype d’un connecteur temps réel pour un client', description: 'Nouvelle brique produit assemblée à partir de technologies éprouvées.', clues: ['Prototype de nouveau produit'], verdict: 'CII', explanation: 'Nouveauté produit sans verrou scientifique : CII.', codexRef: 'cdx_cii' },
      ...COMMON_CARDS,
    ],
  },
  INDUS: {
    label: 'Industrie',
    projects: [
      'un procédé de soudure d’alliages dissemblables que l’état de l’art ne permet pas de tenir en fatigue',
      'une pièce allégée de 30 % sans perte de tenue mécanique',
      'un traitement de surface sans métaux lourds à performance égale',
    ],
    assets: ['Banc d’essais en fatigue', 'Machine de tomographie', 'Cellule robotisée de prototypage'],
    cleanRoles: [
      { role: 'Ingénieur matériaux', g: 'M', weight: 0.28, claimedRdRatio: 0.85, trueRdRatio: 0.85 },
      { role: 'Technicienne d’essais', g: 'F', weight: 0.24, claimedRdRatio: 0.7, trueRdRatio: 0.7 },
      { role: 'Ingénieur calcul', g: 'M', weight: 0.24, claimedRdRatio: 0.6, trueRdRatio: 0.6 },
    ],
    trappedRoles: [
      { role: 'Responsable méthodes', g: 'N', weight: 0.3, claimedRdRatio: 0.9, trueRdRatio: 0.45, evidence: 'piece_feuilles_temps', trap: 'Une bonne moitié de son temps part en industrialisation : les relevés donnent 45 %.' },
      { role: 'Opérateur de production', g: 'M', weight: 0.2, claimedRdRatio: 0.4, trueRdRatio: 0, trap: 'Production de série : aucune part de R&D.' },
      { role: 'Responsable qualité', g: 'N', weight: 0.22, claimedRdRatio: 0.5, trueRdRatio: 0, trap: 'Contrôle qualité de production courante : ce n’est pas de la R&D.' },
    ],
    providers: [
      { provider: 'Centre technique agréé', weight: 0.2, hasMesrAgreement: true, related: false, tier: 1 },
      { provider: 'Bureau d’études MécaPlus', weight: 0.15, hasMesrAgreement: false, related: false, tier: 1, trap: 'Pas d’agrément MESR → dépense non éligible.' },
      { provider: 'Sous-traitant de rang 3', weight: 0.12, hasMesrAgreement: true, related: false, tier: 3, trap: 'Le 3ᵉ rang de sous-traitance n’est pas éligible : la cascade s’arrête au 2ᵉ.' },
    ],
    cards: [
      { title: 'Essais de tenue en fatigue d’un nouvel alliage', description: 'Aucune donnée publiée sur ce couple de matériaux ; campagne d’essais destructifs.', clues: ['État de l’art muet', 'Protocole expérimental'], verdict: 'RD', explanation: 'Incertitude et démarche expérimentale : R&D.', codexRef: 'cdx_incertitude' },
      { title: 'Réglage d’une ligne de production existante', description: 'Optimisation de cadence sur un procédé maîtrisé.', clues: ['Procédé connu', 'Production'], verdict: 'NONE', explanation: 'Optimisation de production courante : hors R&D.', codexRef: 'cdx_dev_courant' },
      { title: 'Prototype de conditionnement réutilisable', description: 'Nouveau produit pour l’entreprise, techniques toutes connues.', clues: ['Prototype de nouveau produit', 'Sans verrou'], verdict: 'CII', explanation: 'Nouveau produit sans verrou scientifique : CII.', codexRef: 'cdx_cii' },
      { title: 'Modélisation numérique du comportement thermique', description: 'Modèle confronté aux essais, hypothèses invalidées conservées.', clues: ['Hypothèses testées', 'Confrontation aux mesures'], verdict: 'RD', explanation: 'Démarche expérimentale documentée : R&D.', codexRef: 'cdx_demarche' },
      { title: 'Achat et installation d’une machine du commerce', description: 'Mise en service d’un équipement standard par le fournisseur.', clues: ['Équipement standard'], verdict: 'NONE', explanation: 'Investissement courant : ce n’est pas un travail de R&D.' },
      { title: 'Prototype d’un gabarit de contrôle sur mesure', description: 'Premier exemplaire d’un outillage conçu pour un nouveau produit, techniques connues.', clues: ['Prototype de nouveau produit'], verdict: 'CII', explanation: 'Prototype de nouveau produit sans incertitude : CII.', codexRef: 'cdx_cii' },
      ...COMMON_CARDS,
    ],
  },
  BIOTECH: {
    label: 'Biotechnologies',
    projects: [
      'un candidat-médicament dont la stabilité en formulation reste non résolue',
      'un test diagnostique dont la sensibilité visée dépasse l’état de l’art',
      'un procédé de culture cellulaire sans sérum animal',
    ],
    assets: ['Chaîne de chromatographie', 'Cytomètre en flux', 'Enceinte de culture pilote'],
    cleanRoles: [
      { role: 'Chercheuse en biologie cellulaire', g: 'F', weight: 0.3, claimedRdRatio: 0.95, trueRdRatio: 0.95 },
      { role: 'Ingénieur procédés', g: 'M', weight: 0.24, claimedRdRatio: 0.8, trueRdRatio: 0.8 },
      { role: 'Technicienne de recherche', g: 'F', weight: 0.2, claimedRdRatio: 0.75, trueRdRatio: 0.75 },
    ],
    trappedRoles: [
      { role: 'Directrice scientifique', g: 'F', weight: 0.32, claimedRdRatio: 1, trueRdRatio: 0.6, evidence: 'piece_feuilles_temps', trap: 'Levée de fonds et comités : ses relevés de temps donnent 60 % de recherche réelle.' },
      { role: 'Chargé des affaires réglementaires', g: 'M', weight: 0.2, claimedRdRatio: 0.6, trueRdRatio: 0, trap: 'Montage de dossiers réglementaires : hors assiette du CIR.' },
      { role: 'Responsable production pilote', g: 'N', weight: 0.22, claimedRdRatio: 0.5, trueRdRatio: 0, trap: 'Production des lots cliniques : aval de la recherche, hors R&D.' },
    ],
    providers: [
      { provider: 'CRO agréée MESR', weight: 0.24, hasMesrAgreement: true, related: false, tier: 1 },
      { provider: 'BioTest Services', weight: 0.16, hasMesrAgreement: false, related: false, tier: 1, trap: 'Prestataire sans agrément MESR : dépense non éligible.' },
      { provider: 'Filiale de recherche du groupe', weight: 0.18, hasMesrAgreement: true, related: true, tier: 1, trap: 'Entité liée : plafond de sous-traitance abaissé à 2 M€.' },
    ],
    cards: [
      { title: 'Criblage de formulations pour stabiliser le principe actif', description: 'Aucune formulation publiée ne tient à température ambiante ; plans d’expériences successifs.', clues: ['Verrou de formulation', 'Incertitude'], verdict: 'RD', explanation: 'Verrou et incertitude sur l’aboutissement : R&D.', codexRef: 'cdx_verrou' },
      { title: 'Constitution du dossier réglementaire', description: 'Rédaction et dépôt auprès de l’autorité compétente.', clues: ['Réglementaire', 'Aucune incertitude technique'], verdict: 'NONE', explanation: 'Travail réglementaire : hors assiette.', codexRef: 'cdx_dev_courant' },
      { title: 'Prototype d’un kit de prélèvement patient', description: 'Nouveau produit d’usage, sans incertitude scientifique.', clues: ['Prototype de nouveau produit'], verdict: 'CII', explanation: 'Nouveau produit sans verrou de recherche : CII.', codexRef: 'cdx_cii' },
      { title: 'Essais in vitro comparatifs documentés', description: 'Protocoles datés, réplicats, résultats négatifs archivés.', clues: ['Protocole', 'Résultats négatifs conservés'], verdict: 'RD', explanation: 'Démarche expérimentale tracée : R&D.', codexRef: 'cdx_demarche' },
      { title: 'Production des lots pour la clinique', description: 'Fabrication selon un procédé déjà figé.', clues: ['Procédé figé', 'Production'], verdict: 'NONE', explanation: 'Production en aval de la recherche : hors R&D.' },
      { title: 'Prototype d’un support de culture réutilisable', description: 'Nouveau consommable d’usage, à partir de matériaux qualifiés.', clues: ['Prototype de nouveau produit'], verdict: 'CII', explanation: 'Nouveau produit sans verrou de recherche : CII.', codexRef: 'cdx_cii' },
      ...COMMON_CARDS,
    ],
  },
  AGRI: {
    label: 'Agroalimentaire',
    projects: [
      'une texture stable sans additif de synthèse, que l’état de l’art ne permet pas de tenir',
      'une conservation longue durée sans conservateur ajouté',
      'une protéine végétale au profil sensoriel non atteint à ce jour',
    ],
    assets: ['Rhéomètre', 'Ligne pilote de séchage', 'Cellule d’analyse sensorielle'],
    cleanRoles: [
      { role: 'Ingénieure R&D produit', g: 'F', weight: 0.3, claimedRdRatio: 0.85, trueRdRatio: 0.85 },
      { role: 'Technicien de laboratoire', g: 'M', weight: 0.22, claimedRdRatio: 0.7, trueRdRatio: 0.7 },
      { role: 'Ingénieur procédés', g: 'M', weight: 0.24, claimedRdRatio: 0.6, trueRdRatio: 0.6 },
    ],
    trappedRoles: [
      { role: 'Directeur général', g: 'M', weight: 0.3, claimedRdRatio: 1, trueRdRatio: 0.35, evidence: 'piece_feuilles_temps', trap: 'Le DG se déclare à 100 % ; ses relevés montrent 35 % de temps réellement passé en labo.' },
      { role: 'Responsable qualité', g: 'N', weight: 0.22, claimedRdRatio: 0.5, trueRdRatio: 0, trap: 'Contrôle qualité des lots : production courante, hors R&D.' },
      { role: 'Chef de produit marketing', g: 'M', weight: 0.2, claimedRdRatio: 0.4, trueRdRatio: 0, trap: 'Positionnement et packaging : nouveauté commerciale, pas R&D.' },
    ],
    providers: [
      { provider: 'INRAE Transfert', weight: 0.2, hasMesrAgreement: true, related: false, tier: 1 },
      { provider: 'LaboPrivé SAS', weight: 0.14, hasMesrAgreement: false, related: false, tier: 1, trap: 'Pas d’agrément MESR → dépense non éligible.' },
      { provider: 'École d’ingénieurs partenaire', weight: 0.16, hasMesrAgreement: true, related: false, tier: 1 },
    ],
    cards: [
      { title: 'Stabiliser une émulsion sans additif', description: 'Aucune solution connue ne tient au-delà de 40 °C ; combinaisons de protéines testées.', clues: ['Verrou physico-chimique', 'Incertitude'], verdict: 'RD', explanation: 'Verrou et incertitude : R&D éligible.', codexRef: 'cdx_verrou' },
      { title: 'Nouvelle recette à partir d’ingrédients connus', description: 'Assemblage de composants maîtrisés pour un nouveau goût.', clues: ['Nouveauté commerciale', 'Pas de verrou'], verdict: 'NONE', explanation: 'Nouveauté pour l’entreprise ≠ R&D.', codexRef: 'cdx_nouveaute' },
      { title: 'Ligne pilote de séchage doux', description: 'Installation pilote pour un nouveau produit, techniques connues.', clues: ['Installation pilote', 'PME'], verdict: 'CII', explanation: 'Prototype de nouveau produit sans verrou : CII.', codexRef: 'cdx_cii' },
      { title: 'Essais de conservation sous atmosphère modifiée', description: 'Plusieurs mélanges gazeux testés pour lever une incertitude de tenue.', clues: ['Incertitude', 'Protocole'], verdict: 'RD', explanation: 'Incertitude et protocole expérimental : R&D.', codexRef: 'cdx_incertitude' },
      { title: 'Contrôle qualité des lots de production', description: 'Vérification routinière de conformité.', clues: ['Production courante'], verdict: 'NONE', explanation: 'Contrôle qualité : hors R&D.' },
      { title: 'Prototype d’un emballage portionnable', description: 'Premier exemplaire d’un conditionnement pour un nouveau produit, matériaux courants.', clues: ['Prototype de nouveau produit'], verdict: 'CII', explanation: 'Nouveauté produit sans incertitude scientifique : CII.', codexRef: 'cdx_cii' },
      ...COMMON_CARDS,
    ],
  },
  GREENTECH: {
    label: 'Transition écologique',
    projects: [
      'un matériau biosourcé dont la tenue mécanique visée dépasse l’état de l’art',
      'un procédé de recyclage chimique sans solvant fluoré',
      'un stockage d’énergie dont la densité visée n’est pas atteinte aujourd’hui',
    ],
    assets: ['Banc de vieillissement accéléré', 'Réacteur pilote', 'Chaîne de caractérisation matériaux'],
    cleanRoles: [
      { role: 'Ingénieure matériaux', g: 'F', weight: 0.3, claimedRdRatio: 0.85, trueRdRatio: 0.85 },
      { role: 'Chercheur en chimie verte', g: 'M', weight: 0.26, claimedRdRatio: 0.9, trueRdRatio: 0.9 },
      { role: 'Technicien d’essais', g: 'M', weight: 0.2, claimedRdRatio: 0.65, trueRdRatio: 0.65 },
    ],
    trappedRoles: [
      { role: 'Responsable industrialisation', g: 'N', weight: 0.3, claimedRdRatio: 0.8, trueRdRatio: 0.25, evidence: 'piece_feuilles_temps', trap: 'L’industrialisation est en aval de la R&D : ses relevés donnent 25 %.' },
      { role: 'Chargée de mission subventions', g: 'F', weight: 0.18, claimedRdRatio: 0.5, trueRdRatio: 0, trap: 'Montage de dossiers de financement : hors assiette.' },
      { role: 'Technico-commercial', g: 'M', weight: 0.2, claimedRdRatio: 0.3, trueRdRatio: 0, trap: 'Avant-vente et démonstrations client : hors R&D.' },
    ],
    providers: [
      { provider: 'Laboratoire CNRS partenaire', weight: 0.2, hasMesrAgreement: true, related: false, tier: 1 },
      { provider: 'Partenaire de consortium non agréé', weight: 0.15, hasMesrAgreement: false, related: false, tier: 1, trap: 'Un partenaire de consortium sans agrément MESR n’est pas éligible.' },
      { provider: 'Prestataire de rang 3', weight: 0.12, hasMesrAgreement: true, related: false, tier: 3, trap: 'La cascade de sous-traitance s’arrête au 2ᵉ rang.' },
    ],
    cards: [
      { title: 'Formulation d’un composite biosourcé', description: 'La tenue mécanique visée n’est atteinte par aucune formulation publiée.', clues: ['État de l’art dépassé', 'Verrou matériau'], verdict: 'RD', explanation: 'Progrès visé par rapport à l’état de l’art : R&D.', codexRef: 'cdx_etat_art' },
      { title: 'Bilan carbone de l’entreprise', description: 'Comptabilisation selon une méthode publiée.', clues: ['Méthode existante'], verdict: 'NONE', explanation: 'Application d’une méthode connue : hors R&D.', codexRef: 'cdx_dev_courant' },
      { title: 'Prototype de bac de collecte connecté', description: 'Nouveau produit pour l’entreprise, composants du commerce.', clues: ['Prototype de nouveau produit'], verdict: 'CII', explanation: 'Nouveau produit sans verrou : CII.', codexRef: 'cdx_cii' },
      { title: 'Campagne de vieillissement accéléré', description: 'Hypothèses de dégradation testées et invalidées une à une.', clues: ['Protocole', 'Résultats négatifs'], verdict: 'RD', explanation: 'Démarche expérimentale documentée : R&D.', codexRef: 'cdx_demarche' },
      { title: 'Industrialisation du procédé validé', description: 'Passage à l’échelle d’un procédé déjà éprouvé au laboratoire.', clues: ['Aval de la R&D'], verdict: 'NONE', explanation: 'L’industrialisation est en aval de la recherche : hors assiette.' },
      { title: 'Prototype d’un module de tri embarqué', description: 'Nouvel équipement d’usage, assemblé avec des composants du commerce.', clues: ['Prototype de nouveau produit'], verdict: 'CII', explanation: 'Nouveau produit sans verrou : CII, pas CIR.', codexRef: 'cdx_cii' },
      ...COMMON_CARDS,
    ],
  },
  SERVICES: {
    label: 'Services numériques',
    projects: [
      'un moteur d’anonymisation dont la robustesse visée n’est documentée nulle part',
      'un outil interne de planification sous contrainte combinatoire non résolue',
      'un modèle de détection de fraude sur données rares',
    ],
    assets: ['Serveur de calcul interne', 'Plateforme d’expérimentation'],
    cleanRoles: [
      { role: 'Data scientist', g: 'N', weight: 0.28, claimedRdRatio: 0.6, trueRdRatio: 0.6 },
      { role: 'Ingénieur R&D interne', g: 'M', weight: 0.24, claimedRdRatio: 0.55, trueRdRatio: 0.55 },
    ],
    trappedRoles: [
      { role: 'Consultant en mission client', g: 'M', weight: 0.34, claimedRdRatio: 0.8, trueRdRatio: 0, trap: 'Prestation facturée à un client : ce n’est pas de la R&D interne.' },
      { role: 'Chef de projet intégration', g: 'M', weight: 0.26, claimedRdRatio: 0.6, trueRdRatio: 0, trap: 'Intégration d’outils du marché : développement courant.' },
      { role: 'Directeur technique', g: 'M', weight: 0.26, claimedRdRatio: 0.7, trueRdRatio: 0.2, evidence: 'piece_feuilles_temps', trap: 'Avant-vente et pilotage de missions : 20 % de R&D interne réelle.' },
    ],
    providers: [
      { provider: 'Laboratoire universitaire agréé', weight: 0.14, hasMesrAgreement: true, related: false, tier: 1 },
      { provider: 'Cabinet de conseil partenaire', weight: 0.16, hasMesrAgreement: false, related: false, tier: 1, trap: 'Pas d’agrément MESR → dépense non éligible.' },
    ],
    cards: [
      { title: 'Robustesse d’un moteur d’anonymisation', description: 'Aucune garantie connue face aux attaques par recoupement ; approches testées et écartées.', clues: ['Incertitude', 'État de l’art insuffisant'], verdict: 'RD', explanation: 'Incertitude sur l’aboutissement : R&D interne éligible.', codexRef: 'cdx_incertitude' },
      { title: 'Mission d’intégration chez un client', description: 'Déploiement d’une solution du marché, facturé au client.', clues: ['Prestation facturée', 'Techniques standard'], verdict: 'NONE', explanation: 'Une prestation client n’est pas de la R&D de l’entreprise.', codexRef: 'cdx_dev_courant' },
      { title: 'Tableau de bord interne de pilotage', description: 'Assemblage d’outils existants pour la direction.', clues: ['Outils existants'], verdict: 'NONE', explanation: 'Développement courant : hors R&D.', codexRef: 'cdx_dev_courant' },
      { title: 'Expérimentations comparées sur données rares', description: 'Protocoles datés, échecs conservés, métriques publiées en interne.', clues: ['Protocole', 'Résultats négatifs conservés'], verdict: 'RD', explanation: 'Démarche expérimentale tracée : R&D.', codexRef: 'cdx_demarche' },
      { title: 'Prototype d’extension du portail client', description: 'Nouvelle fonction produit sans incertitude scientifique.', clues: ['Prototype de nouveau produit'], verdict: 'CII', explanation: 'Nouveauté produit sans verrou : CII.', codexRef: 'cdx_cii' },
      { title: 'Prototype interne d’un moteur de recherche documentaire', description: 'Nouvel outil pour les équipes, briques open source assemblées.', clues: ['Prototype interne'], verdict: 'CII', explanation: 'Nouveauté d’usage sans incertitude : CII.', codexRef: 'cdx_cii' },
      ...COMMON_CARDS,
    ],
  },
};
