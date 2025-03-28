class Bookmark {
  async add(_: chrome.bookmarks.BookmarkTreeNode) {}
  async all() {
    return [] as chrome.bookmarks.BookmarkTreeNode[]
  }
  async clear() {
    return this.all().then(async (tree) => {
      for (const node of tree ?? []) {
        for (const _ of node.children ?? []) {
        }
      }
    })
  }
}

export default new Bookmark()
