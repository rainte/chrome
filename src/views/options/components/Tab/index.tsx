import { Flex, Upload, Typography } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

export default () => (
  <Upload.Dragger>
    <Flex vertical align="center" justify="center" style={{ height: '35vw' }}>
      <UploadOutlined style={{ fontSize: '3rem' }} />
      <Typography.Title level={5}>点击上传</Typography.Title>
    </Flex>
  </Upload.Dragger>
)
