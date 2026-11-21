import JSZip from 'jszip'

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)

  try {
    link.click()
  } finally {
    link.remove()
    URL.revokeObjectURL(url)
  }
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
