import Form, { FormProps, FormItemLink, useForm } from '@/components/Form'
import { Space, Input, Button, Typography } from 'antd'
import { store, StoreEnum } from '@/services/storage'
import { gist } from '@/services/octokit'
import { popup } from '@/utils/show'

const links = {
  githubToken: {
    name: 'Get Github Token',
    url: 'https://github.com/settings/tokens/new'
  }
}

export default () => {
  const addGist = () => {
    popup.ask(async () => {
      const res = await gist.add()
      props.form?.setFieldValue('gistId', res.id)
    })
  }

  const props: FormProps = {
    form: useForm(),
    request: () => store.get(StoreEnum.CRX),
    onFinish: (data) => store.set(StoreEnum.CRX, data).then(() => popup.success()),
    wrapperCol: { span: 10 },
    columns: [
      {
        title: 'Github Token',
        dataIndex: 'githubToken',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, { defaultRender, ...props }) => {
          return <FormItemLink {...links.githubToken} {...props} />
        }
      },
      {
        title: 'Gist ID',
        dataIndex: 'gistId',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, { defaultRender, ...props }) => {
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
