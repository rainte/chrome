import Form, { useForm, FormProps } from '@/components/Form'
import { gist, HubEnum } from '@/services/octokit'
import { popup } from '@/utils/show'

export default () => {
  const form: FormProps = {
    form: useForm(),
    request: () => gist.getJson(HubEnum.PROXY),
    onFinish: (data) => gist.setJson(HubEnum.PROXY, data).then(() => popup.success()),
    wrapperCol: { span: 12 },
    columns: [
      {
        title: '开启',
        dataIndex: 'status',
        valueType: 'switch'
      },
      {
        title: '代理配置',
        dataIndex: 'proxy',
        valueType: 'textarea',
        fieldProps: { autoSize: { minRows: 25 } }
      }
    ]
  }

  return <Form {...form} />
}
