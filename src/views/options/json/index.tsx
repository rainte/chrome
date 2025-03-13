import { useState } from 'react'
import { Flex, Space, Input, Button, Alert } from 'antd'
import { AiOutlineSortAscending } from 'react-icons/ai'
import ReactJson from 'react-json-view'
import fast from '@/utils/fast'

export default function App() {
  const [value, setValue] = useState<string>('{}')
  const [json, setJson] = useState<object>({})
  const [message, setMessage] = useState('')
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [sort, setSort] = useState<boolean>(false)

  const onChange = (event: any) => {
    try {
      const value = event.target.value
      setValue(value)
      isNaN(value) || fast.fail(`"${value}" is not valid JSON`)
      setJson(JSON.parse(value))
      setMessage('')
    } catch (error: any) {
      setJson({})
      setMessage(error.message)
    }
  }

  const onCompress = () => {
    setValue(JSON.stringify(JSON.parse(value)))
  }

  const onFormat = () => {
    setValue(JSON.stringify(JSON.parse(value), null, 2))
  }

  return (
    <Flex vertical gap="small" style={{ height: '100%' }}>
      <Flex>{message && <Alert showIcon message={message} type="error" />}</Flex>
      <Flex gap="large" justify="space-between" style={{ height: '100%' }}>
        <Flex vertical gap="small" style={{ width: '50%' }}>
          <Flex>
            <Space.Compact>
              <Button onClick={() => setCollapsed(!collapsed)}>折/展</Button>
              <Button onClick={() => setSort(!sort)}>
                {sort && <AiOutlineSortAscending />} 排序
              </Button>
            </Space.Compact>
          </Flex>
          <ReactJson
            src={json} // 数据.
            sortKeys={sort} // 排序.
            collapsed={collapsed} // 展开.
            theme="monokai" // 主题.
            name={false} // 根名称.
            quotesOnKeys={false} // 引号.
            displayArrayKey={false} // 显示数组键名.
            displayDataTypes={false} // 显示数据类型.
            displayObjectSize={false} // 显示对象大小.
            style={{
              display: 'flex',
              flex: 2,
              padding: '1rem',
              overflow: 'auto',
              height: message ? '80vh' : '86vh'
            }}
          />
        </Flex>
        <Flex vertical gap="small" flex={2}>
          <Flex>
            <Space.Compact>
              <Button onClick={onCompress}>压缩</Button>
              <Button onClick={onFormat}>格式化</Button>
            </Space.Compact>
          </Flex>
          <Flex flex={2}>
            <Input.TextArea value={value} onChange={onChange} placeholder="输入 Json 字符串..." />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
