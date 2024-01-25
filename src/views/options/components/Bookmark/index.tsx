import { useState, useEffect } from 'react'
import { Flex, Space, Button, Statistic, Divider } from 'antd'
import CountUp from 'react-countup'
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
    bookmark.total(false).then(setTotal)
  }, [])

  const setTotal = (res: any[]) => {
    setLocalTotal(res[0])
    setRemoteTotal(res[1])
  }

  const onUpload = () => {
    popup.ask(async () => {
      const nodes = await bookmark.tree()
      await bookmark.set(nodes)
      await bookmark.total().then(setTotal)
      popup.success()
    })
  }

  const onDownLoad = () => {
    popup.ask(async () => {
      const res = await bookmark.get()
      await bookmark.clear()
      for (const node of res.tree) {
        await bookmark.add(node)
      }
      await bookmark.total().then(setTotal)
      popup.success()
    })
  }

  const onClear = () => {
    popup.ask(async () => {
      await bookmark.clear()
      await bookmark.total().then(setTotal)
      popup.success()
    })
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
