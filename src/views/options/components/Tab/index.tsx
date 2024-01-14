import { Flex, message, Upload } from 'antd'
import type { UploadProps } from 'antd'
import { CloudUploadOutlined } from '@ant-design/icons'

const { Dragger } = Upload

const props: UploadProps = {
  name: 'file',
  action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
  onChange(info) {
    const { status } = info.file
    if (status !== 'uploading') {
      console.log(info.file, info.fileList)
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`)
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files)
  }
}

export default () => (
  <Dragger>
    <Flex vertical align="center" justify="center" style={{ height: '35vw' }}>
      <CloudUploadOutlined style={{ fontSize: '3rem' }} />
      <h3>点击上传</h3>
    </Flex>
  </Dragger>
)
