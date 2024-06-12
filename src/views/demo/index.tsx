import Form, { useForm, FormProps } from '@/components/Form'
import Upload from '@/components/Upload'
import fast from '@/utils/fast'
import './index.scss'

const StatusMap = new Map([
  [1, { text: '正常', status: 'Success' }],
  [2, { text: '冻结', status: 'Error' }]
])
console.log('StatusMap', StatusMap)

export default function App() {
  const setNewTabBgImg = (files: any[]) => {
    props.form?.setFieldValue('newTabBgImg', files)
  }

  const props: FormProps = {
    form: useForm(),
    columns: [
      {
        title: '背景图',
        dataIndex: 'newTabBgImg',
        renderFormItem: (_, { defaultRender, ...props }) => {
          return (
            <Upload
              fileList={props.value}
              customRequest={fast.file.onUpload}
              onChange={({ fileList }) => setNewTabBgImg(fileList)}
            />
          )
        }
      }
    ]
  }

  return <Form {...props} />
}
