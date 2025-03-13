import React from 'react'
import { Button, Collapse, Form, Input, Select, Space, Switch, Typography } from 'antd'

const itemValue = {
  status: true,
  rule: 'domain',
  value: '',
  mode: 'direct'
}

const App: React.FC = () => {
  const [form] = Form.useForm()

  form.setFieldsValue({
    name: '',
    default: 'direct',
    rules: [itemValue],
    external_mode: 'direct',
    external_url: '',
    external_parse: 'Base64',
    external_content: ''
  })

  const renderConnect = (
    <Select options={[{ label: '直连', value: 'direct' }]} style={{ width: '15vw' }} />
  )

  const renderRule = (
    <Form.Item>
      <Form.List name="rules">
        {(subFields, subOpt) => (
          <>
            {subFields.map((subField) => (
              <Space key={subField.key} align="start">
                <Form.Item name={[subField.name, 'status']}>
                  <Switch />
                </Form.Item>
                <Form.Item name={[subField.name, 'rule']}>
                  <Select
                    options={[
                      { label: '域名通配符', value: 'domain' },
                      { label: '正则表达式', value: 'regex' },
                      { label: 'IP/CIDR', value: 'ip' }
                    ]}
                    style={{ width: '10vw' }}
                  />
                </Form.Item>
                <Form.Item name={[subField.name, 'value']}>
                  <Input style={{ width: '20vw' }} />
                </Form.Item>
                <Form.Item name={[subField.name, 'mode']}>{renderConnect}</Form.Item>
                <Button type="link" onClick={() => subOpt.remove(subField.name)}>
                  删除
                </Button>
              </Space>
            ))}
            <br />
            <Button type="dashed" onClick={() => subOpt.add(itemValue)}>
              添加
            </Button>
          </>
        )}
      </Form.List>
    </Form.Item>
  )

  const renderExternal = (
    <>
      <Form.Item label="模式" name="external_mode">
        {renderConnect}
      </Form.Item>

      <Form.Item label="规则地址" name="external_url">
        <Input
          addonBefore={
            <Form.Item name="external_parse" noStyle>
              <Select options={[{ label: 'Base64' }, { label: 'Raw' }]} />
            </Form.Item>
          }
          addonAfter={<Button type="link">更新</Button>}
          defaultValue="https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt"
        />
      </Form.Item>

      <Form.Item shouldUpdate>
        {() => {
          return (
            <Typography>
              <pre style={{ height: '20vh', overflow: 'auto' }}>
                {form.getFieldValue('external_content')}
              </pre>
            </Typography>
          )
        }}
      </Form.Item>
    </>
  )

  return (
    <Form labelCol={{ span: 3 }} form={form} style={{ flex: 2 }}>
      <Form.Item label="名称" name="name">
        <Input />
      </Form.Item>

      <Form.Item label="默认规则" name="default">
        {renderConnect}
      </Form.Item>

      <Collapse
        activeKey={[0, 1]}
        items={[
          { label: '切换规则', children: renderRule },
          { label: '外部规则', children: renderExternal }
        ]}
      />
    </Form>
  )
}

export default App
