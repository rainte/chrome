import { useState, useEffect } from 'react'
import { Flex, Space, Button, Statistic, Divider } from 'antd'
import CountUp from 'react-countup'
import * as bookmark from '@/services/bookmark'
import { popup } from '@/utils/show'

const formatter = (value: number | string) => {
  typeof value === 'string' && (value = parseInt(value))
  return <CountUp end={value} />
}

export default () => {
  const [localTotal, setLocalTotal] = useState(0)
  const [cloudTotal, setCloudTotal] = useState(0)

  useEffect(() => {
    bookmark.total().then(setTotal)
  }, [])

  const setTotal = (res: any[]) => {
    setLocalTotal(res[0])
    setCloudTotal(res[1])
  }

  const onUpload = () => {
    popup.ask(async () => {
      const nodes = await bookmark.local.get()
      await bookmark.cloud.set({ tree: nodes })
      await bookmark.total().then(bookmark.warn).then(setTotal)
      popup.success()
    })
  }

  const onDownLoad = () => {
    popup.ask(async () => {
      const res = await bookmark.cloud.get()
      await bookmark.local.clear()
      for (const node of res.tree) {
        await bookmark.local.add(node)
      }
      await bookmark.total().then(bookmark.warn).then(setTotal)
      popup.success()
    })
  }

  const onClear = () => {
    popup.ask(async () => {
      await bookmark.local.clear()
      await bookmark.total().then(bookmark.warn).then(setTotal)
      popup.success()
    })
  }

  return (
    <Flex vertical gap="large">
      <Space size={30}>
        <Divider dashed={true} />
        <Statistic title="云端" value={cloudTotal} formatter={formatter} />
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
