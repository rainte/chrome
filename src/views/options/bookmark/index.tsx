import { useState, useEffect } from 'react'
import { Flex, Space, Button, Statistic, Divider, Tag } from 'antd'
import bookmark from '@/services/bookmark'
import CountUp from 'react-countup'
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
    refresh()
  }, [])

  const refresh = () => {
    const local = bookmark.local.get()
    const cloud = bookmark.cloud.get()
    local?.then((tree) => setLocalTotal(bookmark.total(tree ?? [])))
    cloud?.then((tree) => setCloudTotal(bookmark.total(tree ?? [])))
    bookmark.isChange(local, cloud).then(setIsChange)
  }

  const onClick = (method: () => Promise<any>) => {
    return popup.ask(() =>
      method().then(() => {
        refresh()
        popup.success()
      })
    )
  }

  return (
    <Flex vertical gap="large">
      <Space size={30}>
        <Divider dashed={true} />
        <Statistic
          title={<>本地 {isChange && <Tag color="error">已变</Tag>}</>}
          value={localTotal}
          formatter={formatter}
        />
        <Divider dashed={true} />
        <Statistic title={<>云端 </>} value={cloudTotal} formatter={formatter} />
        <Divider dashed={true} />
      </Space>
      <Space.Compact>
        <Button onClick={() => onClick(bookmark.onUpload)}>上传书签</Button>
        <Button onClick={() => onClick(bookmark.onDownLoad)}>下载书签</Button>
        <Button onClick={() => onClick(bookmark.local.clear)}>清空书签</Button>
      </Space.Compact>
    </Flex>
  )
}
