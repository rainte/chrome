import { Flex, Menu, Typography } from 'antd'
import crx from '@/utils/crx'
import { menus } from '@/router'
import { AiOutlineReload, AiOutlineRight } from 'react-icons/ai'

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
          onClick={() => crx.system.reload()}
        >
          <AiOutlineReload />
          <Typography.Text>重启</Typography.Text>
        </Flex>
        <Flex
          align="center"
          gap="small"
          style={{ cursor: 'pointer' }}
          onClick={() => crx.tab.add('/options')}
        >
          <Typography.Text>更多</Typography.Text>
          <AiOutlineRight />
        </Flex>
      </Flex>

      <Menu mode="inline" items={data} onClick={(info) => crx.tab.add(`/options/${info.key}`)} />
    </Flex>
  )
}
