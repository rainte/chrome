import { copyFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const coreEntry = require.resolve('@ffmpeg/core')
const coreDir = dirname(coreEntry)
const destination = join(process.cwd(), 'public', 'ffmpeg')

await mkdir(destination, { recursive: true })

for (const file of ['ffmpeg-core.js', 'ffmpeg-core.wasm']) {
  await copyFile(join(coreDir, file), join(destination, file))
  console.log(`Copied ${file}`)
}
