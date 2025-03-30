import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  define: { 'process.env': {} },
  plugins: [react(), visualizer()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    outDir: 'rainte',
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      input: {
        index: './index.html',
        background: './src/background/index.ts',
        content: './src/content/index.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js'
          } else if (chunkInfo.name === 'content') {
            return 'content.js'
          }
          return 'assets/[name]-[hash].js'
        },
        manualChunks: { antd: ['antd'] }
      }
    }
  }
})
