import JSZip from 'jszip'

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface ZipEntry {
  filename: string
  blob: Blob
}

/** 把多个 Blob 打成一个 ZIP 下载 */
export async function downloadAsZip(entries: ZipEntry[], zipName: string): Promise<void> {
  const zip = new JSZip()
  for (const { filename, blob } of entries) {
    zip.file(filename, blob)
  }
  const buf = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })
  downloadBlob(buf, zipName)
}
