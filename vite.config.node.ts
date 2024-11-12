import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ outDir: 'dist/node' })],
  build: {
    outDir: 'dist/node',
    lib: {
      entry: resolve(__dirname, 'src/game-manager.ts'),
      name: 'Match3Preloader',
      fileName: (format) => `match3preloader.${format}.js`,
    },
    rollupOptions: {
      external: ['path', 'fs'],
    },
    emptyOutDir: false,
  },
});