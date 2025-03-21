import { useState } from 'react'
import { Form, FormProps } from '@rainte/ant'
import { Space, Input, Button, Typography } from 'antd'
import storage, { StorageEnum } from '@/services/storage'
import gist from '@/services/gist'
import { popup } from '@/utils/show'

const linkButton = (label: string, url: string) => (
  <Typography.Link href={url} target="_blank">
    <Button>{label}</Button>
  </Typography.Link>
)

export default function App() {
  const [loading, setLoading] = useState(false)

  const addGist = () => {
    const githubToken = props.form?.getFieldValue?.('githubToken')
    githubToken || popup.error('先填写 Github Token')

    popup.ask(() => {
      setLoading(true)
      gist
        .add(githubToken)
        .then((res) => {
          props.form?.setFieldValue?.('githubToken', res.id)
          props.form?.setFieldValue?.('gistId', res.id)
        })
        .finally(() => setLoading(false))
    })
  }

  const onRequest = () => storage.get(StorageEnum.CRX).then((res) => res ?? {})

  const onFinish = (data: any) => {
    storage.set(StorageEnum.CRX, data).then(() => popup.success())
  }

  const props: FormProps = {
    form: Form.useForm(),
    request: onRequest,
    onFinish: onFinish,
    wrapperCol: { span: 10 },
    columns: [
      {
        title: 'Github Token',
        dataIndex: 'githubToken',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, { value, onChange }) => {
          return (
            <Space.Compact style={{ width: '100%' }}>
              <Input value={value} onChange={onChange} />
              {linkButton('Get Github Token', 'https://github.com/settings/tokens/new')}
            </Space.Compact>
          )
        }
      },
      {
        title: 'Gist ID',
        dataIndex: 'gistId',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, { value, onChange }) => {
          return (
            <Space.Compact style={{ width: '100%' }}>
              <Input value={value} onChange={onChange} />
              <Button onClick={addGist} loading={loading}>
                自动生成
              </Button>
              {linkButton('手动生成', 'https://gist.github.com')}
            </Space.Compact>
          )
        }
      }
    ]
  }

  return <Form {...props} />
}
