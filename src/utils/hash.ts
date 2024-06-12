import jsan from 'jsan'

const SHA256 = (input: unknown) => {
  const json = jsan.stringify(input, undefined, undefined, true)
  const data = new TextEncoder().encode(json)

  return crypto.subtle.digest('SHA-256', data).then((buffer: any) => {
    return Array.from(new Uint8Array(buffer))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  })
}

export default {
  SHA256: SHA256
}
