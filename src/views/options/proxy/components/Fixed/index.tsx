import { Form, FormProps } from '@rainte/ant'
import { ModeEnum } from '@/services/proxy'
import { ProxyProps } from '../../index'
import { Typography } from 'antd'

export default function App(props: ProxyProps) {
  const { id, onGet, onFinish } = props

  const options: FormProps = {
    initialValues: {
      scheme: 'HTTP',
      host: '127.0.0.1',
      port: 1080,
      bypassList: '127.0.0.1\n::1\nlocalhost\n192.168.*\n'
    },
    request: () => onGet!(id),
    onFinish: (values: any) => onFinish!({ ...values, id, mode: ModeEnum.FixedServers }),
    wrapperCol: { span: 12 },
    columns: [
      {
        title: '名称',
        dataIndex: 'name',
        formItemProps: { rules: [{ required: true }] }
      },
      {
        title: '代理协议',
        dataIndex: 'scheme',
        valueType: 'select',
        formItemProps: { rules: [{ required: true }] },
        valueEnum: {
          PROXY: { text: 'HTTP' },
          HTTPS: { text: 'HTTPS' },
          SOCKS4: { text: 'SOCKS4' },
          SOCKS5: { text: 'SOCKS5' }
        }
      },
      {
        title: '代理节点',
        dataIndex: 'host',
        formItemProps: { rules: [{ required: true }] }
      },
      {
        title: '代理端口',
        dataIndex: 'port',
        valueType: 'digit',
        formItemProps: { rules: [{ required: true }] }
      },
      // {
      //   title: '认证用户名',
      //   dataIndex: 'user'
      // },
      // {
      //   title: '认证密码',
      //   dataIndex: 'password',
      //   valueType: 'password'
      // },
      {
        title: '过滤地址',
        dataIndex: 'bypassList',
        valueType: 'textarea',
        tooltip: (
          <Typography.Link
            target="_blank"
            style={{ color: 'white' }}
            href="https://developer.chrome.com/docs/extensions/reference/api/proxy#bypass_list"
          >
            点击查看规则
          </Typography.Link>
        ),
        fieldProps: { rows: 9 }
        // https://developer.chrome.com/docs/extensions/reference/api/proxy#bypass_list
      }
    ]
  }

  return <Form {...options} style={{ flex: 2 }} />
}
