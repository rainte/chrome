import { useState } from 'react'
import { ConfigProvider, Flex, Segmented, Space } from 'antd'
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons'
import Agile from './components/agile'
import Setting from './components/setting'
import scss from './index.module.scss'

export default () => {
  const [key, setKey] = useState<any>('agile')

  const doms: Record<string, any> = {
    agile: {
      label: '组件',
      icon: <AppstoreOutlined />,
      dom: <Agile />
    },
    setting: {
      label: '设置',
      icon: <SettingOutlined />,
      dom: <Setting />
    }
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: { trackBg: 'rgba(118,118,128,0.12)' },
          List: { itemPadding: '7px 0' }
        }
      }}
    >
      <Flex vertical className={scss.page}>
        <Segmented
          options={Object.keys({ agile: doms.agile }).map((key) => {
            return {
              label: (
                <Space>
                  {doms[key].icon}
                  {doms[key].label}
                </Space>
              ),
              value: key
            }
          })}
          value={key}
          onChange={setKey}
          block
        />
        {doms[key]?.dom}
      </Flex>
    </ConfigProvider>
  )
}
