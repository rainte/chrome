export const toBase64 = (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result as string)
    reader.onerror = (event) => reject(event.target?.error)
    reader.readAsDataURL(blob)
  })
}

export const toBlob = (base64: string) => {
  const character = atob(base64.split(',')[1])
  const bytes = []
  for (let i = 0; i < character.length; i++) {
    bytes.push(character.charCodeAt(i))
  }
  return new Blob([new Uint8Array(bytes)])
}
