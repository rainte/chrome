class Bookmark {
  async add(node: chrome.bookmarks.BookmarkTreeNode) {
    const head = await chrome.bookmarks.create({
      title: node.title,
      url: node.url,
      parentId: node.parentId
    })

    for (const item of node.children ?? []) {
      await this.add({ ...item, parentId: head.id })
    }
  }
  all() {
    return chrome.bookmarks.getTree().then((tree) => tree[0].children ?? [])
  }
  clear() {
    return this.all().then(async (tree) => {
      for (const node of tree ?? []) {
        for (const item of node.children ?? []) {
          await chrome.bookmarks.removeTree(item.id)
        }
      }
    })
  }
}

export default new Bookmark()
