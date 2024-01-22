import { Space, Button } from 'antd'
import { gist, HubEnum } from '@/utils/octokit'
import { popup } from '@/utils/show'

export default () => {
  const bookmark = chrome.bookmarks

  const tree = async () => {
    const nodes = await bookmark.getTree()
    return nodes[0].children || []
  }

  const onUpload = () => {
    popup.confirm({
      onOk: async () => {
        const nodes = await tree()
        gist.setJson(HubEnum.Bookmark, { tree: nodes }, true)
      }
    })
  }

  const onDownLoad = () => {
    popup.confirm({
      onOk: async () => {
        const res = await gist.getJson(HubEnum.Bookmark)
        await clearBookmark()
        const all: Promise<void[]>[] = []
        res.tree.forEach((node: any) => {
          all.push(addBookmark(node.children, node.id))
        })
        Promise.all(all).then(() => popup.success())
      }
    })
  }

  const onClear = () => {
    popup.confirm({
      onOk: () => clearBookmark().then(() => popup.success())
    })
  }

  const clearBookmark = async () => {
    const nodes = await tree()
    const all: Promise<void>[] = []
    nodes.forEach((node) => {
      node?.children?.forEach((item) => {
        all.push(bookmark.removeTree(item.id))
      })
    })
    return Promise.all(all)
  }

  const addBookmark = async (nodes: any[], parentId: string) => {
    const all: Promise<void>[] = []
    nodes.forEach((node) => {
      const item = bookmark
        .create({
          title: node.title,
          url: node.url,
          parentId
        })
        .then((res) => {
          node.children && addBookmark(node.children, res.id)
        })
      all.push(item)
    })
    return Promise.all(all)
  }

  return (
    <Space.Compact>
      <Button onClick={onUpload}>上传书签</Button>
      <Button onClick={onDownLoad}>下载书签</Button>
      <Button onClick={onClear}>清空书签</Button>
    </Space.Compact>
  )
}
