import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from GitHub Pages at https://dariustieku12-pixel.github.io/Sonka-webapp/
// When a custom domain is attached later, change `base` to '/'.
export default defineConfig({
  base: '/Sonka-webapp/',
  plugins: [react()],
});
