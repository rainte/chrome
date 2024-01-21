import { useState, useEffect } from 'react'
import Upload, { UploadFile } from '@/components/Upload'
import hub, { FileEnum } from '@/utils/hub'
import scss from './index.module.scss'
import { toBlob } from '@/utils/file'

export default () => {
  const [loading, setLoading] = useState(true)
  const [files, setFiles] = useState<UploadFile[]>([])

  useEffect(() => {
    hub.file
      .get(FileEnum.NewTabBgImg)
      .then((base64) => {
        const url = URL.createObjectURL(toBlob(base64))
        setFiles([{ url: base64, thumbUrl: url }] as any)
      })
      .finally(() => setLoading(false))
  }, [])

  const rate = (percent: number, onProgress: any) => {
    return setInterval(() => {
      percent = (percent || 0) + Math.floor(Math.random() * 10)
      percent = percent >= 100 ? 99 : percent
      onProgress({ percent })
    }, 100)
  }

  const onFinish = ({ file, onProgress, onSuccess, onError }: any) => {
    const timer = rate(file.progress, onProgress)

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

  return (
    <Upload
      loading={loading}
      className={scss.upload}
      fileList={files}
      customRequest={onFinish}
      onChange={({ fileList }) => setFiles(fileList)}
    />
  )
}
