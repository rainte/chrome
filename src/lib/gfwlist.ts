export enum ProxyActionEnum {
  Direct = 'direct',
  Proxy = 'proxy'
}

export type GfwRule = {
  host: string
  action: `${ProxyActionEnum.Direct | ProxyActionEnum.Proxy}`
}

export function compressGfwList(text: string): string {
  const lines = new Set<string>()

  for (const raw of text.split('\n')) {
    let line = raw.trim()
    if (!line || line.startsWith('!') || line.startsWith('[')) continue

    let prefix = ''
    if (line.startsWith('@@')) {
      prefix = '@@'
      line = line.slice(2).trim()
    }

    // 正则规则直接丢弃
    if (line.startsWith('/') && line.endsWith('/')) continue

    let host: string | undefined

    // ||example.com^ 或 ||example.com/path
    let m = line.match(/^\|\|([a-zA-Z0-9.-]+)(?:\^|\/|$)/)
    if (m) host = m[1]

    // |http://example.com 或 |https://example.com
    if (!host) {
      m = line.match(/^\|https?:\/\/([^/^]+)/i)
      if (m) host = m[1]
    }

    // .example.com 或裸域名 example.com
    if (!host) {
      m = line.match(/^\.?([a-zA-Z0-9.-]+\.[a-zA-Z0-9-]{2,})$/)
      if (m) host = m[1]
    }

    if (!host) continue
    lines.add(prefix + host.toLowerCase())
  }

  return Array.from(lines).join('\n')
}

export async function downloadGfwList(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GfwList download failed: ${res.status}`)

  const text = (await res.text()).trim()

  let decoded: string
  if (/^[A-Za-z0-9+/=\s]+$/.test(text) && text.length > 100) {
    const base64 = text.replace(/\s/g, '')
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    decoded = new TextDecoder().decode(bytes)
  } else {
    decoded = text
  }

  return compressGfwList(decoded)
}

export function parseCompressedGfwList(text: string): GfwRule[] {
  const rules: GfwRule[] = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('@@')) {
      rules.push({ host: line.slice(2), action: ProxyActionEnum.Direct })
    } else {
      rules.push({ host: line, action: ProxyActionEnum.Proxy })
    }
  }
  return rules
}
