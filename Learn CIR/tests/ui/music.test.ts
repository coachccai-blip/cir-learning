import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * La nappe de fond.
 *
 * Elle est synthétisée, comme les bruitages : aucun fichier audio n'entre dans
 * le dépôt. Ces contrôles vérifient qu'elle ne démarre pas toute seule, qu'un
 * navigateur sans WebAudio ne fait pas tomber le jeu, et que le réglage est
 * bien mémorisé.
 */

class FakeParam {
  value = 0;
  cancelScheduledValues() {}
  setValueAtTime() {}
  linearRampToValueAtTime(v: number) {
    this.value = v;
  }
  exponentialRampToValueAtTime() {}
}
class FakeNode {
  gain = new FakeParam();
  frequency = new FakeParam();
  detune = new FakeParam();
  Q = new FakeParam();
  type = '';
  connect(n: unknown) {
    return n;
  }
  start() {}
  stop() {}
}
let created = 0;
let oscillators = 0;
/** Horloge audio pilotée par le test, indépendante des minuteurs. */
let audioClock = 0;
let lastCtx: FakeCtx | null = null;
/** Le joueur a-t-il déjà interagi avec la page ? */
let gestured = true;
class FakeCtx {
  state = 'running';
  resumed = 0;
  get currentTime() {
    return audioClock;
  }
  destination = {};
  constructor() {
    created++;
    lastCtx = this as unknown as FakeCtx;
  }
  createGain() {
    return new FakeNode();
  }
  createBiquadFilter() {
    return new FakeNode();
  }
  createOscillator() {
    oscillators++;
    return new FakeNode();
  }
  resume() {
    this.resumed++;
    // Comme un vrai navigateur : la reprise n'aboutit qu'après un geste du
    // joueur. Sans cela, le test validerait une reprise qui n'a pas lieu.
    if (gestured) this.state = 'running';
  }
}

describe('Nappe de fond', () => {
  beforeEach(() => {
    created = 0;
    oscillators = 0;
    audioClock = 0;
    lastCtx = null;
    gestured = true;
    vi.resetModules();
    vi.useFakeTimers();
    // `resetModules` rend un module neuf mais laisse tourner le minuteur du
    // précédent : sans ce nettoyage, un test compte les mesures d'un autre.
    vi.clearAllTimers();
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = FakeCtx;
  });

  it('ne crée aucun contexte audio tant que la musique n’est pas demandée', async () => {
    const { startMusic } = await import('../../src/app/music');
    startMusic();
    expect(created, 'contexte créé sans que le joueur ait rien demandé').toBe(0);
  });

  it('joue une progression, pas une note tenue', async () => {
    const { setMusicEnabled } = await import('../../src/app/music');
    setMusicEnabled(true);
    expect(created).toBe(1);
    // Basse + nappe doublée + arpège : une mesure fait plusieurs oscillateurs,
    // et la fenêtre d'anticipation en programme au moins une.
    expect(oscillators).toBeGreaterThan(5);
    const afterFirst = oscillators;
    // Le programmateur ne travaille que si l'horloge audio avance : sans cela
    // il a déjà de l'avance et n'a rien à faire.
    audioClock += 4;
    vi.advanceTimersByTime(2000);
    expect(oscillators, 'la nappe s’arrête après la première mesure').toBeGreaterThan(afterFirst);
  });

  it('cesse de programmer une fois coupée', async () => {
    const { setMusicEnabled } = await import('../../src/app/music');
    setMusicEnabled(true);
    setMusicEnabled(false);
    const silent = oscillators;
    audioClock += 10;
    vi.advanceTimersByTime(5000);
    expect(oscillators, 'des mesures continuent après la coupure').toBe(silent);
  });

  it('ne fait pas tomber le jeu sans WebAudio', async () => {
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = undefined;
    const { setMusicEnabled } = await import('../../src/app/music');
    expect(() => setMusicEnabled(true)).not.toThrow();
    expect(() => setMusicEnabled(false)).not.toThrow();
  });

  it('mémorise le réglage avec les autres options', async () => {
    const { DEFAULT_OPTIONS } = await import('../../src/state/persistence');
    // Le jeu s'ouvre en musique : le bouton sert à la couper, pas à la trouver.
    expect(DEFAULT_OPTIONS.music).toBe(true);
  });

  it('reprend la nappe au premier geste quand le navigateur l’avait suspendue', async () => {
    // C'est le cas réel : au chargement le contexte se crée suspendu, son
    // horloge n'avance pas, et rien ne sort des haut-parleurs.
    gestured = false;
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = class extends FakeCtx {
      state = 'suspended';
    };
    const { setMusicEnabled, startMusic } = await import('../../src/app/music');
    setMusicEnabled(true);
    expect(created).toBe(1);
    expect(lastCtx!.state, 'le contexte devrait rester suspendu sans geste').toBe('suspended');

    // Premier geste du joueur : la nappe doit repartir, même si le
    // programmateur tournait déjà.
    gestured = true;
    startMusic();
    expect(lastCtx!.resumed, 'aucune reprise demandée au premier geste').toBeGreaterThan(0);
    expect(lastCtx!.state).toBe('running');

    // Et les mesures reprennent bien à l'instant courant, pas dans le passé.
    const before = oscillators;
    audioClock += 4;
    vi.advanceTimersByTime(1000);
    expect(oscillators).toBeGreaterThan(before);
  });

  it('tente de démarrer sans attendre de geste', async () => {
    const { setMusicEnabled, armMusic } = await import('../../src/app/music');
    setMusicEnabled(true);
    const detach = armMusic();
    // L'autorisation est déjà acquise ici : le son part sans clic.
    expect(created).toBe(1);
    expect(oscillators).toBeGreaterThan(0);
    detach();
  });
});
