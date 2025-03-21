import { useState } from 'react'
import { ConfigProvider, Segmented, Flex } from 'antd'
import { AiOutlineGlobal, AiOutlineAppstore } from 'react-icons/ai'
import Proxy from './components/Proxy'
import Setting from './components/Setting'

const options = [
  { label: '代理', icon: <AiOutlineGlobal />, dom: <Proxy /> },
  { label: '应用', icon: <AiOutlineAppstore />, dom: <Setting /> }
]

export default function App() {
  const [key, setKey] = useState(0)

  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: { trackBg: 'rgba(118,118,128,0.12)' },
          Menu: { itemBg: '#ededed' }
        }
      }}
    >
      <Flex
        vertical
        gap="small"
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
