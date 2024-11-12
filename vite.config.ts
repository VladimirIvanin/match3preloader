import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  root: 'playground',
  plugins: [vue()],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm.js'
    }
  }
})