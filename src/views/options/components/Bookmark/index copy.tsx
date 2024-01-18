import Form, { FormProps } from '@/components/Form'
import { Space, Input, Button, Typography } from 'antd'
import { popup } from '@/utils/popup'
import bookmark, { BookmarkProps } from '@/services/bookmark'
import { FormItemLink } from '@/components/Form/components'

const aaa = [{ name: 'Get Gist ID', url: 'https://gist.github.com' }]

const request = () => bookmark.config.get()

const onFinish = (data: BookmarkProps) => {
  return bookmark.config.set(data).then(() => popup.success())
}

const uploadBookmark = () => {
  popup.confirm({
    onOk: () => {
      bookmark.gist.upload().then(() => popup.success())
    }
  })
}

const downLoadBookmark = () => {
  popup.confirm({
    onOk: () => {
      bookmark.gist.down().then(() => popup.success())
    }
  })
}

const props: FormProps = {
  request,
  onFinish,
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
      renderFormItem: (_, props) => (
        <FormItemLink name="Get Github Token" url={'TOKEN_URL'} attrs={props} />
      )
    },
    {
      title: 'Gist ID',
      dataIndex: 'gistId',
      formItemProps: { rules: [{ required: true }] },
      renderFormItem: (_, props) => (
        <FormItemLink name="Get Gist ID" url={'GIST_URL'} attrs={props} />
      )
    },
    {
      title: '消息通知',
      dataIndex: 'isNotice',
      valueType: 'switch'
    }
  ]
}

export default () => <Form {...props} />
