import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/wellbe/', // Match GitHub Pages repo
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
