console.log('chrome', chrome)

type StorageProps = { [key: string]: any }

const localJson = {
  stringify: (key: string, value: any) => {
    return localStorage.setItem(key, JSON.stringify(value))
  },
  parse: (key: string) => {
    return JSON.parse(localStorage.getItem(key) as string)
  }
}

const i18nWeb = {
  get: (messageName: string, substitutions?: string[] | string) => {
    console.log('i18nWeb.get', messageName, substitutions)
    return messageName
  }
}
const localWeb = {
  get: async (keys?: string | string[] | StorageProps | null) => {
    const res: StorageProps = {}

    if (typeof keys === 'string') {
      res[keys] = localJson.parse(keys)
    } else if (Array.isArray(keys)) {
      keys.forEach((key) => {
        res[key] = localJson.parse(key)
      })
    } else {
      for (const key in keys) {
        if (keys.hasOwnProperty(key)) {
          res[key] = localJson.parse(key)
        }
      }
    }

    return res
  },
  set: async (items: StorageProps) => {
    for (const key in items) {
      items.hasOwnProperty(key) && localJson.stringify(key, items[key])
    }
  }
}

const isDev = import.meta.env.DEV
export const i18n = isDev ? i18nWeb : { get: chrome.i18n.getMessage }
export const cache = isDev ? localWeb : chrome.storage.local
export const cloud = isDev ? localWeb : chrome.storage.sync

isDev || cloud.get().then((res) => console.log('cloud', res))

export enum StoreEnum {
  CRX = 'CRX',
  File = 'File'
}
export const store = {
  get: (key: string) => cloud.get(key).then((data) => data[key] || {}),
  set: (key: string, data: Record<string, any>) => cloud.set({ [key]: data })
}

export const fileToURL = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result as string)
    reader.onerror = (event) => reject(event.target?.error)
    reader.readAsDataURL(blob)
  })
}
