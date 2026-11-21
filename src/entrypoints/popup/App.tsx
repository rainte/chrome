import { browser } from '#imports'
import { applyProxy, ProxyAction, type ProxySettings } from '@/utils/proxy'
import { proxyState } from '@/utils/storage'
import { Button, Card, Radio, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { AiOutlineGlobal, AiOutlineSetting } from 'react-icons/ai'

const { Text } = Typography

const OpenOptions = () => (
  <Button
    type="text"
    icon={<AiOutlineSetting />}
    onClick={() => browser.runtime.openOptionsPage()}
  />
)

const ProxyRadio = ({ id, name }: { id: string; name: string }) => {
  return (
    <Radio key={id} value={id}>
      <Text>{name}</Text>
    </Radio>
  )
}

export default function App() {
  const [settings, setSettings] = useState<ProxySettings | null>(null)
  const [loading, setLoading] = useState(false)

  const reload = async (state: ProxySettings) => {
    await setSettings(state)
    await applyProxy(state)
  }

  proxyState.watch((state) => reload(state))

  useEffect(() => {
    proxyState.getValue().then((state) => reload(state))
  }, [])

  const onChange = async (id: string) => {
    if (!settings) return
    setLoading(true)
    try {
      const state = await proxyState.getValue()
      const next = { ...state, activeId: id }
      await proxyState.setValue(next)
      reload(next)
    } catch (e) {
      console.error('Switch failed: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      size="small"
      style={{ width: 150 }}
      title={
        <Space>
          <AiOutlineGlobal style={{ display: 'block' }} />
          <Text strong>代理选择</Text>
        </Space>
      }
      extra={<OpenOptions />}
    >
      {!settings ? (
        <Text>{browser.i18n.getMessage('loading')}</Text>
      ) : (
        <Radio.Group
          value={settings.activeId}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
        >
          <Space vertical>
            <ProxyRadio id={ProxyAction.Direct} name="直连" />
            {[...settings.fixedProxies, ...settings.pacProxies].map((p) => (
              <ProxyRadio id={p.id} name={p.name} />
            ))}
          </Space>
        </Radio.Group>
      )}
    </Card>
  )
}
