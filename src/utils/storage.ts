import { storage } from '@rainte/js'

export type StorageProps = Record<string, any>
export type CRXProps = {
  githubToken: string
  gistId: string
}
export enum StoreEnum {
  CRX = 'CRX',
  Bookmark = 'Bookmark',
  Tab = 'Tab'
}

const localWeb = {
  get: async (keys?: string | string[] | StorageProps | null) => {
    const res: StorageProps = {}

    if (typeof keys === 'string') {
      res[keys] = storage.local.get(keys)
    } else if (Array.isArray(keys)) {
      keys.map((key) => (res[key] = storage.local.get(key)))
    } else if (keys instanceof Object) {
      Object.keys(keys).map((key) => (res[key] = storage.local.get(key)))
    }

    return res
  },
  set: async (items: StorageProps) => {
    Object.entries(items).map((item) => storage.local.set(...item))
  }
}

const isDev = import.meta.env.DEV
export const cache = isDev ? localWeb : chrome.storage.local
export const cloud = isDev ? localWeb : chrome.storage.sync
export default {
  get: function <T = Record<string, any>>(key: string): Promise<T> {
    return cloud.get(key).then((data) => data[key])
  },
  set: (key: string, data: StorageProps) => cloud.set({ [key]: data })
}

isDev || cache.get().then((res) => console.log('cache', res))
isDev || cloud.get().then((res) => console.log('cloud', res))
