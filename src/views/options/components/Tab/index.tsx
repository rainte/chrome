import { Collapse, CollapseProps } from 'antd'
import NewTabBgImg from './components/NewTabBgImg'

export default () => {
  const items: CollapseProps['items'] = [{ label: '新标签页', children: <NewTabBgImg /> }]

  return <Collapse defaultActiveKey={0} items={items} />
}
