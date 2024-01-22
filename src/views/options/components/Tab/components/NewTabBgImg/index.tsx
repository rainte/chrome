import Form, { FormProps, useForm } from '@/components/Form'
import { gist, HubEnum } from '@/utils/octokit'

export default () => {
  const props: FormProps = {
    form: useForm(),
    request: () => gist.getJson(HubEnum.Tab),
    onFinish: (data) => gist.setJson(HubEnum.Tab, data, true),
    columns: [
      {
        title: '开启',
        dataIndex: 'status',
        valueType: 'switch'
      },
      {
        title: '背景图地址',
        dataIndex: 'newTabBgImg'
      }
    ]
  }

  return <Form {...props} />
}
