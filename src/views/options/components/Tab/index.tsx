import { Collapse, CollapseProps } from 'antd'
import NewTabBgImg from './components/NewTabBgImg'

export enum TabEnum {
  NewTabBgImg = 'NewTabBgImg'
}

export default function App() {
  const items: CollapseProps['items'] = [{ label: '新标签页', children: <NewTabBgImg /> }]

  return <Collapse defaultActiveKey={0} items={items} />
}
