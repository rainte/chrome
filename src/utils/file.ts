export const percentTimer = (onProgress: any) => {
  let percent = 0
  return setInterval(() => {
    percent += Math.floor(Math.random() * 10)
    percent >= 100 && (percent = 99)
    onProgress({ percent })
  }, 100)
}

export const onUpload = async (options: any) => {
  const { file, onProgress, onSuccess } = options
  const timer = percentTimer(onProgress)

  file.thumbUrl = URL.createObjectURL(file)
  file.url = await toBase64(file)
  file.status = 'done'

  onSuccess?.(file, file.url)
  clearInterval(timer)
}
