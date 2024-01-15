import { Flex, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { i18n } from '@/utils/browser'

export default () => (
  <Upload.Dragger>
    <Flex vertical align="center" justify="center" style={{ height: '35vw' }}>
      <UploadOutlined style={{ fontSize: '3rem' }} />
      <h3>{i18n.get('uploadClickText')}</h3>
    </Flex>
  </Upload.Dragger>
)
