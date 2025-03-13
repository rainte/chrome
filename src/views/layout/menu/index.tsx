import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Typography } from 'antd'

const items = [
  { key: 'json', label: 'Json' },
  { key: 'bookmark', label: '书签' },
  { key: 'proxy', label: '代理' },
  { key: 'tab', label: '标签页' },
  { key: 'config', label: '配置' }
]

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState<string>('')

  useEffect(() => {
    const key = location.pathname.split('/').filter(Boolean).pop()
    const item = items.find((item) => item.key == key)
    console.log('item', item ? item.key : items[0].key)
    setSelectedKey(item ? item.key : items[0].key)
  }, [])

  return (
    <Layout style={{ height: '100vh' }}>
      <Layout.Sider>
        <Typography.Title
          style={{
            color: 'white',
            textAlign: 'center'
          }}
        >
          Rainte
        </Typography.Title>
        <Menu
          mode="inline"
          theme="dark"
          items={items}
          selectedKeys={[selectedKey]}
          onClick={(info) => {
            setSelectedKey(info.key)
            navigate(info.key)
          }}
        />
      </Layout.Sider>
      <Layout style={{ overflow: 'auto' }}>
        <Layout.Content style={{ minHeight: 'fit-content', padding: '16px' }}>
          <Layout.Content
            style={{
              height: '100%',
              padding: '16px',
              backgroundColor: 'white'
            }}
          >
            <Outlet />
          </Layout.Content>
        </Layout.Content>
      </Layout>
    </Layout>
  )
}
