export enum JobMsgType {
  CREATE_JOB = 'CREATE_JOB',
  CANCEL_JOB = 'CANCEL_JOB',
  RUN_JOB = 'RUN_JOB',
  JOB_PROGRESS = 'JOB_PROGRESS',
  JOB_RESULT = 'JOB_RESULT',
  JOB_ERROR = 'JOB_ERROR',
  JOB_CANCELLED = 'JOB_CANCELLED',
  JOB_UPDATE = 'JOB_UPDATE',
  GET_ALL_JOBS = 'GET_ALL_JOBS'
}

export enum JobStatus {
  Pending = 'pending',
  Running = 'running',
  Done = 'done',
  Cancelled = 'cancelled',
  Error = 'error'
}

export interface DiscoveredSource {
  url: string
  type: string
  tabId?: number
  foundAt: number
  title?: string
  duration?: string
  size?: string
}

export interface Job<P = unknown> {
  id: string
  kind: string
  title: string
  payload: P
  status: `${JobStatus}`
  progress: number // 0-100
  phase: string
  error?: string
  createdAt: number
  updatedAt: number
}

/** 处理器契约：必须尊重 signal，通过 report 上报进度 */
export type JobHandler<P = any, R = unknown> = (
  payload: P,
  signal: AbortSignal,
  report: (ratio: number, phase?: string) => void
) => Promise<R>

/** ---- 消息 ---- */

export interface CreateJobMsg {
  type: JobMsgType.CREATE_JOB
  kind: string
  title: string
  payload: unknown
}

export interface CancelJobMsg {
  type: JobMsgType.CANCEL_JOB
  jobId: string
}

export interface RunJobMsg {
  target: 'offscreen'
  type: JobMsgType.RUN_JOB
  job: Job
}

export interface CancelOffscreenMsg {
  target: 'offscreen'
  type: JobMsgType.CANCEL_JOB
  jobId: string
}

export interface ProgressMsg {
  type: JobMsgType.JOB_PROGRESS
  jobId: string
  ratio: number
  phase?: string
}

export interface ResultMsg {
  type: JobMsgType.JOB_RESULT
  jobId: string
  result: unknown
}

export interface ErrorMsg {
  type: JobMsgType.JOB_ERROR
  jobId: string
  error: string
}

export interface CancelledMsg {
  type: JobMsgType.JOB_CANCELLED
  jobId: string
}

export interface UpdateMsg {
  type: JobMsgType.JOB_UPDATE
  job: Job
}
