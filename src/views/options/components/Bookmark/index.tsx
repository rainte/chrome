import { useEffect, useState } from 'react'
import { Flex, Space, Button, Statistic, Divider } from 'antd'
import CountUp from 'react-countup'
import { gist, HubEnum } from '@/utils/octokit'
import { popup } from '@/utils/show'

const formatter = (value: number | string) => {
  typeof value === 'string' && (value = parseInt(value))
  return <CountUp end={value} />
}

export default () => {
  const bookmark = chrome.bookmarks
  const [localTotal, setLocalTotal] = useState(0)
  const [remoteTotal, setRemoteTotal] = useState(0)

  useEffect(() => {
    refreshTotal()
  }, [])

  const onUpload = () => {
    popup.ask(async () => {
      const nodes = await tree()
      await gist.setJson(HubEnum.Bookmark, { tree: nodes }, true)
      refreshTotal()
    })
  }

  const onDownLoad = () => {
    popup.ask(async () => {
      const all: any[] = []
      const res = await gist.getJson(HubEnum.Bookmark)
      await clear()
      res.tree.forEach((node: any) => add(node.children, node.id, all))
      await Promise.all(all)
      await refreshTotal()
      popup.success()
    })
  }

  const onClear = () => {
    popup.ask(() => clear().then(refreshTotal).then(popup.success()))
  }

  const tree = () => bookmark.getTree().then((nodes) => nodes[0].children || [])

  const refreshTotal = () => {
    const local = tree().then(total).then(setLocalTotal)
    const remote = gist.getJson(HubEnum.Bookmark).then((res) => setRemoteTotal(total(res.tree)))
    return Promise.all([local, remote])
  }

  const add = (nodes: any[], parentId: string, all: Promise<any>[]) => {
    nodes.forEach((node) => {
      const item = bookmark
        .create({ title: node.title, url: node.url, parentId })
        .then((res) => node.children && add(node.children, res.id, all))
      all.push(item)
    })
  }

  const clear = async () => {
    const all: Promise<void>[] = []
    tree().then((nodes) =>
      nodes.forEach((node) => {
        node?.children?.forEach((item) => {
          all.push(bookmark.removeTree(item.id))
        })
      })
    )
    return Promise.all(all)
  }

  const total = (nodes: any[]) => {
    let count = 0
    nodes = nodes || []
    nodes.forEach((node: any) => (count += node.url ? 1 : total(node.children)))
    return count
  }

  return (
    <Flex vertical gap="large">
      <Space size={30}>
        <Divider dashed={true} />
        <Statistic title="云端" value={remoteTotal} formatter={formatter} />
        <Divider dashed={true} />
        <Statistic title="本地" value={localTotal} formatter={formatter} />
        <Divider dashed={true} />
      </Space>
      <Space.Compact>
        <Button onClick={onUpload}>上传书签</Button>
        <Button onClick={onDownLoad}>下载书签</Button>
        <Button onClick={onClear}>清空书签</Button>
      </Space.Compact>
    </Flex>
  )
}
