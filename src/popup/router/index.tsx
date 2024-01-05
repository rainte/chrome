import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export default createBrowserRouter([
  { path: '/home', Component: lazy(() => import('@/popup/views/home')) },
  {
    path: '/',
    Component: lazy(() => import('@/popup/views/layout')),
    children: [
      { index: true, element: <Navigate to="/home" /> },
      { path: 'mate', Component: lazy(() => import('@/popup/views/mate')) },
      { path: 'setting', Component: lazy(() => import('@/popup/views/setting')) }
    ]
  },
  { path: '*', element: <Navigate to="/home" /> }
])
