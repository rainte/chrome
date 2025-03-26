import gist from '@/services/gist'
import { StorageEnum } from '@/services/storage'
import notice from '@/services/notice'

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode

export const add = async (node: BookmarkTreeNode) => {
  for (const item of node.children ?? []) {
    const res = await chrome.bookmarks.create({
      title: item.title,
      url: item.url,
      parentId: node.id
    })
    item.children && (await add({ ...item, id: res.id }))
  }
}

export const get = async () => chrome.bookmarks?.getTree()?.then((tree) => tree[0].children ?? [])

export const clear = async () =>
  get().then(async (tree) => {
    for (const node of tree ?? []) {
      for (const item of node.children ?? []) {
        await chrome.bookmarks.removeTree(item.id)
      }
    }
  })

export const cloudGet = () => gist.get(StorageEnum.Bookmark).then((res) => res ?? [])

export const cloudSet = () => get().then((tree) => gist.set({ [StorageEnum.Bookmark]: tree }))

export const onUpload = () => cloudSet().then(() => notice.clear())

export const onDownLoad = () =>
  clear()
    .then(() => cloudGet())
    .then(async (tree) => await Promise.all(tree.map(add)))
    .then(() => notice.clear())

export default {
  local: {
    add,
    get,
    clear
  },
  cloud: {
    get: cloudGet,
    set: cloudSet
  },
  onUpload,
  onDownLoad
}
