import { Flex, List, Button, Typography } from 'antd'
import route from '@/utils/route'

const data = [
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
  'Man charged over missing wedding girl.',
  'Los Angeles battles huge wildfires.'
]

export default () => {
  const Header = () => {
    return (
      <Flex justify="space-between">
        <Button type="text" onClick={() => chrome.runtime.reload()}>
          重启插件
        </Button>
        <Button type="text" onClick={() => route.toCrxTab('/options')}>
          更多设置
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
        <List.Item>
          <Typography.Text mark>[ITEM]</Typography.Text> {item}
        </List.Item>
      )}
    />
  )
}
