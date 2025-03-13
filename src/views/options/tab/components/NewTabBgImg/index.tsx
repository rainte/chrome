import Form, { FormProps } from '@/components/Form'
import { gist, HubEnum } from '@/services/octokit'
import { popup } from '@/utils/show'

export const NEWTAB_BGIMG_KEY = 'NewTabBgImg'

export type NewTabBgImgProps = {
  status?: boolean
  url?: string
  blob?: Blob
}

export default function App() {
  const onRequest = () => gist.getJson(HubEnum.Tab).then((res) => res[NEWTAB_BGIMG_KEY])

  const onFinish = (data: any) =>
    gist.setJson(HubEnum.Tab, { [NEWTAB_BGIMG_KEY]: data }).then(() => popup.success())

  const props: FormProps = {
    form: Form.useForm(),
    request: onRequest,
    onFinish: onFinish,
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
