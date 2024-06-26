import Form, { FormProps } from '@/components/Form'
import { gist, HubEnum } from '@/services/octokit'
import { popup } from '@/utils/show'
import { Tab } from '../../..'

export type NewTabBgImgProps = {
  status?: boolean
  url?: string
  blob?: Blob
}

export default function App() {
  const props: FormProps = {
    form: Form.useForm(),
    request: () => gist.getJson(HubEnum.Tab).then((res) => res[Tab.TabEnum.NewTabBgImg]),
    onFinish: (data) =>
      gist.setJson(HubEnum.Tab, { [Tab.TabEnum.NewTabBgImg]: data }).then(() => popup.success()),
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
