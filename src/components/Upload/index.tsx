import { Upload, UploadFile, Flex, Typography, Spin, UploadProps as AntUploadProps } from 'antd'
import { PlusOutlined } from '@ant-design/icons'

export type { UploadFile } from 'antd'
export type UploadProps = AntUploadProps & { loading?: boolean }

const size = (num: number) => `calc(var(--ant-control-height-lg) * ${num})`
const style = (num: number) => ({ fontSize: size(num) })

const onPreview = async (file: UploadFile) => {
  const src = file.url as string
  const style = 'max-width: 100%; display: block; margin: auto;'
  const image = new Image()
  image.src = src
  image.setAttribute('style', style)
  window.open(src)?.document?.write(image.outerHTML)
}

const dom = (props: UploadProps) => {
  const { fileList = [], maxCount = 1, loading, disabled } = props

  return (
    <Upload {...props} disabled={disabled === undefined ? loading : disabled}>
      {fileList.length >= maxCount ? null : (
        <Flex vertical align="center" justify="center">
          {loading ? (
            <Spin />
          ) : (
            <>
              <PlusOutlined style={style(0.3)} />
              <Typography.Text style={style(0.25)}>点击上传</Typography.Text>
            </>
          )}
        </Flex>
      )}
    </Upload>
  )
}

export default dom

dom.defaultProps = {
  listType: 'picture-card',
  onPreview
}
