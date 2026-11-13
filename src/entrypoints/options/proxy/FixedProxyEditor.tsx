import { Card } from 'antd'
import { Form } from '@rainte/ant'
import { ProxyKind, type ProxyEditorProps } from './actions'

export default function FixedProxyEditor({ item, onSave }: ProxyEditorProps) {
  return (
    <Card>
      <Form
        request={async () => item}
        onFinish={async (values) => onSave(ProxyKind.Fixed, { ...item, ...values })}
        columns={[
          {
            title: '名称',
            dataIndex: 'name',
            formItemProps: { rules: [{ required: true }] }
          },
          {
            title: '协议',
            dataIndex: 'scheme',
            valueType: 'select',
            valueEnum: {
              http: { text: 'HTTP' },
              socks5: { text: 'SOCKS5' }
            },
            formItemProps: { rules: [{ required: true }] }
          },
          {
            title: '主机',
            dataIndex: 'host',
            formItemProps: { rules: [{ required: true }] }
          },
          {
            title: '端口',
            dataIndex: 'port',
            valueType: 'digit',
            formItemProps: { rules: [{ required: true }] }
          }
        ]}
      />
    </Card>
  )
}
