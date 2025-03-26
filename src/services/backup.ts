import { db, json } from '@rainte/js'
import gist from '@/services/gist'
import bookmark from '@/services/bookmark'
import storage, { StorageEnum } from '@/services/storage'

const getBookmark = () => bookmark.local.get()

const setBookmark = async (tree: any[]) => {
  await bookmark.local.clear()
  return Promise.all(tree.map(bookmark.local.add))
}

const getStorage = async () => {
  const keys = await chrome.storage.sync.getKeys()
  return chrome.storage.sync.get(keys)
}

const setStorage = async (value: any) => {
  await chrome.storage.sync.clear()
  return chrome.storage.sync.set(value)
}

const getDatabase = () => db.db.rows.toArray()

const setDatabase = async (value: any[]) => {
  await db.db.rows.clear()

  return Promise.all(
    value.map(async (item) => {
      console.log('item', item)
      await db.db.rows.add(item)
    })
  )
}

const upload = () => {
  return Promise.all([getBookmark(), getStorage(), getDatabase()]).then((res) => {
    console.log('upload', res)
    return gist.set({
      [StorageEnum.Bookmark]: res[0],
      [StorageEnum.Storage]: res[1],
      [StorageEnum.Db]: res[2]
    })
  })
}

const down = async () => {
  const config = await storage.get(StorageEnum.CRX)
  const url = `GET /gists/${config?.gistId}`
  const options = { gist_id: config?.gistId }

  return gist
    .request(url, options)
    .then((res) => res.files)
    .then(async (files) => {
      let temp = files[StorageEnum.Bookmark + gist.extension]
      const res1 = temp ? setBookmark(json.parse(temp?.content)) : null

      temp = files[StorageEnum.Storage + gist.extension]
      const res2 = temp ? setStorage(json.parse(temp?.content)) : null

      temp = files[StorageEnum.Db + gist.extension]
      const res3 = temp ? setDatabase(json.parse(temp?.content)) : null

      return Promise.all([res1, res2, res3])
    })
}

const info = async () => {
  const config = await storage.get(StorageEnum.CRX)
  const url = `GET /gists/${config?.gistId}`
  const options = { gist_id: config?.gistId }

  return gist.request(url, options)
}

export default {
  upload,
  down,
  info
}
