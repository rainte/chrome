import { useEffect, useState } from 'react'
import { Form, FormProps } from '@rainte/ant'
import { Button, Typography } from 'antd'
import { ModeEnum, getFixedModes, direct, fetchPacData } from '@/services/proxy'
import { popup } from '@/utils/show'
import { ProxyProps } from '../../index'

const modeMap = new Map([
  ['domain', { text: '域名' }],
  ['regex', { text: '正则' }],
  ['ip', { text: 'IP/CIDR' }]
])

const formatMap = new Map([
  ['base64', { text: 'Base64' }],
  ['raw', { text: 'Raw' }]
])

export default function App(props: ProxyProps) {
  const { id, onGet, onFinish } = props
  const [proxyMap, setProxyMap] = useState<Map<string, any>>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getFixedModes().then((modes) => {
      setProxyMap(new Map(modes.map((item) => [item.id, { text: item.name }])))
    })
  }, [])

  const fetchExternalData = async () => {
    setLoading(true)
    const url = options.form?.getFieldValue(['pac', 'url'])
    const format = options.form?.getFieldValue(['pac', 'format'])

    let data = null
    try {
      data = await fetchPacData(url, format)
    } catch (e) {
      popup.error(String(e))
    } finally {
      options.form?.setFieldValue(['pac', 'value'], data)
      setLoading(false)
    }
  }

  const options: FormProps = {
    form: Form.useForm(),
    initialValues: {
      default: direct.id,
      pac: {
        status: true,
        format: 'base64',
        url: 'https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt',
        proxy: direct.id
      }
    },
    request: () =>
      onGet!(id).then(async (res: any) => {
        res.pac.status && (res.pac.value = await fetchPacData(res.pac.url, res.pac.format))
        return res
      }),
    onFinish: (values: any) => onFinish!({ ...values, id, mode: ModeEnum.PacScript }),
    wrapperCol: { span: 12 },
    columns: [
      {
        title: '名称',
        dataIndex: 'name',
        formItemProps: { rules: [{ required: true }] }
      },
      {
        title: '默认规则',
        dataIndex: 'default',
        valueType: 'select',
        valueEnum: proxyMap,
        formItemProps: { rules: [{ required: true }] }
      },
      {
        title: '本地规则',
        dataIndex: 'rules',
        valueType: 'formList',
        fieldProps: {
          creatorRecord: {
            status: true,
            mode: 'domain',
            proxy: direct.id
          }
        },
        formItemProps: {
          wrapperCol: { span: 17 },
          tooltip: (
            <Typography.Link
              target="_blank"
              style={{ color: 'white' }}
              href="https://developer.chrome.com/docs/extensions/reference/api/proxy#bypass_list"
            >
              点击查看规则
            </Typography.Link>
          )
        },
        columns: [
          {
            valueType: 'group',
            fieldProps: { size: 'small' },
            columns: [
              {
                dataIndex: 'status',
                valueType: 'switch',
                formItemProps: { rules: [{ required: true }] }
              },
              {
                valueType: 'dependency',
                name: ['status'],
                columns: ({ status }) => [
                  {
                    valueType: 'group',
                    fieldProps: { size: 'small' },
                    columns: [
                      {
                        dataIndex: 'mode',
                        valueType: 'select',
                        valueEnum: modeMap,
                        width: 'xs',
                        formItemProps: { rules: [{ required: status }] }
                      },
                      {
                        dataIndex: 'value',
                        width: 'md',
                        formItemProps: { rules: [{ required: status }] }
                      },
                      {
                        dataIndex: 'proxy',
                        valueType: 'select',
                        valueEnum: proxyMap,
                        width: 'xs',
                        formItemProps: { rules: [{ required: status }] }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        title: '外部规则',
        dataIndex: 'formSet',
        valueType: 'formSet',
        tooltip: '仅支持 AutoProxy 规则',
        fieldProps: { formItemProps: { style: { marginBottom: 0 } } },
        formItemProps: { wrapperCol: { span: 24 } },
        columns: [
          {
            dataIndex: ['pac', 'status'],
            valueType: 'switch',
            formItemProps: { rules: [{ required: true }] }
          },
          {
            valueType: 'dependency',
            name: [['pac', 'status']],
            columns: ({ pac }) => [
              {
                valueType: 'group',
                fieldProps: { size: 'small' },
                columns: [
                  {
                    dataIndex: ['pac', 'format'],
                    valueType: 'select',
                    valueEnum: formatMap,
                    width: 'xs',
                    formItemProps: { rules: [{ required: pac.status }] }
                  },
                  {
                    dataIndex: ['pac', 'url'],
                    width: 'md',
                    formItemProps: { rules: [{ required: pac.status }] }
                  },
                  {
                    dataIndex: ['pac', 'proxy'],
                    valueType: 'select',
                    valueEnum: proxyMap,
                    width: 'xs',
                    formItemProps: { rules: [{ required: pac.status }] }
                  }
                ]
              }
            ]
          },
          {
            renderFormItem: (_, __) => (
              <Button loading={loading} onClick={fetchExternalData}>
                获取
              </Button>
            )
          }
        ]
      },
      {
        title: '每日更新',
        dataIndex: ['pac', 'day'],
        valueType: 'switch'
      },
      {
        valueType: 'dependency',
        name: [
          ['pac', 'status'],
          ['pac', 'url']
        ],
        columns: ({ pac }) => [
          {
            dataIndex: ['pac', 'value'],
            valueType: 'code',
            formItemProps: {
              rules: [{ required: pac.status && pac.url }],
              wrapperCol: { span: 18, offset: 3 }
            },
            fieldProps: { autoSize: { minRows: 10, maxRows: 10 } }
          }
        ]
      }
    ]
  }

  return <Form {...options} style={{ flex: 2 }} />
}
