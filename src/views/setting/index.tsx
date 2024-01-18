import { Flex, List, Button, Typography } from 'antd'
import scss from './index.module.scss'

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
        <Button type="text" onClick={() => chrome.runtime.openOptionsPage()}>
          更多设置
        </Button>
      </Flex>
    )
  }

  return (
    <List
      className={scss.page}
      header={<Header />}
      bordered
      dataSource={data}
      renderItem={(item) => (
        <List.Item>
          <Typography.Text mark>[ITEM]</Typography.Text> {item}
        </List.Item>
      )}
    />
  )
}
