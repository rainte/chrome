import Form, { FormProps } from '@/components/Form'
import { Space, Input, Button } from 'antd'

export default () => {
  const open = (url: string) => {
    window.open(url, '_blank')
  }

  const form: FormProps = {
    columns: [
      {
        title: 'Github Token',
        dataIndex: 'token',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: () => (
          <Space.Compact>
            <Input />
            <Button onClick={() => open('https://github.com/settings/tokens/new')}>
              Get Token
            </Button>
          </Space.Compact>
        )
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
