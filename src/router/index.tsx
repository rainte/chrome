import { lazy } from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'

const router = createHashRouter([
  { path: 'demo', Component: lazy(() => import('@/views/demo')) },
  {
    path: '/',
    Component: lazy(() => import('@/views/layout/blank')),
    children: [
      { index: true, element: <Navigate to="/popup" /> },
      { path: 'newtab', Component: lazy(() => import('@/views/newtab')) },
      {
        path: 'options',
        Component: lazy(() => import('@/views/layout/menu')),
        children: [
          { path: 'bookmark', Component: lazy(() => import('@/views/options/bookmark')) },
          { path: 'config', Component: lazy(() => import('@/views/options/config')) },
          { path: 'json', Component: lazy(() => import('@/views/options/json')) },
          { path: 'proxy', Component: lazy(() => import('@/views/options/proxy')) },
          { path: 'tab', Component: lazy(() => import('@/views/options/tab')) }
        ]
      },
      { path: 'popup', Component: lazy(() => import('@/views/popup')) }
    ]
  },
  { path: '*', element: <Navigate to="/popup" /> }
])

export default router
