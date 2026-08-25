import { describe, it, expect } from 'vitest';
import { soundForTarget } from '../../src/app/uiSounds';

/**
 * Le retour sonore se déduit de la nature du contrôle, sans qu'aucun écran
 * n'ait à s'en occuper — sauf quand l'action mérite sa propre signature, et
 * le composant la nomme alors par `data-sfx`.
 *
 * Les éléments sont simulés : la règle ne dépend d'aucune classe du DOM, elle
 * lit la balise, les classes et les attributs.
 */

interface FakeOptions {
  tag?: string;
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
  disabled?: boolean;
}

function el({ tag = 'button', className = '', text = '', attrs = {}, disabled }: FakeOptions) {
  const classes = className.split(' ').filter(Boolean);
  const node = {
    tagName: tag.toUpperCase(),
    textContent: text,
    classList: { contains: (c: string) => classes.includes(c) },
    getAttribute: (name: string) => attrs[name] ?? null,
    matches: (sel: string) => (disabled ? sel.includes('disabled') : false),
    closest: (_sel: string) => node,
  };
  return node as unknown as Element;
}

describe('Retour sonore de l’interface', () => {
  it('ne sonne pas hors d’un contrôle', () => {
    const plain = { closest: () => null } as unknown as Element;
    expect(soundForTarget(plain)).toBeNull();
    expect(soundForTarget(null)).toBeNull();
  });

  // Le silence sur un bouton grisé laisse croire à une panne.
  it('répond même sur un contrôle indisponible', () => {
    expect(soundForTarget(el({ className: 'btn btn-primary', disabled: true }))).toBe('deny');
  });

  it('distingue le bouton d’action du bouton secondaire', () => {
    expect(soundForTarget(el({ className: 'btn btn-primary', text: 'Valider' }))).toBe('tapPrimary');
    expect(soundForTarget(el({ className: 'btn', text: 'Options' }))).toBe('tap');
    expect(soundForTarget(el({ className: 'btn', text: 'Retour' }))).toBe('back');
  });

  it('donne son propre tic aux réponses de dialogue', () => {
    expect(soundForTarget(el({ className: 'choice', text: 'Une réponse' }))).toBe('click');
  });

  it('coche et décoche au même son, et ignore la saisie libre', () => {
    expect(soundForTarget(el({ tag: 'input', attrs: { type: 'checkbox' } }))).toBe('toggle');
    expect(soundForTarget(el({ tag: 'select' }))).toBe('toggle');
    expect(soundForTarget(el({ tag: 'input', attrs: { type: 'number' } }))).toBeNull();
    // Un curseur glissé déclencherait le son en rafale.
    expect(soundForTarget(el({ tag: 'input', attrs: { type: 'range' } }))).toBeNull();
  });

  // Ce que le joueur doit reconnaître sans regarder l'écran.
  it('donne une signature propre aux actions marquantes', () => {
    const declared: [string, string][] = [
      ['phase-tech', 'phaseTech'],
      ['phase-relation', 'phaseRelation'],
      ['card', 'cardPlace'],
      ['open', 'open'],
      ['nav', 'nav'],
      ['validate', 'validate'],
      ['call', 'ring'],
    ];
    for (const [attr, sound] of declared) {
      expect(soundForTarget(el({ className: 'btn', attrs: { 'data-sfx': attr } })), attr).toBe(sound);
    }
  });

  it('laisse la déclaration primer sur la déduction', () => {
    // Un bouton d'action qui bascule de phase sonne la bascule, pas l'action.
    const button = el({ className: 'btn btn-primary', attrs: { 'data-sfx': 'phase-tech' } });
    expect(soundForTarget(button)).toBe('phaseTech');
  });

  it('ignore une déclaration inconnue plutôt que de rester muet', () => {
    expect(soundForTarget(el({ className: 'btn btn-primary', attrs: { 'data-sfx': 'inexistant' } }))).toBe(
      'tapPrimary',
    );
  });
});
