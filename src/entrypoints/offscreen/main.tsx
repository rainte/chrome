import { browser } from '#imports'
import { JobMsgType, type CancelOffscreenMsg, type Job, type RunJobMsg } from '@/utils/job'
import { downloadMedia } from './handlers'

const MAX_CONCURRENT = 3
const controllers = new Map<string, AbortController>()

let running = 0
const waiting: (() => void)[] = []

browser.runtime.onMessage.addListener((msg: any) => {
  if (msg.target !== 'offscreen') return

  if (msg.type === JobMsgType.RUN_JOB) {
    const { job } = msg as RunJobMsg
    acquire().then(() => {
      switch (job.kind) {
        case 'm3u8':
          return executeM3u8(job as Job<{ url: string; fileName: string }>).finally(release)
        default:
          send({ type: JobMsgType.JOB_ERROR, jobId: job.id, error: `未注册的处理器: ${job.kind}` })
          return
      }
    })
  } else if (msg.type === JobMsgType.CANCEL_JOB) {
    controllers.get((msg as CancelOffscreenMsg).jobId)?.abort()
  }
})

function acquire(): Promise<void> {
  if (running < MAX_CONCURRENT) {
    running++
    return Promise.resolve()
  }
  return new Promise((resolve) =>
    waiting.push(() => {
      running++
      resolve()
    })
  )
}

async function executeM3u8(job: Job<{ url: string; fileName: string }>) {
  const controller = new AbortController()
  controllers.set(job.id, controller)

  const report = (ratio: number, phase?: string) =>
    send({ type: JobMsgType.JOB_PROGRESS, jobId: job.id, ratio, phase })

  try {
    const result = await downloadMedia(job.payload, controller.signal, report)
    const blobUrl = URL.createObjectURL(result.blob)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    send({
      type: 'JOB_RESULT',
      jobId: job.id,
      result: { blobUrl, fileName: result.fileName || `${job.title}.mp4` }
    })
  } catch (err: any) {
    const type = err?.name === 'AbortError' ? JobMsgType.JOB_CANCELLED : JobMsgType.JOB_ERROR
    send({ type, jobId: job.id, error: err?.message })
  } finally {
    controllers.delete(job.id)
  }
}

function release() {
  running--
  waiting.shift()?.()
}

function send(msg: unknown) {
  return browser.runtime.sendMessage(msg).catch(() => {})
}
