import Form, { FormProps, useForm } from '@/components/Form'
import { gist, HubEnum } from '@/services/octokit'
import { popup } from '@/utils/show'
import { TabEnum } from '../..'

export type NewTabBgImgProps = {
  status?: boolean
  url?: string
  blob?: Blob
}

export default function App() {
  const props: FormProps = {
    form: useForm(),
    request: () => gist.getJson(HubEnum.Tab).then((res) => res[TabEnum.NewTabBgImg]),
    onFinish: (data) =>
      gist.setJson(HubEnum.Tab, { [TabEnum.NewTabBgImg]: data }).then(() => popup.success()),
    wrapperCol: { span: 12 },
    columns: [
      {
        title: '开启',
        dataIndex: 'status',
        valueType: 'switch'
      },
      {
        title: '背景图 URL',
        dataIndex: 'url'
      }
    ]
  }

  return <Form {...props} />
}
