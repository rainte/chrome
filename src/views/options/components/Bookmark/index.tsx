import Form, { FormProps } from '@/components/Form'
import { Space, Input, Button } from 'antd'
import { i18n, cloud } from '@/utils/browser'
import { message } from '@/utils/popup'
import route from '@/utils/route'

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
      message.success(i18n.get('messageSuccess'))
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
            <Button onClick={uploadBookmark}>{i18n.get('bookmarkUpload')}</Button>
            <Button onClick={downLoadBookmark}>{i18n.get('bookmarkDownLoad')}</Button>
          </Space.Compact>
        )
      },
      {
        title: i18n.get('bookmarkGithubToken'),
        dataIndex: 'githubToken',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: () => (
          <Space.Compact>
            <Input />
            <Button onClick={() => route.open(TOKEN_URL)}>
              {i18n.get('bookmarkGetGithubToken')}
            </Button>
          </Space.Compact>
        )
      },
      {
        title: i18n.get('bookmarkGistID'),
        dataIndex: 'gistId',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: () => (
          <Space.Compact>
            <Input />
            <Button onClick={() => route.open(GIST_URL)}>{i18n.get('bookmarkGetGistID')}</Button>
          </Space.Compact>
        )
      },
      {
        title: i18n.get('bookmarkNotice'),
        dataIndex: 'isNotice',
        valueType: 'switch'
      }
    ]
  }

  return <Form {...form} />
}
