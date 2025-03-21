import { Flex, Menu, Typography } from 'antd'
import { AiOutlineReload, AiOutlineRight } from 'react-icons/ai'
import { menus } from '@/router'
import fast from '@/utils/fast'

const data = menus.map((item) => {
  return { key: item.url, label: item.label, extra: <AiOutlineRight /> }
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
          <Typography.Text>重启</Typography.Text>
        </Flex>
        <Flex
          align="center"
          gap="small"
          style={{ cursor: 'pointer' }}
          onClick={() => fast.toCrxTab('/options')}
        >
          <Typography.Text>更多</Typography.Text>
          <AiOutlineRight />
        </Flex>
      </Flex>

      <Menu mode="inline" items={data} onClick={(info) => fast.toCrxTab(`/options/${info.key}`)} />
    </Flex>
  )
}
