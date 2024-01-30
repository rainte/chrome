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
  const { labelCol, wrapperCol } = props
  const init = defaultProps({ labelCol, wrapperCol } as FormProps)
  const attrs = { ...init, ...props } as FormProps

  return <BetaSchemaForm {...attrs} />
}

export default dom

const defaultProps = (props: FormProps): FormProps => {
  const { labelCol = { span: 3 }, wrapperCol = { span: 6 } } = props
  const span = (labelCol.span as number) + (wrapperCol.span as number)

  const res = {
    layout: 'horizontal',
    scrollToFirstError: true,
    labelCol: labelCol,
    wrapperCol: wrapperCol,
    submitter: {
      render: (_: any, submitter: JSX.Element[]) => {
        return (
          <Form.Item wrapperCol={{ span: span }}>
            <Flex justify="center">
              <Space>{submitter.reverse()}</Space>
            </Flex>
          </Form.Item>
        )
      }
    }
  } as FormProps

  return res
}
