import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path = nom du repo, requis pour GitHub Pages (project page).
export default defineConfig({
  base: '/cir-learning/',
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Sans cela Vitest remplace les feuilles de style par une chaîne vide :
    // le test de contraste des thèmes lit le fichier de tokens tel quel.
    css: true,
  },
} as ReturnType<typeof defineConfig>);
