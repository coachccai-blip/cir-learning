// Sons courts synthétisés en WebAudio — aucun fichier audio, mute par défaut
// (§12.4). Le volume vient des options du joueur (0 = silence).

let ctx: AudioContext | null = null;

function audioCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  ac: AudioContext,
  freq: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine',
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + duration + 0.05);
}

export type SoundName = 'badge' | 'validate' | 'ring' | 'alert';

/** Joue un son court. `volume` : 0-100 (0 = rien). */
export function playSound(name: SoundName, volume: number): void {
  if (volume <= 0) return;
  const ac = audioCtx();
  if (!ac) return;
  const v = Math.min(0.25, (volume / 100) * 0.25);
  switch (name) {
    case 'badge': // petit arpège ascendant
      tone(ac, 660, 0, 0.12, v);
      tone(ac, 880, 0.09, 0.12, v);
      tone(ac, 1320, 0.18, 0.2, v);
      break;
    case 'validate': // tampon sourd
      tone(ac, 220, 0, 0.09, v, 'triangle');
      tone(ac, 165, 0.06, 0.16, v, 'triangle');
      break;
    case 'ring': // double sonnerie de téléphone
      for (const off of [0, 0.5]) {
        tone(ac, 950, off, 0.16, v * 0.8, 'square');
        tone(ac, 1250, off + 0.02, 0.14, v * 0.5, 'square');
      }
      break;
    case 'alert': // deux notes descendantes
      tone(ac, 520, 0, 0.14, v, 'triangle');
      tone(ac, 390, 0.13, 0.2, v, 'triangle');
      break;
  }
}
