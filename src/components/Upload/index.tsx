import { Upload, UploadFile, Flex, Typography, Spin, UploadProps as AntUploadProps } from 'antd'
import { AiOutlinePlus } from 'react-icons/ai'

export type { UploadFile } from 'antd'
export type UploadProps = AntUploadProps & { loading?: boolean }

const style = (num: number) => ({
  fontSize: `calc(var(--ant-control-height-lg) * ${num})`
})

const onPreview = async (file: UploadFile) => {
  const src = file.url as string
  const style = 'max-width: 100%; display: block; margin: auto;'
  const image = new Image()
  image.src = src
  image.setAttribute('style', style)
  window.open(src)?.document?.write(image.outerHTML)
}

export default function App(props: UploadProps) {
  const { fileList = [], maxCount = 1, loading, disabled } = props

  return (
    <Upload {...props} disabled={disabled === undefined ? loading : disabled}>
      {fileList.length < maxCount && (
        <Flex vertical align="center" justify="center">
          {loading ? (
            <Spin />
          ) : (
            <>
              <AiOutlinePlus style={style(0.3)} />
              <Typography.Text style={style(0.25)}>点击上传</Typography.Text>
            </>
          )}
        </Flex>
      )}
    </Upload>
  )
}

App.defaultProps = {
  listType: 'picture-card',
  onPreview
}
