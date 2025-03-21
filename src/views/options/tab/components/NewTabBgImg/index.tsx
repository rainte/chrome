import { Form, FormProps } from '@rainte/ant'
import { db } from '@rainte/js'
import fast from '@/utils/fast'
import { StorageEnum } from '@/services/storage'
import { popup } from '@/utils/show'

export const NEWTAB_BGIMG_KEY = 'NewTabBgImg'

export type NewTabBgImgProps = {
  status?: boolean
  files?: (File & { url: string })[]
}

export default function App() {
  const onRequest = () => {
    return db
      .get(StorageEnum.Tab)
      .then((res) => res[NEWTAB_BGIMG_KEY])
      .then((res: NewTabBgImgProps) => {
        const files = res?.files?.map((file) => {
          file.url = URL.createObjectURL(file)
          return file
        })
        return { ...res, files }
      })
  }

  const onFinish = async (data: any) => {
    return db
      .set(StorageEnum.Tab, {
        [NEWTAB_BGIMG_KEY]: {
          status: data.status,
          files: data.files.map((file: any) => file.originFileObj)
        }
      })
      .then(() => popup.success())
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
              customRequest: fast.onUpload
            }
          }
        ]
      }
    ]
  }

  return <Form {...props} />
}
