import { lazy } from 'react'
import { createHashRouter, Navigate } from 'react-router-dom'

export default createHashRouter([
  { path: '/home', Component: lazy(() => import('@/views/home')) },
  {
    path: '/',
    Component: lazy(() => import('@/views/layout')),
    children: [
      { index: true, element: <Navigate to="/home" /> },
      { path: 'agile', Component: lazy(() => import('@/views/agile')) },
      { path: 'newtab', Component: lazy(() => import('@/views/newtab')) },
      { path: 'options', Component: lazy(() => import('@/views/options')) },
      { path: 'setting', Component: lazy(() => import('@/views/setting')) }
    ]
  },
  { path: '*', element: <Navigate to="/home" /> }
])
