import { antd, router } from '@rainte/ant'
import { App, ConfigProvider, Spin } from 'antd'
import 'antd/dist/reset.css'
import zhCN from 'antd/locale/zh_CN'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { menus } from './layout'

antd.addErrorListener()

const layout = () => import('./layout')
const dataRouter = router.createRouter(menus, '/proxy', layout)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN} theme={{ hashed: false }}>
      <App>
        <antd.AntdAppHolder />
        <Suspense fallback={<Spin delay={500} fullscreen size="large" />}>
          <RouterProvider router={dataRouter} />
        </Suspense>
      </App>
    </ConfigProvider>
  </React.StrictMode>
)
