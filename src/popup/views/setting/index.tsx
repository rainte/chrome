import { Tabs } from 'antd'
import type { TabsProps } from 'antd'

const onChange = (key: string) => {
  console.log(key)
}

const items: TabsProps['items'] = [
  {
    key: 'component',
    label: '组件',
    children: 'Content of Tab Pane 1'
  },
  {
    key: 'setting',
    label: '设置',
    children: 'Content of Tab Pane 1'
  }
]

export default () => (
  <Tabs defaultActiveKey="component" items={items} onChange={onChange} centered />
)
