export const toBase64 = (blob: Blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result)
    reader.onerror = (event) => reject(event.target?.error)
    reader.readAsDataURL(blob)
  }).then((res) => res as string)
}

export const toBlob = (base64: string) => {
  if (!base64.includes(',')) return
  const character = atob(base64.split(',')[1])
  const bytes = []
  for (let i = 0; i < character.length; i++) {
    bytes.push(character.charCodeAt(i))
  }
  return new Blob([new Uint8Array(bytes)])
}

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
