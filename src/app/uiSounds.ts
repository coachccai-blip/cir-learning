// Retour sonore de l'interface. Un seul écouteur en capture sur le document
// plutôt qu'un `onClick` sonore dans chaque composant : le son suit la nature
// du contrôle, et aucun écran n'a à s'en préoccuper.

import { useEffect } from 'react';
import { playSound, type SoundName } from './sound';

/**
 * Sons déclarés par les composants via `data-sfx`. Une bascule de phase ou le
 * classement d'une carte n'ont pas à sonner comme un bouton quelconque : le
 * joueur doit reconnaître l'action sans regarder l'écran.
 */
const DECLARED: Record<string, SoundName> = {
  'phase-tech': 'phaseTech',
  'phase-relation': 'phaseRelation',
  card: 'cardPlace',
  open: 'open',
  close: 'close',
  nav: 'nav',
  validate: 'validate',
  coin: 'coin',
  call: 'ring',
};

/** Le son que mérite l'élément cliqué, ou null si l'élément n'est pas un contrôle. */
export function soundForTarget(el: Element | null): SoundName | null {
  const control = el?.closest('button, [role="button"], input, select, a[href]');
  if (!control) return null;

  // Un contrôle désactivé répond quand même : le silence laisse croire à un bug.
  if (control.matches(':disabled, [aria-disabled="true"]')) return 'deny';

  // Le composant a nommé son son : il prime sur toute déduction.
  const declared = control.getAttribute('data-sfx');
  if (declared && DECLARED[declared]) return DECLARED[declared];

  // Déduction sur la balise plutôt que sur `instanceof HTMLInputElement` : la
  // règle devient testable hors navigateur, et résiste aux éléments venus d'un
  // autre document (iframe), où les classes DOM ne correspondent pas.
  const tag = control.tagName.toLowerCase();
  if (tag === 'input') {
    const type = (control.getAttribute('type') ?? 'text').toLowerCase();
    if (type === 'checkbox' || type === 'radio') return 'toggle';
    return null; // saisie libre ou curseur : le glissement sonnerait en rafale
  }
  if (tag === 'select') return 'toggle';

  const label = (control.textContent ?? '').trim();
  if (/^(retour|annuler|fermer)\b/i.test(label)) return 'back';
  // Une réponse de dialogue, de quiz ou de contrôle : un tic discret, distinct
  // du bouton d'action, parce qu'on en enchaîne des dizaines.
  if (control.classList.contains('choice')) return 'click';
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
