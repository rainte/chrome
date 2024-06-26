import Form, { FormProps, FormItemLink } from '@/components/Form'
import { Space, Input, Button, Typography } from 'antd'
import storage, { StoreEnum } from '@/utils/storage'
import { gist } from '@/services/octokit'
import { popup } from '@/utils/show'

const links = {
  githubToken: {
    name: 'Get Github Token',
    url: 'https://github.com/settings/tokens/new'
  }
}

export default function App() {
  const addGist = () => {
    popup.ask(async () => {
      const res = await gist.add()
      props.form?.setFieldValue('gistId', res.id)
    })
  }

  const props: FormProps = {
    form: Form.useForm(),
    request: () => storage.get(StoreEnum.CRX).then((res) => res || {}),
    onFinish: (data) => storage.set(StoreEnum.CRX, data).then(() => popup.success()),
    wrapperCol: { span: 10 },
    columns: [
      {
        title: 'Github Token',
        dataIndex: 'githubToken',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, props) => {
          delete (props as any).defaultRender
          return <FormItemLink {...links.githubToken} {...props} />
        }
      },
      {
        title: 'Gist ID',
        dataIndex: 'gistId',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, props) => {
          delete (props as any).defaultRender
          return (
            <Space.Compact style={{ width: '100%' }}>
              <Input {...props} />
              <Button onClick={addGist}>自动生成</Button>
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
