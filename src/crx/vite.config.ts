import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export const name = (dir: string) => path.basename(dir)

export default (name: string) => {
  return defineConfig({
    define: {
      'process.env': {}
    },
    build: {
      outDir: '.' + name,
      lib: {
        entry: [path.resolve(__dirname, './' + name + '/index.tsx')],
        formats: ['cjs'],
        fileName: () => name + '.js'
      },
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js'
        }
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url))
      }
    }
  })
}
