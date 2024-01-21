import { useState, useEffect } from 'react'
import Form, { FormProps, useForm } from '@/components/Form'
import Upload, { percentTimer } from '@/components/Upload'
import hub, { HubEnum, FileEnum } from '@/utils/hub'
import { toBlob } from '@/utils/file'
import { popup } from '@/utils/show'
import scss from './index.module.scss'

export default () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    hub.get(HubEnum.Tab).then((config) => props.form?.setFieldsValue(config))
  }, [])

  useEffect(() => {
    hub.file
      .get(FileEnum.NewTabBgImg)
      .then((base64) => {
        const url = URL.createObjectURL(toBlob(base64))
        setNewTabBgImg([{ url, thumbUrl: url }])
      })
      .finally(() => setLoading(false))
  }, [])

  const onUpload = ({ file, onProgress, onSuccess, onError }: any) => {
    const timer = percentTimer(onProgress)

    hub.file
      .set(FileEnum.NewTabBgImg, file)
      .then((url) => {
        file.url = file.thumbUrl = url
        file.status = 'done'
        onSuccess?.(file, url)
      })
      .catch((res) => {
        file.status = 'error'
        onError?.(file, res)
      })
      .finally(() => clearInterval(timer))
  }

  const onRemove = (file: any) => {
    hub.file.set(FileEnum.NewTabBgImg, null)
  }

  const setNewTabBgImg = (files: any[]) => {
    props.form?.setFieldValue('newTabBgImg', files)
  }

  const props: FormProps = {
    form: useForm(),
    request: () => hub.get(HubEnum.Tab),
    onFinish: (data) => {
      const { newTabBgImg, ...formData } = data
      console.log('ssss', HubEnum.Tab, formData)
      return hub.set(HubEnum.Tab, formData).then(() => popup.success())
    },
    columns: [
      {
        title: '开启',
        dataIndex: 'status',
        valueType: 'switch'
      },
      {
        title: '背景图',
        dataIndex: 'newTabBgImg',
        renderFormItem: (_, { defaultRender, ...props }) => {
          return (
            <Upload
              loading={loading}
              className={scss.upload}
              fileList={props.value}
              customRequest={onUpload}
              onRemove={() => {
                hub.file.set(FileEnum.NewTabBgImg)
              }}
              onChange={({ fileList }) => setNewTabBgImg(fileList)}
            />
          )
        }
      }
    ]
  }

  return <Form {...props} />
}
