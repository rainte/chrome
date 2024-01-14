import React from 'react'
import { BetaSchemaForm } from '@ant-design/pro-components'
import { FormSchema } from '@ant-design/pro-form/es/components/SchemaForm'
import { Form as AntForm, Flex, Space } from 'antd'

export type FormProps<T = Record<string, any>, ValueType = 'text'> = FormSchema<T, ValueType>

const Form: React.FC<FormProps<any, any>> = <T, ValueType>(props: FormProps<T, ValueType>) => {
  return <BetaSchemaForm {...props} />
}

export default Form

Form.defaultProps = {
  layout: 'horizontal',
  submitter: {
    render: (_: any, dom: JSX.Element[]) => {
      return (
        <AntForm.Item>
          <Flex justify="center">
            <Space>{dom}</Space>
          </Flex>
        </AntForm.Item>
      )
    }
  }
}
