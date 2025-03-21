import gist from '@/services/gist'
import { StorageEnum } from '@/services/storage'
import { hash } from '@rainte/js'
import notice from '@/services/notice'

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode
export type BookmarkProps = {
  tree: BookmarkTreeNode[]
}

export const total = (tree: BookmarkTreeNode[]) => {
  let count = 0
  tree.map((node) => (count += node.url ? 1 : total(node.children ?? [])))
  return count
}

export const add = async (node: BookmarkTreeNode) => {
  for (const item of node.children ?? []) {
    const res = await chrome.bookmarks.create({
      title: item.title,
      url: item.url,
      parentId: node.id
    })
    item.children && add({ ...item, id: res.id })
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

export const cloudGet = () =>
  gist.get<BookmarkProps>(StorageEnum.Bookmark).then((res) => res.tree ?? [])

export const cloudSet = () =>
  get().then((tree) => gist.set({ [StorageEnum.Bookmark]: { tree: tree ?? [] } }))

export const isChange = (local: any, cloud: any) => {
  return Promise.all([local, cloud]).then(async ([res1, res2]) => {
    const flattenTree = (tree: any[]) => {
      return tree.reduce((acc, node) => {
        const { children, title, url } = node
        acc.push({ title, url })

        if (children && children.length > 0) {
          acc.push(...flattenTree(children))
        }

        return acc
      }, [])
    }

    const hash1 = await hash.SHA256(flattenTree(res1 ?? []))
    const hash2 = await hash.SHA256(flattenTree(res2 ?? []))
    return hash1 !== hash2
  })
}

export const onUpload = () => cloudSet().then(() => notice.clear())

export const onDownLoad = () =>
  clear()
    .then(() => cloudGet())
    .then((tree) => tree.forEach(add))
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
  total,
  isChange,
  onUpload,
  onDownLoad
}
