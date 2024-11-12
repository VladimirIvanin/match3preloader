import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist/browser',
    lib: {
      entry: resolve(__dirname, 'src/game-manager.ts'),
      name: 'Match3Preloader',
      fileName: (format) => `match3preloader.${format}.js`,
    },
    emptyOutDir: false,
  },
});