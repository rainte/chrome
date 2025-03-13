import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Flex, List, Space, TabPaneProps, Tabs, Typography } from 'antd'
import fast from '@/utils/fast'
import Fixed from './components/Fixed'
import Pac from './components/Pac'

export type ProxyProps = {
  name: string
  type?: 'Fixed' | 'Pac'
}

const data: ProxyProps[] = [
  { name: 'aaa', type: 'Fixed' },
  { name: 'aaa', type: 'Fixed' },
  { name: 'aaa', type: 'Fixed' },
  { name: 'aaa', type: 'Fixed' },
  { name: 'aaa', type: 'Fixed' }
]

export default function App() {
  const renderHeader = (label: string, type: ProxyProps['type']) => (
    <Flex justify="space-between" align="center">
      <Typography.Title level={5}>{label}</Typography.Title>
      <Button>添加</Button>
    </Flex>
  )

  const renderItem = (item: ProxyProps) => (
    <List.Item>
      <Flex justify="space-between" align="center" style={{ width: '10vw' }}>
        <Typography.Link>{item.name}</Typography.Link>
      </Flex>
    </List.Item>
  )

  return (
    <Flex gap="large" justify="space-between" style={{ height: '100%' }}>
      <Space direction="vertical">
        <List
          bordered
          header={renderHeader('代理节点', 'Fixed')}
          dataSource={data}
          renderItem={renderItem}
        />
        <List
          header={renderHeader('策略模式', 'Pac')}
          bordered
          dataSource={data}
          renderItem={renderItem}
        />
      </Space>
      {/* <Fixed name="123" /> */}
      <Pac />
    </Flex>
  )
}
