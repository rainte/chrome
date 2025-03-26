import { useState, useEffect } from 'react'
import { Flex, Radio, Dropdown, Button, Input } from 'antd'
import proxy, { ModeEnum } from '@/services/proxy'
import storage, { StorageEnum } from '@/services/storage'
import fast from '@/utils/fast'
import { AiOutlineDown, AiOutlineSetting } from 'react-icons/ai'

export default function App() {
  const [domain, setDomain] = useState('')
  const [fixeds, setFixeds] = useState<any[]>([])
  const [pacs, setPacs] = useState<any[]>([])
  const [selected, setSelected] = useState<string>(proxy.direct.id)
  const [loading, setLoading] = useState(false)
  const [isPac, setIsPac] = useState(false)

  useEffect(() => {
    fast.tabDo((tabs: any[]) => setDomain(new URL(tabs[0].url).hostname))
  }, [])

  useEffect(() => {
    proxy.getAllModes().then((res) => {
      setFixeds(res.fixed)
      setPacs(res.pac)
    })
  }, [])

  useEffect(() => {
    storage.get(StorageEnum.Proxy).then((res) => {
      setSelected(res?.use ?? proxy.direct.id)
    })
  }, [])

  useEffect(() => {
    setIsPac(!!pacs.find((itme) => itme.id == selected))
  }, [selected])

  const onChange = async (id: string) => {
    setSelected(id)
    storage.get(StorageEnum.Proxy).then((res) => {
      storage.set(StorageEnum.Proxy, { ...res, use: id })
    })

    const rule = [proxy.direct, proxy.system, ...fixeds, ...pacs].find((item) => item.id == id)
    if (rule.mode == ModeEnum.PacScript) {
      const config = await proxy.getProxyConfig(rule.default)
      await proxy.setProxy(config, async () => {
        const config = await proxy.getProxyConfig(id)
        proxy.setProxy(config)
      })
    } else {
      const config = await proxy.getProxyConfig(id)
      await proxy.setProxy(config)
    }

    fast.tabDo((tabs: any[]) => chrome.tabs.reload(tabs[0].id))
  }

  const onAdd = (value: string) => {
    setLoading(true)
    proxy.get().then((res) => {
      res.rules ??= []
      res.rules.forEach((item) => {
        if (item.id == selected) {
          const rule = { status: true, mode: 'domain', value: domain, proxy: value }
          item.rules.push(rule)
        }
      })
      proxy.set(res).finally(() => setLoading(false))
      onChange(selected)
    })
  }

  const renderDomain = () => {
    return (
      <Input
        addonBefore={'域名'}
        defaultValue={domain}
        onChange={(e) => setDomain(e.target.value)}
      />
    )
  }

  const renderDropdown = () => (
    <Flex justify="space-between">
      <Dropdown
        trigger={['click']}
        menu={{
          items: [proxy.direct, ...fixeds].map((item) => {
            return { key: item.id, label: item.name }
          }),
          onClick: (e) => onAdd(e.key)
        }}
      >
        <Button loading={loading}>
          <Flex gap="small" align="center" justify="center">
            添加规则
            <AiOutlineDown />
          </Flex>
        </Button>
      </Dropdown>
      <Button onClick={() => fast.toCrxTab(`/options/proxy`)}>
        <Flex gap="small" align="center" justify="center">
          选项配置
          <AiOutlineSetting />
        </Flex>
      </Button>
    </Flex>
  )

  return (
    <>
      <Radio.Group
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        options={[proxy.direct, proxy.system, ...fixeds, ...pacs].map((item) => {
          return { value: item.id, label: item.name }
        })}
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 1rem',
          gap: 8
        }}
      />

      {isPac && renderDomain()}
      {isPac && renderDropdown()}
    </>
  )
}
