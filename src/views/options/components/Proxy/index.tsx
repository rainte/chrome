import Form, { FormProps } from '@/components/Form'
import { Space, Input, Button } from 'antd'

const StatusMap = new Map([
  [1, { text: '正常', status: 'Success' }],
  [2, { text: '冻结', status: 'Error' }]
])

const valueEnum = {
  all: { text: '全部', status: 'Default' },
  open: {
    text: '未解决',
    status: 'Error'
  },
  closed: {
    text: '已解决',
    status: 'Success',
    disabled: true
  },
  processing: {
    text: '解决中',
    status: 'Processing'
  }
}

export default () => {
  const open = (url: string) => {
    // chrome.storage.
    window.open(url, '_blank')
  }

  const form: FormProps = {
    wrapperCol: { span: 24 },
    columns: [
      {
        title: '代理模式',
        dataIndex: 'mode',
        valueType: 'select',
        width: 'md',
        formItemProps: { rules: [{ required: true }] },
        valueEnum: {
          direct: { text: 'direct', status: 'direct' },
          auto_detect: { text: 'auto_detect', status: 'auto_detect' },
          pac_script: { text: 'pac_script', status: 'pac_script' },
          fixed_servers: { text: 'fixed_servers', status: 'fixed_servers' },
          system: { text: 'system', status: 'system' }
        }
      },
      {
        title: '分组',
        dataIndex: 'list',
        valueType: 'formList',
        columns: [
          {
            title: '状态',
            dataIndex: 'groupState',
            valueType: 'select',
            // width: 'lg',
            valueEnum
          },
          {
            title: '标题',
            // width: 'lg',
            dataIndex: 'groupTitle',
            // colProps: {
            //   xs: 12
            // },
            formItemProps: {
              rules: [
                {
                  required: true,
                  message: '此项为必填项'
                }
              ]
            }
          }
        ]
      },
      {
        title: '消息通知',
        dataIndex: 'notice',
        valueType: 'switch'
      }
    ]
  }

  return <Form {...form} />
}
