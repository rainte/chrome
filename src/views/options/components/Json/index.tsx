import { useState } from 'react'
import { Flex, Space, Input, Button, Alert } from 'antd'
import { SortAscendingOutlined } from '@ant-design/icons'
import ReactJson from 'react-json-view'
import error from '@/utils/error'

export default () => {
  const [value, setValue] = useState<string>('{}')
  const [json, setJson] = useState<object>({})
  const [message, setMessage] = useState('')
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [sort, setSort] = useState<boolean>(true)

  const onChange = (event: any) => {
    try {
      const value = event.target.value
      setValue(value)
      isNaN(value) || error.fail(`"${value}" is not valid JSON`)
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
    <Flex vertical gap="small">
      <Flex>{message && <Alert showIcon message={message} type="error" />}</Flex>
      <Flex gap="large">
        <Flex vertical gap="small" flex={2}>
          <Flex>
            <Space.Compact>
              <Button onClick={() => setCollapsed(!collapsed)}>折/展</Button>
              <Button onClick={() => setSort(!sort)}>
                {sort && <SortAscendingOutlined />} 排序
              </Button>
            </Space.Compact>
          </Flex>
          <Flex flex={2}>
            <ReactJson
              src={json}
              sortKeys={sort}
              collapsed={collapsed}
              theme="monokai"
              quotesOnKeys={false}
              style={{
                padding: '1rem',
                width: '100%',
                minHeight: message ? '80vh' : '86vh'
              }}
            />
          </Flex>
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
