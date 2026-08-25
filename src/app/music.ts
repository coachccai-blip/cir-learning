// Nappe sonore de fond, synthétisée en WebAudio.
//
// Aucun fichier audio : le jeu n'en embarque pas un seul, et ce n'est pas pour
// en ajouter un ici. La musique est jouée par oscillateurs, comme les
// bruitages — quelques kilo-octets de code plutôt qu'un mégaoctet de MP3, et
// aucune question de licence.
//
// Le registre visé est celui d'un hall d'agence : une nappe tenue, une
// progression lente de quatre accords, un arpège discret par-dessus. Rien qui
// attire l'attention — une musique de fond qu'on remarque en la coupant, pas
// en l'écoutant.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
/** Instant (horloge audio) jusqu'auquel les notes sont déjà programmées. */
let scheduledUntil = 0;
let bar = 0;
let wanted = false;

/** Volume de la nappe. Volontairement bas : elle doit passer sous les voix. */
const LEVEL = 0.055;
/** Durée d'une mesure, en secondes — environ 72 battements par minute. */
const BAR = 3.33;
/** Fenêtre d'anticipation : on programme toujours la mesure suivante. */
const LOOKAHEAD = 1.5;

/**
 * Progression en fa majeur, quatre mesures. Les accords sont donnés en
 * fréquences (Hz) : fondamentale de basse, puis les notes de la nappe.
 */
const PROGRESSION: { bass: number; pad: number[]; color: number[] }[] = [
  // Fa majeur 9
  { bass: 87.31, pad: [174.61, 261.63, 349.23], color: [523.25, 659.25] },
  // La mineur 7
  { bass: 110.0, pad: [220.0, 261.63, 329.63], color: [523.25, 659.25] },
  // Ré mineur 9
  { bass: 73.42, pad: [146.83, 220.0, 349.23], color: [587.33, 698.46] },
  // Si bémol majeur 7
  { bass: 116.54, pad: [233.08, 293.66, 349.23], color: [466.16, 587.33] },
];

function ensureContext(): boolean {
  try {
    if (!ctx) {
      ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      // Un passe-bas assez fermé : la nappe reste derrière la voix de synthèse
      // et les bruitages, sans jamais mordre dans les aigus.
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1400;
      filter.Q.value = 0.6;
      gain.connect(filter).connect(ctx.destination);
      master = gain;
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return true;
  } catch {
    return false;
  }
}

/** Une note tenue, avec attaque et extinction douces. */
function sustain(at: number, freq: number, dur: number, level: number, detune = 0) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  osc.detune.value = detune;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(level, at + dur * 0.35);
  gain.gain.linearRampToValueAtTime(0.0001, at + dur);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + dur + 0.1);
}

/** Une note d'arpège : courte, ronde, très en retrait. */
function pluck(at: number, freq: number, level: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(level, at + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + 1);
}

/** Programme une mesure complète à partir de l'instant donné. */
function scheduleBar(at: number, index: number) {
  const chord = PROGRESSION[index % PROGRESSION.length];
  // Basse : une ronde par mesure.
  sustain(at, chord.bass, BAR, 0.5);
  // Nappe : deux oscillateurs légèrement désaccordés par note, pour l'épaisseur.
  for (const f of chord.pad) {
    sustain(at, f, BAR, 0.26, -4);
    sustain(at, f, BAR, 0.26, 5);
  }
  // Arpège : deux notes par mesure, décalées, très douces.
  chord.color.forEach((f, i) => {
    pluck(at + BAR * (0.25 + i * 0.4), f, 0.14);
  });
}

function tick() {
  if (!ctx) return;
  while (scheduledUntil < ctx.currentTime + LOOKAHEAD) {
    scheduleBar(scheduledUntil, bar);
    scheduledUntil += BAR;
    bar += 1;
  }
}

/** Démarre (ou reprend) la nappe. Sans effet si elle tourne déjà. */
export function startMusic(): void {
  if (!wanted || timer !== null) return;
  if (!ensureContext() || !ctx || !master) return;
  scheduledUntil = ctx.currentTime + 0.15;
  // Fondu d'entrée : la musique ne doit jamais claquer au premier clic.
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(LEVEL, ctx.currentTime + 2.5);
  tick();
  timer = setInterval(tick, 500);
}

/** Coupe la nappe en fondu, et cesse de programmer de nouvelles mesures. */
export function stopMusic(): void {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
}

/**
 * Dit si la musique est souhaitée, et l'applique.
 *
 * Les navigateurs refusent de démarrer un contexte audio avant un geste du
 * joueur : tant qu'il n'a rien touché, on retient l'intention et `armMusic`
 * fera démarrer la nappe au premier clic.
 */
export function setMusicEnabled(on: boolean): void {
  wanted = on;
  if (on) startMusic();
  else stopMusic();
}

/**
 * Attend le premier geste du joueur pour démarrer la nappe. Rend une fonction
 * de désinscription, pour que React puisse nettoyer.
 */
export function armMusic(): () => void {
  if (typeof window === 'undefined') return () => {};
  const go = () => {
    if (wanted) startMusic();
  };
  window.addEventListener('pointerdown', go, { once: false });
  window.addEventListener('keydown', go, { once: false });
  return () => {
    window.removeEventListener('pointerdown', go);
    window.removeEventListener('keydown', go);
  };
}
