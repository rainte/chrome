import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default (name: string) => {
  return defineConfig({
    build: {
      lib: {
        entry: [path.resolve(__dirname, './' + name + '/index.tsx')],
        formats: ['cjs'],
        fileName: () => name + '.js'
      },
      rollupOptions: { output: { assetFileNames: () => name + '.css' } }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url))
      }
    }
  })
}
