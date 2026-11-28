import { usePrefersDark } from '@/hooks/usePrefersDark'
import { ProConfigProvider } from '@ant-design/pro-components'
import { antd, router } from '@rainte/ant'
import { App, ConfigProvider, Spin, theme } from 'antd'
import 'antd/dist/reset.css'
import zhCN from 'antd/locale/zh_CN'
import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '../index.css'
import { menus } from './layout'

antd.addErrorListener()

const layout = () => import('./layout')
const dataRouter = router.createRouter(menus, '/proxy', layout)

function ThemedApp() {
  const isDark = usePrefersDark()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{ hashed: false, algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm }}
    >
      <ProConfigProvider dark={isDark}>
        <App>
          <antd.AntdAppHolder />
          <Suspense fallback={<Spin delay={500} fullscreen size="large" />}>
            <RouterProvider router={dataRouter} />
          </Suspense>
        </App>
      </ProConfigProvider>
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
)
