// Modèles de prospects pour la prospection procédurale (§16).

import type { ProspectTemplate } from '../engine/types';

export const PROSPECT_TEMPLATES: ProspectTemplate[] = [
  {
    id: 'pr_saas',
    companyPool: ['Fluxio', 'Cortexa', 'Brightloop', 'Nimbly', 'Datastream'],
    sectorPool: ['SAAS'],
    sizeRange: [15, 120],
    eligibilityProfile: 'BORDERLINE',
    hooks: ['Ils recrutent 3 profils R&D', 'Ils viennent de lever 4 M€', 'Leur CTO parle d’un moteur maison'],
    estimatedCirRange: [25000, 90000],
  },
  {
    id: 'pr_biotech',
    companyPool: ['Neuronova', 'Immunext', 'BioSère', 'Genethik'],
    sectorPool: ['BIOTECH'],
    sizeRange: [20, 90],
    eligibilityProfile: 'ELIGIBLE',
    hooks: ['Essais pré-cliniques en cours', 'Subvention Bpifrance annoncée', 'Deux docteurs recrutés'],
    estimatedCirRange: [80000, 200000],
  },
  {
    id: 'pr_indus',
    companyPool: ['Métalfine', 'Précilex', 'Forgetech', 'Alliage & Co'],
    sectorPool: ['INDUS'],
    sizeRange: [30, 200],
    eligibilityProfile: 'BORDERLINE',
    hooks: ['Nouveau banc d’essais installé', 'Prototype d’alliage en test', 'Marché aéronautique exigeant'],
    estimatedCirRange: [40000, 130000],
  },
  {
    id: 'pr_green',
    companyPool: ['Solaris Bio', 'Terravert', 'EcoMat', 'Cyclonov'],
    sectorPool: ['GREENTECH'],
    sizeRange: [15, 110],
    eligibilityProfile: 'BORDERLINE',
    hooks: ['Consortium européen', 'Avance remboursable ADEME', 'Matériau biosourcé breveté'],
    estimatedCirRange: [35000, 120000],
  },
  {
    id: 'pr_agri',
    companyPool: ['Ferme du Vallon', 'NutriGraine', 'Saveurs Nord', 'BioChamp'],
    sectorPool: ['AGRI'],
    sizeRange: [10, 80],
    eligibilityProfile: 'BORDERLINE',
    hooks: ['Nouvelle formulation à l’étude', 'Essais de conservation', 'Labo interne récent'],
    estimatedCirRange: [20000, 80000],
  },
  {
    id: 'pr_services_toxic',
    companyPool: ['ConseilPro', 'DigitAll', 'InfoServ', 'NetConsult', 'Prestalink'],
    sectorPool: ['SERVICES'],
    sizeRange: [40, 300],
    eligibilityProfile: 'NOT_ELIGIBLE',
    hooks: ['« On fait de la tech, donc du CIR »', 'ESN en forte croissance', 'Le DG veut du crédit d’impôt'],
    estimatedCirRange: [0, 15000],
  },
  {
    id: 'pr_retail_toxic',
    companyPool: ['ModaShop', 'Épicerie Plus', 'MaisonDéco', 'Sportissimo'],
    sectorPool: ['SERVICES'],
    sizeRange: [20, 150],
    eligibilityProfile: 'NOT_ELIGIBLE',
    hooks: ['Nouveau site e-commerce', 'Refonte de l’appli mobile', 'Migration ERP'],
    estimatedCirRange: [0, 10000],
  },
];
