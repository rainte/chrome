import Form, { FormProps } from '@/components/Form'
import Dialog from '@/components/Dialog'
import { Space, Input, Button } from 'antd'
import route from '@/utils/route'
import { i18n, cloud } from '@/utils/browser'

export default () => {
  const TOKEN_URL = 'https://github.com/settings/tokens/new'
  const GIST_URL = 'https://gist.github.com'

  const onFinish = (formData: any) => {
    console.log('onFinish', formData)
    return cloud.set(formData)
  }

  const uploadBookmark = () => {
    Dialog.confirm({
      onOk: () => {
        // cloud.set()
      }
    })
  }

  const downLoadBookmark = () => {
    Dialog.confirm({
      onOk: () => {}
    })
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
        dataIndex: 'token',
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
        dataIndex: 'gist',
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
        dataIndex: 'notice',
        valueType: 'switch'
      }
    ]
  }

  return <Form {...form} />
}
