import { Tabs, TabsProps } from 'antd'
import Agile from '@/views/agile'
import Setting from '@/views/setting'
import scss from './index.module.scss'

export default () => {
  const items: TabsProps['items'] = [
    { key: 'agile', label: '组件', children: <Agile /> },
    { key: 'setting', label: '设置', children: <Setting /> }
  ]

  return (
    <Tabs className={scss.page} defaultActiveKey="setting" items={items} centered size="large" />
  )
}
