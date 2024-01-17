import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, App, Spin } from 'antd'
import popup from '@/utils/popup'
import router from '@/router'
import 'antd/dist/reset.css'
import './index.scss'

const Element = () => {
  popup()

  return (
    <Suspense fallback={<Spin fullscreen size="large" delay={500} />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <App className="root-app">
        <Element />
      </App>
    </ConfigProvider>
  </React.StrictMode>
)
