import { lazy } from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'

const router = createHashRouter([
  { path: 'demo', Component: lazy(() => import('@/views/demo')) },
  {
    path: '/',
    Component: lazy(() => import('@/views/layout')),
    children: [
      { index: true, element: <Navigate to="/popup" /> },
      { path: 'newtab', Component: lazy(() => import('@/views/newtab')) },
      { path: 'options', Component: lazy(() => import('@/views/options')) },
      { path: 'popup', Component: lazy(() => import('@/views/popup')) }
    ]
  },
  { path: '*', element: <Navigate to="/popup" /> }
])

export default router
