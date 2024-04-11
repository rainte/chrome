import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Spin } from 'antd'
import popup from '@/utils/show'
import router from '@/router'

export default function () {
  popup()

  return (
    <Suspense fallback={<Spin delay={500} fullscreen size="large" />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
