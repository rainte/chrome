import { Flex, List, Button, Typography, Switch } from 'antd'
import { ReloadOutlined, RightOutlined } from '@ant-design/icons'
import route from '@/utils/route'

const data = [
  { label: '演示', type: 'demo' },
  { label: '演示', type: 'demo' }
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

  const actions = (item: any) => {
    return [
      <Switch
        onChange={(checked) => {
          console.log('onChange', checked, item)
        }}
      />
    ]
  }

  return (
    <Flex vertical gap="small">
      <Header />
      <List
        bordered
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={actions(item)}>
            <Typography.Text>{item.label}</Typography.Text>
          </List.Item>
        )}
      />
    </Flex>
  )
}
