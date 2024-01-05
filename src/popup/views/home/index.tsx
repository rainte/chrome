import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import Mate from '@/popup/views/mate'
import Setting from '@/popup/views/setting'

export default () => {
  const items: TabsProps['items'] = [
    {
      key: 'mate',
      label: '组件',
      children: <Mate />
    },
    {
      key: 'setting',
      label: '设置',
      children: <Setting />
    }
  ]

  return <Tabs defaultActiveKey="mate" items={items} centered />
}
