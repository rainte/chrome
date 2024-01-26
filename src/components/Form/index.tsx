import { BetaSchemaForm } from '@ant-design/pro-components'
import { FormSchema } from '@ant-design/pro-form/es/components/SchemaForm'
import { Form, Flex, Space } from 'antd'

export * from './components'
export type FormProps<T = any, ValueType = 'text'> = FormSchema<T, ValueType>
export const useForm = () => {
  const [form] = Form.useForm()
  return form
}

const dom = function <T = any, ValueType = 'text'>(props: FormProps<T, ValueType>) {
  return <BetaSchemaForm {...props} />
}

export default dom

dom.defaultProps = {
  layout: 'horizontal',
  labelWrap: true,
  scrollToFirstError: true,
  wrapperCol: { span: 6 },
  submitter: {
    render: (_: any, dom: JSX.Element[]) => {
      return (
        <Form.Item>
          <Flex justify="center">
            <Space>{dom.reverse()}</Space>
          </Flex>
        </Form.Item>
      )
    }
  }
}
