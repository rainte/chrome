import type { JobHandler } from '@/utils/job'
import { fetchSegments, mapConcurrent, mergeTsToMp4 } from './ffmpeg'

/** 媒体下载：下载所有 TS 分片后直接合并为 MP4 */
export const downloadMedia: JobHandler<
  { url: string; fileName: string },
  { blob: Blob; fileName: string }
> = async ({ url, fileName }, signal, report) => {
  report(0, 'downloading')

  const segmentUrls = await fetchSegments(url, signal)
  let downloaded = 0

  const tsChunks = await mapConcurrent(
    segmentUrls,
    6, // 并发下载分片数
    async (segUrl) => {
      const resp = await fetch(segUrl, { signal })
      if (!resp.ok) throw new Error(`分片下载失败: ${resp.status}`)
      const buf = new Uint8Array(await resp.arrayBuffer())
      downloaded++
      report((downloaded / segmentUrls.length) * 0.8, 'downloading') // 下载占 80% 进度
      return buf
    },
    signal
  )

  report(0.8, 'converting')

  const blob = await mergeTsToMp4(tsChunks, (ratio) => {
    report(0.8 + ratio * 0.2, 'converting') // 合并占 20% 进度
  })

  return { blob, fileName }
}
