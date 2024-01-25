const bookmark = chrome.bookmarks

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

const clear = async () => {
  const nodes = await tree()
  for (const node of nodes) {
    for (const item of node?.children || []) {
      await bookmark.removeTree(item.id)
    }
  }
}

const total = (nodes: any[]) => {
  let count = 0
  nodes = nodes || []
  nodes.map((node: any) => (count += node.url ? 1 : total(node.children)))
  return count
}

const tree = () =>
  bookmark
    .getTree()
    .then((nodes) => nodes[0].children)
    .then((nodes) => nodes || [])

export default { add, clear, total, tree }
