import Form, { FormProps, useForm } from '@/components/Form'
import { Space, Input, Button, Typography } from 'antd'
import { popup } from '@/utils/popup'
import bookmark, { DOMAIN } from '@/services/bookmark'
import { FormItemLink } from '@/components/Form/components'
import { storage } from '@/utils/browser'

export default () => {
  const request = () => bookmark.config.get()
  const onFinish = (data: any) => {
    return bookmark.config.set(data).then(() => popup.success())
  }

  const autoAddGist = () => {
    popup.confirm({
      onOk: () => {
        bookmark.gist.add().then((res) => {
          props.form?.setFieldValue('gistId', res.id)
          popup.success()
        })
      }
    })
  }

  const uploadBookmark = () => {
    popup.confirm({
      onOk: () => {
        // bookmark.gist.upload().then(() => popup.success())
      }
    })
  }

  const downLoadBookmark = () => {
    popup.confirm({
      onOk: () => {
        bookmark.gist.down().then((res) => {
          console.log('res',res)
          popup.success()
        })
      }
    })
  }

  const props: FormProps = {
    form: useForm(),
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
        title: 'Gist ID',
        dataIndex: 'gistId',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, { defaultRender, ...props }) => {
          return (
            <Space.Compact>
              <Input {...props} />
              <Button onClick={autoAddGist}>自动生成</Button>
              <Typography.Link href="https://gist.github.com" target="_blank">
                <Button>手动生成</Button>
              </Typography.Link>
            </Space.Compact>
          )
        }
      }
    ]
  }

  return <Form {...props} />
}
