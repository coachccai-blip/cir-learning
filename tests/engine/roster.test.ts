import { describe, it, expect, beforeAll } from 'vitest';
import { arrivingProspect, openingProspects, rosterOrder, scriptedProspect } from '../../src/engine/roster';
import { rosterFor } from '../../src/data/clients';
import { hasRealPortrait } from '../../src/data/portraits';
import type { ClientDef } from '../../src/engine/types';

/**
 * D'où viennent les clients du portefeuille.
 *
 * Le portefeuille s'ouvrait sur deux dossiers déjà présents. Au cabinet, on
 * n'hérite pas d'un portefeuille : on le construit au téléphone. Ces contrôles
 * vérifient que chaque client écrit passe bien par le vivier de prospection,
 * avec un vrai visage, et que le vivier ne se répète pas.
 */

const ROSTER: ClientDef[] = rosterFor('onboarding');

describe('Vivier de prospection', () => {
  it('propose deux pistes au premier jour, pas davantage', () => {
    const opening = openingProspects(ROSTER, 'graine', 2);
    expect(opening).toHaveLength(2);
    expect(new Set(opening.map((p) => p.scriptedClientId)).size).toBe(2);
  });

  it('donne un ordre différent selon la graine, mais stable pour une même partie', () => {
    const a = rosterOrder(ROSTER, 'a').map((c) => c.id);
    const b = rosterOrder(ROSTER, 'b').map((c) => c.id);
    expect(rosterOrder(ROSTER, 'a').map((c) => c.id)).toEqual(a);
    expect(a).not.toEqual(b);
    // Aucun client perdu ni dupliqué en route.
    expect([...a].sort()).toEqual(ROSTER.map((c) => c.id).sort());
  });

  it('n’envoie aucune nouvelle piste avant la troisième semaine', () => {
    for (const cycle of [1, 2]) {
      expect(arrivingProspect(ROSTER, 'graine', cycle, 2, [])).toBeNull();
    }
  });

  it('sert ensuite une piste par semaine, sans jamais repasser les mêmes', () => {
    const offered = openingProspects(ROSTER, 'graine', 2).map((p) => p.scriptedClientId!);
    for (let cycle = 3; cycle < 3 + (ROSTER.length - 2); cycle++) {
      const next = arrivingProspect(ROSTER, 'graine', cycle, 2, offered);
      expect(next, `semaine ${cycle}`).not.toBeNull();
      expect(offered).not.toContain(next!.scriptedClientId);
      offered.push(next!.scriptedClientId!);
    }
    expect(new Set(offered).size).toBe(ROSTER.length);
    // Vivier épuisé : plus rien à servir, et surtout pas un doublon.
    expect(arrivingProspect(ROSTER, 'graine', 20, 2, offered)).toBeNull();
  });
});

describe('Fiche de prospection d’un client écrit', () => {
  it('porte le vrai visage du contact, jamais un avatar dessiné', () => {
    for (const mode of ['onboarding', 'expert'] as const) {
      for (const c of rosterFor(mode)) {
        const p = scriptedProspect(c, 0);
        expect(hasRealPortrait(p.portraitId), `${c.name} sans portrait`).toBe(true);
      }
    }
  });

  it('reprend l’identité du client et renvoie vers son dossier écrit', () => {
    const c = ROSTER[0];
    const p = scriptedProspect(c, 0);
    expect(p.company).toBe(c.name);
    expect(p.contactName).toBe(c.contact.name);
    expect(p.gender).toBe(c.contact.gender);
    expect(p.scriptedClientId).toBe(c.id);
    expect(p.status).toBe('NEW');
    // Au téléphone, on annonce le bas de la fourchette : la promesse se
    // négocie en rendez-vous, pas au décrochage.
    expect(p.estimatedCir).toBe(c.cirEstimate[0]);
  });

  it('varie la situation d’appel d’une fiche à l’autre', () => {
    const scenarios = ROSTER.map((c, i) => scriptedProspect(c, i).callScenarioId);
    expect(new Set(scenarios).size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// Le même parcours, mais sur le vrai magasin.
// ---------------------------------------------------------------------------

describe('Un client n’entre au portefeuille que par le téléphone', () => {
  beforeAll(() => {
    const mem: Record<string, string> = {};
    (globalThis as unknown as { localStorage: unknown }).localStorage = {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => {
        mem[k] = v;
      },
      removeItem: (k: string) => {
        delete mem[k];
      },
    };
  });

  it('ouvre la partie sur un portefeuille vide et deux pistes à appeler', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.boot();
    s.setOptions({ volume: 0 });
    s.newGame('onboarding', 'vide');
    const save = useStore.getState().save!;
    expect(save.portfolio).toEqual([]);
    expect(save.prospects).toHaveLength(2);
    expect(save.prospects.every((p) => p.scriptedClientId)).toBe(true);
  });

  it('transforme un appel réussi en rendez-vous de découverte, pas en signature', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('onboarding', 'vide');
    const target = useStore.getState().save!.prospects[0];
    useStore.getState().resolveProspectCall(target.id, ['prospect_sign']);

    const save = useStore.getState().save!;
    expect(save.portfolio.map((cs) => cs.clientId)).toEqual([target.scriptedClientId]);
    // Un rendez-vous décroché n'est pas encaissé : le dossier reste à qualifier.
    expect(save.portfolio[0].dossierState).toBe('LEAD');
    expect(save.revenue.signed).toBe(0);
  });

  it('donne un vrai visage à chaque client du portefeuille', async () => {
    const { useStore } = await import('../../src/state/store');
    const { clientById } = await import('../../src/data/clients');
    const s = useStore.getState();
    s.newGame('onboarding', 'visages');
    // On tente de signer tout ce qui passe, écrit comme généré.
    for (let cycle = 0; cycle < 6; cycle++) {
      useStore.getState().generateProspects(4);
      for (const p of useStore.getState().save!.prospects.filter((x) => x.status === 'NEW')) {
        useStore.getState().resolveProspectCall(p.id, ['prospect_sign']);
      }
    }
    const portfolio = useStore.getState().save!.portfolio;
    expect(portfolio.length).toBeGreaterThan(2);
    for (const cs of portfolio) {
      const c = clientById(cs.clientId);
      expect(hasRealPortrait(c.contact.avatarSeed), `${c.name} sans portrait`).toBe(true);
    }
  });
});

describe('Une piste écrite ratée se rappelle', () => {
  it('revient dans le vivier la semaine suivante', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('onboarding', 'relance');
    const target = useStore.getState().save!.prospects[0];
    useStore.getState().resolveProspectCall(target.id, ['prospect_decline']);
    expect(useStore.getState().save!.prospects.find((p) => p.id === target.id)!.status).toBe(
      'DECLINED',
    );
    expect(useStore.getState().save!.portfolio).toEqual([]);

    useStore.getState().advanceCycle();
    // Un appel raté ne condamne pas un dossier écrit : à deux pistes ouvertes,
    // la saison entière y passerait.
    expect(useStore.getState().save!.prospects.find((p) => p.id === target.id)!.status).toBe('NEW');
  });

  it('ne ressuscite pas un prospect généré écarté', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('onboarding', 'relance-gen');
    useStore.getState().generateProspects(3);
    const gen = useStore.getState().save!.prospects.find((p) => !p.scriptedClientId)!;
    useStore.getState().resolveProspectCall(gen.id, ['prospect_decline']);
    useStore.getState().advanceCycle();
    expect(useStore.getState().save!.prospects.find((p) => p.id === gen.id)!.status).toBe(
      'DECLINED',
    );
  });
});

describe('Le vivier ne se répète pas', () => {
  it('ne sert jamais deux fois la même raison sociale ni le même interlocuteur', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('onboarding', 'doublons');
    // Sans budget d'actions, un joueur peut appeler et réseauter tout son
    // saoul : le vivier doit tenir la distance sans se répéter.
    for (let cycle = 0; cycle < 6; cycle++) useStore.getState().generateProspects(5);
    const prospects = useStore.getState().save!.prospects;
    expect(prospects.length).toBeGreaterThanOrEqual(30);
    const companies = prospects.map((p) => p.company);
    const contacts = prospects.map((p) => p.contactName);
    expect(new Set(companies).size, 'raisons sociales en double').toBe(companies.length);
    expect(new Set(contacts).size, 'interlocuteurs en double').toBe(contacts.length);
  });

  it('préfère servir moins de fiches que d’en resservir une déjà vue', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('onboarding', 'vivier-epuise');
    // Bien plus de demandes que le vivier ne compte d'entreprises : la liste
    // doit se tarir, jamais se répéter.
    for (let i = 0; i < 40; i++) useStore.getState().generateProspects(10);
    const companies = useStore.getState().save!.prospects.map((p) => p.company);
    expect(new Set(companies).size, 'une entreprise est revenue deux fois').toBe(companies.length);
    // Le vivier s'est bien tari plutôt que de boucler indéfiniment.
    expect(companies.length).toBeLessThan(400);
  });

  it('évite aussi les noms des fiches déjà écartées', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('onboarding', 'ecartes');
    useStore.getState().generateProspects(4);
    // On écarte tout : les fiches restent affichées, leurs noms restent pris.
    for (const p of useStore.getState().save!.prospects.filter((x) => !x.scriptedClientId)) {
      useStore.getState().resolveProspectCall(p.id, ['prospect_decline']);
    }
    const before = useStore.getState().save!.prospects.map((p) => p.company);
    useStore.getState().generateProspects(4);
    const after = useStore.getState().save!.prospects.map((p) => p.company);
    expect(new Set(after).size, `doublon avec les écartés : ${before.join(', ')}`).toBe(after.length);
  });
});
