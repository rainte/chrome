import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default (dir: string) => {
  const name = path.basename(dir)

  return defineConfig({
    define: { 'process.env': {} },
    plugins: [react()],
    resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
    build: {
      outDir: `.${name}`,
      lib: {
        entry: [path.resolve(__dirname, `./${name}/index.tsx`)],
        formats: ['cjs'],
        fileName: () => `${name}.js`
      },
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'assets/[name]-[hash].js'
        }
      }
    }
  })
}
