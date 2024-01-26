import Form, { FormProps, useForm } from '@/components/Form'
import { gist, HubEnum } from '@/services/octokit'
import { popup } from '@/utils/show'

export type NewTabBgImgProps = {
  status?: boolean
  newTabBgImg?: string
}

export default () => {
  const props: FormProps = {
    form: useForm(),
    request: () => gist.getJson(HubEnum.Tab),
    onFinish: (data) => gist.setJson(HubEnum.Tab, data).then(() => popup.success()),
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
