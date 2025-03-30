import { useState, useEffect } from 'react'
import { Button, Flex, List, Space, Typography } from 'antd'
import { hash } from '@rainte/js'
import { dialog } from '@rainte/ant'
import crx from '@/utils/crx'
import proxy, { ModeEnum } from '@/services/proxy'
import Fixed from './components/Fixed'
import Pac from './components/Pac'

export type ProxyProps = {
  id?: string
  name?: string
  mode?: ModeEnum
  onGet?: FunctionProps
  onFinish?: FunctionProps
}

export default function App() {
  const [use, setUse] = useState<ProxyProps>()
  const [fixeds, setFixeds] = useState<ProxyProps[]>([])
  const [pacs, setPacs] = useState<ProxyProps[]>([])

  useEffect(() => {
    refresh()
  }, [])

  const refresh = () => {
    return proxy.groupRules().then((res: any) => {
      setFixeds(res.fixed)
      setPacs(res.pac)
    })
  }

  const onSave = (data: any) => {
    return proxy.set(data).then(() => {
      refresh()
      dialog.popup.success()
    })
  }

  const onGet = (id: string) => {
    return proxy.allRules().then((rules: any[]) => rules.find((item) => item.id == id) ?? {})
  }

  const onFinish = (values: any) => {
    values.pac?.value && (values.pac.value = undefined)

    proxy.get().then(async (res) => {
      res.rules ??= []

      if (values.id) {
        res.rules.forEach((item, index) => {
          item.id == values.id && (res.rules![index] = values)
        })
      } else {
        values.id = hash.id()
        res.rules.push(values)
      }

      await onSave(res)
      setUse(values)
      res.use == values.id && crx.proxy.set(await proxy.makeConfig(values.id))
    })
  }

  const onDel = (id: string) => {
    dialog.popup.ask(() => {
      proxy.get().then(async (res) => {
        res.rules = res?.rules?.filter((item) => item.id != id) ?? []
        res.rules.forEach((item) => {
          item.default == id && dialog.popup.error(`${item.name} 使用中`)
          item.pac?.proxy == id && dialog.popup.error(`${item.name} 使用中`)
          item.rules?.forEach((rule: any) => {
            rule?.proxy == id && dialog.popup.error(`${item.name} 使用中`)
          })
        })
        res.use == id && (res.use = ModeEnum.Direct)
        console.log('res', res)
        onSave(res)
        use?.id == id && setUse(undefined)
        crx.proxy.set(await proxy.makeConfig(res.use ?? ModeEnum.Direct))
      })
    })
  }

  const renderHeader = (label: string, mode: ModeEnum) => (
    <Flex justify="space-between" style={{ width: '10rem' }}>
      <Typography.Title level={5}>{label}</Typography.Title>
      <Button onClick={() => setUse({ mode })}>添加</Button>
    </Flex>
  )

  const renderItem = (item: ProxyProps) => (
    <List.Item>
      <Flex justify="space-between" align="center" style={{ width: '10rem' }}>
        <Typography.Link onClick={() => setUse(item)}>{item.name}</Typography.Link>
        <Button type="link" size="small" onClick={() => onDel(item.id!)}>
          删除
        </Button>
      </Flex>
    </List.Item>
  )

  const renderRight = () => {
    if (use?.mode == ModeEnum.FixedServers) {
      return <Fixed key={use?.id} {...use} onGet={onGet} onFinish={onFinish} />
    } else if (use?.mode == ModeEnum.PacScript) {
      return <Pac key={use?.id} {...use} onGet={onGet} onFinish={onFinish} />
    }
  }

  return (
    <Flex gap="large" justify="space-between" style={{ height: '100%' }}>
      <Space direction="vertical" align="center">
        <List
          bordered
          header={renderHeader('代理节点', ModeEnum.FixedServers)}
          dataSource={fixeds}
          renderItem={renderItem}
        />

        <List
          header={renderHeader('策略模式', ModeEnum.PacScript)}
          bordered
          dataSource={pacs}
          renderItem={renderItem}
        />
      </Space>

      {renderRight()}
    </Flex>
  )
}
