import { Tabs, TabsProps } from 'antd'
import Mate from '@/views/mate'
import Setting from '@/views/setting'

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

  return <Tabs defaultActiveKey="mate" items={items} centered size="large" />
}
