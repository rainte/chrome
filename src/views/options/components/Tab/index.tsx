import { Flex, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

export default () => (
  <Upload.Dragger>
    <Flex vertical align="center" justify="center" style={{ height: '35vw' }}>
      <UploadOutlined style={{ fontSize: '3rem' }} />
      <h3>点击上传</h3>
    </Flex>
  </Upload.Dragger>
)
