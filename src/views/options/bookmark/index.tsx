import { useState, useEffect } from 'react'
import { Flex, Space, Button, Statistic, Divider, Tag } from 'antd'
import bookmark from '@/services/bookmark'
import CountUp from 'react-countup'
import { popup } from '@/utils/show'
import { fast, hash } from '@rainte/js'

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
    Promise.all([bookmark.local.get(), bookmark.cloud.get()]).then(async ([local, cloud]) => {
      const localTree = fast
        .flattenTree(local ?? [])
        .filter((item: any) => item.url)
        .map(({ title, url }: any) => ({ title, url }))
      const cloudTree = fast
        .flattenTree(cloud ?? [])
        .filter((item: any) => item.url)
        .map(({ title, url }: any) => ({ title, url }))

      setLocalTotal(localTree.length)
      setCloudTotal(cloudTree.length)

      const hash1 = await hash.SHA256(localTree)
      const hash2 = await hash.SHA256(cloudTree)
      setIsChange(hash1 != hash2)
    })
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
