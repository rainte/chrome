import Form, { FormProps } from '@/components/Form'
import { Space, Input, Button } from 'antd'

export default () => {
  const open = (url: string) => {
    // chrome.storage.
    window.open(url, '_blank')
  }

  const form: FormProps = {
    columns: [
      {
        title: '代理模式',
        dataIndex: 'mode',
        valueType: 'select',
        formItemProps: { rules: [{ required: true }] },
        valueEnum: {
          direct: { text: 'direct', status: 'direct' },
          auto_detect: { text: 'auto_detect', status: 'auto_detect' },
          pac_script: { text: 'pac_script', status: 'pac_script' },
          fixed_servers: { text: 'fixed_servers', status: 'fixed_servers' },
          system: { text: 'system', status: 'system' }
        }
      },
      {
        title: 'Gist ID',
        dataIndex: 'gist',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: () => (
          <Space.Compact>
            <Input />
            <Button onClick={() => open('https://gist.github.com')}>Get Gist ID</Button>
          </Space.Compact>
        )
      },
      {
        title: '消息通知',
        dataIndex: 'notice',
        valueType: 'switch'
      }
    ]
  }

  return <Form {...form} />
}
