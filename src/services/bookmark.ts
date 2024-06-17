import { gist, HubEnum } from '@/services/octokit'
import storage, { StoreEnum } from '@/utils/storage'
import notice from './notice'
import hash from '@/utils/hash'

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode
export type BookmarkProps = {
  tree: BookmarkTreeNode[]
}

export const sum = (nodes: BookmarkTreeNode[]) => {
  let count = 0
  nodes = nodes || []
  nodes.map((node) => (count += node.url ? 1 : sum(node.children || [])))
  return count
}

const local = {
  add: async function (node: BookmarkTreeNode) {
    for (const item of node.children || []) {
      const res = await chrome.bookmarks.create({
        title: item.title,
        url: item.url,
        parentId: node.id
      })
      item.children && (await this.add({ ...item, id: res.id }))
    }
  },
  get: () => {
    return chrome.bookmarks
      .getTree()
      .then((nodes) => nodes[0].children)
      .then((nodes) => nodes || [])
  },
  clear: async function () {
    const nodes = await this.get()
    for (const node of nodes) {
      for (const item of node?.children || []) {
        await chrome.bookmarks.removeTree(item.id)
      }
    }
  }
}

const cloud = {
  get: () => gist.getJson<BookmarkProps>(HubEnum.Bookmark),
  set: (data: BookmarkProps) => gist.setJson(HubEnum.Bookmark, data)
}

const warn = {
  set: () =>
    function (...args: any[]) {
      bookmark.isChange().then((ok) => {
        if (ok) {
          storage.set(StoreEnum.Bookmark, args)
          chrome.action.setBadgeText({ text: '!' })
          chrome.action.setBadgeBackgroundColor({ color: 'red' })
        }
      })
    },
  clear: () => notice.clear()
}

const bookmark = {
  local,
  cloud,
  warn,
  total: function () {
    const local = this.local.get().then(sum)
    const cloud = this.cloud
      .get()
      .then((res) => res.tree)
      .then(sum)
    return Promise.all([local, cloud])
  },
  isChange: function () {
    const local = this.local.get()
    const cloud = this.cloud.get().then((res) => res.tree)
    return Promise.all([local, cloud]).then(async ([res1, res2]) => {
      const hash1 = await hash.SHA256(res1)
      const hash2 = await hash.SHA256(res2)
      return hash1 !== hash2
    })
  },
  listener: function () {
    chrome.bookmarks.onCreated.addListener(this.warn.set)
    chrome.bookmarks.onChanged.addListener(this.warn.set)
    chrome.bookmarks.onRemoved.addListener(this.warn.set)
    chrome.bookmarks.onMoved.addListener(this.warn.set)
  }
}

export default bookmark
