export type DBConfig = {
  dbName: string
  storeName: string
  version?: number
}

/** 链式操作对象 */
export type DBClient = {
  save<T>(key: string, value: T): Promise<void>
  load<T>(key: string): Promise<T | null>
  clear(key: string): Promise<void>
}

/** 打开数据库，按配置创建 objectStore */
function openOnce(config: DBConfig): Promise<IDBDatabase> {
  const { dbName, storeName, version = 1 } = config
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, version)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(storeName)) {
        req.result.createObjectStore(storeName)
      }
    }
    req.onsuccess = () => {
      const db = req.result
      // 兜底：别人要升级/删除时让路
      db.onversionchange = () => db.close()
      resolve(db)
    }
    req.onerror = () => reject(req.error)
  })
}

/** 开库 → 事务 → 完成 → 关闭，一次操作一个连接 */
function withStore<T>(
  config: DBConfig,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openOnce(config).then((db) => {
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(config.storeName, mode)
      const req = fn(tx.objectStore(config.storeName))
      let result: T
      req.onsuccess = () => {
        result = req.result as T
      }
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => {
        db.close()
        resolve(result)
      }
      tx.onerror = () => {
        db.close()
        reject(tx.error)
      }
      tx.onabort = () => {
        db.close()
        reject(tx.error ?? new Error('transaction aborted'))
      }
    })
  })
}

export function openDB(config: DBConfig): DBClient {
  return {
    save<T>(key: string, value: T): Promise<void> {
      return withStore(config, 'readwrite', (store) => store.put(value, key)).then(() => undefined)
    },
    load<T>(key: string): Promise<T | null> {
      return withStore<T | null>(
        config,
        'readonly',
        (store) => store.get(key) as IDBRequest<T | null>
      ).then((result) => result ?? null)
    },
    clear(key: string): Promise<void> {
      return withStore(config, 'readwrite', (store) => store.delete(key)).then(() => undefined)
    }
  }
}
