// Cas d'assiette avec pièges contextualisés (§7.4, §15.3). Données fictives.
// Les corrigés (« expected ») sont recalculés par le moteur, pas figés à la main.

import type { AssietteCase } from '../engine/types';
import { variedCase } from './registry';

export const CASES: AssietteCase[] = [
  {
    id: 'case_agri',
    clientId: 'cli_agri_dupuis',
    fiscalYear: 2025,
    narrative:
      'Maison Dupuis a travaillé sur la stabilisation d’une émulsion végétale sans additif de synthèse — un vrai verrou de physico-chimie alimentaire.',
    personnel: [
      {
        id: 'p1',
        name: 'Léa Ferrand',
        role: 'Ingénieure R&D',
        grossCost: 62000,
        claimedRdRatio: 1.0,
        trueRdRatio: 0.8,
        evidence: 'piece_feuilles_temps',
        trap: 'Le DG déclare tout son temps en R&D ; les feuilles de temps révèlent une part d’appui à la production.',
      },
      { id: 'p2', name: 'Tom Aubert', role: 'Technicien de labo', grossCost: 41000, claimedRdRatio: 0.6, trueRdRatio: 0.6 },
      {
        id: 'p3',
        name: 'Nadia Cherif',
        role: 'Responsable qualité',
        grossCost: 55000,
        claimedRdRatio: 0.5,
        trueRdRatio: 0.0,
        trap: 'Contrôle qualité de production courante : ce n’est pas de la R&D.',
      },
    ],
    amortization: [{ id: 'a1', asset: 'Rhéomètre', annualDepreciation: 9000, rdRatio: 1.0, trueRdRatio: 1.0 }],
    subcontracting: [
      { id: 's1', provider: 'INRAE Transfert', amount: 35000, hasMesrAgreement: true, related: false, tier: 1 },
      {
        id: 's2',
        provider: 'LaboPrivé SAS',
        amount: 18000,
        hasMesrAgreement: false,
        related: false,
        tier: 1,
        trap: 'Pas d’agrément MESR → dépense non éligible depuis 2022.',
      },
    ],
    grants: [{ id: 'g1', source: 'Région', amount: 20000, rdAllocationRatio: 1.0, type: 'grant' }],
    decoys: [
      { id: 'd1', label: 'Dépôt de brevet émulsion', amount: 4200, removedItemId: 'patents', reason: 'Frais de brevet supprimés de l’assiette depuis le 15/02/2025.' },
      { id: 'd2', label: 'Abonnement veille normative', amount: 2800, removedItemId: 'techWatch', reason: 'Veille technologique supprimée depuis le 15/02/2025.' },
    ],
  },
  {
    id: 'case_saas',
    clientId: 'cli_saas_nexalog',
    fiscalYear: 2025,
    narrative:
      'Nexalog a développé un moteur de prédiction de flux logistiques. Une partie relève de la R&D (algorithme sous incertitude), une partie du développement courant (portages, intégrations).',
    personnel: [
      {
        id: 'p1',
        name: 'Elsa Brunet',
        role: 'CTO',
        grossCost: 95000,
        claimedRdRatio: 0.5,
        trueRdRatio: 0.35,
        evidence: 'piece_feuilles_temps',
        trap: 'Un CTO fait aussi du management et de l’avant-vente : la part réellement consacrée à la recherche est plus basse que le taux déclaré.',
      },
      { id: 'p2', name: 'Sami Toure', role: 'Chercheur ML', grossCost: 72000, claimedRdRatio: 0.9, trueRdRatio: 0.9 },
      { id: 'p3', name: 'Julie Amrani', role: 'Ingénieure R&D', grossCost: 64000, claimedRdRatio: 0.8, trueRdRatio: 0.8 },
      {
        id: 'p4',
        name: 'Kevin Roy',
        role: 'Développeur front',
        grossCost: 52000,
        claimedRdRatio: 0.7,
        trueRdRatio: 0.0,
        trap: 'Intégration d’écrans et portage mobile : développement courant, pas de R&D.',
      },
    ],
    amortization: [
      { id: 'a1', asset: 'Cluster GPU d’entraînement', annualDepreciation: 24000, rdRatio: 0.8, trueRdRatio: 0.8 },
    ],
    subcontracting: [
      { id: 's1', provider: 'Laboratoire universitaire (agréé)', amount: 40000, hasMesrAgreement: true, related: false, tier: 1 },
    ],
    grants: [],
    decoys: [
      { id: 'd1', label: 'Frais de dépôt de brevet logiciel', amount: 6000, removedItemId: 'patents', reason: 'Frais de brevet supprimés depuis le 15/02/2025.' },
    ],
  },
  {
    id: 'case_indus',
    clientId: 'cli_indus_verdier',
    fiscalYear: 2025,
    narrative:
      'Mecaprécis a conçu un banc d’essais et des prototypes pour usiner un alliage réfractaire jusque-là non maîtrisé. Frontière CIR (recherche) / CII (prototype de nouveau produit).',
    personnel: [
      { id: 'p1', name: 'Hervé Verdier', role: 'Directeur / ingénieur', grossCost: 88000, claimedRdRatio: 0.3, trueRdRatio: 0.3 },
      { id: 'p2', name: 'Sophie Lasalle', role: 'Ingénieure matériaux', grossCost: 68000, claimedRdRatio: 0.85, trueRdRatio: 0.85 },
      {
        id: 'p3',
        name: 'Bruno Meyer',
        role: 'Chef d’atelier',
        grossCost: 54000,
        claimedRdRatio: 0.5,
        trueRdRatio: 0.2,
        evidence: 'piece_feuilles_temps',
        trap: 'La production série n’est pas de la R&D : seule la mise au point du procédé entre dans l’assiette.',
      },
    ],
    amortization: [
      { id: 'a1', asset: 'Banc d’essais prototype', annualDepreciation: 30000, rdRatio: 1.0, trueRdRatio: 1.0 },
      {
        id: 'a2',
        asset: 'Machine-outil série',
        annualDepreciation: 45000,
        rdRatio: 1.0,
        trueRdRatio: 0.0,
        trap: 'Machine de production série : non affectée à la R&D.',
      },
    ],
    subcontracting: [
      { id: 's1', provider: 'CETIM (agréé)', amount: 60000, hasMesrAgreement: true, related: false, tier: 1 },
    ],
    grants: [],
    decoys: [
      { id: 'd1', label: 'Maintenance de brevet procédé', amount: 3500, removedItemId: 'patents', reason: 'Frais de brevet supprimés depuis le 15/02/2025.' },
    ],
  },
  {
    id: 'case_biotech',
    clientId: 'cli_biotech_cellvia',
    fiscalYear: 2025,
    narrative:
      'Cellvia mène des essais pré-cliniques sur une molécule candidate. Sous-traitance agréée importante, subvention Bpifrance et avance remboursable à déduire.',
    personnel: [
      { id: 'p1', name: 'Dr. Amina Sy', role: 'Chercheuse (docteure)', grossCost: 78000, claimedRdRatio: 1.0, trueRdRatio: 1.0 },
      { id: 'p2', name: 'Dr. Paul Vidal', role: 'Chercheur (docteur)', grossCost: 82000, claimedRdRatio: 0.9, trueRdRatio: 0.9 },
      { id: 'p3', name: 'Emma Léger', role: 'Technicienne de recherche', grossCost: 46000, claimedRdRatio: 0.8, trueRdRatio: 0.8 },
    ],
    amortization: [{ id: 'a1', asset: 'Plateforme de criblage', annualDepreciation: 40000, rdRatio: 1.0, trueRdRatio: 1.0 }],
    subcontracting: [
      { id: 's1', provider: 'CRO agréée (essais in vivo)', amount: 220000, hasMesrAgreement: true, related: false, tier: 1 },
      {
        id: 's2',
        provider: 'Filiale Cellvia Lab (liée)',
        amount: 90000,
        hasMesrAgreement: true,
        related: true,
        tier: 1,
        trap: 'Entité liée : plafond annuel de sous-traitance abaissé à 2 M€ (sans effet ici mais à connaître).',
      },
      {
        id: 's3',
        provider: 'Prestataire de 3ᵉ rang',
        amount: 15000,
        hasMesrAgreement: true,
        related: false,
        tier: 3,
        trap: 'Re-sous-traitance de 3ᵉ rang : non éligible (cascade limitée au 2ᵉ rang).',
      },
    ],
    grants: [
      { id: 'g1', source: 'Bpifrance (subvention)', amount: 120000, rdAllocationRatio: 1.0, type: 'grant', trap: 'Subvention Bpifrance à déduire de l’assiette.' },
      { id: 'g2', source: 'Avance remboursable Région', amount: 60000, rdAllocationRatio: 1.0, type: 'repayableAdvance', trap: 'Avance remboursable : déduite à l’octroi.' },
    ],
    decoys: [
      { id: 'd1', label: 'Majoration jeune docteur (×2)', amount: 78000, removedItemId: 'youngDoctorBonus', reason: 'Majoration jeune docteur supprimée depuis le 15/02/2025. Le salaire du docteur reste éligible au taux normal.' },
      { id: 'd2', label: 'Frais de brevet molécule', amount: 9000, removedItemId: 'patents', reason: 'Frais de brevet supprimés depuis le 15/02/2025.' },
    ],
  },
  {
    id: 'case_green',
    clientId: 'cli_green_solterra',
    fiscalYear: 2025,
    narrative:
      'Solterra développe un isolant biosourcé au sein d’un consortium. Avance remboursable et quote-part de subvention à traiter finement.',
    personnel: [
      { id: 'p1', name: 'Yohan Prat', role: 'Ingénieur matériaux', grossCost: 66000, claimedRdRatio: 0.9, trueRdRatio: 0.9 },
      { id: 'p2', name: 'Clara Dumas', role: 'Chercheuse procédés', grossCost: 71000, claimedRdRatio: 0.85, trueRdRatio: 0.85 },
      {
        id: 'p3',
        name: 'Nabil Haddad',
        role: 'Responsable industrialisation',
        grossCost: 63000,
        claimedRdRatio: 0.6,
        trueRdRatio: 0.25,
        evidence: 'piece_feuilles_temps',
        trap: 'L’industrialisation est en aval de la R&D : le taux justifiable est bien inférieur au taux déclaré.',
      },
    ],
    amortization: [{ id: 'a1', asset: 'Ligne pilote', annualDepreciation: 55000, rdRatio: 0.7, trueRdRatio: 0.7 }],
    subcontracting: [
      { id: 's1', provider: 'École d’ingénieurs (agréée)', amount: 48000, hasMesrAgreement: true, related: false, tier: 1 },
      {
        id: 's2',
        provider: 'Partenaire consortium (non agréé)',
        amount: 30000,
        hasMesrAgreement: false,
        related: false,
        tier: 1,
        trap: 'Partenaire de consortium sans agrément MESR : non éligible.',
      },
    ],
    grants: [
      { id: 'g1', source: 'ADEME (subvention)', amount: 80000, rdAllocationRatio: 0.75, type: 'grant', trap: 'Seule la quote-part affectée à la R&D est déduite.' },
      { id: 'g2', source: 'Avance remboursable', amount: 50000, rdAllocationRatio: 1.0, type: 'repayableAdvance', trap: 'Avance remboursable déduite à l’octroi.' },
    ],
    decoys: [
      { id: 'd1', label: 'Veille brevets concurrents', amount: 5000, removedItemId: 'techWatch', reason: 'Veille technologique supprimée depuis le 15/02/2025.' },
    ],
  },
  {
    id: 'case_services',
    clientId: 'cli_services_datao',
    fiscalYear: 2025,
    narrative:
      'Data&Co réalise des prestations pour ses clients. La quasi-totalité relève du développement courant : quelques jours d’un data scientist touchent peut-être à une vraie incertitude, le reste non.',
    personnel: [
      {
        id: 'p1',
        name: 'Rémi Fabre',
        role: 'Data scientist',
        grossCost: 68000,
        claimedRdRatio: 0.8,
        trueRdRatio: 0.15,
        evidence: 'piece_feuilles_temps',
        trap: 'Prestations client facturées : seule une petite part relève d’une R&D interne réelle.',
      },
      {
        id: 'p2',
        name: 'Léna Bruno',
        role: 'Consultante BI',
        grossCost: 58000,
        claimedRdRatio: 0.6,
        trueRdRatio: 0.0,
        trap: 'Mise en place d’outils existants chez les clients : aucune R&D.',
      },
      {
        id: 'p3',
        name: 'Hugo Petit',
        role: 'Développeur',
        grossCost: 51000,
        claimedRdRatio: 0.5,
        trueRdRatio: 0.0,
        trap: 'Développement applicatif standard : pas de R&D.',
      },
    ],
    amortization: [],
    subcontracting: [
      {
        id: 's1',
        provider: 'Freelance (non agréé)',
        amount: 22000,
        hasMesrAgreement: false,
        related: false,
        tier: 1,
        trap: 'Sous-traitant sans agrément : non éligible.',
      },
    ],
    grants: [],
    decoys: [
      { id: 'd1', label: 'Abonnement veille technologique', amount: 3000, removedItemId: 'techWatch', reason: 'Veille technologique supprimée depuis le 15/02/2025.' },
    ],
  },
];

/** Tous les dossiers écrits à la main. */
export function writtenCases(): AssietteCase[] {
  return [...CASES];
}

export function caseById(id: string): AssietteCase {
  // La variante de la partie en cours prime : c'est elle que le joueur
  // instruit, et c'est sur elle que le corrigé doit être calculé.
  const c = variedCase(id) ?? CASES.find((c) => c.id === id);
  if (!c) throw new Error(`Cas inconnu : ${id}`);
  return c;
}
