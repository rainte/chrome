import { gist, HubEnum } from '@/services/octokit'
import notice, { NoticeEnum } from '@/services/notice'

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode
export type BookmarkProps = {
  tree: BookmarkTreeNode[]
}

export const local = {
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
  get: async () => {
    if (import.meta.env.DEV) return []

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

export const cloud = {
  get: () => gist.getJson<BookmarkProps>(HubEnum.Bookmark),
  set: (data: BookmarkProps) => gist.setJson(HubEnum.Bookmark, data)
}

export const total = () => {
  const res1 = local.get().then(sum)
  const res2 = cloud
    .get()
    .then((res) => res.tree)
    .then(sum)
  return Promise.all([res1, res2])
}

export const warn = async (res: any) => {
  notice.send(NoticeEnum.Bookmark)
  return res
}

export const sum = (nodes: BookmarkTreeNode[]) => {
  let count = 0
  nodes = nodes || []
  nodes.map((node) => (count += node.url ? 1 : sum(node.children || [])))
  return count
}
