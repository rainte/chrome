import { lazy } from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'

export default createHashRouter([
  { path: '/home', Component: lazy(() => import('@/views/home')) },
  {
    path: '/',
    Component: lazy(() => import('@/views/layout')),
    children: [
      { index: true, element: <Navigate to="/home" /> },
      { path: 'mate', Component: lazy(() => import('@/views/mate')) },
      { path: 'setting', Component: lazy(() => import('@/views/setting')) },
      { path: 'options', Component: lazy(() => import('@/views/options')) }
    ]
  },
  { path: '*', element: <Navigate to="/home" /> }
])
