import { storage } from '#imports'
import type { BackupSettings } from '@/entrypoints/options/backup/actions'
import type { TabSettings } from '@/entrypoints/options/tab/actions'
import { ProxyAction, type ProxySettings } from './proxy'

const StorageKeys = {
  Backup: 'sync:backup',
  Proxy: 'local:proxy',
  Tab: 'local:tab'
} as const

export const backupState = storage.defineItem<BackupSettings>(StorageKeys.Backup, {
  fallback: { token: '', gistId: '' }
})

export const proxyState = storage.defineItem<ProxySettings>(StorageKeys.Proxy, {
  init: () => {
    return {
      activeId: ProxyAction.Direct,
      fixedProxies: [],
      pacProxies: []
    }
  }
})

export const tabState = storage.defineItem<TabSettings>(StorageKeys.Tab, {
  fallback: { cover: '' }
})
