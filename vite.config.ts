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
  },
} as ReturnType<typeof defineConfig>);
