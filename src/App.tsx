import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Spin } from 'antd'
import { dialog } from '@rainte/ant'
import router from '@/router'

export default function App() {
  dialog.useDialog()

  return (
    <Suspense fallback={<Spin delay={500} fullscreen size="large" />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
