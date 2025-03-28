import { Collapse, CollapseProps } from 'antd'
import NewTabBgImg from './components/NewTabBgImg'

const items: CollapseProps['items'] = [{ label: '新标签页', children: <NewTabBgImg /> }]

export default function App() {
  return <Collapse defaultActiveKey={0} items={items} />
}
