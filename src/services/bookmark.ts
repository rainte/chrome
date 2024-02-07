import { gist, HubEnum } from '@/services/octokit'
import notice from './notice'
import { cloud } from './storage'

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

export default {
  addLocalBookmark: async function (node: BookmarkTreeNode) {
    for (const item of node.children || []) {
      const res = await chrome.bookmarks.create({
        title: item.title,
        url: item.url,
        parentId: node.id
      })
      item.children && (await this.addLocalBookmark({ ...item, id: res.id }))
    }
  },
  getLocalBookmark: async () => {
    if (import.meta.env.DEV) return []

    return chrome.bookmarks
      .getTree()
      .then((nodes) => nodes[0].children)
      .then((nodes) => nodes || [])
  },
  clearLocalBookmark: async function () {
    const nodes = await this.getLocalBookmark()
    for (const node of nodes) {
      for (const item of node?.children || []) {
        await chrome.bookmarks.removeTree(item.id)
      }
    }
  },
  getCloudBookmark: () => gist.getJson<BookmarkProps>(HubEnum.Bookmark),
  setCloudBookmark: (data: BookmarkProps) => gist.setJson(HubEnum.Bookmark, data),
  total: function () {
    const res1 = this.getLocalBookmark().then(sum)
    const res2 = this.getCloudBookmark()
      .then((res) => res.tree)
      .then(sum)
    return Promise.all([res1, res2])
  },
  warnNotice: async (...args: any[]) => {
    cloud.set({ warnNotice: args })
    chrome.action.setBadgeText({ text: '!' })
    chrome.action.setBadgeBackgroundColor({ color: 'red' })
  },
  clearNotice: () => notice.clear(),
  listener: function () {
    chrome.bookmarks.onCreated.addListener(this.warnNotice)
    chrome.bookmarks.onChanged.addListener(this.warnNotice)
    chrome.bookmarks.onRemoved.addListener(this.warnNotice)
    chrome.bookmarks.onMoved.addListener(this.warnNotice)
  }
}
