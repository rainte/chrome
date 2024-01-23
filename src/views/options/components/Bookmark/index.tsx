import { useEffect, useState } from 'react'
import { Flex, Space, Button, Statistic, Divider } from 'antd'
import CountUp from 'react-countup'
import { gist, HubEnum } from '@/utils/octokit'
import notice, { NoticeEnum } from '@/utils/notice'
import { popup } from '@/utils/show'
import bookmark from '@/services/bookmark'

const formatter = (value: number | string) => {
  typeof value === 'string' && (value = parseInt(value))
  return <CountUp end={value} />
}

export default () => {
  const [localTotal, setLocalTotal] = useState(0)
  const [remoteTotal, setRemoteTotal] = useState(0)

  useEffect(() => {
    refreshTotal()
  }, [])

  const onUpload = () => {
    popup.ask(async () => {
      const nodes = await bookmark.tree()
      await gist.setJson(HubEnum.Bookmark, { tree: nodes })
      await refreshTotal()
      popup.success()
    })
  }

  const onDownLoad = () => {
    popup.ask(async () => {
      const res = await gist.getJson(HubEnum.Bookmark)
      await bookmark.clear()
      for (const node of res.tree) {
        await bookmark.add(node)
      }
      await refreshTotal()
      popup.success()
    })
  }

  const onClear = () => {
    popup.ask(async () => {
      await bookmark.clear()
      await refreshTotal()
      popup.success()
    })
  }

  const refreshTotal = () => {
    const local = bookmark.tree().then(bookmark.total).then(setLocalTotal)
    const remote = gist
      .getJson(HubEnum.Bookmark)
      .then((res) => setRemoteTotal(bookmark.total(res.tree)))
    notice.send(NoticeEnum.Bookmark)
    return Promise.all([local, remote])
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
