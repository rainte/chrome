import { browser, type Browser } from '#imports'
import { ProxyActionEnum as ProxyAction, parseCompressedGfwList } from './gfwlist'

export { ProxyAction }

export interface FixedProxy {
  id: string
  name: string
  host: string
  scheme: `${Browser.proxy.Scheme}`
  port: number
}

export interface PacRule {
  pattern: string
  action: `${ProxyAction.Direct | ProxyAction.Proxy}`
}

export interface PacProxy {
  id: string
  name: string
  fixedProxyId: string
  rules: PacRule[]
  gfwUrl: string
  gfwlist?: {
    text: string
    updatedAt: string
  }
}

export interface ProxySettings {
  activeId: string
  fixedProxies: FixedProxy[]
  pacProxies: PacProxy[]
}

export function toBrowserProxy(state: ProxySettings): Browser.proxy.ProxyConfig {
  if (state.activeId === ProxyAction.Direct) {
    return { mode: browser.proxy.Mode.DIRECT }
  }

  const fixed = state.fixedProxies.find((p) => p.id === state.activeId)
  if (fixed) {
    return {
      mode: browser.proxy.Mode.FIXED_SERVERS,
      rules: {
        singleProxy: { scheme: fixed.scheme, host: fixed.host, port: fixed.port },
        bypassList: ['localhost', '127.0.0.1', '192.168.*']
      }
    }
  }

  const pac = state.pacProxies.find((p) => p.id === state.activeId)
  if (pac) {
    const upstream = state.fixedProxies.find((f) => f.id === pac.fixedProxyId)
    if (!upstream) return { mode: browser.proxy.Mode.DIRECT }

    const proxy = `PROXY ${upstream.host}:${upstream.port}`

    const rulesCode = pac.rules
      .map((r) => {
        const result = r.action === ProxyAction.Proxy ? proxy : 'DIRECT'
        return `if (host === '${r.pattern}' || dnsDomainIs(host, '.${r.pattern}')) return '${result}';`
      })
      .join('\n  ')

    const cache = pac.gfwlist
    const gfwRules = cache ? parseCompressedGfwList(cache.text) : []

    const sortedGfw = [
      ...gfwRules.filter((r) => r.action === ProxyAction.Direct),
      ...gfwRules.filter((r) => r.action === ProxyAction.Proxy)
    ]

    const gfwCode = sortedGfw
      .map((r) => {
        const result = r.action === ProxyAction.Proxy ? proxy : 'DIRECT'
        return `if (host === '${r.host}' || dnsDomainIs(host, '.${r.host}')) return '${result}';`
      })
      .join('\n  ')

    return {
      mode: browser.proxy.Mode.PAC_SCRIPT,
      pacScript: {
        data: `function FindProxyForURL(url, host) {
  ${rulesCode}
  ${gfwCode}
  return 'DIRECT';
}`
      }
    }
  }

  return { mode: browser.proxy.Mode.DIRECT }
}

export async function applyProxy(state: ProxySettings) {
  const value = toBrowserProxy(state)
  console.log('Switch proxy mode', value.mode)
  await browser.proxy.settings.set({
    value: value,
    scope: 'regular'
  })
}
