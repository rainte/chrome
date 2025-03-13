import { gist, HubEnum } from '@/services/octokit'
import storage, { StoreEnum } from '@/utils/storage'
import notice from './notice'
import { hash } from '@rainte/js'

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

const localAdd = async (node: BookmarkTreeNode) => {
  for (const item of node.children || []) {
    const res = await chrome.bookmarks.create({
      title: item.title,
      url: item.url,
      parentId: node.id
    })
    item.children && (await localAdd({ ...item, id: res.id }))
  }
}

const localGet = async () => {
  return chrome.bookmarks
    ? chrome.bookmarks
        .getTree()
        .then((nodes) => nodes[0].children)
        .then((nodes) => nodes || [])
    : []
}

const localClear = async () => {
  const nodes = await localGet()
  for (const node of nodes) {
    for (const item of node?.children || []) {
      await chrome.bookmarks.removeTree(item.id)
    }
  }
}

const cloudGet = () => gist.getJson<BookmarkProps>(HubEnum.Bookmark)

const cloudSet = (data: BookmarkProps) => gist.setJson(HubEnum.Bookmark, data)

const warnSet = () =>
  function (...args: any[]) {
    isChange().then((ok) => {
      if (ok) {
        storage.set(StoreEnum.Bookmark, args)
        chrome.action.setBadgeText({ text: '!' })
        chrome.action.setBadgeBackgroundColor({ color: 'red' })
      }
    })
  }

const warnClear = () => notice.clear()

const total = () => {
  const local = localGet().then(sum)
  const cloud = cloudGet()
    .then((res) => res.tree)
    .then(sum)
  return Promise.all([local, cloud])
}

const isChange = function () {
  const local = localGet()
  const cloud = cloudGet().then((res) => res.tree)
  return Promise.all([local, cloud]).then(async ([res1, res2]) => {
    const hash1 = await hash.SHA256(res1)
    const hash2 = await hash.SHA256(res2)
    return hash1 !== hash2
  })
}

const listener = () => {
  chrome.bookmarks.onCreated.addListener(warnSet)
  chrome.bookmarks.onChanged.addListener(warnSet)
  chrome.bookmarks.onRemoved.addListener(warnSet)
  chrome.bookmarks.onMoved.addListener(warnSet)
}

export default {
  local: {
    add: localAdd,
    get: localGet,
    clear: localClear
  },
  cloud: {
    get: cloudGet,
    set: cloudSet
  },
  warn: {
    set: warnSet,
    clear: warnClear
  },
  total,
  isChange,
  listener
}
