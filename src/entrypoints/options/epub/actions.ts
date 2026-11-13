import { EpubKind, type BatchItemResult } from '@/lib/epub'
import { downloadAsZip, downloadBlob } from '@/utils/download'
import { antd } from '@rainte/ant'

export const handleDownloadOne = (kind: EpubKind, r: BatchItemResult) => {
  if (!r.ok || !r.result) return
  const { title, epubBlob, txtBlob } = r.result
  downloadBlob(kind === 'epub' ? epubBlob : txtBlob, `${title}.${kind}`)
  antd.message.success(`${title}.${kind} 已开始下载`)
}

export const handleDownloadAll = async (results: BatchItemResult[], kind?: EpubKind) => {
  const ok = results.filter((r) => r.ok && r.result)
  if (!ok.length) return

  const entries: { filename: string; blob: Blob }[] = []
  for (const r of ok) {
    const res = r.result!
    if (!kind || kind === EpubKind.Epub) {
      entries.push({ filename: `${res.title}.epub`, blob: res.epubBlob })
    }
    if (!kind || kind === EpubKind.Txt) {
      entries.push({ filename: `${res.title}.txt`, blob: res.txtBlob })
    }
  }

  const zipName =
    kind === 'epub' ? 'epub-books.zip' : kind === 'txt' ? 'txt-books.zip' : 'converted-books.zip'

  await downloadAsZip(entries, zipName)
  antd.message.success(`已打包 ${entries.length} 个文件`)
}
