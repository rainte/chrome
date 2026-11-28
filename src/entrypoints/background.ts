import { browser, defineBackground, type Browser } from '#imports'
import type { CreateJobMsg, DiscoveredSource, Job, RunJobMsg } from '@/utils/job'
import { JobMsgType, JobStatus } from '@/utils/job'

interface HlsMeta {
  duration: number // 秒
  estimatedBytes: number // 估算字节数，0 表示无法估算
  bitrate?: number // 用于估算的码率 (bps)
  bitrateSource?: 'AVERAGE-BANDWIDTH' | 'BANDWIDTH' | 'BYTERANGE'
  live: boolean
}

type SetPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

let offscreenReady = false
const jobs = new Map<string, Job>()
const discovered = new Map<string, DiscoveredSource>()
const EXTENSION_ORIGIN = `chrome-extension://${browser.runtime.id}`

export default defineBackground(() => {
  browser.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (!isM3U8(details.url)) return
      if (details.initiator === EXTENSION_ORIGIN) return
      if (discovered.has(details.url)) return
      ;(async () => {
        const source = await setHlsSource(details)
        discovered.set(details.url, source)
        browser.runtime.sendMessage({ type: 'SOURCE_DISCOVERED', source }).catch(() => {})
      })()
    },
    {
      urls: ['<all_urls>']
    }
  )

  // 可选：响应头里识别 Content-Type 为 mpegurl 的（URL 不带 .m3u8 的情况）
  browser.webRequest.onHeadersReceived.addListener(
    (details) => {
      if (discovered.has(details.url)) return
      const ct = details.responseHeaders?.find(
        (h) => h.name.toLowerCase() === 'content-type'
      )?.value
      if (isM3U8(details.url, ct)) {
        ;(async () => {
          const source = await setHlsSource(details)
          discovered.set(details.url, source)
          browser.runtime.sendMessage({ type: 'SOURCE_DISCOVERED', source }).catch(() => {})
        })()
      }
    },
    { urls: ['<all_urls>'] },
    ['responseHeaders']
  )

  browser.runtime.onMessage.addListener((msg: any) => {
    let job: Job | undefined
    if (msg.jobId) job = jobs.get(msg.jobId)

    switch (msg.type) {
      case JobMsgType.CREATE_JOB:
        createJob(msg as CreateJobMsg)
        return true

      case JobMsgType.CANCEL_JOB: {
        if (!job || job.status === JobStatus.Done || job.status === JobStatus.Cancelled) return
        broadcast(job, { status: JobStatus.Cancelled, error: '用户取消' })
        browser.runtime
          .sendMessage({
            target: 'offscreen',
            type: JobMsgType.CANCEL_JOB,
            jobId: job.id
          })
          .catch(() => {})
        return true
      }

      case JobMsgType.GET_ALL_JOBS:
        return Promise.resolve([...jobs.values()])

      case 'GET_DISCOVERED':
        return Promise.resolve([...discovered.values()].sort((a, b) => b.foundAt - a.foundAt))

      case 'CLEAR_DISCOVERED':
        discovered.clear()
        return Promise.resolve([...discovered.values()].sort((a, b) => b.foundAt - a.foundAt))

      case 'CLEAR_JOBS':
        for (const [id, job] of jobs) {
          if (
            job.status === JobStatus.Done ||
            job.status === JobStatus.Cancelled ||
            job.status === JobStatus.Error
          ) {
            jobs.delete(id)
          }
        }
        return Promise.resolve([...jobs.values()])

      case JobMsgType.JOB_PROGRESS: {
        if (!job || job.status === JobStatus.Cancelled) return
        broadcast(job, {
          status: JobStatus.Running,
          progress: Math.round(msg.ratio * 100),
          phase: msg.phase ?? job.phase
        })
        return
      }

      case JobMsgType.JOB_RESULT: {
        if (!job || job.status === JobStatus.Cancelled) return
        broadcast(job, { status: JobStatus.Done, progress: 100, phase: 'done' })
        onResult(job, msg.result).catch((err) =>
          broadcast(job, { status: JobStatus.Error, error: err.message })
        )
        return
      }

      case JobMsgType.JOB_ERROR: {
        if (!job || job.status === JobStatus.Cancelled) return
        broadcast(job, { status: JobStatus.Error, error: msg.error })
        return
      }

      case JobMsgType.JOB_CANCELLED: {
        if (!job || job.status === JobStatus.Cancelled) return
        broadcast(job, { status: JobStatus.Cancelled })
        return
      }
    }
  })
})

async function setHlsSource(
  details: SetPartial<
    Browser.webRequest.WebRequestDetails,
    'documentId' | 'documentLifecycle' | 'frameType'
  >
) {
  const hlsMeta = await inspectHlsMeta(details.url)
  const source: DiscoveredSource = {
    url: details.url,
    type: 'hls',
    tabId: details.tabId,
    foundAt: Date.now(),
    title: guessTitle(details.url),
    duration: formatDuration(hlsMeta.duration),
    size: formatBytes(hlsMeta.estimatedBytes)
  }
  return source
}

async function createJob(msg: CreateJobMsg) {
  const now = Date.now()
  const job: Job = {
    id: crypto.randomUUID(),
    kind: msg.kind,
    title: msg.title,
    payload: msg.payload,
    status: 'pending',
    progress: 0,
    phase: '',
    createdAt: now,
    updatedAt: now
  }
  jobs.set(job.id, job)
  broadcast(job)

  await ensureOffscreen()
  const runMsg: RunJobMsg = { target: 'offscreen', type: JobMsgType.RUN_JOB, job }
  browser.runtime.sendMessage(runMsg).catch(console.error)
}

async function onResult(job: Job, result: any) {
  if (job.kind === 'm3u8' && result?.blobUrl) {
    await browser.downloads.download({
      url: result.blobUrl,
      filename: result.fileName || `${job.title}.mp4`,
      saveAs: false
    })
  }
}

async function ensureOffscreen() {
  if (offscreenReady) return
  const [ctx] = await browser.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  })
  if (!ctx) {
    await browser.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['WORKERS'],
      justification: 'Run async jobs'
    })
  }
  offscreenReady = true
}

function broadcast(job: Job, p: Partial<Job> = {}) {
  Object.assign(job, p, { updatedAt: Date.now() })
  browser.runtime.sendMessage({ type: JobMsgType.JOB_UPDATE, job }).catch(() => {})
}

function isM3U8(url: string, contentType?: string) {
  const M3U8_RE = /\.m3u8(\?|$)/i
  return M3U8_RE.test(url) || !!contentType?.includes('mpegurl')
}

async function inspectHlsMeta(m3u8Url: string, signal?: AbortSignal): Promise<HlsMeta> {
  const resp = await fetch(m3u8Url, { signal })
  if (!resp.ok) throw new Error(`m3u8 请求失败: ${resp.status}`)
  const text = await resp.text()

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // ---- 判断 Playlist 类型 ----
  const isMaster = lines.some((l) => l.startsWith('#EXT-X-STREAM-INF'))

  if (isMaster) {
    // Master Playlist：取第一个变体
    let bitrate: number | undefined
    let bitrateSource: HlsMeta['bitrateSource']
    let childUri: string | undefined

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      if (line.startsWith('#EXT-X-STREAM-INF')) {
        const avg = line.match(/AVERAGE-BANDWIDTH=(\d+)/)
        const bw = line.match(/BANDWIDTH=(\d+)/)
        if (avg) {
          bitrate = Number(avg[1])
          bitrateSource = 'AVERAGE-BANDWIDTH'
        } else if (bw) {
          bitrate = Number(bw[1])
          bitrateSource = 'BANDWIDTH'
        }

        // 下一行非注释行即子播放列表 URI
        const next = lines[i + 1]
        if (next && !next.startsWith('#')) {
          childUri = next
          break
        }
      }
    }

    if (!childUri) throw new Error('Master Playlist 中未找到子流')

    const base = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1)
    const childUrl = childUri.startsWith('http') ? childUri : base + childUri
    const child = await inspectHlsMeta(childUrl, signal)

    const estimatedBytes =
      bitrate && child.duration > 0 ? Math.round((bitrate * child.duration) / 8) : 0

    return {
      duration: child.duration,
      estimatedBytes,
      bitrate,
      bitrateSource,
      live: child.live
    }
  }

  // ---- Media Playlist ----
  let duration = 0
  let byterangeTotal = 0
  let hasByterange = false

  for (const line of lines) {
    const extinf = line.match(/^#EXTINF:\s*([\d.]+)/)
    if (extinf) duration += parseFloat(extinf[1]!)

    const br = line.match(/^#EXT-X-BYTERANGE:\s*(\d+)/)
    if (br) {
      byterangeTotal += Number(br[1])
      hasByterange = true
    }
  }

  const live = !lines.includes('#EXT-X-ENDLIST')

  let estimatedBytes = 0
  let bitrate: number | undefined
  let bitrateSource: HlsMeta['bitrateSource']

  if (!live && duration > 0) {
    if (hasByterange && byterangeTotal > 0) {
      // 有 BYTERANGE 时直接用字节数（这是最准的）
      estimatedBytes = byterangeTotal
      bitrate = Math.round((byterangeTotal * 8) / duration)
      bitrateSource = 'BYTERANGE'
    } else {
      // 没有 BYTERANGE，只能靠码率兜底：从 #EXT-X-BITRATE 或缺失
      const bitrateLine = lines.find((l) => l.startsWith('#EXT-X-BITRATE'))
      if (bitrateLine) {
        const m = bitrateLine.match(/:(\d+)/)
        if (m) {
          bitrate = Number(m[1]) * 1000 // EXT-X-BITRATE 单位是 kbps
          estimatedBytes = Math.round((bitrate * duration) / 8)
          bitrateSource = 'BANDWIDTH'
        }
      }
    }
  }

  return { duration, estimatedBytes, bitrate, bitrateSource, live }
}

function guessTitle(url: string) {
  return (url.split('/').pop()?.split('?')[0] ?? 'video').replace(/\.m3u8$/i, '')
}

function formatDuration(seconds?: number): string {
  if (seconds === undefined) return '解析中...'
  if (seconds < 0) return '未知'

  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '未知'
  if (bytes < 1024) return `${bytes} B`

  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let i = 0

  while (value >= 1024 && i < units.length - 1) {
    value /= 1024
    i++
  }

  // 大于 100 时保留 0 位小数更干净，否则按传入精度
  const fixed = value >= 100 ? 0 : decimals
  return `${value.toFixed(fixed)} ${units[i]}`
}
