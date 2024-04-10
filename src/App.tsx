import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, App, Spin, message } from 'antd'
import popup from '@/utils/show'
import router from '@/router'
import zhCN from 'antd/locale/zh_CN'
import scss from './index.module.scss'

export default () => {
  popup()

  window.addEventListener('unhandledrejection', (event) => {
    message.error(event.reason.message)
  })

  return (
    <ConfigProvider locale={zhCN} theme={{ cssVar: true, hashed: false }}>
      <App className={scss.app}>
        <Suspense fallback={<Spin delay={500} fullscreen size="large" />}>
          <RouterProvider router={router} />
        </Suspense>
      </App>
    </ConfigProvider>
  )
}
