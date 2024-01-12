import { RouterProvider } from 'react-router-dom'
import router from '@/router'
import './index.scss'

export default () => {
  console.log('popup')
  return <RouterProvider router={router} />
}
