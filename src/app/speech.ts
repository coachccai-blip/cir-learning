// Lecture à haute voix des répliques (Web Speech API). Aucun fichier audio,
// aucun service tiers : la synthèse est celle du système du joueur.
//
// La disponibilité et la qualité des voix varient beaucoup d'un navigateur à
// l'autre. Tout est donc optionnel : si aucune voix française n'est installée,
// le bouton de lecture ne s'affiche pas plutôt que de lire avec un accent
// anglais.

export type Gender = 'F' | 'M';

/** Indices de genre présents dans les noms de voix françaises courantes. */
const FEMALE_HINTS = ['female', 'femme', 'amelie', 'amélie', 'audrey', 'aurelie', 'aurélie', 'julie', 'marie', 'virginie', 'chantal', 'hortense', 'céline', 'celine', 'léa', 'lea'];
const MALE_HINTS = ['male', 'homme', 'thomas', 'nicolas', 'paul', 'henri', 'daniel', 'mathieu', 'guillaume', 'yannick', 'claude'];

function isFrench(v: { lang: string }): boolean {
  return v.lang.toLowerCase().startsWith('fr');
}

/** 2 = genre reconnu et conforme, 1 = indéterminé, 0 = genre opposé. */
export function scoreForGender(v: { name: string }, gender: Gender): number {
  const name = v.name.toLowerCase();
  const hits = (list: string[]) => list.some((h) => name.includes(h));
  if (gender === 'F') {
    if (hits(FEMALE_HINTS)) return 2;
    if (hits(MALE_HINTS)) return 0;
  } else {
    if (hits(MALE_HINTS)) return 2;
    if (hits(FEMALE_HINTS)) return 0;
  }
  return 1; // voix française au genre indéterminé : acceptable par défaut
}

/** Forme minimale d'une voix — permet de tester la sélection sans navigateur. */
export interface VoiceLike {
  name: string;
  lang: string;
}

/**
 * Meilleure voix française pour ce genre, parmi une liste donnée. Fonction pure,
 * extraite pour être testable : la disponibilité des voix dépend du système et
 * n'est pas reproductible en test.
 */
export function pickVoice<T extends VoiceLike>(voices: readonly T[], gender: Gender): T | null {
  const french = voices.filter(isFrench);
  const pool = french.length > 0 ? french : [];
  if (pool.length === 0) return null;
  return pool
    .map((v, i) => ({ v, score: scoreForGender(v, gender), i }))
    .sort((a, b) => b.score - a.score || a.i - b.i)[0].v;
}

export function frenchVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices().filter(isFrench);
}

/** La synthèse est-elle utilisable, avec au moins une voix française ? */
export function speechAvailable(): boolean {
  return frenchVoices().length > 0;
}

/**
 * Meilleure voix française pour ce genre. Quand aucune voix n'est marquée, on
 * différencie au moins la hauteur (cf. `pitchFor`), pour que deux personnages
 * ne se ressemblent pas.
 */
export function voiceFor(gender: Gender): SpeechSynthesisVoice | null {
  return pickVoice(frenchVoices(), gender);
}

/** Voix neutre ? Alors on écarte les hauteurs pour distinguer les personnages. */
export function pitchFor(gender: Gender, voice: { name: string } | null): number {
  if (voice && scoreForGender(voice, gender) === 2) return 1;
  return gender === 'F' ? 1.25 : 0.82;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

/**
 * Lit un texte. Relancer la lecture interrompt la précédente : deux répliques
 * ne se superposent jamais. `onEnd` sert à rendre son état au bouton.
 */
export function speak(text: string, gender: Gender, onEnd?: () => void): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  stopSpeaking();
  const voice = voiceFor(gender);
  try {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'fr-FR';
    u.rate = 1.02;
    u.pitch = pitchFor(gender, voice);
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    // Navigateur récalcitrant : on rend la main plutôt que de laisser le
    // bouton bloqué sur « lecture en cours ».
    onEnd?.();
  }
}

/**
 * Les voix arrivent de façon asynchrone dans Chrome : le premier appel à
 * `getVoices()` renvoie souvent une liste vide. Prévient quand elles sont là.
 */
export function onVoicesReady(cb: () => void): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return () => {};
  const synth = window.speechSynthesis;
  synth.addEventListener('voiceschanged', cb);
  return () => synth.removeEventListener('voiceschanged', cb);
}
