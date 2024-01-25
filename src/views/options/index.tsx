import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Flex, Tabs, TabPaneProps } from 'antd'
import route from '@/utils/route'
import * as Dom from './components'
import scss from './index.module.scss'

const TAB = 'tab'

export default () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('json')

  useEffect(() => {
    const activeKey = route.get(location, TAB)
    activeKey && setTab(activeKey)
  }, [])

  const items: (TabPaneProps & { label: string })[] = [
    { id: 'json', label: 'Json', children: <Dom.Json /> },
    { id: 'proxy', label: '代理', children: <Dom.Proxy /> },
    { id: 'bookmark', label: '书签', children: <Dom.Bookmark /> },
    { id: 'tab', label: '标签页', children: <Dom.Tab /> },
    { id: 'config', label: '配置', children: <Dom.Config /> }
  ]

  return (
    <Tabs
      className={scss.page}
      activeKey={tab}
      size="large"
      tabPosition="left"
      tabBarGutter={20}
      tabBarStyle={{ width: '15rem' }}
      tabBarExtraContent={{ left: <Flex className={scss.tabsTitle}>设置</Flex> }}
      onTabClick={(activeKey) => {
        setTab(activeKey)
        const url = route.add(location, { [TAB]: activeKey })
        navigate(url)
      }}
      items={items.map((item) => {
        return {
          label: item.label,
          key: item.id as string,
          children: item.children
        }
      })}
    />
  )
}
