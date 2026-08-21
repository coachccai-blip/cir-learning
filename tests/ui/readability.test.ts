import { describe, it, expect } from 'vitest';
import tokens from '../../src/styles/tokens.css?raw';
import app from '../../src/styles/app.css?raw';

/**
 * Le jeu superposait du texte coloré à des surfaces colorées : vert et orange
 * sur des panneaux bleu soutenu en phase Technique. Ces contrôles verrouillent
 * la règle qui a remplacé cette pratique — surfaces neutres, encres calibrées.
 */

function srgb(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Toutes les variables déclarées dans un bloc de thème. */
function themeVars(selector: string): Record<string, string> {
  const start = tokens.indexOf(selector);
  expect(start, `bloc de thème introuvable : ${selector}`).toBeGreaterThan(-1);
  const open = tokens.indexOf('{', start);
  const close = tokens.indexOf('}', open);
  const body = tokens.slice(open + 1, close);
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}

const THEMES = {
  'Relation client': themeVars('[data-phase="DAY"]'),
  Technique: themeVars('[data-phase="NIGHT"]'),
};

describe('Lisibilité des encres sur les surfaces de contenu', () => {
  for (const [phase, v] of Object.entries(THEMES)) {
    const surfaces = ['bg-panel', 'bg-elevated', 'bg-sunken'] as const;

    // Les fonds sur lesquels on lit doivent être opaques : un fond translucide
    // laisserait remonter le dégradé de page sous les paragraphes.
    it(`${phase} : les surfaces de contenu sont définies en couleur pleine`, () => {
      for (const s of surfaces) expect(v[s], s).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    // Le texte courant : confortable sur de longs paragraphes.
    it(`${phase} : le texte courant tient 7:1 sur chaque surface`, () => {
      for (const s of surfaces) {
        expect(contrast(v.text, v[s]), `${phase} text/${s}`).toBeGreaterThanOrEqual(7);
      }
    });

    it(`${phase} : le texte secondaire tient 7:1 sur les panneaux`, () => {
      expect(contrast(v['text-muted'], v['bg-panel'])).toBeGreaterThanOrEqual(7);
      expect(contrast(v['text-faint'], v['bg-panel'])).toBeGreaterThanOrEqual(4.5);
    });

    // Les couleurs sémantiques n'habillent plus que des chiffres courts, des
    // icônes et des liserés : le seuil AA suffit, mais il doit être tenu.
    it(`${phase} : les encres sémantiques tiennent 4,5:1 sur les panneaux`, () => {
      for (const ink of ['pos', 'neg', 'warn', 'info', 'accent-text']) {
        expect(contrast(v[ink], v['bg-panel']), `${phase} ${ink}`).toBeGreaterThanOrEqual(4.5);
      }
    });

    // Une surface de contenu quasi neutre : c'est tout l'enjeu de la refonte.
    // On mesure l'écart entre canaux — au-delà, le fond « colore » le texte.
    it(`${phase} : les surfaces de contenu restent quasi neutres`, () => {
      for (const s of surfaces) {
        const h = v[s].replace('#', '');
        const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
        const spread = Math.max(r, g, b) - Math.min(r, g, b);
        expect(spread, `${phase} ${s} (${v[s]}) trop coloré`).toBeLessThanOrEqual(22);
      }
    });
  }

  // Un rôle défini d'un seul côté produit une couleur héritée de l'autre
  // thème : c'est ainsi qu'on se retrouve avec du texte clair sur fond clair.
  it('chaque rôle de couleur du jour est redéfini la nuit', () => {
    const roles = (t: Record<string, string>) =>
      Object.keys(t).filter((k) => !k.startsWith('shadow-')).sort();
    expect(roles(THEMES.Technique)).toEqual(roles(THEMES['Relation client']));
  });

  // Un `var(--x)` sans définition ne déclenche aucune erreur : la propriété est
  // simplement ignorée. C'est ainsi qu'un panneau s'est retrouvé transparent,
  // son texte sombre posé sur le dégradé sombre de l'écran de fin.
  it('n’emploie aucune variable CSS non définie', () => {
    const sheets = tokens + app;
    const defined = new Set([...sheets.matchAll(/--([\w-]+)\s*:/g)].map((m) => m[1]));
    // Variables passées en style inline depuis React (bulles de l'accueil).
    for (const local of ['size', 'dur', 'delay', 'drift']) defined.add(local);
    const used = new Set([...sheets.matchAll(/var\(--([\w-]+)/g)].map((m) => m[1]));
    const missing = [...used].filter((v) => !defined.has(v)).sort();
    expect(missing, `variables sans définition : ${missing.join(', ')}`).toEqual([]);
  });
});
