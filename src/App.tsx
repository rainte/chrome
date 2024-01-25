import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Spin, message } from 'antd'
import popup from '@/utils/show'
import router from '@/router'

export default () => {
  popup()

  window.addEventListener('unhandledrejection', (event) => {
    message.error(event.reason.message)
  })

  return (
    <Suspense fallback={<Spin delay={500} fullscreen size="large" />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
