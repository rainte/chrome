import { useState } from 'react'
import { ConfigProvider, Segmented, Flex } from 'antd'
import { AiFillAppstore, AiOutlineSetting } from 'react-icons/ai'
import Apps from './components/Apps'
import Setting from './components/Setting'

const options = [
  { label: '组件', icon: <AiFillAppstore />, dom: <Apps /> },
  { label: '设置', icon: <AiOutlineSetting />, dom: <Setting /> }
]

export default function App() {
  const [key, setKey] = useState(0)

  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: { trackBg: 'rgba(118,118,128,0.12)' },
          List: { itemPadding: '7px 0' }
        }
      }}
    >
      <Flex
        vertical
        gap="small"
        className="popup"
        style={{
          width: '17rem',
          padding: '1rem',
          backgroundColor: '#ededed'
        }}
      >
        <Segmented
          options={options.map((item, index) => {
            return {
              label: (
                <Flex gap="small" align="center" justify="center">
                  {item.icon}
                  {item.label}
                </Flex>
              ),
              value: index
            }
          })}
          value={key}
          onChange={setKey}
          block
        />
        {options[key].dom}
      </Flex>
    </ConfigProvider>
  )
}
