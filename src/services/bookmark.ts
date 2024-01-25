import { gist, HubEnum } from '@/utils/octokit'
import notice, { NoticeEnum } from '@/utils/notice'

const bookmark = chrome.bookmarks

const total = (isNotice = true) => {
  const local = tree().then(sum)
  const cloud = gist
    .getJson(HubEnum.Bookmark)
    .then((res) => res.tree)
    .then(sum)
  return Promise.all([local, cloud]).then((res) => {
    isNotice && notice.send(NoticeEnum.Bookmark)
    return res
  })
}

const add = async (node: any) => {
  for (const item of node.children) {
    const res = await bookmark.create({
      title: item.title,
      url: item.url,
      parentId: node.id
    })
    item.children && (await add({ ...item, id: res.id }))
  }
}

const get = () => gist.getJson(HubEnum.Bookmark)

const set = (nodes: any) => gist.setJson(HubEnum.Bookmark, { tree: nodes })

const clear = async () => {
  const nodes = await tree()
  for (const node of nodes) {
    for (const item of node?.children || []) {
      await bookmark.removeTree(item.id)
    }
  }
}

const sum = (nodes: any[]) => {
  let count = 0
  nodes = nodes || []
  nodes.map((node: any) => (count += node.url ? 1 : sum(node.children)))
  return count
}

const tree = async () => {
  if (import.meta.env.DEV) {
    return []
  } else {
    return bookmark
      .getTree()
      .then((nodes) => nodes[0].children)
      .then((nodes) => nodes || [])
  }
}

export default { add, get, set, clear, sum, tree, total }
