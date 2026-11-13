import { Form, antd, file } from '@rainte/ant'
import { loadTabSettings, saveTabSettings } from './actions'

export default () => {
  return (
    <Form
      labelCol={{ span: 2 }}
      request={async () => loadTabSettings()}
      onFinish={async (values) => {
        await antd.safeRun(async () => {
          const blob = values.cover?.[0]?.originFileObj
          const cover = blob ? await file.toBase64(blob) : ''
          await saveTabSettings({ ...values, cover })
        })
      }}
      columns={[
        {
          title: '图片',
          dataIndex: 'cover',
          valueType: 'upload',
          convertValue: (value) => (value ? [file.base64ToUploadFile(value)] : []),
          fieldProps: {
            listType: 'picture-card',
            accept: 'image/*',
            customRequest: ({ file, onSuccess }: any) => {
              onSuccess?.({ url: URL.createObjectURL(file) })
            }
          }
        }
      ]}
    />
  )
}
