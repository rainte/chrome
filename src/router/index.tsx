import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

export default createBrowserRouter([
  { path: '/home', Component: lazy(() => import('@/views/home')) },
  {
    path: '/',
    Component: lazy(() => import('@/views/layout')),
    children: [
      { index: true, element: <Navigate to="/home" /> },
      { path: 'mate', Component: lazy(() => import('@/views/mate')) },
      { path: 'setting', Component: lazy(() => import('@/views/setting')) }
    ]
  },
  { path: '*', element: <Navigate to="/home" /> }
])
