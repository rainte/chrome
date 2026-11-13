import { fetchGist } from '@/utils/gist'
import { backupState } from '@/utils/storage'

export interface BackupSettings {
  token: string
  gistId: string
  updatedAt?: string
}

export interface BackupTime {
  local?: string
  cloud?: string
}

export const loadBackupSettings = () => backupState.getValue()

export const saveBackupSettings = (state: BackupSettings) => backupState.setValue(state)

export const assertBackupSettings = (state: BackupSettings) => {
  if (!state.token || !state.gistId) {
    throw new Error('请先配置 Github Token 和 Gist ID')
  }
}

export const toDate = (time?: string) => (time ? new Date(time).toLocaleString() : '一')

export const loadBackupTime = async (state: BackupSettings) => {
  let next: BackupTime = { local: state.updatedAt }
  if (state.token && state.gistId) {
    const last = await fetchGist(state.token, state.gistId)
    next = { ...next, cloud: last.updated_at }
  }
  return next
}
