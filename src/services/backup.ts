import { database } from '@rainte/js'
import gist, { GistEnum } from '@/utils/gist'
import crx from '@/utils/crx'
import { popup } from '@/utils/show'

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
  for (const item of tree ?? []) {
    await Promise.all(item.map(crx.bookmark.add))
  }
}

const getStorage = () => crx.sync.get()

const setStorage = async (items: any) => {
  await crx.sync.clear()
  return crx.sync.set(items)
}

const getDatabase = () => database.db.rows.toArray()

const setDatabase = async (value: any[]) => {
  await database.db.rows.clear()
  return Promise.all(value.map(database.db.rows.add))
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
      popup.error(`${tasks[index].name}: ${item.reason}`)
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
      task(files[name + gist.extension]).catch((e) => ({ error: e.message }))
    )
  )

  res.forEach((item, index) => {
    if (item.status === 'rejected') {
      popup.error(`${tasks[index].name}: ${item.reason}`)
    }
  })
}

const info = () => gist.get()

export default {
  upload,
  down,
  info
}
