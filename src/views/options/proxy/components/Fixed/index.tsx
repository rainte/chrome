import Form, { FormProps } from '@/components/Form'
import { gist, HubEnum } from '@/services/octokit'
import { popup } from '@/utils/show'
import { ProxyProps } from '../../index'

export default function App(props: ProxyProps) {
  const { name } = props

  const onRequest = () => gist.getJson(HubEnum.Proxy).then((res) => res[name])

  const onFinish = (data: any) =>
    gist.setJson(HubEnum.Proxy, { [name]: data }).then(() => popup.success())

  const formProps: FormProps = {
    form: Form.useForm(),
    request: onRequest,
    onFinish: onFinish,
    wrapperCol: { span: 12 },
    columns: [
      {
        title: '名称',
        dataIndex: 'name',
        formItemProps: { rules: [{ required: true }] }
      },
      {
        title: '代理协议',
        dataIndex: 'protocol',
        valueType: 'select',
        initialValue: 'http',
        formItemProps: { rules: [{ required: true }] },
        valueEnum: {
          http: { text: 'HTTP' },
          https: { text: 'HTTPS' },
          socks4: { text: 'SOCKS4' },
          socks5: { text: 'SOCKS5' }
        }
      },
      {
        title: '代理节点',
        dataIndex: 'ip',
        formItemProps: { rules: [{ required: true }] }
      },
      {
        title: '代理端口',
        dataIndex: 'port',
        valueType: 'digit',
        formItemProps: { rules: [{ required: true }] }
      },
      {
        title: '认证用户名',
        dataIndex: 'user'
      },
      {
        title: '认证密码',
        dataIndex: 'password',
        valueType: 'password'
      },
      {
        title: '过滤地址',
        dataIndex: 'filter',
        valueType: 'textarea',
        initialValue: '127.0.0.1\n::1\nlocalhost',
        fieldProps: { rows: 9 }
      }
    ]
  }

  return <Form {...formProps} style={{ flex: 2 }} />
}
