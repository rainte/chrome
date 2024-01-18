import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Spin, message } from 'antd'
import popup from '@/utils/popup'
import router from '@/router'

export default () => {
  popup()

  window.addEventListener('unhandledrejection', (event) => {
    message.error(event.reason.message)
  })

  return (
    <Suspense fallback={<Spin fullscreen size="large" delay={500} />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
