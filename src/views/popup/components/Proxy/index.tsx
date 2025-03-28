import { useState, useEffect } from 'react'
import { Flex, Radio, Dropdown, Button, Input } from 'antd'
import crx from '@/utils/crx'
import proxy, { ModeEnum } from '@/services/proxy'
import { AiOutlineDown, AiOutlineSetting } from 'react-icons/ai'

enum LoadingEnum {
  Load = 'load',
  Save = 'save'
}

export default function App() {
  const [domain, setDomain] = useState('')
  const [fixeds, setFixeds] = useState<any[]>([])
  const [pacs, setPacs] = useState<any[]>([])
  const [isPac, setIsPac] = useState(false)
  const [selected, setSelected] = useState<string>(ModeEnum.Direct)

  const [loading, setLoading] = useState<{ [key in LoadingEnum]: boolean }>({
    [LoadingEnum.Load]: false,
    [LoadingEnum.Save]: false
  })

  const setLoadingStates = (type: LoadingEnum, isLoading: boolean) => {
    setLoading((prev) => ({ ...prev, [type]: isLoading }))
  }

  useEffect(() => {
    crx.tab.todo((tabs) => setDomain(new URL(tabs[0].url ?? '').hostname))
  }, [])

  useEffect(() => {
    proxy.groupRules().then((res) => {
      setFixeds(res.fixed)
      setPacs(res.pac)
    })
  }, [])

  useEffect(() => {
    proxy.get().then((res) => {
      setSelected(res.use ?? ModeEnum.Direct)
    })
  }, [])

  useEffect(() => {
    setIsPac(!!pacs.find((itme) => itme.id == selected))
  }, [selected])

  const onChange = async (id: string) => {
    setSelected(id)
    await proxy.setUse(id)
    const config = await proxy.makeConfig(id)
    await crx.proxy.set(config)
    crx.tab.todo((tabs) => crx.tab.reload(tabs))
  }

  const onAdd = (value: string) => {
    setLoadingStates(LoadingEnum.Save, true)
    proxy
      .addRule(selected, domain, value)
      .then(() => onChange(selected))
      .finally(() => setLoadingStates(LoadingEnum.Save, false))
  }

  const renderDomain = () => {
    return <Input addonBefore={'域名'} value={domain} onChange={(e) => setDomain(e.target.value)} />
  }

  const renderDropdown = () => (
    <Flex justify="space-between">
      <Dropdown
        trigger={['click']}
        menu={{
          items: [proxy.direct, ...fixeds].map((item: any) => ({ key: item.id, label: item.name })),
          onClick: (e) => onAdd(e.key)
        }}
      >
        <Button loading={loading.save}>
          <Flex gap="small" align="center" justify="center">
            添加规则
            <AiOutlineDown />
          </Flex>
        </Button>
      </Dropdown>
      <Button onClick={() => crx.tab.add(`/options/proxy`)}>
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
