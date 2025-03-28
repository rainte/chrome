import { SyncEnum } from '..'

class Sync {
  get(keys?: ObjectProps | string) {
    return chrome.storage.sync.get(keys)
  }
  set(items: ObjectProps) {
    return chrome.storage.sync.set(items)
  }
  getItem<T = any>(key: SyncEnum): Promise<T | undefined> {
    return this.get(key).then((res) => res[key])
  }
  setItem(key: SyncEnum, data: any) {
    return this.set({ [key]: data })
  }
  clear() {
    return chrome.storage.sync.clear()
  }
}

export default new Sync()
