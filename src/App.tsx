import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Spin } from 'antd'
import router from '@/router'
import popup from '@/utils/show'

export default function App() {
  popup()

  return (
    <Suspense fallback={<Spin delay={500} fullscreen size="large" />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
