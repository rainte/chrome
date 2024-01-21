import { CSSProperties } from 'react'
import { Upload, UploadFile, Flex, Typography, Spin, UploadProps as AntUploadProps } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import scss from './index.module.scss'

export type { UploadFile } from 'antd'
export type UploadProps = AntUploadProps & {
  loading?: boolean
  iconStyle?: CSSProperties
  textStyle?: CSSProperties
}

export const percentTimer = (onProgress: any) => {
  let percent = 0
  return setInterval(() => {
    percent += Math.floor(Math.random() * 10)
    percent >= 100 && (percent = 99)
    onProgress({ percent })
  }, 100)
}

const onPreview = async (file: UploadFile) => {
  let src = file.url as string

  const tab = window.open(src)
  const image = new Image()
  image.src = src
  image.setAttribute('style', 'max-width: 100%; display: block; margin: auto;')
  tab?.document?.write(image.outerHTML)
}

const dom = (props: UploadProps) => {
  const { fileList = [], maxCount = 1, loading, disabled } = props
  const uploadButton = (
    <Flex vertical align="center" justify="center">
      {loading ? (
        <Spin />
      ) : (
        <>
          <PlusOutlined style={props.iconStyle} />
          <Typography.Text style={props.textStyle}>点击上传</Typography.Text>
        </>
      )}
    </Flex>
  )

  return (
    <Upload {...props} disabled={disabled === undefined ? loading : disabled}>
      {fileList.length >= maxCount ? null : uploadButton}
    </Upload>
  )
}

export default dom

dom.defaultProps = {
  className: scss.upload,
  listType: 'picture-card',
  onPreview
}
