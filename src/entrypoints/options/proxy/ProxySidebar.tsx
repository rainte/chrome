import { Button, Card, Flex, Listy, Space, Typography } from 'antd'
import { antd } from '@rainte/ant'
import { ProxyAction, type FixedProxy, type PacProxy, type ProxySettings } from '@/utils/proxy'
import { loadProxySettings, ProxyKind } from './actions'

export type Selection = { kind: ProxyKind; id: string } | null

const EmptyText = <Typography.Text type="secondary">暂无</Typography.Text>

export default function ProxySidebar({
  settings,
  selection,
  onSelect,
  onAdd,
  onChange
}: {
  settings?: ProxySettings
  selection: Selection
  onSelect: (s: Selection) => void
  onAdd: (kind: ProxyKind) => void
  onChange: (s: ProxySettings) => void
}) {
  const createAddButton = (kind: ProxyKind) => (
    <Button type="link" onClick={() => onAdd(kind)}>
      添加
    </Button>
  )

  const onRemove = (id: string) => {
    antd.modal.confirm({
      onOk: async () => {
        await antd.safeRun(async () => {
          const state = await loadProxySettings()
          if (state.pacProxies.some((p) => p.fixedProxyId === id)) {
            throw new Error('此代理被占用')
          }

          const fixedProxies = state.fixedProxies.filter((p) => p.id !== id)
          const pacProxies = state.pacProxies.filter((p) => p.id !== id)
          const activeId = state.activeId === id ? ProxyAction.Direct : state.activeId
          if (selection?.id === id) onSelect(null)
          await onChange({ fixedProxies, pacProxies, activeId })
        })
      }
    })
  }

  const createListy = (kind: ProxyKind) => (
    <Listy<FixedProxy | PacProxy>
      items={settings?.[kind == ProxyKind.Fixed ? 'fixedProxies' : 'pacProxies']}
      rowKey="id"
      styles={{ item: { padding: 3 } }}
      itemRender={(item) => (
        <Flex justify="space-between">
          <Typography.Link onClick={() => onSelect({ kind, id: item.id })}>
            {item.name}
          </Typography.Link>
          <Button type="link" danger onClick={() => onRemove(item.id)}>
            删除
          </Button>
        </Flex>
      )}
    />
  )

  return (
    <Space vertical style={{ width: 200 }}>
      <Card title="固定代理" size="small" extra={createAddButton(ProxyKind.Fixed)}>
        {settings?.fixedProxies.length === 0 ? EmptyText : createListy(ProxyKind.Fixed)}
      </Card>

      <Card title="策略代理" size="small" extra={createAddButton(ProxyKind.Pac)}>
        {settings?.pacProxies.length === 0 ? EmptyText : createListy(ProxyKind.Pac)}
      </Card>
    </Space>
  )
}
