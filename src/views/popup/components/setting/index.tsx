import { Flex, List, Button, Typography, Switch } from 'antd'
import { ReloadOutlined, RightOutlined } from '@ant-design/icons'
import route from '@/utils/route'

const data = [{ label: '代理', type: 'proxy' }]

export default () => {
  const onChange = (checked: boolean, item: any) => {
    console.log('onChange', checked, item)
  }

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
    <List
      header={<Header />}
      dataSource={data}
      bordered
      renderItem={(item) => (
        <List.Item actions={[<Switch onChange={(checked) => onChange(checked, item)} />]}>
          <Typography.Text>{item.label}</Typography.Text>
        </List.Item>
      )}
    />
  )
}
