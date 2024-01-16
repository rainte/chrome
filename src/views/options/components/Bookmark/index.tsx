import Form, { FormProps } from '@/components/Form'
import { Space, Input, Button, Typography } from 'antd'
import { cloud } from '@/utils/browser'
import { message } from '@/utils/popup'

export default () => {
  // const asas = App.useApp()

  const TOKEN_URL = 'https://github.com/settings/tokens/new'
  const GIST_URL = 'https://gist.github.com'

  const aaa = import.meta.env.VITE_SOME_KEY
  // const { message} = App.useApp();
  console.log('message', message, aaa)
  // message.success(i18n.get('messageSuccess'))

  const onFinish = (formData: any) => {
    return cloud.set(formData).then(() => {
      // asas.message.success('123')
      message.success('操作成功')
    })
  }

  const uploadBookmark = () => {
    // Dialog.confirm({
    //   onOk: () => {
    //     // cloud.set()
    //   }
    // })
  }

  const downLoadBookmark = () => {
    // Dialog.confirm({
    //   onOk: () => {}
    // })
  }

  const form: FormProps = {
    onFinish: onFinish,
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
        dataIndex: 'githubToken',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: () => (
          <Space.Compact>
            <Input />
            <Typography.Link href={TOKEN_URL} target="_blank">
              <Button>Get Github Token</Button>
            </Typography.Link>
          </Space.Compact>
        )
      },
      {
        title: 'Gist ID',
        dataIndex: 'gistId',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: () => (
          <Space.Compact>
            <Input />
            <Typography.Link href={GIST_URL} target="_blank">
              <Button>Get Gist ID</Button>
            </Typography.Link>
          </Space.Compact>
        )
      },
      {
        title: '消息通知',
        dataIndex: 'isNotice',
        valueType: 'switch'
      }
    ]
  }

  return <Form {...form} />
}
