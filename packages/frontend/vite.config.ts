import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import ui from '@nuxt/ui/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss(), ui()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Fix pour les problèmes de compatibilité ESM/CommonJS avec jiti
      jiti: fileURLToPath(new URL('./node_modules/jiti/lib/index.js', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['jiti'],
    esbuildOptions: {
      // Préserver le format des modules pour éviter les problèmes ESM/CommonJS
      preserveSymlinks: true,
    },
  },
})
