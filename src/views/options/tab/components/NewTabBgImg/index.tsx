import { Form, FormProps, misc, dialog } from '@rainte/ant'
import { database, blob } from '@rainte/js'
import { DbEnum } from '@/utils/crx'

export const NEWTAB_BGIMG_KEY = 'NewTabBgImg'

export type NewTabBgImgProps = {
  status?: boolean
  files?: { base64: string; url?: string }[]
}

export default function App() {
  const onRequest = () => {
    return database
      .get(DbEnum.Tab)
      .then((res) => res[NEWTAB_BGIMG_KEY])
      .then((res: NewTabBgImgProps) => {
        const files = res?.files?.map((file) => {
          file.url = URL.createObjectURL(blob.toBlob(file.base64))
          return file
        })
        return { ...res, files }
      })
  }

  const onFinish = async (data: any) => {
    const files = await Promise.all(
      data.files.map(async (file: any) => {
        return { base64: file.base64 ? file.base64 : await blob.toBase64(file.originFileObj) }
      })
    )
    return database
      .set(DbEnum.Tab, { [NEWTAB_BGIMG_KEY]: { status: data.status, files } })
      .then(() => dialog.popup.success())
  }

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
        valueType: 'dependency',
        name: ['status'],
        columns: ({ status }) => [
          {
            title: '背景图',
            dataIndex: 'files',
            valueType: 'upload',
            formItemProps: {
              wrapperCol: { span: 24 },
              rules: [{ required: status }]
            },
            fieldProps: {
              listType: 'picture-card',
              customRequest: misc.onUpload
            }
          }
        ]
      }
    ]
  }

  return <Form {...props} />
}
