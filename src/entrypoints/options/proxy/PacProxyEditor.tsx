import { Card, Empty } from 'antd'
import { Form } from '@rainte/ant'
import { ProxyKind, type ProxyEditorProps } from './actions'
import PacRuleEditor from './PacRuleEditor'

export default function PacProxyEditor({ item, settings, onSave }: ProxyEditorProps) {
  return (
    <Card>
      <Form
        request={async () => item}
        onFinish={async (values) => onSave(ProxyKind.Pac, { ...item, ...values })}
        columns={[
          {
            title: '名称',
            dataIndex: 'name',
            valueType: 'text',
            formItemProps: { rules: [{ required: true }] }
          },
          {
            title: '代理',
            dataIndex: 'fixedProxyId',
            valueType: 'select',
            valueEnum: Object.fromEntries(
              settings?.fixedProxies.map((f) => [
                f.id,
                { text: `${f.name} (${f.scheme}://${f.host}:${f.port})` }
              ]) ?? []
            ),
            formItemProps: { rules: [{ required: true }] },
            fieldProps: { notFoundContent: <Empty description="请先添加固定代理" /> }
          },
          {
            title: 'GFWList',
            tooltip: 'GFWList为Base64编码的AdBlock规则',
            dataIndex: 'gfwUrl',
            valueType: 'text'
          },
          {
            title: '分流规则',
            dataIndex: 'rules',
            formItemRender: () => <PacRuleEditor />
          }
        ]}
      />
    </Card>
  )
}
