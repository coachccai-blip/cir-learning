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

export type SoundName =
  | 'badge'
  | 'validate'
  | 'ring'
  | 'alert'
  | 'success'
  | 'fail'
  | 'levelup'
  | 'click'
  | 'fanfare'
  // Retours d'interface, déclenchés globalement par `useUiSounds`.
  | 'tap'
  | 'tapPrimary'
  | 'toggle'
  | 'back'
  | 'deny'
  // Actions qui méritent leur propre signature : on doit les reconnaître
  // sans regarder l'écran.
  | 'phaseTech'
  | 'phaseRelation'
  | 'cardPlace'
  | 'cardOk'
  | 'cardBad'
  | 'open'
  | 'close'
  | 'nav'
  | 'coin';

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
    case 'success': // accord majeur bref et lumineux
      tone(ac, 523, 0, 0.18, v * 0.9);
      tone(ac, 659, 0.02, 0.2, v * 0.7);
      tone(ac, 784, 0.04, 0.26, v * 0.6);
      break;
    case 'fail': // chute mineure, sans agressivité
      tone(ac, 392, 0, 0.16, v * 0.8, 'triangle');
      tone(ac, 311, 0.12, 0.22, v * 0.8, 'triangle');
      tone(ac, 262, 0.24, 0.3, v * 0.6, 'triangle');
      break;
    case 'levelup': // gamme ascendante de montée en grade
      [523, 659, 784, 1047].forEach((f, i) => tone(ac, f, i * 0.08, 0.22, v * 0.75));
      break;
    case 'click': // retour tactile discret sur un choix
      tone(ac, 880, 0, 0.045, v * 0.35, 'triangle');
      break;
    case 'tap': // bouton secondaire : clic mat, très court
      tone(ac, 520, 0, 0.035, v * 0.3, 'triangle');
      tone(ac, 780, 0.012, 0.03, v * 0.16, 'sine');
      break;
    case 'tapPrimary': // bouton d'action principal : un peu plus de corps
      tone(ac, 392, 0, 0.05, v * 0.34, 'triangle');
      tone(ac, 587, 0.025, 0.07, v * 0.26, 'sine');
      break;
    case 'toggle': // case à cocher, curseur : deux tics secs
      tone(ac, 1100, 0, 0.025, v * 0.22, 'square');
      tone(ac, 1450, 0.03, 0.03, v * 0.14, 'square');
      break;
    case 'back': // retour en arrière : la même figure, à l'envers
      tone(ac, 660, 0, 0.035, v * 0.22, 'triangle');
      tone(ac, 440, 0.03, 0.05, v * 0.24, 'triangle');
      break;
    case 'deny': // action indisponible : sourd, jamais strident
      tone(ac, 180, 0, 0.07, v * 0.3, 'triangle');
      break;
    case 'phaseTech': // bascule vers la phase Technique : on descend au calme
      tone(ac, 523, 0, 0.13, v * 0.5, 'sine');
      tone(ac, 392, 0.1, 0.16, v * 0.5, 'sine');
      tone(ac, 262, 0.21, 0.3, v * 0.45, 'triangle');
      break;
    case 'phaseRelation': // retour au bureau : on remonte, plus clair
      tone(ac, 330, 0, 0.12, v * 0.45, 'triangle');
      tone(ac, 494, 0.1, 0.14, v * 0.5, 'sine');
      tone(ac, 659, 0.2, 0.26, v * 0.5, 'sine');
      break;
    case 'cardPlace': // une carte tombe dans une colonne : sec, feutré
      tone(ac, 300, 0, 0.05, v * 0.3, 'triangle');
      tone(ac, 200, 0.035, 0.07, v * 0.22, 'sine');
      break;
    case 'cardOk': // bien classée : deux notes montantes, brèves
      tone(ac, 784, 0, 0.08, v * 0.42);
      tone(ac, 1047, 0.07, 0.12, v * 0.36);
      break;
    case 'cardBad': // mal classée : deux notes descendantes, sourdes
      tone(ac, 415, 0, 0.09, v * 0.4, 'triangle');
      tone(ac, 311, 0.08, 0.15, v * 0.36, 'triangle');
      break;
    case 'open': // un panneau, un dossier, une fiche s'ouvre
      tone(ac, 440, 0, 0.05, v * 0.26, 'sine');
      tone(ac, 660, 0.04, 0.08, v * 0.22, 'sine');
      break;
    case 'close': // et se referme
      tone(ac, 660, 0, 0.05, v * 0.22, 'sine');
      tone(ac, 440, 0.04, 0.08, v * 0.24, 'sine');
      break;
    case 'nav': // changement d'écran sans conséquence de jeu
      tone(ac, 587, 0, 0.045, v * 0.26, 'triangle');
      tone(ac, 880, 0.03, 0.06, v * 0.18, 'sine');
      break;
    case 'coin': // du chiffre d'affaires entre
      tone(ac, 988, 0, 0.07, v * 0.4);
      tone(ac, 1319, 0.06, 0.14, v * 0.34);
      break;
    case 'fanfare': // fin de saison
      [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) =>
        tone(ac, f, i * 0.11, 0.3, v * 0.7),
      );
      break;
  }
}
