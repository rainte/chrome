import { Flex, List, Typography } from 'antd'
import scss from './index.module.scss'

const data = [
  'Racing car sprays burning fuel into crowd.',
  'Japanese princess to wed commoner.',
  'Australian walks 100km after outback crash.',
  'Man charged over missing wedding girl.',
  'Los Angeles battles huge wildfires.'
]
// chrome.runtime.openOptionsPage()

export default () => {
  const Header = () => {
    return (
      <Flex>
        <Typography.Link strong style={{ flexGrow: 1 }}>
          重启插件
        </Typography.Link>
        <Typography.Link onClick={() => chrome.runtime.openOptionsPage} strong>
          更多设置
        </Typography.Link>
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
