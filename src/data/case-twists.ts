// Variantes des dossiers écrits à la main (§7.4 étendu).
//
// Chaque cas propose des configurations alternatives, tirées par la graine de
// partie. Le dossier de base reste dans le tirage : c'est celui qui a été
// équilibré et relu. Les autres déplacent les pièges — le prestataire agréé
// ne l'est plus, la personne « saine » devient le poste à corriger — sans
// changer la nature de l'exercice ni le nombre de lignes à trancher.
//
// Règle d'écriture : aucun libellé ne cite de pourcentage ni de montant. Les
// ratios changent d'une variante à l'autre, et les montants sont brouillés par
// le moteur ; un chiffre écrit dans un piège se désynchroniserait.
//
// Les identifiants de ligne sont préfixés par catégorie (p/a/s/g/d) : un
// `dropIds` ne peut donc pas retirer par erreur la ligne d'une autre catégorie.

import type { CaseTwist } from '../engine/casevar';

const AGRI: CaseTwist[] = [
  {
    id: 'tw_agri_agrement',
    hook: 'Cette année, le partenaire privé a décroché son agrément — et l’institut historique a laissé expirer le sien.',
    subcontracting: [
      {
        id: 's1',
        provider: 'Institut technique agroalimentaire',
        hasMesrAgreement: false,
        trap: 'Agrément MESR expiré en cours d’exercice : la facture n’est plus éligible, même chez un partenaire de longue date.',
      },
      { id: 's2', provider: 'LaboPrivé SAS (agréé)', hasMesrAgreement: true, clearTrap: true },
    ],
  },
  {
    id: 'tw_agri_qualite',
    hook: 'La responsable qualité a piloté elle-même la campagne d’essais ; c’est le technicien qui a passé la moitié de l’année en appui production.',
    personnel: [
      { id: 'p2', trueRdRatio: 0.3, evidence: 'piece_feuilles_temps', trap: 'Le technicien a basculé en appui production sur une partie de l’exercice : ce temps-là n’est pas de la R&D.' },
      { id: 'p3', role: 'Responsable qualité et essais', claimedRdRatio: 0.55, trueRdRatio: 0.55, clearTrap: true },
    ],
    grants: [
      {
        id: 'g1',
        source: 'Région (avance remboursable)',
        type: 'repayableAdvance',
        trap: 'Avance remboursable : elle se déduit à l’octroi, pas au remboursement.',
      },
    ],
  },
];

const SAAS: CaseTwist[] = [
  {
    id: 'tw_saas_cto',
    hook: 'La CTO s’est mise en retrait de la recherche cette année, et c’est le développeur front qui a porté le prototype.',
    personnel: [
      { id: 'p1', claimedRdRatio: 0.5, trueRdRatio: 0.15 },
      {
        id: 'p4',
        role: 'Développeur, prototype de recherche',
        claimedRdRatio: 0.7,
        trueRdRatio: 0.55,
        clearTrap: true,
      },
    ],
  },
  {
    id: 'tw_saas_aide',
    hook: 'Le projet a été cofinancé cette année, et le laboratoire est intervenu en re-sous-traitance.',
    subcontracting: [
      {
        id: 's1',
        provider: 'Laboratoire universitaire (via un intégrateur)',
        tier: 3,
        trap: 'Re-sous-traitance de 3ᵉ rang : la cascade s’arrête au 2ᵉ rang, la dépense est exclue.',
      },
    ],
    addGrants: [
      {
        id: 'g1',
        source: 'Bpifrance (subvention innovation)',
        amount: 90000,
        rdAllocationRatio: 1,
        type: 'grant',
        trap: 'Subvention affectée au projet : à déduire de l’assiette.',
      },
    ],
  },
];

const INDUS: CaseTwist[] = [
  {
    id: 'tw_indus_machines',
    hook: 'La machine de série a été reconvertie en banc d’essais, tandis que le banc prototype part désormais en production une partie de l’année.',
    amortization: [
      {
        id: 'a1',
        asset: 'Banc d’essais prototype (partagé avec la production)',
        rdRatio: 1,
        trueRdRatio: 0,
        trap: 'Le banc sert désormais aussi à produire : il n’est plus affecté exclusivement à la R&D.',
      },
      { id: 'a2', asset: 'Machine-outil reconvertie en banc de mise au point', trueRdRatio: 1, clearTrap: true },
    ],
  },
  {
    id: 'tw_indus_cetim',
    hook: 'Une partie des essais est passée par la filiale du groupe, et un partenaire non agréé s’est ajouté.',
    subcontracting: [
      {
        id: 's1',
        provider: 'Filiale d’ingénierie du groupe (agréée)',
        related: true,
        trap: 'Entité liée : plafond annuel de sous-traitance abaissé — à connaître, sans effet sur ce dossier.',
      },
    ],
    addSubcontracting: [
      {
        id: 's2',
        provider: 'Bureau d’études indépendant',
        amount: 26000,
        hasMesrAgreement: false,
        related: false,
        tier: 1,
        trap: 'Aucun agrément MESR : la dépense est exclue, quel que soit le sérieux des travaux.',
      },
    ],
  },
];

const BIOTECH: CaseTwist[] = [
  {
    id: 'tw_biotech_cro',
    hook: 'Le prestataire d’essais a changé en cours d’exercice, et la prestation de rang trois a été réinternalisée d’un cran.',
    subcontracting: [
      {
        id: 's1',
        provider: 'Nouvelle CRO (essais in vivo)',
        hasMesrAgreement: false,
        trap: 'La nouvelle CRO n’est pas agréée MESR : toute la facture d’essais sort de l’assiette.',
      },
      { id: 's3', provider: 'Prestataire de 2ᵉ rang', tier: 2, clearTrap: true },
    ],
  },
  {
    id: 'tw_biotech_avance',
    hook: 'Le plan de financement a été refondu : l’aide nationale est devenue remboursable, et la Région a versé une subvention partiellement affectée.',
    grants: [
      {
        id: 'g1',
        source: 'Bpifrance (avance remboursable)',
        type: 'repayableAdvance',
        trap: 'Avance remboursable : déduite dès l’octroi, sans attendre le remboursement.',
      },
      {
        id: 'g2',
        source: 'Région (subvention)',
        type: 'grant',
        rdAllocationRatio: 0.6,
        trap: 'Seule la quote-part affectée aux travaux de R&D se déduit.',
      },
    ],
  },
];

const GREEN: CaseTwist[] = [
  {
    id: 'tw_green_consortium',
    hook: 'Le partenaire du consortium a obtenu son agrément ; en revanche l’école est intervenue via un tiers.',
    subcontracting: [
      {
        id: 's1',
        provider: 'École d’ingénieurs (via un bureau d’études)',
        tier: 3,
        trap: 'Intervention de 3ᵉ rang : la cascade de sous-traitance s’arrête au 2ᵉ rang.',
      },
      { id: 's2', provider: 'Partenaire consortium (agréé)', hasMesrAgreement: true, clearTrap: true },
    ],
  },
  {
    id: 'tw_green_equipe',
    hook: 'Le responsable industrialisation a rejoint l’équipe de recherche à plein temps ; la chercheuse procédés, elle, a passé l’année sur la ligne de production.',
    personnel: [
      {
        id: 'p2',
        claimedRdRatio: 0.85,
        trueRdRatio: 0.3,
        evidence: 'piece_feuilles_temps',
        trap: 'Le suivi de la ligne de production a occupé l’essentiel de l’année : ce temps ne relève pas de la R&D.',
      },
      { id: 'p3', role: 'Ingénieur procédés (équipe recherche)', claimedRdRatio: 0.9, trueRdRatio: 0.9, clearTrap: true },
    ],
    grants: [{ id: 'g1', source: 'ADEME (subvention)', rdAllocationRatio: 1 }],
  },
];

const SERVICES: CaseTwist[] = [
  {
    id: 'tw_services_freelance',
    hook: 'Le freelance a été régularisé — mais il intervenait pour le compte d’un autre prestataire.',
    subcontracting: [
      {
        id: 's1',
        provider: 'Freelance agréé (mandaté par un intégrateur)',
        hasMesrAgreement: true,
        tier: 3,
        trap: 'Agréé, mais au 3ᵉ rang : la chaîne de sous-traitance s’arrête au 2ᵉ. Un agrément ne suffit pas.',
      },
    ],
  },
  {
    id: 'tw_services_apporteur',
    hook: 'La société a intégré un apporteur d’affaires et confié son avant-vente au data scientist.',
    personnel: [{ id: 'p1', claimedRdRatio: 0.7, trueRdRatio: 0.08 }],
    addPersonnel: [
      {
        id: 'p4',
        name: 'Sonia Vidal',
        role: 'Apporteuse d’affaires',
        grossCost: 49000,
        claimedRdRatio: 0.4,
        trueRdRatio: 0,
        trap: 'Prospection et avant-vente : aucune activité de recherche, quelle que soit la technicité du discours.',
      },
    ],
  },
];

export const CASE_TWISTS: Record<string, CaseTwist[]> = {
  case_agri: AGRI,
  case_saas: SAAS,
  case_indus: INDUS,
  case_biotech: BIOTECH,
  case_green: GREEN,
  case_services: SERVICES,
};

export function twistsForCase(caseId: string): CaseTwist[] {
  return CASE_TWISTS[caseId] ?? [];
}
