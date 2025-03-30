import { http } from '@rainte/js'
import crx, { SyncEnum } from '@/utils/crx'
import gfwlist from '@/utils/gfwlist'

export enum ModeEnum {
  Direct = 'direct',
  System = 'system',
  AutoDetect = 'auto_detect',
  FixedServers = 'fixed_servers',
  PacScript = 'pac_script'
}

export type ProxyProps = {
  use?: string
  rules?: any[]
}

const direct = { id: ModeEnum.Direct, name: '直连' }
const system = { id: ModeEnum.System, name: '系统代理' }

const get = (): Promise<ProxyProps> => crx.sync.getItem(SyncEnum.Proxy).then((res) => res ?? {})

const set = (data: any) => crx.sync.setItem(SyncEnum.Proxy, data)

const allRules = (): Promise<any[]> => {
  return get().then((res) => res?.rules ?? [])
}

const fixedRules = () => {
  return allRules()
    .then((rules) => rules.filter((item) => item.mode == ModeEnum.FixedServers))
    .then((res) => [direct, ...res])
}

const groupRules = () => {
  return allRules().then((rules) => {
    return rules?.reduce(
      (acc, item) => {
        if (item.mode == ModeEnum.FixedServers) {
          acc.fixed.push(item)
        } else if (item.mode == ModeEnum.PacScript) {
          acc.pac.push(item)
        }
        return acc
      },
      { fixed: [], pac: [] }
    )
  })
}

const setUse = (id: string) => {
  return crx.sync.getItem(SyncEnum.Proxy).then((res) => {
    crx.sync.setItem(SyncEnum.Proxy, { ...res, use: id })
  })
}

const addRule = (id: string, domain: string, proxy: string) => {
  return allRules().then((rules) => {
    rules.forEach((item) => {
      if (item.id == id) {
        const rule = { status: true, mode: 'domain', value: domain, proxy }
        item.rules ??= []
        item.rules.push(rule)
      }
    })
    crx.sync.setItem(SyncEnum.Proxy, { rules, use: id })
  })
}

const makeConfig = async (id: string) => {
  let mode: string = ModeEnum.Direct
  let rules = undefined
  let pacScript = undefined

  if (id == direct.id) {
    mode = ModeEnum.Direct
  } else if (id == system.id) {
    mode = ModeEnum.System
  } else {
    const all = await allRules()
    const rule = all.find((item) => item.id == id)

    if (rule.mode == ModeEnum.FixedServers) {
      mode = ModeEnum.FixedServers
      rules = makeFixedConfig(rule)
    } else if (rule.mode == ModeEnum.PacScript) {
      const fixeds = await fixedRules()
      mode = ModeEnum.PacScript
      pacScript = { data: await makePacConfig(rule, fixeds) }
    }
  }

  return { mode, rules, pacScript }
}

const fetchPac = (url: string, format?: string) => {
  return http.axios
    .get(url)
    .then((res) => res.data)
    .then((data) => (format == 'base64' ? atob(data) : data))
}

export const downPac = async (id: string) => {
  const config = await makeConfig(id)
  gfwlist.toPacFile(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pac</title>
    <script>
      ${config.pacScript?.data}
      const res = FindProxyForURL('https://www.google.com/search?q=demo', 'www.google.com')
      console.log('res', res)
    </script>
  </head>
  <body></body>
</html>
`)
}

const makeFixedConfig = (rule: any) => {
  return {
    singleProxy: {
      scheme: 'PROXY' == rule.scheme ? 'http' : rule.scheme?.toLocaleLowerCase(),
      host: rule.host,
      port: rule.port
    },
    bypassList: (rule.bypassList as string)
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  }
}

const makePacConfig = async (config: any, fixeds: any[]) => {
  const rules = ((config.rules as any[]) ?? [])
    .filter((item) => item.status)
    .map((item) => {
      const proxy = makeProxy(fixeds, item.proxy)
      return { rule: item.value, proxy }
    })

  return gfwlist.toPacRule({
    rules,
    proxy: makeProxy(fixeds, config.pac.proxy),
    defaultProxy: makeProxy(fixeds, config.default),
    data: config.pac.status ? await fetchPac(config.pac.url, config.pac.format) : undefined
  })
}

const makeProxy = (fixeds: any[], id: any) => {
  if (id == ModeEnum.Direct) {
    return 'DIRECT'
  }

  const proxy = fixeds.find((item) => item.id == id)
  return `${proxy.scheme} ${proxy.host}:${proxy.port}`
}

export default {
  direct,
  system,
  get,
  set,
  allRules,
  fixedRules,
  groupRules,
  setUse,
  addRule,
  makeConfig,
  fetchPac,
  downPac
}
