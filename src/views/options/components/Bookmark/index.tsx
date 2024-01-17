import { useEffect, useState } from 'react'
import Form, { FormProps, formItemHandler } from '@/components/Form'
import { Space, Input, Button, Typography, Form as aaa } from 'antd'
import { storage, AppEnum } from '@/utils/browser'
import { popup } from '@/utils/popup'
import bookmark from '@/services/bookmark'

const TOKEN_URL = 'https://github.com/settings/tokens/new'
const GIST_URL = 'https://gist.github.com'

type BookmarkProps = {
  githubToken?: string
  gistId?: string
  isNotice?: boolean
}

export default () => {
  useEffect(() => {
    storage.cloud.get(AppEnum.Bookmark).then((res) => {
      Form.defaultProps?.form?.setFieldsValue(res)
    })
  }, [])

  // const request = () => storage.cloud.get(AppEnum.Bookmark)
  const onFinish = (data: any) => storage.cloud.set(AppEnum.Bookmark, data, true)

  const uploadBookmark = () => {
    popup.confirm({
      onOk: async () => {
        const tree = await chrome.bookmarks.getTree()
        console.log('tree', tree)
      }
    })
  }

  const downLoadBookmark = () => {
    popup.confirm({
      onOk: () => {
        // bookmark.getGistBookmark()
        // cloud.set()
      }
    })
  }

  const form: FormProps = {
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
        renderFormItem: (_, props) => {
          const attrs = formItemHandler(props)

          return (
            <Space.Compact>
              <Input {...attrs} />
              <Typography.Link href={TOKEN_URL} target="_blank">
                <Button>Get Github Token</Button>
              </Typography.Link>
            </Space.Compact>
          )
        }
      },
      {
        title: 'Gist ID',
        dataIndex: 'gistId',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, props) => {
          const attrs = formItemHandler(props)

          return (
            <Space.Compact>
              <Input {...attrs} />
              <Typography.Link href={GIST_URL} target="_blank">
                <Button>Get Gist ID</Button>
              </Typography.Link>
            </Space.Compact>
          )
        }
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
