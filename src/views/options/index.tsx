import { Flex, Tabs, TabPaneProps } from 'antd'
import * as Dom from './components'
import scss from './index.module.scss'

export default () => {
  const items: (TabPaneProps & { label: string })[] = [
    { label: '代理', children: <Dom.Proxy /> },
    { label: '书签', children: <Dom.Bookmark /> },
    { label: '标签页', children: <Dom.Tab /> },
    { label: '配置', children: <Dom.Config /> }
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
