import { describe, it, expect } from 'vitest';
import { pickVoice, pitchFor, scoreForGender } from '../../src/app/speech';
import { genderForSpeaker } from '../../src/data/voices';
import { CLIENTS } from '../../src/data/clients';
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
