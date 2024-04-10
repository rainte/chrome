import { Flex, List, Typography } from 'antd'
import { Text } from '@rainte/react'
import { AiOutlineReload, AiOutlineRight } from 'react-icons/ai'
import route from '@/utils/route'

const data = [
  { label: 'Json', url: '/options?tab=json' },
  { label: '书签', url: '/options?tab=bookmark' }
]

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
          onClick={() => route.toCrxTab('/options')}
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
          <Typography.Link onClick={() => route.toCrxTab(item.url)}>
            <List.Item extra={<AiOutlineRight />}>
              <Typography.Text>{item.label}</Typography.Text>
            </List.Item>
          </Typography.Link>
        )}
      />
    </Flex>
  )
}
