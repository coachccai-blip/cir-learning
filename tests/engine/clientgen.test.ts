import { describe, it, expect } from 'vitest';
import { buildClientFromProspect, prospectBecomesClient } from '../../src/engine/clientgen';
import { generateProspect } from '../../src/engine/prospects';
import { PROSPECT_TEMPLATES } from '../../src/data/prospects';
import { computeBreakdown } from '../../src/engine/cir/calculator';
import { scenarioById } from '../../src/data/scenarios/index';
import ruleset from '../../src/data/rules/ruleset-2026.json';
import balance from '../../src/data/balance.json';
import { TEAM_FIRST_NAMES_F, TEAM_FIRST_NAMES_M } from '../../src/data/dossier-kit';
import { hasRealPortrait } from '../../src/data/portraits';
import type { GeneratedProspect, Ruleset } from '../../src/engine/types';

const RULESET = ruleset as Ruleset;
const SETTINGS = balance.prospectToClient;
const SEED = 'test-seed';

// Sans contrainte de noms déjà pris, la génération sert toujours une fiche :
// c'est le magasin qui tient la liste des raisons sociales déjà vues.
const prospects = Array.from({ length: 200 }, (_, i) =>
  generateProspect(PROSPECT_TEMPLATES, SEED, i),
).filter((p): p is GeneratedProspect => p !== null);
const convertible = prospects.filter((p) => prospectBecomesClient(p, SEED, SETTINGS));

describe('Conversion d’un prospect signé en client du portefeuille', () => {
  it('n’attribue que de vrais visages aux prospects', () => {
    for (const p of prospects) {
      expect(hasRealPortrait(p.portraitId), `${p.company} sans portrait`).toBe(true);
    }
  });

  it('refuse un prospect dont le visage serait dessiné', () => {
    // Un client sans photo retomberait sur l'avatar généré : le portefeuille se
    // lirait comme un remplissage. On préfère ne pas ouvrir le dossier.
    const faceless = convertible.map((p) => ({ ...p, portraitId: 'visage-inexistant' }));
    expect(faceless.length).toBeGreaterThan(0);
    for (const p of faceless) {
      expect(prospectBecomesClient(p, SEED, SETTINGS)).toBe(false);
    }
  });

  it('donne au client le visage annoncé au téléphone', () => {
    for (const p of convertible.slice(0, 10)) {
      const bundle = buildClientFromProspect(p, SEED, RULESET, SETTINGS, 2026);
      expect(bundle.client.contact.avatarSeed).toBe(p.portraitId);
      expect(hasRealPortrait(bundle.client.contact.avatarSeed)).toBe(true);
    }
  });

  it('n’ouvre jamais de dossier sur un prospect non éligible', () => {
    for (const p of prospects.filter((p) => p.eligibility === 'NOT_ELIGIBLE')) {
      expect(prospectBecomesClient(p, SEED, SETTINGS)).toBe(false);
    }
  });

  it('écarte les missions trop petites pour justifier un dossier', () => {
    for (const p of convertible) expect(p.estimatedCir).toBeGreaterThanOrEqual(SETTINGS.minEstimatedCir);
  });

  it('en convertit une partie, mais pas tous', () => {
    const eligibleBig = prospects.filter(
      (p) => p.eligibility !== 'NOT_ELIGIBLE' && p.estimatedCir >= SETTINGS.minEstimatedCir,
    );
    expect(eligibleBig.length).toBeGreaterThan(10);
    expect(convertible.length).toBeGreaterThan(0);
    expect(convertible.length).toBeLessThan(eligibleBig.length);
  });

  it('est déterministe : même graine, même verdict', () => {
    for (const p of prospects.slice(0, 20)) {
      expect(prospectBecomesClient(p, SEED, SETTINGS)).toBe(prospectBecomesClient(p, SEED, SETTINGS));
    }
  });
});

describe('Dossier fabriqué pour un prospect converti', () => {
  const built = convertible.slice(0, 25).map((p) => ({
    p,
    b: buildClientFromProspect(p, SEED, RULESET, SETTINGS, 2025),
  }));

  it('produit un dossier jouable : équipe, cartes, scénarios résolvables', () => {
    for (const { b } of built) {
      expect(b.case.personnel.length).toBeGreaterThanOrEqual(2);
      expect(b.cardset.cards).toHaveLength(SETTINGS.cardCount);
      expect(new Set(b.cardset.cards.map((c) => c.id)).size).toBe(SETTINGS.cardCount);
      for (const id of Object.values(b.client.scenarios)) expect(() => scenarioById(id)).not.toThrow();
      expect(b.client.caseId).toBe(b.case.id);
      expect(b.client.cardsetId).toBe(b.cardset.id);
      expect(b.case.clientId).toBe(b.client.id);
    }
  });

  it('mêle toujours des postes sains et des postes piégés', () => {
    for (const { b } of built) {
      expect(b.case.personnel.some((p) => p.trap)).toBe(true);
      expect(b.case.personnel.some((p) => !p.trap)).toBe(true);
    }
  });

  it('propose un tri qui n’est pas gagnable en cochant une seule colonne', () => {
    for (const { b } of built) {
      const counts: Record<string, number> = {};
      for (const c of b.cardset.cards) counts[c.verdict] = (counts[c.verdict] ?? 0) + 1;
      expect(Object.keys(counts).length).toBe(3);
      expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(b.cardset.cards.length / 2);
    }
  });

  it('recale le dossier sur l’ordre de grandeur annoncé au téléphone', () => {
    for (const { p, b } of built) {
      const trueCir = computeBreakdown(b.case, null, RULESET, { legal: true }).cir;
      expect(trueCir).toBeGreaterThan(0);
      // Tolérance large : les arrondis à la centaine d'euros déplacent le total.
      expect(Math.abs(trueCir - p.estimatedCir) / p.estimatedCir).toBeLessThan(0.15);
      expect(b.client.cirEstimate[0]).toBeLessThanOrEqual(trueCir);
      expect(b.client.cirEstimate[1]).toBeGreaterThanOrEqual(trueCir);
    }
  });

  it('est déterministe : même graine, même dossier', () => {
    for (const p of convertible.slice(0, 5)) {
      const a = buildClientFromProspect(p, SEED, RULESET, SETTINGS, 2025);
      const c = buildClientFromProspect(p, SEED, RULESET, SETTINGS, 2025);
      expect(JSON.stringify(a)).toBe(JSON.stringify(c));
    }
  });

  it('accorde le prénom avec l’intitulé du poste', () => {
    const feminineRole = /^(Chargée|Chercheuse|Directrice|Ingénieure|Technicienne)/;
    const masculineRole = /^(Chargé |Chef |Chercheur|Consultant|Directeur|Développeur|Ingénieur |Opérateur|Technicien |Technicien’|Technico)/;
    let checked = 0;
    for (const { b } of built) {
      for (const person of b.case.personnel) {
        const first = person.name.split(' ')[0];
        if (feminineRole.test(person.role)) { checked++; expect(TEAM_FIRST_NAMES_F).toContain(first); }
        if (masculineRole.test(person.role)) { checked++; expect(TEAM_FIRST_NAMES_M).toContain(first); }
      }
    }
    // Le test serait vert sans rien vérifier si aucun intitulé n'était genré.
    expect(checked).toBeGreaterThan(20);
  });

  it('donne à chaque dossier généré un identifiant unique', () => {
    const ids = built.map(({ b }) => b.client.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// Garde-fou de typage : un prospect mal formé ne doit pas passer inaperçu.
const _typecheck: GeneratedProspect = prospects[0];
void _typecheck;
