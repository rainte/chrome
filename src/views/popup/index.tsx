import { useState } from 'react'
import { ConfigProvider, Flex, Segmented, Space } from 'antd'
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons'
import Apps from './components/apps'
import Setting from './components/setting'
import './index.scss'

export default () => {
  const [key, setKey] = useState<any>('apps')

  const doms: Record<string, any> = {
    apps: {
      label: '组件',
      icon: <AppstoreOutlined />,
      dom: <Apps />
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
      <Flex vertical gap="small" className="popup">
        <Segmented
          options={Object.keys(doms).map((key) => {
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
