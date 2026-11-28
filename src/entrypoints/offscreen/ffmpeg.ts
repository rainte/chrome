declare function createFFmpegCore(options?: {
  locateFile?: (path: string) => string
  print?: (text: string) => void
  printErr?: (text: string) => void
}): Promise<any>

interface FfmpegCore {
  FS: {
    writeFile: (name: string, data: Uint8Array) => void
    readFile: (name: string) => Uint8Array
    unlink: (name: string) => void
  }
  exec: (...args: string[]) => number
  setLogger: (fn: (log: { type: string; message: string }) => void) => void
  reset: () => void
}

let corePromise: Promise<FfmpegCore> | null = null

/** 懒加载 ffmpeg core，仅实例化一次 */
export function getFfmpegCore(): Promise<FfmpegCore> {
  if (corePromise) return corePromise

  corePromise = (async () => {
    const script = document.createElement('script')
    script.src = '/ffmpeg/ffmpeg-core.js'
    document.head.appendChild(script)

    await new Promise<void>((resolve, reject) => {
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('无法加载 ffmpeg-core.js'))
    })

    const core: FfmpegCore = await createFFmpegCore({
      locateFile: (path: string) => `/ffmpeg/${path}`,
      print: () => {},
      printErr: () => {}
    })

    return core
  })()

  return corePromise
}

/**
 * 将多个 TS 分片合并为一个 MP4 Blob。
 * 使用 concat: 协议而非二进制直接拼接，以更好的处理分片边界。
 * 执行后立即清理 MEMFS 中的分片文件，避免内存耗尽导致 Aborted()。
 */
export async function mergeTsToMp4(
  tsChunks: Uint8Array[],
  onProgress?: (ratio: number) => void,
  onLog?: (msg: string) => void
): Promise<Blob> {
  const core = await getFfmpegCore()

  const segNames = tsChunks.map((_, i) => `seg_${String(i).padStart(4, '0')}.ts`)

  // 1. 写入所有分片
  tsChunks.forEach((chunk, i) => {
    core.FS.writeFile(segNames[i]!, chunk)
  })

  // 2. 构造 concat 输入
  const concatInput = `concat:${segNames.join('|')}`

  const args = ['-i', concatInput, '-c', 'copy', '-movflags', '+faststart', 'output.mp4']

  // 3. 日志与进度
  let durationSec = 0
  let lastError = ''

  core.setLogger(({ type, message }) => {
    if (type === 'stderr') {
      onLog?.(message)

      const durationMatch = message.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
      if (durationMatch) {
        const [, h, m, s, cs] = durationMatch
        durationSec = Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(cs) / 100
      }

      const timeMatch = message.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/)
      if (timeMatch && durationSec > 0 && onProgress) {
        const [, h, m, s, cs] = timeMatch
        const currentSec = Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(cs) / 100
        onProgress(Math.min(1, currentSec / durationSec))
      }

      if (/Error|Invalid|corrupt input packet/i.test(message)) {
        lastError = message
      }
    }
  })

  // 4. 执行 ffmpeg
  let exitCode = -1
  let execError: Error | null = null
  try {
    exitCode = core.exec(...args)
  } catch (err: any) {
    // Emscripten 的 Aborted() 会以异常形式抛出
    execError = err
  }

  // 5. 立即清理所有分片，释放内存
  for (const name of segNames) {
    try {
      core.FS.unlink(name)
    } catch {
      /* 已不存在则忽略 */
    }
  }

  // 6. 检查输出文件是否真实生成
  let output: Uint8Array | null = null
  try {
    output = core.FS.readFile('output.mp4')
  } catch {
    output = null
  }

  // 清理输出（读完后立刻释放 MEMFS 引用）
  try {
    core.FS.unlink('output.mp4')
  } catch {
    /* ignore */
  }

  try {
    core.reset()
  } catch {
    /* ignore */
  }

  // 7. 判定结果
  if (!output || output.length === 0) {
    const reason = execError?.message || lastError || `ffmpeg 未生成有效输出（退出码: ${exitCode}）`
    throw new Error(reason)
  }

  // 即使 exec 抛了 Aborted，只要有有效输出就认为成功
  if (exitCode !== 0 && !execError) {
    onLog?.(`ffmpeg 退出码 ${exitCode}，但输出有效，继续`)
  }

  return new Blob([new Uint8Array(output)], { type: 'video/mp4' })
}

/** 简单并发池 */
export async function mapConcurrent<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
  signal: AbortSignal
): Promise<R[]> {
  const results: R[] = Array.from({ length: items.length })
  let index = 0

  async function worker() {
    while (index < items.length) {
      if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
      const i = index++
      const item = items[i]
      if (item === undefined) break
      results[i] = await fn(item)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

/** 从 m3u8 URL 解析出分片列表（简化版，支持媒体播放列表） */
export async function fetchSegments(m3u8Url: string, signal: AbortSignal): Promise<string[]> {
  const resp = await fetch(m3u8Url, { signal })
  if (!resp.ok) throw new Error(`m3u8 请求失败: ${resp.status}`)
  const text = await resp.text()

  const base = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1)
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const segments: string[] = []
  let isMediaPlaylist = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue

    if (line.startsWith('#EXTINF')) isMediaPlaylist = true
    if (!line.startsWith('#') && line.length > 0 && !line.startsWith('http')) {
      segments.push(base + line)
    } else if (line.startsWith('http') && !line.includes('.m3u8')) {
      segments.push(line)
    }
  }

  if (!isMediaPlaylist) {
    // 主播放列表：取第一个子播放列表递归
    const child = lines.find((l) => !l.startsWith('#') && l.length > 0)
    if (child) {
      const childUrl = child.startsWith('http') ? child : base + child
      return fetchSegments(childUrl, signal)
    }
  }

  if (segments.length === 0) throw new Error('未找到任何分片')
  return segments
}
