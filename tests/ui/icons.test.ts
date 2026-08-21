import { describe, it, expect } from 'vitest';

/**
 * Les pictogrammes d'interface sont des tracés, pas des émojis : rendu stable
 * d'un système à l'autre, taille et couleur pilotées par le CSS. Les émojis
 * restent admis là où ils sont expressifs — une célébration, un badge — et
 * jamais plus d'un par paragraphe.
 */

const UI_FILES = import.meta.glob('../../src/{screens,components,ui}/**/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu;

describe('Pictogrammes de l’interface', () => {
  it('couvre bien tous les écrans et composants', () => {
    expect(Object.keys(UI_FILES).length).toBeGreaterThan(15);
  });

  it('n’aligne jamais plus d’un émoji dans un même paragraphe', () => {
    const offenders: string[] = [];
    for (const [file, src] of Object.entries(UI_FILES)) {
      src.split('\n').forEach((line, i) => {
        const found = line.match(EMOJI) ?? [];
        if (found.length > 1) offenders.push(`${file}:${i + 1} ${found.join('')}`);
      });
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('n’emploie plus d’émoji comme mobilier d’interface', () => {
    const offenders: string[] = [];
    for (const [file, src] of Object.entries(UI_FILES)) {
      const found = src.match(EMOJI) ?? [];
      if (found.length > 0) offenders.push(`${file} → ${found.join(' ')}`);
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('chaque tracé d’icône est bien formé', async () => {
    const { Icon } = await import('../../src/ui/Icon');
    expect(typeof Icon).toBe('function');
    const src = (await import('../../src/ui/Icon.tsx?raw')).default as string;
    const paths = [...src.matchAll(/'(M[\d.\-,\sA-Za-z]+)'/g)].map((m) => m[1]);
    expect(paths.length).toBeGreaterThan(40);
    for (const d of paths) {
      // Un tracé commence par un déplacement absolu et ne contient que des
      // commandes SVG valides : une faute de frappe casse l'icône en silence.
      expect(d.startsWith('M'), d).toBe(true);
      expect(/[^MmLlHhVvCcSsQqTtAaZz0-9.\-,\s]/.test(d), d).toBe(false);
    }
  });
});
