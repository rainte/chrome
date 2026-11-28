import { browser } from '#imports'
import { applyProxy, ProxyAction, type ProxySettings } from '@/utils/proxy'
import { proxyState } from '@/utils/storage'
import { Card, Flex, Radio, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'

const { Text } = Typography

const ProxyRadio = ({ id, name }: { id: string; name: string }) => {
  return (
    <Radio key={id} value={id}>
      <Text>{name}</Text>
    </Radio>
  )
}

export default function Proxy() {
  const [settings, setSettings] = useState<ProxySettings | null>(null)
  const [loading, setLoading] = useState(false)

  const reload = async (state: ProxySettings) => {
    await setSettings(state)
    await applyProxy(state)
  }

  useEffect(() => {
    proxyState.getValue().then((state) => reload(state))
    const unsub = proxyState.watch((state) => reload(state))
    return () => {
      unsub()
    }
  }, [])

  const onChange = async (id: string) => {
    if (!settings) return
    setLoading(true)
    try {
      const state = await proxyState.getValue()
      const next = { ...state, activeId: id }
      await proxyState.setValue(next)
      await reload(next)
    } catch (e) {
      console.error('Switch failed: ' + (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex vertical gap={5}>
      <Card title="代理选择" size="small">
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
    </Flex>
  )
}
