import { storage } from '@rainte/js'

export enum StorageEnum {
  CRX = 'crx',
  Bookmark = 'bookmark',
  Proxy = 'proxy',
  Tab = 'tab'
}

const localWeb = {
  get: async (keys?: string | string[] | ObjectProps | null) => {
    const res: ObjectProps = {}

    if (typeof keys === 'string') {
      res[keys] = storage.local.get(keys)
    } else if (Array.isArray(keys)) {
      keys.map((key) => (res[key] = storage.local.get(key)))
    } else if (keys instanceof Object) {
      Object.keys(keys).map((key) => (res[key] = storage.local.get(key)))
    }

    return res
  },
  set: async (items: ObjectProps) => {
    Object.entries(items).map((item) => storage.local.set(...item))
  }
}

const isDev = import.meta.env.MODE == 'development'
export const cache = isDev ? localWeb : chrome.storage.local
export const cloud = isDev ? localWeb : chrome.storage.sync

isDev || cache.get().then((res) => console.log('cache', res))
isDev || cloud.get().then((res) => console.log('cloud', res))

const get = <T = ObjectProps>(key: string): Promise<T | undefined> => {
  return cloud.get(key).then((res) => res[key])
}

const set = (key: string, data: ObjectProps) => cloud.set({ [key]: data })

export default {
  get,
  set
}
