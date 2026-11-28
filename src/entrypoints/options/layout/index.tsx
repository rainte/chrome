import { collapsedState } from '@/utils/storage'
import { Layout as ProLayout } from '@rainte/ant'
import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'

export const menus = [
  {
    url: 'json',
    label: 'Json',
    component: () => import('../json')
  },
  {
    url: 'proxy',
    label: '代理',
    component: () => import('../proxy')
  },
  {
    url: 'tab',
    label: '标签页',
    component: () => import('../tab')
  },
  {
    url: 'markdown',
    label: 'Markdown',
    component: () => import('../markdown')
  },
  {
    url: 'epub',
    label: 'EPUB',
    component: () => import('../epub')
  },
  {
    url: 'reader',
    label: '阅读器',
    component: () => import('../reader')
  },
  {
    url: 'backup',
    label: '备份',
    component: () => import('../backup')
  }
]

const routes = menus.map((item, i) => ({
  path: item.url,
  name: `${i + 1}. ${item.label}`
}))

export default function Layout() {
  const [loading, setLoading] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const ref = { cancelled: false }
    loadCollapsed(ref)
    return () => {
      ref.cancelled = true
    }
  }, [])

  async function loadCollapsed(ref: { cancelled: boolean }) {
    setLoading(true)
    const v = await collapsedState.getValue()
    if (ref.cancelled) return
    setCollapsed(v)
    setLoading(false)
  }

  if (loading) {
    return <Spin fullscreen delay={500} />
  }

  return (
    <ProLayout
      title={import.meta.env.VITE_NAME}
      logo={import.meta.env.VITE_LOGO}
      inlineCollapsed={true}
      routes={routes}
      breakpoint={false}
      collapsed={collapsed}
      onCollapse={(v) => {
        setCollapsed(v)
        collapsedState.setValue(v)
      }}
      style={{ height: '100vh' }}
    >
      <Outlet />
    </ProLayout>
  )
}
