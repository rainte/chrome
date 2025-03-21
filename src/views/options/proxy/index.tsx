import { useState, useEffect } from 'react'
import { Button, Flex, List, Space, Typography } from 'antd'
import proxy, { ModeEnum } from '@/services/proxy'
import { hash } from '@rainte/js'
import { popup } from '@/utils/show'
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

  const refresh = () =>
    proxy.getAllModes().then((res) => {
      setFixeds(res.fixed)
      setPacs(res.pac)
    })

  const onSave = (data: any) =>
    proxy.set(data).then(() => {
      refresh()
      popup.success()
    })

  const onGet = (id: string) => {
    return proxy
      .get()
      .then((res) => res.rules ?? [])
      .then((rules) => rules.find((item) => id && item.id == id) ?? {})
  }

  const onFinish = (values: any) => {
    proxy.get().then(async (res) => {
      if (values.id) {
        res?.rules?.forEach((item, index, array) => item.id == values.id && (array[index] = values))
      } else {
        values.id = hash.id()
        res.rules ? res.rules.push(values) : (res.rules = [values])
      }

      await onSave(res)
      setUse(values)
    })
  }

  const onDel = (id: string) => {
    popup.ask(() => {
      proxy.get().then((res) => {
        res.rules = res?.rules?.filter((item) => item.id != id) ?? []
        onSave(res)
        use?.id == id && setUse(undefined)
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
