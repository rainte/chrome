import { storage } from '#imports'
import type { BackupSettings } from '@/entrypoints/options/backup/actions'
import { Theme, type ReaderSettings } from '@/entrypoints/options/reader/actions'
import type { TabSettings } from '@/entrypoints/options/tab/actions'
import { ProxyAction, type ProxySettings } from './proxy'

const StorageKeys = {
  Backup: 'sync:backup',
  Proxy: 'local:proxy',
  Tab: 'local:tab',
  Reader: 'local:reader',
  ReaderScroll: 'local:readerScroll',
  Collapsed: 'local:collapsed'
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

export const readerState = storage.defineItem<ReaderSettings>(StorageKeys.Reader, {
  init: () => {
    return {
      theme: Theme.Light,
      fontSize: 16,
      chapter: 0,
      ratio: 0
    }
  }
})

export const readerScrollState = storage.defineItem(StorageKeys.ReaderScroll, {
  init: () => 0
})

export const collapsedState = storage.defineItem(StorageKeys.Collapsed, {
  init: () => false
})
