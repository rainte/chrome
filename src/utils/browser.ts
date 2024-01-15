export const i18n = {
  get: (messageName: string, substitutions?: string[] | string) => {
    return messageName
    // return chrome.i18n.getMessage(messageName, substitutions)
  }
}

export const cache = {
  get: (keys?: string | string[] | { [key: string]: any } | null) => {
    // if (keys instanceof String) {
    //   return JSON.parse(localStorage.getItem(keys.toString()) as string)
    // } else if (keys instanceof Array) {
    //   for (let key of keys) {
    //     return JSON.parse(localStorage.getItem(key) as string)
    //   }
    // }
    // for (let key in keys) {
    //   return localStorage.setItem(key, JSON.stringify(items[key]))
    // }
    // return JSON.parse(localStorage.getItem('keys') as string)
    // return chrome.storage.local.get(keys)
  },
  set: (items: { [key: string]: any }) => {
    for (let key in items) {
      localStorage.setItem(key, JSON.stringify(items[key]))
    }
    // return chrome.storage.local.set(items)
  }
}

export const cloud = {
  set: (items: { [key: string]: any }) => {
    // return localStorage.setItem('items', JSON.stringify(items))
    return chrome.storage.sync.set(items)
  }
}
