import { BetaSchemaForm } from '@ant-design/pro-components'
import { FormSchema } from '@ant-design/pro-form/es/components/SchemaForm'
import { Form as AntForm, Flex, Space } from 'antd'

export { default as FormItemLink } from './components/FormItemLink'

export type FormProps<T = any, ValueType = 'text'> = FormSchema<T, ValueType>

const useForm = () => {
  const [form] = AntForm.useForm()
  return form
}

export default function Form<T = any, ValueType = 'text'>(props: FormProps<T, ValueType>) {
  const { labelCol, wrapperCol } = props
  const init = defaultProps({ labelCol, wrapperCol } as FormProps)

  return <BetaSchemaForm {...({ ...init, ...props } as FormProps)} />
}

const defaultProps = (props: FormProps): FormProps => {
  const { labelCol = { span: 3 }, wrapperCol = { span: 6 } } = props
  const span = (labelCol.span as number) + (wrapperCol.span as number)

  const res = {
    layout: 'horizontal',
    scrollToFirstError: true,
    labelCol: labelCol,
    wrapperCol: wrapperCol,
    submitter: {
      render: (_, submitter) => {
        return (
          <AntForm.Item wrapperCol={{ span: span }}>
            <Flex justify="center">
              <Space>{submitter.reverse()}</Space>
            </Flex>
          </AntForm.Item>
        )
      }
    }
  } as FormProps

  return res
}

Form.useForm = useForm
