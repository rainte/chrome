import { database } from '@rainte/js'
import { dialog } from '@rainte/ant'
import gist, { GistEnum } from '@/utils/gist'
import crx, { SyncEnum } from '@/utils/crx'

const map: {
  [key in GistEnum]?: { get: FunctionProps; set: FunctionProps }
} = {
  [GistEnum.Bookmark]: { get: () => getBookmark(), set: (value: any) => setBookmark(value) },
  [GistEnum.Storage]: { get: () => getStorage(), set: (value: any) => setStorage(value) },
  [GistEnum.Db]: { get: () => getDatabase(), set: (value: any) => setDatabase(value) }
}

const all = Object.values(GistEnum).filter((item) => item != GistEnum.CRX)

const getBookmark = () => crx.bookmark.all()

const setBookmark = async (tree: any[]) => {
  await crx.bookmark.clear()
  for (const item of tree.shift().children) {
    await crx.bookmark.add(item)
  }
}

const getStorage = () =>
  crx.sync.get().then((res) => {
    const { [SyncEnum.CRX]: _, ...attrs } = res
    return attrs
  })

const setStorage = async (items: any) => {
  const last = await crx.sync.getItem(SyncEnum.CRX)
  await crx.sync.clear()
  return crx.sync.set({ ...items, [SyncEnum.CRX]: last })
}

const getDatabase = () => database.db.rows.toArray()

const setDatabase = async (value: any[]) => {
  await database.db.rows.clear()
  return Promise.all(value.map((item) => database.set(item.key, item.value)))
}

const upload = async (checkeds?: GistEnum[]) => {
  checkeds ??= all
  const tasks: { name: GistEnum; task: () => Promise<any> }[] = []

  for (const name of checkeds) {
    tasks.push({ name, task: map[name]!.get })
  }

  const res = await Promise.allSettled(
    tasks.map(({ task }) => task().catch((e) => ({ error: e.message })))
  )

  const items: { [key in GistEnum]?: any } = {}
  res.forEach((item, index) => {
    if (item.status === 'fulfilled') {
      items[tasks[index].name] = item.value
    } else {
      dialog.popup.error(`${tasks[index].name}: ${item.reason}`)
    }
  })

  return gist.set(items)
}

const down = async (checkeds?: GistEnum[]) => {
  checkeds ??= all
  const tasks: { name: GistEnum; task: (value: any) => Promise<any> }[] = []

  const files = await gist.files()

  for (const name of checkeds) {
    tasks.push({ name, task: map[name]!.set })
  }

  const res = await Promise.allSettled(
    tasks.map(({ name, task }) =>
      task(files[name + gist.extension].content).catch((e) => ({ error: e.message }))
    )
  )

  res.forEach((item, index) => {
    if (item.status === 'rejected') {
      dialog.popup.error(`${tasks[index].name}: ${item.reason}`)
    }
  })
}

const info = () => gist.get()

export default {
  upload,
  down,
  info
}
