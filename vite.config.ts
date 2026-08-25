import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path = nom du repo, requis pour GitHub Pages (project page).
//
// Le mode `standalone` sert la version hors ligne, en un seul fichier HTML :
// chemins relatifs, aucun découpage en morceaux et aucun préchargement, sinon
// le script cherche à recharger un fichier voisin — introuvable depuis le
// disque. Voir `scripts/build-standalone.mjs`.
export default defineConfig(({ mode }) => ({
  base: mode === 'standalone' ? './' : '/cir-learning/',
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    modulePreload: mode === 'standalone' ? false : undefined,
    rollupOptions:
      mode === 'standalone' ? { output: { inlineDynamicImports: true } } : undefined,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Sans cela Vitest remplace les feuilles de style par une chaîne vide :
    // le test de contraste des thèmes lit le fichier de tokens tel quel.
    css: true,
  },
})) as ReturnType<typeof defineConfig>;
