// Retour sonore de l'interface. Un seul écouteur en capture sur le document
// plutôt qu'un `onClick` sonore dans chaque composant : le son suit la nature
// du contrôle, et aucun écran n'a à s'en préoccuper.

import { useEffect } from 'react';
import { playSound, type SoundName } from './sound';

/** Le son que mérite l'élément cliqué, ou null si l'élément n'est pas un contrôle. */
export function soundForTarget(el: Element | null): SoundName | null {
  const control = el?.closest('button, [role="button"], input, select, a[href]');
  if (!control) return null;

  // Un contrôle désactivé répond quand même : le silence laisse croire à un bug.
  if (control.matches(':disabled, [aria-disabled="true"]')) return 'deny';

  if (control instanceof HTMLInputElement) {
    if (control.type === 'checkbox' || control.type === 'radio') return 'toggle';
    if (control.type === 'range') return null; // le glissement déclencherait en rafale
    return null;
  }
  if (control instanceof HTMLSelectElement) return 'toggle';

  const label = (control.textContent ?? '').trim();
  if (/^(retour|annuler|fermer)\b/i.test(label)) return 'back';
  if (control.classList.contains('btn-primary')) return 'tapPrimary';
  return 'tap';
}

/**
 * Branche le retour sonore global. En capture, pour sonner même si le
 * gestionnaire du composant arrête la propagation ou démonte l'écran.
 */
export function useUiSounds(volume: number): void {
  useEffect(() => {
    if (volume <= 0) return;
    function onPointerDown(e: Event) {
      const sound = soundForTarget(e.target as Element | null);
      if (sound) playSound(sound, volume);
    }
    // `pointerdown` plutôt que `click` : le son part à l'appui, pas au relâchement.
    document.addEventListener('pointerdown', onPointerDown, true);
    // Le clavier ne produit pas de pointerdown : on complète sur Entrée / Espace.
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const sound = soundForTarget(document.activeElement);
      if (sound) playSound(sound, volume);
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [volume]);
}
