import React, { lazy, Suspense } from 'react'
import type { RadioChangeEvent } from 'antd'
import { Row, Radio, Tabs, TabPaneProps } from 'antd'
import './index.scss'

type TabProps = TabPaneProps & { label: string }

export default () => {
  // React.createElement
  const items: TabProps[] = [
    {
      label: '/home',
      // children: React.createElement( import('@/views/home'))
    },
    {
      label: '/home',
      children: React.createElement(lazy(() => import('@/views/home')))
    },
    {
      label: '/home',
      children: React.createElement(lazy(() => import('@/views/home')))
    },
    {
      label: '/home',
      children: React.createElement(lazy(() => import('@/views/home')))
    },
    {
      label: '/home',
      children: React.createElement(lazy(() => import('@/views/home')))
    }
  ]

  return (
    <Row className="page">
      <Tabs
        size="large"
        tabPosition="left"
        tabBarGutter={20}
        tabBarStyle={{ width: '15rem' }}
        tabBarExtraContent={{ left: <Row className="tabs-title">设置</Row> }}
        items={items.map((item, i) => {
          return {
            label: item.label,
            key: i + '',
            children: '123'
          }
        })}
      />
    </Row>
  )
}
