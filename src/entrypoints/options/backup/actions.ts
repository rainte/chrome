import { downloadBackup } from '@/utils/backup'
import { backupState, storageKeyName, StorageKeys } from '@/utils/storage'

export const BackupStorageKeys = [
  storageKeyName(StorageKeys.Proxy),
  storageKeyName(StorageKeys.Tab)
]

export interface BackupSettings {
  token: string
  repo: string
  path: string
  includeBookmarks: boolean
  updatedAt?: string
}

export interface BackupTime {
  local?: string
  cloud?: string
}

export const loadBackupSettings = () => backupState.getValue()

export const saveBackupSettings = (state: BackupSettings) => backupState.setValue(state)

export const assertBackupSettings = (state: BackupSettings) => {
  if (!state.token || !state.repo) {
    throw new Error('请先配置 Github Token 和 Github Repository')
  }
}

export const formatDate = (time?: string) => (time ? new Date(time).toLocaleString() : '一')

export const loadBackupTime = async (state: BackupSettings) => {
  let next: BackupTime = { local: state.updatedAt }
  if (state.token && state.repo) {
    const last = await downloadBackup({ kind: 'repo', token: state.token, repo: state.repo })
    next = { ...next, cloud: last.updatedAt }
  }
  return next
}
