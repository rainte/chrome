// UUID v5（RFC 4122），与 Python uuid.uuid5 输出完全一致
// NAMESPACE_URL 是 RFC 4122 标准命名空间之一。
// 这里必须与原 Python 脚本 uuid.uuid5(uuid.NAMESPACE_URL, …) 保持一致，
// 否则同一本书会生成不同的 dc:identifier，破坏字节级可复现性。
const DEFAULT_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'

export async function uuidV5(name: string, namespace: string = DEFAULT_NAMESPACE): Promise<string> {
  const nsBytes = hexToBytes(namespace.replace(/-/g, ''))
  const nameBytes = new TextEncoder().encode(name)

  const data = new Uint8Array(nsBytes.length + nameBytes.length)
  data.set(nsBytes, 0)
  data.set(nameBytes, nsBytes.length)

  const hashBuf = await crypto.subtle.digest('SHA-1', data)
  const bytes = new Uint8Array(hashBuf).slice(0, 16)

  // 用 DataView 改写版本位和变体位，避免 noUncheckedIndexedAccess 报错
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  view.setUint8(6, (view.getUint8(6) & 0x0f) | 0x50) // version 5
  view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80) // variant

  const h = bytesToHex(bytes)
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16)
  }
  return out
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}
