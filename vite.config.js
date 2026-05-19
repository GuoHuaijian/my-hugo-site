import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Extract highlight.js into its own chunk (only loaded on detail pages with code blocks)
          if (id.includes('highlight.js')) return 'hljs'
          // Extract mermaid into its own chunk (lazy-loaded via dynamic import)
          if (id.includes('mermaid')) return 'mermaid'
          // Group vue/vue-router into framework chunk
          if (id.includes('node_modules/vue')) return 'vendor'
        }
      }
    },
    // Ensure CSS is code-split alongside JS chunks
    cssCodeSplit: true
  }
})
