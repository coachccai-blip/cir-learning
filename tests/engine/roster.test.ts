import { describe, it, expect, beforeAll } from 'vitest';
import { prospectsForCycle, scriptedProspect } from '../../src/engine/roster';
import { roster } from '../../src/data/clients';
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

const ROSTER: ClientDef[] = roster();

describe('Vivier de la saison', () => {
  it('sert exactement deux dossiers, toujours les mêmes, aux semaines 1 et 2', () => {
    const s1 = prospectsForCycle(ROSTER, 1, []);
    expect(s1.map((p) => p.company)).toEqual(['Maison Dupuis']);
    const s2 = prospectsForCycle(ROSTER, 2, ['cli_agri_dupuis']);
    expect(s2.map((p) => p.company)).toEqual(['Mecaprécis']);
  });

  it('ne sert plus rien ensuite : deux clients, pas trois', () => {
    const offered = ['cli_agri_dupuis', 'cli_indus_verdier'];
    for (const cycle of [3, 4, 5, 6]) {
      expect(prospectsForCycle(ROSTER, cycle, offered), `semaine ${cycle}`)
        .toEqual([]);
    }
  });

  it('ne dépend pas de la graine : le parcours d’entrée est écrit', () => {
    for (const seed of ['a', 'b', 'c']) {
      void seed;
      expect(prospectsForCycle(ROSTER, 1, [])[0].company).toBe('Maison Dupuis');
      expect(prospectsForCycle(ROSTER, 2, ['cli_agri_dupuis'])[0].company).toBe('Mecaprécis');
    }
  });

  it('ne repropose pas une fiche déjà servie', () => {
    expect(prospectsForCycle(ROSTER, 1, ['cli_agri_dupuis'])).toEqual([]);
  });
});

describe('Fiche de prospection d’un client écrit', () => {
  it('porte le vrai visage du contact, jamais un avatar dessiné', () => {
    for (const c of roster()) {
      const p = scriptedProspect(c, 0);
      expect(hasRealPortrait(p.portraitId), `${c.name} sans portrait`).toBe(true);
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

  it('ouvre la première saison sur un portefeuille vide et une seule piste', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.boot();
    s.setOptions({ volume: 0 });
    s.newGame('vide');
    const save = useStore.getState().save!;
    expect(save.portfolio).toEqual([]);
    expect(save.prospects.map((p) => p.company)).toEqual(['Maison Dupuis']);
  });

  it('transforme un appel réussi en rendez-vous de découverte, pas en signature', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('vide');
    const target = useStore.getState().save!.prospects[0];
    useStore.getState().resolveProspectCall(target.id, ['prospect_sign']);

    const save = useStore.getState().save!;
    expect(save.portfolio.map((cs) => cs.clientId)).toEqual([target.scriptedClientId]);
    // Un rendez-vous décroché n'est pas encaissé : le dossier reste à qualifier.
    expect(save.portfolio[0].dossierState).toBe('LEAD');
    expect(save.revenue.signed).toBe(0);
  });

  it('n’ouvre jamais de dossier sur un prospect généré', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('generes');
    // On signe tout ce qui passe : aucune de ces signatures ne doit ouvrir de
    // dossier. Un client du portefeuille est toujours écrit à la main.
    for (let cycle = 0; cycle < 5; cycle++) {
      useStore.getState().generateProspects(4);
      for (const p of useStore.getState().save!.prospects.filter((x) => x.status === 'NEW' && !x.scriptedClientId)) {
        useStore.getState().resolveProspectCall(p.id, ['prospect_sign']);
      }
    }
    expect(useStore.getState().save!.prospects.filter((p) => p.status === 'SIGNED').length)
      .toBeGreaterThan(4);
    expect(useStore.getState().save!.portfolio).toEqual([]);
  });

  it('donne un vrai visage à chaque client du portefeuille', async () => {
    const { useStore } = await import('../../src/state/store');
    const { clientById } = await import('../../src/data/clients');
    const s = useStore.getState();
    s.newGame('visages');
    for (const p of useStore.getState().save!.prospects) {
      useStore.getState().resolveProspectCall(p.id, ['prospect_sign']);
    }
    const portfolio = useStore.getState().save!.portfolio;
    expect(portfolio.length).toBeGreaterThan(0);
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
    s.newGame('relance');
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
    s.newGame('relance-gen');
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
    s.newGame('doublons');
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
    s.newGame('vivier-epuise');
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
    s.newGame('ecartes');
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

describe('Continuer à jouer ouvre le reste du catalogue', () => {
  it('sert les dossiers jamais proposés, une seule fois', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('suite');
    // Le calendrier d'entrée n'a servi que Maison Dupuis.
    const before = useStore.getState().save!.prospects.map((p) => p.scriptedClientId);
    expect(before).toEqual(['cli_agri_dupuis']);

    useStore.getState().acknowledgeGraduation();
    const after = useStore.getState().save!.prospects.filter((p) => p.scriptedClientId);
    // Les cinq autres dossiers écrits de la saison sont désormais appelables.
    expect(after).toHaveLength(ROSTER.length);
    expect(new Set(after.map((p) => p.scriptedClientId)).size).toBe(ROSTER.length);
    expect(after.map((p) => p.scriptedClientId)).toContain('cli_indus_verdier');
    expect(after.map((p) => p.scriptedClientId)).toContain('cli_services_datao');

    // Un second appel ne duplique rien : l'accusé de réception est à usage unique.
    useStore.getState().acknowledgeGraduation();
    expect(useStore.getState().save!.prospects.filter((p) => p.scriptedClientId)).toHaveLength(
      ROSTER.length,
    );
  });

  it('ne repropose pas un dossier déjà décroché', async () => {
    const { useStore } = await import('../../src/state/store');
    const s = useStore.getState();
    s.newGame('suite-2');
    const dupuis = useStore.getState().save!.prospects[0];
    useStore.getState().resolveProspectCall(dupuis.id, ['prospect_sign']);
    useStore.getState().acknowledgeGraduation();
    const scripted = useStore.getState().save!.prospects.filter((p) => p.scriptedClientId);
    expect(scripted.filter((p) => p.scriptedClientId === 'cli_agri_dupuis')).toHaveLength(1);
    expect(new Set(scripted.map((p) => p.scriptedClientId)).size).toBe(ROSTER.length);
  });
});

describe('Le catalogue ouvert ignore ce qui est déjà pris', () => {
  it('ne repropose pas un client déjà au portefeuille', async () => {
    const { useStore } = await import('../../src/state/store');
    const { initClientState } = await import('../../src/state/factory');
    const s = useStore.getState();
    s.newGame('deja-pris');
    // Un dossier arrivé au portefeuille sans passer par le vivier : il ne doit
    // pas ressortir en piste à appeler.
    useStore.setState({
      save: {
        ...useStore.getState().save!,
        portfolio: [{ ...initClientState('cli_saas_nexalog'), dossierState: 'CLOSED' }],
      },
    });
    useStore.getState().acknowledgeGraduation();
    const scripted = useStore.getState().save!.prospects.map((p) => p.scriptedClientId);
    expect(scripted).not.toContain('cli_saas_nexalog');
    expect(scripted).toContain('cli_indus_verdier');
  });
});
