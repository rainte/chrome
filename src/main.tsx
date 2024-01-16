import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, App, Spin } from 'antd'
import router from '@/router'
import 'antd/dist/reset.css'
import './index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <App>
        <Suspense fallback={<Spin fullscreen size="large" delay={500} />}>
          <RouterProvider router={router} />
        </Suspense>
      </App>
    </ConfigProvider>
  </React.StrictMode>
)
