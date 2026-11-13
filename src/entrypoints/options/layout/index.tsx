import { Outlet } from 'react-router'
import { Layout } from '@rainte/ant'
import { PageContainer, ProCard } from '@ant-design/pro-components'

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
    url: 'backup',
    label: '备份',
    component: () => import('../backup')
  }
]

const routes = menus.map((item) => ({
  path: item.url,
  name: item.label
}))

export default function LayoutDemo() {
  return (
    <Layout routes={routes}>
      <PageContainer title={false}>
        <ProCard>
          <Outlet />
        </ProCard>
      </PageContainer>
    </Layout>
  )
}
