import { RouterProvider } from 'react-router-dom'
import router from '@/popup/router'
import './index.scss'

export default () => {
  return <RouterProvider router={router} />
}
