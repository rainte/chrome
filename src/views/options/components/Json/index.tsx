import { useState } from 'react'
import { Flex, Input, Space, Button, Alert } from 'antd'
import ReactJson from 'react-json-view'

const { TextArea } = Input

export default () => {
  const [json, setJson] = useState<object>({})
  const [error, setError] = useState('')
  const [collapsed, setCollapsed] = useState<boolean | number>(false)
  const [sort, setSort] = useState<boolean>(true)

  const onChange = (event: any) => {
    try {
      setJson(JSON.parse(event.target.value))
      setError('')
    } catch (error: any) {
      setJson({})
      setError(error.message)
    }
  }

  return (
    <Flex vertical gap="small">
      <Flex vertical gap="small">
        <Space.Compact>
          <Button onClick={() => setCollapsed(!collapsed)}>折叠/展开</Button>
          <Button onClick={() => setSort(!sort)}>排序</Button>
        </Space.Compact>
        {error ? <Alert showIcon message={error} type="error" /> : null}
      </Flex>
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
              minHeight: '85vh'
            }}
          />
        </Flex>
        <Flex flex={2}>
          <TextArea onChange={onChange} />
        </Flex>
      </Flex>
    </Flex>
  )
}
