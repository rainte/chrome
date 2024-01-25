import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tabs, Typography, TabPaneProps } from 'antd'
import route from '@/utils/route'
import * as Dom from './components'
import './index.scss'

const TAB = 'tab'

export default () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState('proxy')

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

  const titleStyle = { margin: '1rem', color: 'rgba(0, 0, 0, 0.65)' }

  return (
    <Tabs
      className="options"
      activeKey={tab}
      size="large"
      tabPosition="left"
      tabBarGutter={20}
      tabBarStyle={{ width: '15rem' }}
      tabBarExtraContent={{
        left: (
          <Typography.Title level={3} style={titleStyle}>
            设置
          </Typography.Title>
        )
      }}
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
