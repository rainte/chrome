import { Tabs, TabsProps } from 'antd'
import Agile from '@/views/agile'
import Setting from '@/views/setting'
import { i18n } from '@/utils/browser'
import style from './index.module.scss'

export default () => {
  const items: TabsProps['items'] = [
    {
      key: 'agile',
      label: i18n.get('homeAgile'),
      children: <Agile />
    },
    {
      key: 'setting',
      label: i18n.get('homeSetting'),
      children: <Setting />
    }
  ]

  return (
    <Tabs className={style.page} defaultActiveKey="agile" items={items} centered size="large" />
  )
}
