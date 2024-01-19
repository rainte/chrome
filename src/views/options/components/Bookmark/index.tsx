import Form, { FormProps, useForm } from '@/components/Form'
import { Space, Input, Button, Typography } from 'antd'
import { popup } from '@/utils/show'
import bookmark from '@/services/bookmark'

export default () => {
  const uploadBookmark = () => {
    popup.confirm({
      onOk: () => {
        bookmark.upload().then(() => popup.success())
      }
    })
  }

  const downLoadBookmark = () => {
    popup.confirm({
      onOk: () => {
        // bookmark.getGist().then((res) => {
        //   console.log('res', res)
        //   popup.success()
        // })
      }
    })
  }

  return (
    <Space.Compact>
      <Button onClick={uploadBookmark}>上传书签</Button>
      <Button onClick={downLoadBookmark}>下载书签</Button>
    </Space.Compact>
  )
}
