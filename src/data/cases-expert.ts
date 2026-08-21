// Dossiers de la deuxième saison (mode Expert). Données fictives.
//
// Trois différences avec les dossiers d'Onboarding :
//   — les cinq postes sont présents dès le premier dossier ;
//   — chaque ligne piégée porte une pièce (`evidence`), parce qu'en Expert le
//     taux justifiable n'est révélé qu'à celui qui l'a rapportée du terrain ;
//   — un dossier ne contient presque rien d'éligible : il faut savoir le
//     refuser plutôt que de le monter.

import type { AssietteCase } from '../engine/types';

export const EXPERT_CASES: AssietteCase[] = [
  {
    id: 'case_exp_ovalis',
    clientId: 'cli_exp_ovalis',
    fiscalYear: 2025,
    narrative:
      'Ovalis Nutrition cherche à encapsuler des ferments vivants pour qu’ils survivent à la digestion — aucun enrobage connu ne tient à la fois la chaleur du procédé et l’acidité gastrique.',
    personnel: [
      {
        id: 'p1',
        name: 'Nadia Cherif',
        role: 'Directrice qualité et R&D',
        grossCost: 92000,
        claimedRdRatio: 0.8,
        trueRdRatio: 0.45,
        evidence: 'piece_feuilles_temps',
        trap: 'Elle pilote aussi le plan de contrôle qualité et les audits clients : ce temps-là ne relève pas de la recherche.',
      },
      { id: 'p2', name: 'Yanis Berger', role: 'Ingénieur formulation', grossCost: 64000, claimedRdRatio: 0.9, trueRdRatio: 0.9 },
      { id: 'p3', name: 'Tom Aubert', role: 'Technicien de laboratoire', grossCost: 43000, claimedRdRatio: 0.75, trueRdRatio: 0.75 },
      {
        id: 'p4',
        name: 'Camille Roussel',
        role: 'Chargée d’affaires réglementaires',
        grossCost: 51000,
        claimedRdRatio: 0.5,
        trueRdRatio: 0,
        evidence: 'piece_registre',
        trap: 'Dossiers d’homologation et veille réglementaire : aucune incertitude scientifique à lever.',
      },
    ],
    amortization: [
      { id: 'a1', asset: 'Encapsuleur pilote', annualDepreciation: 22000, rdRatio: 1, trueRdRatio: 1 },
      {
        id: 'a2',
        asset: 'Ligne de conditionnement',
        annualDepreciation: 38000,
        rdRatio: 0.5,
        trueRdRatio: 0,
        trap: 'Conditionnement des lots commerciaux : équipement de production, pas de recherche.',
      },
    ],
    subcontracting: [
      { id: 's1', provider: 'Institut Carnot (agréé)', amount: 55000, hasMesrAgreement: true, related: false, tier: 1 },
      {
        id: 's2',
        provider: 'Laboratoire d’analyses sensorielles',
        amount: 24000,
        hasMesrAgreement: false,
        related: false,
        tier: 1,
        trap: 'Aucun agrément MESR : la dépense est exclue, même si les analyses servent réellement le projet.',
      },
      {
        id: 's3',
        provider: 'Prestataire mandaté par l’institut',
        amount: 12000,
        hasMesrAgreement: true,
        related: false,
        tier: 3,
        trap: 'Intervention de 3ᵉ rang : la cascade de sous-traitance s’arrête au 2ᵉ.',
      },
    ],
    grants: [
      {
        id: 'g1',
        source: 'Région (subvention projet mixte)',
        amount: 45000,
        rdAllocationRatio: 0.6,
        type: 'grant',
        trap: 'Aide versée sur un projet mixte : seule la quote-part affectée à la R&D se déduit.',
      },
    ],
    decoys: [
      { id: 'd1', label: 'Dépôt de brevet encapsulation', amount: 7000, removedItemId: 'patents', reason: 'Frais de brevet supprimés de l’assiette depuis le 15/02/2025.' },
      { id: 'd2', label: 'Abonnement veille scientifique', amount: 3500, removedItemId: 'techWatch', reason: 'Veille technologique supprimée depuis le 15/02/2025.' },
    ],
  },
  {
    id: 'case_exp_fluxym',
    clientId: 'cli_exp_fluxym',
    fiscalYear: 2025,
    narrative:
      'Fluxym travaille sur un ordonnancement d’ateliers dont aucun solveur connu ne garantit la convergence à l’échelle visée. Le reste de l’activité est de l’édition logicielle classique.',
    personnel: [
      {
        id: 'p1',
        name: 'Kevin Roy',
        role: 'Directeur technique',
        grossCost: 105000,
        claimedRdRatio: 0.75,
        trueRdRatio: 0.3,
        evidence: 'piece_feuilles_temps',
        trap: 'Un directeur technique passe une part importante de l’année en avant-vente, en recrutement et en comité.',
      },
      { id: 'p2', name: 'Inès Fabre', role: 'Chercheuse en optimisation', grossCost: 82000, claimedRdRatio: 0.95, trueRdRatio: 0.95 },
      { id: 'p3', name: 'Marius Colin', role: 'Ingénieur R&D', grossCost: 68000, claimedRdRatio: 0.8, trueRdRatio: 0.8 },
      {
        id: 'p4',
        name: 'Sarah Lemoine',
        role: 'Ingénieure support niveau 3',
        grossCost: 57000,
        claimedRdRatio: 0.6,
        trueRdRatio: 0,
        evidence: 'piece_registre',
        trap: 'Support et correction d’anomalies en production : développement courant, quelle que soit la difficulté des tickets.',
      },
    ],
    amortization: [
      { id: 'a1', asset: 'Ferme de calcul dédiée aux entraînements', annualDepreciation: 46000, rdRatio: 0.85, trueRdRatio: 0.85 },
    ],
    subcontracting: [
      { id: 's1', provider: 'Laboratoire d’informatique (agréé)', amount: 70000, hasMesrAgreement: true, related: false, tier: 1 },
      {
        id: 's2',
        provider: 'ESN partenaire',
        amount: 48000,
        hasMesrAgreement: false,
        related: false,
        tier: 1,
        trap: 'Prestataire non agréé MESR : exclu de l’assiette, même sur des travaux réellement techniques.',
      },
    ],
    grants: [
      {
        id: 'g1',
        source: 'Bpifrance (avance remboursable)',
        amount: 100000,
        rdAllocationRatio: 1,
        type: 'repayableAdvance',
        trap: 'Avance remboursable : elle se déduit dès l’octroi, pas au moment du remboursement.',
      },
      {
        id: 'g2',
        source: 'Programme européen (subvention)',
        amount: 60000,
        rdAllocationRatio: 0.5,
        type: 'grant',
        trap: 'Projet cofinancé pour moitié seulement sur la partie recherche : la clé de répartition doit être documentée.',
      },
    ],
    decoys: [
      { id: 'd1', label: 'Frais de dépôt de brevet logiciel', amount: 8000, removedItemId: 'patents', reason: 'Frais de brevet supprimés depuis le 15/02/2025.' },
    ],
  },
  {
    id: 'case_exp_neoregen',
    clientId: 'cli_exp_neoregen',
    fiscalYear: 2025,
    narrative:
      'Néorégén conduit des essais précliniques sur une thérapie cellulaire. Sous-traitance massive, financements publics croisés, et une frontière ténue entre recherche et production de lots cliniques.',
    personnel: [
      {
        id: 'p1',
        name: 'Dr. Amina Sy',
        role: 'Directrice scientifique',
        grossCost: 118000,
        claimedRdRatio: 1,
        trueRdRatio: 0.75,
        evidence: 'piece_feuilles_temps',
        trap: 'La direction scientifique inclut la levée de fonds et la communication investisseurs : ce temps n’est pas de la recherche.',
      },
      { id: 'p2', name: 'Dr. Malik Ferreira', role: 'Chercheur (docteur)', grossCost: 89000, claimedRdRatio: 0.95, trueRdRatio: 0.95 },
      { id: 'p3', name: 'Lucie Vasseur', role: 'Technicienne de recherche', grossCost: 52000, claimedRdRatio: 0.9, trueRdRatio: 0.9 },
      {
        id: 'p4',
        name: 'Hugo Simon',
        role: 'Responsable production clinique',
        grossCost: 71000,
        claimedRdRatio: 0.7,
        trueRdRatio: 0.15,
        evidence: 'piece_registre',
        trap: 'La production des lots cliniques est en aval de la recherche : seule la mise au point du procédé compte.',
      },
    ],
    amortization: [
      { id: 'a1', asset: 'Salle blanche de recherche', annualDepreciation: 65000, rdRatio: 1, trueRdRatio: 1 },
      {
        id: 'a2',
        asset: 'Automate de remplissage',
        annualDepreciation: 52000,
        rdRatio: 1,
        trueRdRatio: 0,
        trap: 'Machine affectée à la production des lots : hors assiette de recherche.',
      },
    ],
    subcontracting: [
      { id: 's1', provider: 'CRO agréée (essais précliniques)', amount: 260000, hasMesrAgreement: true, related: false, tier: 1 },
      {
        id: 's2',
        provider: 'Filiale Néorégén Bio (liée, agréée)',
        amount: 110000,
        hasMesrAgreement: true,
        related: true,
        tier: 1,
        trap: 'Entité liée : le plafond annuel de sous-traitance est abaissé — à vérifier avant de tout retenir.',
      },
      {
        id: 's3',
        provider: 'Plateforme mandatée par la CRO',
        amount: 35000,
        hasMesrAgreement: true,
        related: false,
        tier: 3,
        trap: 'Re-sous-traitance de 3ᵉ rang : exclue, agrément ou non.',
      },
    ],
    grants: [
      {
        id: 'g1',
        source: 'Bpifrance (subvention)',
        amount: 150000,
        rdAllocationRatio: 1,
        type: 'grant',
        trap: 'Subvention affectée au programme de recherche : à déduire intégralement.',
      },
      {
        id: 'g2',
        source: 'Avance remboursable Région',
        amount: 80000,
        rdAllocationRatio: 1,
        type: 'repayableAdvance',
        trap: 'Avance remboursable : déduite à l’octroi.',
      },
    ],
    decoys: [
      { id: 'd1', label: 'Majoration jeune docteur (×2)', amount: 89000, removedItemId: 'youngDoctorBonus', reason: 'Majoration jeune docteur supprimée depuis le 15/02/2025. Le salaire du docteur, lui, reste éligible au taux normal.' },
      { id: 'd2', label: 'Frais de brevet thérapie cellulaire', amount: 11000, removedItemId: 'patents', reason: 'Frais de brevet supprimés depuis le 15/02/2025.' },
    ],
  },
  {
    id: 'case_exp_forgeal',
    clientId: 'cli_exp_forgeal',
    fiscalYear: 2025,
    narrative:
      'Forgeal usine des pièces réfractaires avec un savoir-faire rare — mais documenté ailleurs. Le seul développement de l’année est un bâti conçu en interne : un matériel nouveau, sans incertitude scientifique.',
    personnel: [
      {
        id: 'p1',
        name: 'Bruno Meyer',
        role: 'Gérant',
        grossCost: 76000,
        claimedRdRatio: 0.6,
        trueRdRatio: 0.05,
        evidence: 'piece_feuilles_temps',
        trap: 'Direction, devis et conduite d’atelier : l’essentiel de l’année n’a rien de scientifique.',
      },
      {
        id: 'p2',
        name: 'Sofia Marchand',
        role: 'Cheffe d’atelier',
        grossCost: 58000,
        claimedRdRatio: 0.5,
        trueRdRatio: 0,
        evidence: 'piece_registre',
        trap: 'Conduite de l’atelier et réglages de série : production courante.',
      },
      {
        id: 'p3',
        name: 'Damien Roche',
        role: 'Technicien méthodes',
        grossCost: 49000,
        claimedRdRatio: 0.4,
        trueRdRatio: 0.1,
        evidence: 'piece_feuilles_temps',
        trap: 'Industrialisation et gammes d’usinage : en aval de toute recherche.',
      },
    ],
    amortization: [
      {
        id: 'a1',
        asset: 'Bâti de maintien conçu en interne',
        annualDepreciation: 18000,
        rdRatio: 1,
        trueRdRatio: 0,
        trap: 'Premier exemplaire d’un matériel nouveau, sans verrou de recherche : cela relève du CII, pas du CIR.',
      },
    ],
    subcontracting: [
      {
        id: 's1',
        provider: 'Bureau d’études indépendant',
        amount: 30000,
        hasMesrAgreement: false,
        related: false,
        tier: 1,
        trap: 'Aucun agrément MESR : dépense exclue.',
      },
    ],
    grants: [],
    decoys: [
      { id: 'd1', label: 'Dépôt de brevet du bâti', amount: 5000, removedItemId: 'patents', reason: 'Frais de brevet supprimés depuis le 15/02/2025.' },
    ],
  },
];
