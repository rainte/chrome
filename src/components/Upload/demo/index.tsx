import { useState } from 'react'
import Form, { FormProps, useForm } from '@/components/Form'
import Upload from '@/components/Upload'
import { gist, SetProps, HubEnum, } from '@/utils/octokit'
import { toBlob } from '@/utils/file'
import { onUpload } from '@/utils/mate'
import { popup } from '@/utils/show'
import scss from './index.module.scss'

export default () => {
  const [loading, setLoading] = useState(true)
  const [newTabBgImgHas, setNewTabBgImgHas] = useState(false)
  const setNewTabBgImg = (files: any[]) => {
    props.form?.setFieldValue('newTabBgImg', files)
  }

  const request = () => {
    return gist
      .get()
      .then((res) => {
        if (res[HubEnum.Tab]) {
          const url = res[HubEnum.Tab]?.content
          if (url) {
            const thumbUrl = URL.createObjectURL(toBlob(url))
            setNewTabBgImgHas(true)
            setNewTabBgImg([{ url, thumbUrl }])
          }
        }
        return res
      })
      .then((res) => JSON.parse(res[HubEnum.Tab]?.content || '{}'))
      .finally(() => setLoading(false))
  }

  const onFinish = (data: any) => {
    const { newTabBgImg, ...formData } = data
    const files: SetProps[] = []
    files.push({ key: HubEnum.Tab, data: JSON.stringify(formData) })
    if (newTabBgImg && newTabBgImg.length) {
      files.push({ key: HubEnum.Tab, data: newTabBgImg[0].url })
    } else {
      newTabBgImgHas && files.push({ key: HubEnum.Tab, data: null })
    }
    return gist.set(files).then(() => popup.success())
  }

  const props: FormProps = {
    form: useForm(),
    request,
    onFinish,
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
              onChange={({ fileList }) => setNewTabBgImg(fileList)}
            />
          )
        }
      }
    ]
  }

  return <Form {...props} />
}
