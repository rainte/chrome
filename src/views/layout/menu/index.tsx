import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Typography } from 'antd'
import { menus } from '@/router'

const items = menus.map((item) => {
  return { key: item.url, label: item.label }
})

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState('')

  useEffect(() => {
    const key = location.pathname.split('/').filter(Boolean).pop()
    const item = items.find((item) => item.key == key)
    setSelectedKey(item ? item.key : items[0].key)
  }, [])

  return (
    <Layout style={{ height: '100vh' }}>
      <Layout.Sider>
        <Typography.Title style={{ color: 'white', textAlign: 'center' }}>
          {import.meta.env.VITE_NAME}
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
