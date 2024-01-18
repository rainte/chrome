import Form, { FormProps, FormItemLink } from '@/components/Form'
import rainte, { RainteProps } from '@/services/rainte'
import { popup } from '@/utils/popup'

const links = {
  githubToken: {
    name: 'Get Github Token',
    url: 'https://github.com/settings/tokens/new'
  }
}

export default () => {
  const request = () => rainte.get()
  const onFinish = (data: RainteProps) => {
    return rainte.set(data).then(() => popup.success())
  }

  const props: FormProps = {
    request,
    onFinish,
    columns: [
      {
        title: 'Github Token',
        dataIndex: 'githubToken',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, { defaultRender, ...props }) => {
          return <FormItemLink {...links.githubToken} {...props} />
        }
      }
    ]
  }

  return <Form {...props} />
}
