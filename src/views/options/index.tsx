import { Flex, Tabs, TabPaneProps } from 'antd'
import { Bookmark, Proxy, Tab } from './components'
import './index.scss'

export default () => {
  const items: (TabPaneProps & { label: string })[] = [
    {
      label: '代理',
      children: <Proxy />
    },
    {
      label: '书签',
      children: <Bookmark />
    },
    {
      label: '标签页',
      children: <Tab />
    },
    {
      label: '翻译',
      children: <Proxy />
    },
    {
      label: 'Json',
      children: <Proxy />
    },
    {
      label: 'WebSocket',
      children: <Proxy />
    }
  ]

  return (
    <Flex className="page">
      <Tabs
        className="page-tabs"
        defaultActiveKey="1"
        size="large"
        tabPosition="left"
        tabBarGutter={20}
        tabBarStyle={{ width: '15rem' }}
        tabBarExtraContent={{ left: <Flex className="tabs-title">设置</Flex> }}
        items={items.map((item, i) => {
          return {
            label: item.label,
            key: i + '',
            children: item.children
          }
        })}
      />
    </Flex>
  )
}
