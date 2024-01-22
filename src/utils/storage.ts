export type StorageProps = Record<string, any>
export type CRXProps = {
  githubToken: string
  gistId: string
}
export enum StoreEnum {
  CRX = 'CRX'
}
export enum FileEnum {
  NewTabBgImg = 'newTabBgImg'
}

const localJson = {
  stringify: (key: string, value: any) => {
    return localStorage.setItem(key, JSON.stringify(value))
  },
  parse: (key: string) => {
    return JSON.parse(localStorage.getItem(key) as string)
  }
}

const localWeb = {
  get: async (keys?: string | string[] | StorageProps | null) => {
    const res: StorageProps = {}

    if (typeof keys === 'string') {
      res[keys] = localJson.parse(keys)
    } else if (Array.isArray(keys)) {
      keys.map((key) => (res[key] = localJson.parse(key)))
    } else if (keys instanceof Object) {
      Object.keys(keys).map((key) => (res[key] = localJson.parse(key)))
    }

    return res
  },
  set: async (items: StorageProps) => {
    Object.keys(items).map((key) => localJson.stringify(key, items[key]))
  }
}

const isDev = import.meta.env.DEV
export const cache = isDev ? localWeb : chrome.storage.local
export const cloud = isDev ? localWeb : chrome.storage.sync
export const store = {
  get: (key: string) =>
    cloud
      .get(key)
      .then((data) => data[key] || {})
      .then((res: StorageProps) => res),
  set: (key: string, data: StorageProps) => cloud.set({ [key]: data })
}

isDev || cloud.get().then((res) => console.log('cloud', res))
