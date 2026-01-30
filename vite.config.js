import { defineConfig } from 'vite';

export default defineConfig({
  base: '/digitalPortfolio/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    minify: 'terser'
  }
});
