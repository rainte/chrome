import { useEffect, useState } from 'react'
import { Form, FormProps } from '@rainte/ant'
import { Space, Input, Button, Typography } from 'antd'
import storage, { StorageEnum } from '@/services/storage'
import gist from '@/services/gist'
import backup from '@/services/backup'
import { date } from '@rainte/js'
import { popup } from '@/utils/show'

const linkButton = (label: string, url: string) => (
  <Typography.Link href={url} target="_blank">
    <Button>{label}</Button>
  </Typography.Link>
)

enum LoadingEnum {
  Save = 'save',
  Upload = 'upload',
  Down = 'down'
}

export default function App() {
  const [info, setInfo] = useState<any>()
  const [loading, setLoading] = useState({
    [LoadingEnum.Save]: false,
    [LoadingEnum.Upload]: false,
    [LoadingEnum.Down]: false
  })

  useEffect(() => {
    refresh()
  }, [])

  const refresh = () => backup.info().then(setInfo)

  const setLoadingStates = (type: LoadingEnum, isLoading: boolean) => {
    setLoading((prev) => ({ ...prev, [type]: isLoading }))
  }

  const addGist = () => {
    const githubToken = props.form?.getFieldValue?.('githubToken')
    githubToken || popup.error('先填写 Github Token')

    popup.ask(() => {
      setLoadingStates(LoadingEnum.Save, true)
      gist
        .add(githubToken)
        .then((res) => {
          props.form?.setFieldValue?.('githubToken', res.id)
          props.form?.setFieldValue?.('gistId', res.id)
        })
        .finally(() => setLoadingStates(LoadingEnum.Save, false))
    })
  }

  const onRequest = () => storage.get(StorageEnum.CRX).then((res) => res ?? {})

  const onFinish = (data: any) => {
    storage.set(StorageEnum.CRX, data).then(() => popup.success())
  }

  const onUpload = () => {
    popup.ask(() => {
      setLoadingStates(LoadingEnum.Upload, true)
      backup
        .upload()
        .then(() => {
          refresh()
          popup.success()
        })
        .finally(() => setLoadingStates(LoadingEnum.Upload, false))
    })
  }

  const onDown = () => {
    popup.ask(() => {
      setLoadingStates(LoadingEnum.Down, true)
      backup
        .down()
        .then(() => popup.success())
        .finally(() => setLoadingStates(LoadingEnum.Down, false))
    })
  }

  const props: FormProps = {
    form: Form.useForm(),
    request: onRequest,
    onFinish: onFinish,
    wrapperCol: { span: 10 },
    columns: [
      {
        formItemProps: { wrapperCol: { offset: 3 } },
        renderFormItem: () => {
          return (
            <Space style={{ width: '100%' }}>
              <Space.Compact style={{ width: '100%' }}>
                <Button onClick={onUpload} loading={loading[LoadingEnum.Upload]}>
                  上传备份
                </Button>
                <Button onClick={onDown} loading={loading[LoadingEnum.Down]}>
                  覆盖本地
                </Button>
              </Space.Compact>
              <Typography.Text>
                {info?.updated_at && date.dayjs(info.updated_at).format(date.FORMAT.DATETIME)}
              </Typography.Text>
            </Space>
          )
        }
      },
      {
        title: 'Github Token',
        dataIndex: 'githubToken',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, { value, onChange }) => {
          return (
            <Space.Compact style={{ width: '100%' }}>
              <Input value={value} onChange={onChange} />
              {linkButton('Get Github Token', 'https://github.com/settings/tokens/new')}
            </Space.Compact>
          )
        }
      },
      {
        title: 'Gist ID',
        dataIndex: 'gistId',
        formItemProps: { rules: [{ required: true }] },
        renderFormItem: (_, { value, onChange }) => {
          return (
            <Space.Compact style={{ width: '100%' }}>
              <Input value={value} onChange={onChange} />
              <Button onClick={addGist} loading={loading[LoadingEnum.Save]}>
                自动生成
              </Button>
              {linkButton('手动生成', 'https://gist.github.com')}
            </Space.Compact>
          )
        }
      }
    ]
  }

  return <Form {...props} />
}
