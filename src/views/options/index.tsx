import { Flex, Tabs, TabPaneProps } from 'antd'
import { Bookmark, Proxy, Rainte, Tab } from './components'
import scss from './index.module.scss'

export default () => {
  const items: (TabPaneProps & { label: string })[] = [
    { label: '书签', children: <Bookmark /> },
    { label: '代理', children: <Proxy /> },
    { label: '标签页', children: <Tab /> },
    { label: '全局', children: <Rainte /> }
  ]

  return (
    <Tabs
      className={scss.page}
      defaultActiveKey="0"
      size="large"
      tabPosition="left"
      tabBarGutter={20}
      tabBarStyle={{ width: '15rem' }}
      tabBarExtraContent={{ left: <Flex className={scss.tabsTitle}>设置</Flex> }}
      items={items.map((item, i) => {
        return {
          label: item.label,
          key: i + '',
          children: item.children
        }
      })}
    />
  )
}
