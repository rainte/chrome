import { Flex, List, Button, Typography } from 'antd'
import { ReloadOutlined, RightOutlined } from '@ant-design/icons'
import route from '@/utils/route'

const data = [
  { label: 'Json', url: '/options?tab=json' },
  { label: '书签', url: '/options?tab=bookmark' }
]

export default () => {
  const Header = () => {
    return (
      <Flex justify="space-between">
        <Button type="text" onClick={() => chrome.runtime.reload()}>
          <ReloadOutlined />
          重启插件
        </Button>
        <Button type="text" onClick={() => route.toCrxTab('/options')}>
          更多设置
          <RightOutlined />
        </Button>
      </Flex>
    )
  }

  return (
    <Flex vertical gap="small">
      <Header />
      <List
        bordered
        dataSource={data}
        renderItem={(item) => (
          <Typography.Link onClick={() => route.toCrxTab(item.url)}>
            <List.Item extra={<RightOutlined />}>
              <Typography.Text>{item.label}</Typography.Text>
            </List.Item>
          </Typography.Link>
        )}
      />
    </Flex>
  )
}
