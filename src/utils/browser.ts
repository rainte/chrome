import { popup } from '@/utils/popup'

type StorageProps = { [key: string]: any }

export const AppEnum = {
  Bookmark: 'bookmark'
}

const localJson = {
  stringify: (key: string, value: any) => {
    return localStorage.setItem(key, JSON.stringify(value))
  },
  parse: (key: string) => {
    return JSON.parse(localStorage.getItem(key) || 'null')
  }
}

const i18nWeb = {
  get: (messageName: string, substitutions?: string[] | string) => {
    console.log('i18nWeb.get', messageName, substitutions)
    return messageName
  }
}
const localWeb = {
  get: (keys?: string | string[] | StorageProps | null) => {
    return new Promise<StorageProps>((resolve) => {
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

      resolve(res)
    })
  },
  set: (items: StorageProps) => {
    return new Promise<void>((resolve) => {
      for (const key in items) {
        if (items.hasOwnProperty(key)) {
          localJson.stringify(key, items[key])
        }
      }
      resolve()
    })
  }
}

console.log('chrome', chrome)
const isDev = import.meta.env.DEV
export const i18n = isDev ? i18nWeb : { get: chrome.i18n.getMessage }
export const cache = isDev ? localWeb : chrome.storage.local
export const cloud = isDev ? localWeb : chrome.storage.sync
export const storage = {
  cloud: {
    get: (domain: string) => {
      return cloud.get(domain).then((res) => ({ ...res[domain] }))
    },
    set: (domain: string, data: StorageProps, isOk?: boolean) => {
      const promise = cloud.set({ [domain]: data })

      return isOk ? promise.then(() => popup.success()) : promise
    }
  }
}
