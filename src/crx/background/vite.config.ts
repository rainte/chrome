import path from 'path'
import vite from '../../../vite.config'

const fileName = 'background'

export default Object.assign(vite, {
  build: {
    lib: {
      entry: [path.resolve(__dirname, './index.tsx')],
      formats: ['cjs'],
      fileName: () => fileName + '.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: () => fileName + '.css'
      }
    }
  }
})
