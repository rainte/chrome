import { useState, useEffect } from 'react'
import { Flex, Radio, Dropdown, Button, Input } from 'antd'
import proxy, { getProxyConfig, ModeEnum, setProxy } from '@/services/proxy'
import storage, { StorageEnum } from '@/services/storage'
import fast from '@/utils/fast'
import { AiOutlineDown, AiOutlineSetting } from 'react-icons/ai'

export default function App() {
  const [domain, setDomain] = useState(location.hostname)
  const [proxys, setProxys] = useState<any[]>([])
  const [selected, setSelected] = useState<string>(proxy.direct.id)
  const [loading, setLoading] = useState(false)
  const [isPac, setIsPac] = useState(false)

  useEffect(() => {
    proxy
      .getAllModes()
      .then((res) => [...res.fixed, ...res.pac])
      .then(setProxys)
  }, [])

  useEffect(() => {
    storage.get(StorageEnum.Proxy).then((res) => {
      setSelected(res?.use ?? proxy.direct.id)
    })
  }, [])

  useEffect(() => {
    const proxy = proxys.find((itme) => itme.id == selected)
    setIsPac(proxy?.mode == ModeEnum.PacScript)
  }, [selected])

  const onChange = async (id: string) => {
    setSelected(id)
    storage.get(StorageEnum.Proxy).then((res) => {
      storage.set(StorageEnum.Proxy, { ...res, use: id })
    })
    setProxy(await getProxyConfig(id))
  }

  const onAdd = (value: string) => {
    setLoading(true)
    proxy.get().then((res) => {
      res?.rules?.forEach((item) => {
        if (item.id == selected) {
          const rule = { status: true, mode: 'domain', data: domain, proxy: value }
          item.rules ? item.rules.push(rule) : (item.rules = [rule])
        }
      })
      proxy.set(res).finally(() => setLoading(false))
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
          items: [proxy.direct, ...proxys].map((item) => {
            console.log('item', item)
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
        options={[proxy.direct, proxy.system, ...proxys].map((item) => {
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
