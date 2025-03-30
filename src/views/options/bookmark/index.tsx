import { useState, useEffect } from 'react'
import { Flex, Space, Button, Statistic, Divider, Tag } from 'antd'
import { array, hash } from '@rainte/js'
import { dialog } from '@rainte/ant'
import gist, { GistEnum } from '@/utils/gist'
import crx from '@/utils/crx'
import backup from '@/services/backup'
import CountUp from 'react-countup'

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

  const refresh = async () => {
    const local = crx.bookmark.all()
    const cloud = gist.getItem(GistEnum.Bookmark)
    const res = await Promise.all([local, cloud])
    const localTree = array
      .flattenTree(res[0] ?? [])
      .filter((item: any) => item.url)
      .map(({ title, url }: any) => ({ title, url }))
    const cloudTree = array
      .flattenTree(res[1] ?? [])
      .filter((item: any) => item.url)
      .map(({ title, url }: any) => ({ title, url }))

    setLocalTotal(localTree.length)
    setCloudTotal(cloudTree.length)

    const hash1 = await hash.SHA256(localTree)
    const hash2 = await hash.SHA256(cloudTree)
    setIsChange(hash1 != hash2)
  }

  const onOk = (method: () => Promise<any>) => {
    return dialog.popup.ask(() =>
      method().then(() => {
        crx.action.clear()
        refresh()
        dialog.popup.success()
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
        <Button onClick={() => onOk(() => backup.upload([GistEnum.Bookmark]))}>上传书签</Button>
        <Button onClick={() => onOk(() => backup.down([GistEnum.Bookmark]))}>下载书签</Button>
        <Button onClick={() => onOk(() => crx.bookmark.clear())}>清空书签</Button>
      </Space.Compact>
    </Flex>
  )
}
