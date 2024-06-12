import { useState, useEffect } from 'react'
import { Flex, Space, Button, Statistic, Divider, Tag } from 'antd'
import CountUp from 'react-countup'
import bookmark from '@/services/bookmark'
import { popup } from '@/utils/show'

const formatter = (value: number | string) => {
  typeof value === 'string' && (value = parseInt(value))
  return <CountUp end={value} />
}

export default function App() {
  const [localTotal, setLocalTotal] = useState(0)
  const [cloudTotal, setCloudTotal] = useState(0)
  const [isChange, setIsChange] = useState(false)

  useEffect(() => {
    bookmark.total().then(setTotal)
    bookmark.isChange().then(setIsChange)
  }, [])

  const setTotal = (res: any[]) => {
    setLocalTotal(res[0])
    setCloudTotal(res[1])
  }

  const onUpload = () => {
    popup.ask(async () => {
      const nodes = await bookmark.getLocalBookmark()
      await bookmark.setCloudBookmark({ tree: nodes })
      await bookmark.total().then(setTotal)
      await bookmark.clearNotice()
      popup.success()
    })
  }

  const onDownLoad = () => {
    popup.ask(async () => {
      const res = await bookmark.getCloudBookmark()
      await bookmark.clearLocalBookmark()
      for (const node of res.tree) {
        await bookmark.addLocalBookmark(node)
      }
      await bookmark.total().then(setTotal)
      await bookmark.clearNotice()
      popup.success()
    })
  }

  const onClear = () => {
    popup.ask(async () => {
      await bookmark.clearLocalBookmark()
      await bookmark.total().then(setTotal)
      await bookmark.clearNotice()
      popup.success()
    })
  }

  return (
    <Flex vertical gap="large">
      <Space size={30}>
        <Divider dashed={true} />
        <Statistic
          title={
            <>
              本地&nbsp;
              {isChange && <Tag color="error">已变</Tag>}
            </>
          }
          value={localTotal}
          formatter={formatter}
        />
        <Divider dashed={true} />
        <Statistic title={<>云端&nbsp;</>} value={cloudTotal} formatter={formatter} />
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
