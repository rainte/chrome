import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: [path.resolve(__dirname, 'src/content/index.tsx')],
      formats: ['cjs'],
      fileName: () => 'content.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: () => 'content.css'
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
