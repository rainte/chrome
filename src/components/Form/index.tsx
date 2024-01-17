import React from 'react'
import { BetaSchemaForm } from '@ant-design/pro-components'
import { FormSchema } from '@ant-design/pro-form/es/components/SchemaForm'
import { Form as AntForm, Flex, Space } from 'antd'

export type FormProps<T = Record<string, any>, ValueType = 'text'> = FormSchema<T, ValueType>

export const useForm = () => {
  const [form] = AntForm.useForm()
  return form
}

export const formItemHandler = (props: any) => {
  const { defaultRender, ...attrs } = props

  return attrs
}

const Render: React.FC<FormProps<any, any>> = <T, ValueType>(props: FormProps<T, ValueType>) => {
  return <BetaSchemaForm {...props} />
}

export default Render

Render.defaultProps = {
  form: useForm(),
  layout: 'horizontal',
  submitter: {
    render: (_: any, dom: JSX.Element[]) => {
      return (
        <AntForm.Item>
          <Flex justify="center">
            <Space>{dom.reverse()}</Space>
          </Flex>
        </AntForm.Item>
      )
    }
  }
}
