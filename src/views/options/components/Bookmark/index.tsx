import Form, { FormProps } from '@/components/Form'
import Dialog from '@/components/Dialog'
import Route from '@/components/Route'
import { Space, Input, Button } from 'antd'

export default () => {
  const TOKEN_URL = 'https://github.com/settings/tokens/new'
  const GIST_URL = 'https://gist.github.com'

  const uploadBookmark = () => {
    Dialog.confirm({
      onOk: () => {}
    })
  }

  const downLoadBookmark = () => {
    Dialog.confirm({
      onOk: () => {}
    })
  }

  const form: FormProps = {
    columns: [
      {
        renderFormItem: () => (
          <Space.Compact>
            <Button onClick={uploadBookmark}>上传书签</Button>
            <Button onClick={downLoadBookmark}>下载书签</Button>
          </Space.Compact>
        )
      },
      {
        title: 'Github Token',
        dataIndex: 'token',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: () => (
          <Space.Compact>
            <Input />
            <Button onClick={() => Route.open(TOKEN_URL)}>Get Token</Button>
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
            <Button onClick={() => Route.open(GIST_URL)}>Get Gist ID</Button>
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
