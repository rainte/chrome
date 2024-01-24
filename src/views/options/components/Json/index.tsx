import { useState } from 'react'
import { Flex, Space, Input, Switch, Typography, Alert } from 'antd'
import ReactJson from 'react-json-view'
import error from '@/utils/error'

export default () => {
  const [json, setJson] = useState<object>({})
  const [message, setMessage] = useState('')
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [sort, setSort] = useState<boolean>(true)

  const onChange = (event: any) => {
    try {
      const value = event.target.value
      isNaN(value) || error.fail(`"${value}" is not valid JSON`)
      setJson(JSON.parse(value))
      setMessage('')
    } catch (error: any) {
      setJson({})
      setMessage(error.message)
    }
  }

  return (
    <Flex vertical gap="small">
      <Flex vertical>
        <Space>
          <Typography.Text>折/展</Typography.Text>
          <Switch onChange={() => setCollapsed(!collapsed)} checked={collapsed} />
          <Typography.Text>排序</Typography.Text>
          <Switch onChange={() => setSort(!sort)} checked={sort} />
        </Space>
      </Flex>
      <Flex>{message ? <Alert showIcon message={message} type="error" /> : null}</Flex>
      <Flex gap="large">
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
        <Flex flex={2}>
          <Input.TextArea
            defaultValue={JSON.stringify(json)}
            onChange={onChange}
            placeholder="输入 Json 字符串..."
          />
        </Flex>
      </Flex>
    </Flex>
  )
}
