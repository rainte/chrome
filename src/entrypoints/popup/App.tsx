import { browser } from '#imports'
import { popupActiveKeyState } from '@/utils/storage'
import { Button, Flex, Segmented, Space, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { AiOutlineSetting } from 'react-icons/ai'
import M3u8 from './m3u8'
import Proxy from './proxy'

const tabItems = [
  {
    key: 'proxy',
    label: '代理',
    content: <Proxy />
  },
  {
    key: 'm3u8',
    label: 'M3U8',
    content: <M3u8 />
  }
]

const OpenOptions = () => (
  <Button
    type="text"
    icon={<AiOutlineSetting />}
    onClick={() => browser.runtime.openOptionsPage()}
  />
)

export default function App() {
  const [loading, setLoading] = useState(false)
  const [activeKey, setActiveKey] = useState('proxy')
  const tab = tabItems.find((i) => i.key === activeKey)

  useEffect(() => {
    const ref = { cancelled: false }
    loadActiveKey(ref)
    return () => {
      ref.cancelled = true
    }
  }, [])

  async function loadActiveKey(ref: { cancelled: boolean }) {
    setLoading(true)
    const v = await popupActiveKeyState.getValue()
    if (ref.cancelled) return
    setActiveKey(v)
    setLoading(false)
  }

  if (loading) {
    return <Spin fullscreen delay={500} />
  }

  return (
    <Space vertical style={{ width: '20rem', padding: '1rem' }}>
      <Flex gap={5}>
        <Segmented
          block
          value={activeKey}
          onChange={(v) => {
            setActiveKey(v)
            popupActiveKeyState.setValue(v)
          }}
          options={tabItems.map((i) => ({ label: i.label, value: i.key }))}
          style={{ flex: 1, marginBottom: '.3rem' }}
        />
        <OpenOptions />
      </Flex>
      <>{tab?.content}</>
    </Space>
  )
}
