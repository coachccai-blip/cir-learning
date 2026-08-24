import { describe, it, expect } from 'vitest';
import { genderOfVoice, pickVoice, pitchFor, rateFor, scoreForGender } from '../../src/app/speech';
import { displayedSpeaker, genderForSpeaker, isGenericSpeaker } from '../../src/data/voices';
import { CLIENTS } from '../../src/data/clients';
import { EXPERT_CLIENTS } from '../../src/data/clients-expert';
import { SCENARIOS } from '../../src/data/scenarios/index';

// Voix telles qu'on les rencontre réellement : macOS, Windows, Chrome Android.
const VOICES = [
  { name: 'Google français', lang: 'fr-FR' },
  { name: 'Amélie', lang: 'fr-CA' },
  { name: 'Thomas', lang: 'fr-FR' },
  { name: 'Microsoft Hortense Desktop - French', lang: 'fr-FR' },
  { name: 'Daniel', lang: 'en-GB' },
  { name: 'Samantha', lang: 'en-US' },
];

describe('Choix de la voix de lecture', () => {
  it('ne retient jamais une voix non française', () => {
    for (const g of ['F', 'M'] as const) {
      const v = pickVoice(VOICES, g);
      expect(v?.lang.toLowerCase().startsWith('fr')).toBe(true);
    }
  });

  it('choisit une voix féminine pour une femme, masculine pour un homme', () => {
    expect(pickVoice(VOICES, 'F')?.name).toMatch(/Amélie|Hortense/);
    expect(pickVoice(VOICES, 'M')?.name).toBe('Thomas');
  });

  it('accepte une voix française neutre plutôt que rien', () => {
    const neutral = [{ name: 'Google français', lang: 'fr-FR' }];
    expect(pickVoice(neutral, 'F')?.name).toBe('Google français');
    expect(pickVoice(neutral, 'M')?.name).toBe('Google français');
  });

  it('ne rend rien si aucune voix française n’est installée', () => {
    expect(pickVoice([{ name: 'Daniel', lang: 'en-GB' }], 'M')).toBeNull();
    expect(pickVoice([], 'F')).toBeNull();
  });

  it('écarte les hauteurs quand la voix ne porte pas de genre', () => {
    const neutral = { name: 'Google français' };
    expect(pitchFor('F', neutral)).toBeGreaterThan(pitchFor('M', neutral));
    // Voix déjà genrée : on ne la déforme pas.
    expect(pitchFor('F', { name: 'Amélie' })).toBe(1);
    expect(pitchFor('M', { name: 'Thomas' })).toBe(1);
  });

  it('note correctement le genre d’une voix', () => {
    expect(scoreForGender({ name: 'Hortense' }, 'F')).toBe(2);
    expect(scoreForGender({ name: 'Hortense' }, 'M')).toBe(0);
    expect(scoreForGender({ name: 'Google français' }, 'M')).toBe(1);
  });
});

describe('Genre des interlocuteurs', () => {
  it('chaque client écrit porte un genre explicite', () => {
    for (const c of CLIENTS) expect(['F', 'M']).toContain(c.contact.gender);
  });

  it('les PNJ récurrents ont une voix attribuée', () => {
    expect(genderForSpeaker('Amélie Roux (manager)')).toBe('F');
    expect(genderForSpeaker('Karim Bensaïd (senior)')).toBe('M');
    expect(genderForSpeaker('Sophie Meyer (directrice de BU)')).toBe('F');
  });

  it('« Le client » emprunte la voix de l’interlocuteur en cours', () => {
    expect(genderForSpeaker('Le client', 'F')).toBe('F');
    expect(genderForSpeaker('Le prospect', 'M')).toBe('M');
  });

  it('tout locuteur du contenu obtient une voix, sans exception', () => {
    const speakers = new Set(SCENARIOS.flatMap((s) => s.nodes.map((n) => n.speaker)));
    for (const sp of speakers) expect(['F', 'M']).toContain(genderForSpeaker(sp));
  });
});

// ---------------------------------------------------------------------------
// Le défaut signalé : des personnages masculins lus par une voix féminine.
// ---------------------------------------------------------------------------

describe('Quand le système n’offre pas la bonne voix', () => {
  // Cas très courant : une seule voix française installée, et elle est féminine.
  const ONLY_FEMALE = [{ name: 'Microsoft Hortense Desktop - French', lang: 'fr-FR' }];
  const ONLY_NEUTRAL = [{ name: 'Google français', lang: 'fr-FR' }];

  it('reconnaît le genre porté par les noms de voix courants', () => {
    expect(genderOfVoice({ name: 'Microsoft Paul - French (France)' })).toBe('M');
    expect(genderOfVoice({ name: 'Microsoft Hortense Desktop - French' })).toBe('F');
    expect(genderOfVoice({ name: 'Amélie' })).toBe('F');
    expect(genderOfVoice({ name: 'Thomas' })).toBe('M');
    expect(genderOfVoice({ name: 'Google français' })).toBeNull();
    // Piège classique : « female » contient « male ».
    expect(genderOfVoice({ name: 'French Female' })).toBe('F');
  });

  it('écarte franchement la hauteur quand la seule voix est du genre opposé', () => {
    const v = pickVoice(ONLY_FEMALE, 'M')!;
    const neutral = pickVoice(ONLY_NEUTRAL, 'M')!;
    // Une voix féminine à peine assombrie reste une voix féminine : l'écart
    // doit être plus marqué que sur une voix neutre.
    expect(pitchFor('M', v)).toBeLessThan(pitchFor('M', neutral));
    expect(pitchFor('M', v)).toBeLessThan(0.7);
    expect(rateFor('M', v)).toBeLessThan(rateFor('M', neutral));
  });

  it('ne touche ni à la hauteur ni au débit quand la voix est la bonne', () => {
    const v = pickVoice([{ name: 'Thomas', lang: 'fr-FR' }], 'M')!;
    expect(pitchFor('M', v)).toBe(1);
    expect(rateFor('M', v)).toBe(rateFor('F', v));
  });

  it('laisse le joueur imposer une voix depuis les options', () => {
    const pool = [
      { name: 'Google français', lang: 'fr-FR' },
      { name: 'Microsoft Paul - French (France)', lang: 'fr-FR' },
    ];
    expect(pickVoice(pool, 'F', 'Microsoft Paul - French (France)')?.name).toBe(
      'Microsoft Paul - French (France)',
    );
    // Un nom inconnu ne casse rien : on retombe sur le choix automatique.
    expect(pickVoice(pool, 'M', 'Voix inexistante')?.name).toBe('Microsoft Paul - French (France)');
  });
});

describe('Genre de lecture de chaque personnage', () => {
  const ALL = [...CLIENTS, ...EXPERT_CLIENTS];

  it('lit chaque client avec la voix de son genre quand la scène le nomme', () => {
    for (const c of ALL) {
      for (const scId of Object.values(c.scenarios)) {
        const sc = SCENARIOS.find((s) => s.id === scId);
        if (!sc) continue;
        for (const n of sc.nodes) {
          // Un nœud qui donne la parole à quelqu'un d'autre porte son propre
          // portrait : il n'emprunte pas le genre du client.
          if (n.avatarSeed) continue;
          if (n.speaker !== c.contact.name && !isGenericSpeaker(n.speaker)) continue;
          expect(
            genderForSpeaker(n.speaker, c.contact.gender),
            `${sc.id}/${n.speaker} chez ${c.contact.name}`,
          ).toBe(c.contact.gender);
        }
      }
    }
  });

  it('nomme l’interlocuteur réel derrière les libellés génériques', () => {
    expect(displayedSpeaker('Le client', 'Marc Dupuis')).toBe('Marc Dupuis');
    expect(displayedSpeaker('Le dirigeant', 'Nadia Cherif')).toBe('Nadia Cherif');
    // Un personnage nommé garde son nom, même si un client est en contexte.
    expect(displayedSpeaker('Tom Aubert', 'Nadia Cherif')).toBe('Tom Aubert');
    // Et sans contexte, le libellé générique reste tel quel.
    expect(displayedSpeaker('Le client', undefined)).toBe('Le client');
  });
});
