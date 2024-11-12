import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/game-manager.ts'),
      name: 'Match3Preloader',
      fileName: (format) => `match3preloader.${format}.js`,
    },
    rollupOptions: {

    },
  },
});