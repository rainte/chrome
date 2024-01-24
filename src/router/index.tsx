import { lazy } from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'

export default createHashRouter([
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
