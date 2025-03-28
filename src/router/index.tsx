import { lazy } from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'

export const menus = [
  { url: 'json', label: 'Json', component: import('@/views/options/json') },
  { url: 'bookmark', label: '书签', component: import('@/views/options/bookmark') },
  { url: 'proxy', label: '代理', component: import('@/views/options/proxy') },
  { url: 'tab', label: '标签页', component: import('@/views/options/tab') },
  { url: 'config', label: '备份', component: import('@/views/options/config') }
]

const routes = menus.map((item) => {
  return { path: item.url, Component: lazy(() => item.component) }
})

const popup = <Navigate to="/popup" />
const options = <Navigate to={'/options/' + menus[0]?.url} />

const router = createHashRouter([
  { path: 'demo', Component: lazy(() => import('@/views/demo')) },
  {
    path: '/',
    Component: lazy(() => import('@/views/layout/blank')),
    children: [
      { index: true, element: popup },
      { path: 'newtab', Component: lazy(() => import('@/views/newtab')) },
      {
        path: 'options',
        Component: lazy(() => import('@/views/layout/menu')),
        children: [{ index: true, element: options }, ...routes]
      },
      { path: 'popup', Component: lazy(() => import('@/views/popup')) }
    ]
  },
  { path: '*', Component: lazy(() => import('@/views/404')) }
])

export default router
