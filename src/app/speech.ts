// Lecture à haute voix des répliques (Web Speech API). Aucun fichier audio,
// aucun service tiers : la synthèse est celle du système du joueur.
//
// La disponibilité et la qualité des voix varient beaucoup d'un navigateur à
// l'autre. Tout est donc optionnel : si aucune voix française n'est installée,
// le bouton de lecture ne s'affiche pas plutôt que de lire avec un accent
// anglais.

export type Gender = 'F' | 'M';

/**
 * Indices de genre dans les noms de voix françaises réellement installées sur
 * les systèmes courants (Windows, macOS, iOS, Android, Chrome). La liste était
 * trop courte : la plupart des voix retombaient en « genre indéterminé », et
 * tous les personnages parlaient avec le même timbre.
 *
 * Attention à l'ordre de test : « male » est contenu dans « female », c'est
 * pourquoi le féminin est évalué en premier (cf. `scoreForGender`).
 */
const FEMALE_HINTS = [
  'female', 'femme', 'woman',
  'amelie', 'amélie', 'audrey', 'aurelie', 'aurélie', 'julie', 'marie', 'virginie',
  'chantal', 'hortense', 'céline', 'celine', 'léa', 'lea', 'manon', 'elise', 'élise',
  'sabine', 'nathalie', 'charlotte', 'jolie', 'flore', 'siri voix 1', 'voix 1',
];
const MALE_HINTS = [
  'homme', 'man',
  'thomas', 'nicolas', 'paul', 'henri', 'daniel', 'mathieu', 'guillaume', 'yannick',
  'claude', 'antoine', 'bruno', 'christophe', 'jacques', 'sebastien', 'sébastien',
  'alain', 'olivier', 'pierre', 'rémi', 'remi', 'siri voix 2', 'voix 2',
];

function isFrench(v: { lang: string }): boolean {
  return v.lang.toLowerCase().startsWith('fr');
}

/** Genre porté par le nom d'une voix, ou null si rien ne le dit. */
export function genderOfVoice(v: { name: string }): Gender | null {
  const name = v.name.toLowerCase();
  // Le féminin d'abord : « female » contient « male ».
  if (FEMALE_HINTS.some((h) => name.includes(h))) return 'F';
  if (MALE_HINTS.some((h) => name.includes(h))) return 'M';
  return null;
}

/** 2 = genre reconnu et conforme, 1 = indéterminé, 0 = genre opposé. */
export function scoreForGender(v: { name: string }, gender: Gender): number {
  const found = genderOfVoice(v);
  if (found === null) return 1; // voix au genre indéterminé : acceptable par défaut
  return found === gender ? 2 : 0;
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
export function pickVoice<T extends VoiceLike>(
  voices: readonly T[],
  gender: Gender,
  /** Voix imposée par le joueur depuis les options, par son nom exact. */
  preferred?: string,
): T | null {
  const pool = voices.filter(isFrench);
  if (pool.length === 0) return null;
  if (preferred) {
    const chosen = pool.find((v) => v.name === preferred);
    if (chosen) return chosen;
  }
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
export function voiceFor(gender: Gender, preferred?: string): SpeechSynthesisVoice | null {
  return pickVoice(frenchVoices(), gender, preferred);
}

/**
 * Hauteur de lecture. Trois cas, du meilleur au pire :
 *   — la voix porte bien le genre demandé : on n'y touche pas ;
 *   — la voix est neutre : on écarte modérément, pour distinguer ;
 *   — la voix est du genre opposé (souvent la seule installée) : on écarte
 *     franchement, faute de quoi tous les hommes sont lus par une voix de
 *     femme à peine assombrie.
 */
export function pitchFor(gender: Gender, voice: { name: string } | null): number {
  const score = voice ? scoreForGender(voice, gender) : 1;
  if (score === 2) return 1;
  if (score === 1) return gender === 'F' ? 1.22 : 0.8;
  return gender === 'F' ? 1.45 : 0.62;
}

/** Un homme lu par une voix féminine gagne aussi à ralentir un peu. */
export function rateFor(gender: Gender, voice: { name: string } | null): number {
  const score = voice ? scoreForGender(voice, gender) : 1;
  if (score === 0 && gender === 'M') return 0.94;
  return 1.02;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

/**
 * Lit un texte. Relancer la lecture interrompt la précédente : deux répliques
 * ne se superposent jamais. `onEnd` sert à rendre son état au bouton.
 */
export function speak(
  text: string,
  gender: Gender,
  onEnd?: () => void,
  /** Voix choisie par le joueur dans les options, pour ce genre. */
  preferred?: string,
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  stopSpeaking();
  const voice = voiceFor(gender, preferred);
  try {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'fr-FR';
    u.rate = rateFor(gender, voice);
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
