import { Flex, List, Typography } from 'antd'
import { Text } from '@rainte/react'
import { AiOutlineReload, AiOutlineRight } from 'react-icons/ai'
import fast from '@/utils/fast'
import { items, KEY_TAB } from '@/views/options'

const data = items.map((item) => {
  return { ...item, url: `/options?${KEY_TAB}=${item.id}` }
})

export default function App() {
  return (
    <Flex vertical gap="small">
      <Flex justify="space-between" style={{ padding: '0 1rem' }}>
        <Flex
          align="center"
          gap="small"
          style={{ cursor: 'pointer' }}
          onClick={() => chrome.runtime.reload()}
        >
          <AiOutlineReload />
          <Text>重启</Text>
        </Flex>
        <Flex
          align="center"
          gap="small"
          style={{ cursor: 'pointer' }}
          onClick={() => fast.url.toCrxTab('/options')}
        >
          <Text>更多</Text>
          <AiOutlineRight />
        </Flex>
      </Flex>

      <List
        split
        bordered
        dataSource={data}
        renderItem={(item) => (
          <Typography.Link onClick={() => fast.url.toCrxTab(item.url)}>
            <List.Item extra={<AiOutlineRight />}>
              <Typography.Text>{item.label}</Typography.Text>
            </List.Item>
          </Typography.Link>
        )}
      />
    </Flex>
  )
}
