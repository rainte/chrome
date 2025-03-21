import { Form, FormProps } from '@rainte/ant'
import fast from '@/utils/fast'
import './index.scss'

const StatusMap = new Map([
  [1, { text: '正常', status: 'Success' }],
  [2, { text: '冻结', status: 'Error' }]
])
console.log('StatusMap', StatusMap)

export default function App() {
  const props: FormProps = {
    onFinish: (formData) => console.log('onFinish', formData),
    columns: [
      {
        title: '图片',
        dataIndex: 'image',
        valueType: 'upload',
        fieldProps: { customRequest: fast.onUpload }
      }
    ]
  }

  return <Form {...props} />
}
