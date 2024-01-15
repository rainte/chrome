import { Flex, Tabs, TabPaneProps } from 'antd'
import { Bookmark, Proxy, Tab } from './components'
import { i18n } from '@/utils/browser'
import './index.scss'

export default () => {
  const items: (TabPaneProps & { label: string })[] = [
    {
      label: i18n.get('optionsProxy'),
      children: <Proxy />
    },
    {
      label: i18n.get('optionsBookmark'),
      children: <Bookmark />
    },
    {
      label: i18n.get('optionsTab'),
      children: <Tab />
    },
    {
      label: i18n.get('optionsProxy'),
      children: <Proxy />
    },
    {
      label: 'Json',
      children: <Proxy />
    },
    {
      label: 'WebSocket',
      children: <Proxy />
    }
  ]

  return (
    <Flex className="page">
      <Tabs
        className="page-tabs"
        defaultActiveKey="1"
        size="large"
        tabPosition="left"
        tabBarGutter={20}
        tabBarStyle={{ width: '15rem' }}
        tabBarExtraContent={{
          left: <Flex className="tabs-title">{i18n.get('optionsTitle')}</Flex>
        }}
        items={items.map((item, i) => {
          return {
            label: item.label,
            key: i + '',
            children: item.children
          }
        })}
      />
    </Flex>
  )
}
