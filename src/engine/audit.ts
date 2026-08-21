// Contrôle fiscal (§8.5) : les questions portent sur les décisions réellement
// prises par le joueur. La partie est déjà jouée — le contrôle révèle la
// qualité du travail.

import type {
  AssietteCase,
  AuditFinding,
  AuditResult,
  Cardset,
  ClientState,
  Ruleset,
} from './types';
import { isSubcontractEligible } from './cir/calculator';
import { RELANCES, type FindingFamily } from '../data/audit-relances';

const RATE = 0.3; // approximation d'impact en crédit pour les montants de rappel affichés

export interface AuditOptions {
  /**
   * Séance contradictoire : le vérificateur relance sur chaque constat au lieu
   * de le clore d'une seule question. Réservé à la deuxième saison.
   */
  contradictoire?: boolean;
}

export function buildAuditFindings(
  cs: ClientState,
  c: AssietteCase,
  cardset: Cardset,
  ruleset: Ruleset,
  opts: AuditOptions = {},
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const input = cs.assietteInput;
  /** Attache la relance de la famille de constat, en séance contradictoire. */
  const relance = (family: FindingFamily) =>
    opts.contradictoire ? { followUp: RELANCES[family] } : {};

  // 1. Cartes non éligibles valorisées en R&D
  for (const card of cardset.cards) {
    const placed = cs.cardPlacements[card.id];
    if (placed === 'RD' && card.verdict !== 'RD') {
      findings.push({
        id: `f_card_${card.id}`,
        clientId: cs.clientId,
        label: `Travaux « ${card.title} » valorisés en R&D`,
        defensible: false,
        question: `Vous avez retenu « ${card.title} » dans l'assiette R&D. Où sont l'état de l'art et le verrou technique de ces travaux ?`,
        goodAnswer: '',
        weakAnswers: [
          'C’était un projet important pour le client…',
          'L’équipe a rencontré de vraies difficultés techniques.',
          'Nous pensions que cela relevait de la R&D au sens large.',
        ],
        reassessment: Math.round(9000 * RATE),
        ...relance('card'),
      });
    }
  }

  if (input) {
    // 2. Postes supprimés (leurres) intégrés
    for (const d of c.decoys) {
      if (input.decoysIncluded[d.id]) {
        findings.push({
          id: `f_decoy_${d.id}`,
          clientId: cs.clientId,
          label: `Poste supprimé retenu : ${d.label}`,
          defensible: false,
          question: `Votre assiette intègre « ${d.label} ». Ce poste a été supprimé de l'assiette du CIR. Qu'avez-vous à dire ?`,
          goodAnswer: '',
          weakAnswers: [
            'Ce poste était éligible les années précédentes…',
            'Le client nous l’avait transmis dans ses dépenses.',
            'C’est une erreur de reprise de l’historique.',
          ],
          reassessment: Math.round(d.amount * RATE),
          ...relance('decoy'),
        });
      }
    }

    // 3. Sous-traitance non éligible retenue
    for (const s of c.subcontracting) {
      if (input.subcontractingIncluded[s.id] && !isSubcontractEligible(s, ruleset)) {
        findings.push({
          id: `f_sub_${s.id}`,
          clientId: cs.clientId,
          label: `Sous-traitance non éligible : ${s.provider}`,
          defensible: false,
          question: `Vous avez retenu la facture de ${s.provider}. Pouvez-vous produire son agrément MESR en cours de validité ?`,
          goodAnswer: '',
          weakAnswers: [
            'Nous n’avons pas vérifié l’agrément au moment du dossier.',
            'Le prestataire nous avait dit être « en cours d’agrément ».',
            'La dépense correspond pourtant à de vrais travaux de recherche.',
          ],
          reassessment: Math.round(s.amount * RATE),
          ...relance('sub'),
        });
      }
    }

    // 4. Financements publics non déduits
    for (const g of c.grants) {
      if (!input.grantsDeducted[g.id]) {
        findings.push({
          id: `f_grant_${g.id}`,
          clientId: cs.clientId,
          label: `Financement public non déduit : ${g.source}`,
          defensible: false,
          question: `${g.source} a versé ${g.amount.toLocaleString('fr-FR')} € sur ces travaux. Pourquoi cette somme n'apparaît-elle pas en déduction de l'assiette ?`,
          goodAnswer: '',
          weakAnswers: [
            'Le versement est arrivé en cours d’exercice…',
            'Nous pensions la déduire l’année du remboursement.',
            'Le client ne nous avait pas transmis la convention.',
          ],
          reassessment: Math.round(g.amount * g.rdAllocationRatio * RATE),
          ...relance('grant'),
        });
      }
    }

    // 5. Taux d'affectation gonflés
    for (const p of c.personnel) {
      const claimed = input.personnelRatios[p.id] ?? 0;
      if (claimed > p.trueRdRatio + 0.1) {
        const hasEvidence = p.evidence ? cs.piecesCollected.includes(p.evidence) : false;
        findings.push({
          id: `f_pers_${p.id}`,
          clientId: cs.clientId,
          label: `Taux d'affectation de ${p.name} : ${Math.round(claimed * 100)} %`,
          defensible: false,
          question: `${p.name} est valorisé à ${Math.round(claimed * 100)} % de temps R&D. ${
            hasEvidence
              ? 'Vos propres feuilles de temps indiquent un taux inférieur. Comment l’expliquez-vous ?'
              : 'Sur quelles feuilles de temps vous appuyez-vous ?'
          }`,
          goodAnswer: '',
          weakAnswers: [
            'C’est le taux que la direction nous a déclaré.',
            'Cette personne travaille « essentiellement » sur la R&D.',
            'Nous n’avons pas pu obtenir les feuilles de temps.',
          ],
          reassessment: Math.round(p.grossCost * (claimed - p.trueRdRatio) * 1.4 * RATE),
          ...relance('pers'),
        });
      }
    }
  }

  // 6. Documentation de la démarche expérimentale
  const hasCr = cs.piecesCollected.includes('piece_cr_essais');
  const justifOk = (cs.scores.justification ?? 0) >= 70;
  if (!justifOk || !hasCr) {
    findings.push({
      id: 'f_doc',
      clientId: cs.clientId,
      label: 'Documentation de la démarche expérimentale',
      defensible: hasCr,
      question:
        'Votre dossier évoque une démarche expérimentale. Produisez-moi les comptes rendus d’essais et les hypothèses testées.',
      goodAnswer: hasCr
        ? 'Voici les comptes rendus d’essais collectés en cours de mission, datés et signés, avec les hypothèses et les résultats négatifs conservés.'
        : '',
      weakAnswers: [
        'Les équipes n’ont pas l’habitude de tout documenter…',
        'Nous pouvons reconstituer un historique a posteriori.',
        'Le chef de projet pourra vous l’expliquer oralement.',
      ],
      reassessment: 6000,
      ...relance('doc'),
    });
  }

  return findings;
}

export function resolveAudit(
  findings: AuditFinding[],
  defendedIds: string[],
  justifScore: number,
  playerCir: number,
  feeRate: number,
  /** Constats non défendus mais rectifiés spontanément en séance. */
  mitigatedIds: string[] = [],
  /** Part du rappel abandonnée sur un constat rectifié (0 = aucune remise). */
  remedyRelief = 0,
): AuditResult {
  const detail = findings.map((finding) => {
    const defended = finding.defensible && defendedIds.includes(finding.id);
    return { finding, defended, mitigated: !defended && mitigatedIds.includes(finding.id) };
  });
  // Reconnaître et rectifier n'efface pas le rappel : la bonne foi et la
  // rectification spontanée en réduisent la portée, elles ne l'annulent pas.
  let reassessed = Math.round(
    detail
      .filter((d) => !d.defended)
      .reduce((s, d) => s + d.finding.reassessment * (d.mitigated ? 1 - remedyRelief : 1), 0),
  );
  // Un justificatif solide limite la casse sur les points d'appréciation.
  if (justifScore >= 80) reassessed = Math.round(reassessed * 0.75);
  reassessed = Math.min(reassessed, playerCir);

  let outcome: AuditResult['outcome'];
  if (reassessed === 0) outcome = 'validated';
  else if (reassessed < playerCir * 0.5) outcome = 'partial';
  else outcome = 'total';

  return {
    outcome,
    findings: detail,
    reassessedAmount: reassessed,
    feesRefunded: Math.round(reassessed * feeRate),
  };
}
