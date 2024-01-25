import Form, { FormProps } from '@/components/Form'
import Upload from '@/components/Upload'
import { onUpload } from '@/utils/mate'
import './index.scss'

export default () => {
  const setNewTabBgImg = (files: any[]) => {
    props.form?.setFieldValue('newTabBgImg', files)
  }

  const props: FormProps<any, any> = {
    columns: [
      {
        title: '背景图',
        dataIndex: 'newTabBgImg',
        renderFormItem: (_, { defaultRender, ...props }) => {
          return (
            <Upload
              fileList={props.value}
              customRequest={onUpload}
              onChange={({ fileList }) => setNewTabBgImg(fileList)}
            />
          )
        }
      }
    ]
  }

  return <Form {...props} />
}
