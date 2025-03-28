import { storage } from '@rainte/js'
import { SyncEnum } from '..'

class Sync {
  async get(keys?: ObjectProps | string) {
    const res: ObjectProps = {}

    if (typeof keys === 'string') {
      res[keys] = storage.local.get(keys)
    } else if (Array.isArray(keys)) {
      keys.map((key) => (res[key] = storage.local.get(key)))
    } else if (keys instanceof Object) {
      Object.keys(keys).map((key) => (res[key] = storage.local.get(key)))
    }

    return res
  }
  async set(items: ObjectProps) {
    return Object.entries(items).map((item) => storage.local.set(...item))
  }
  getItem<T = any>(key: SyncEnum): Promise<T | undefined> {
    return this.get(key).then((res) => res[key])
  }
  setItem(key: SyncEnum, data: any) {
    return this.set({ [key]: data })
  }
  async clear() {
    storage.local.clear()
  }
}

export default new Sync()
