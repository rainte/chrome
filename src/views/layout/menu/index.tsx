import { useLocation } from 'react-router-dom'
import { Menu } from '@rainte/ant'
import { menus } from '@/router'

const items = menus.map((item) => ({ key: item.url, label: item.label }))

export default function App() {
  const location = useLocation()
  return <Menu key={location.pathname} items={items} />
}
