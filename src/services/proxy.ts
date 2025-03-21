import storage, { StorageEnum } from '@/services/storage'

export type ProxyConfig = chrome.proxy.ProxyConfig

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

export const direct = { id: ModeEnum.Direct, name: '直连' }
export const system = { id: ModeEnum.System, name: '系统代理' }

export const get = () => storage.get<ProxyProps>(StorageEnum.Proxy).then((res) => res ?? {})

export const set = (data: ProxyProps) => storage.set(StorageEnum.Proxy, data)

export const getFixedModes = () => {
  return get()
    .then((modes) => modes.rules ?? [])
    .then((rules) => rules.filter((item) => item.mode == ModeEnum.FixedServers))
    .then((res) => [direct, ...(res ?? [])])
}

export const getAllModes = () =>
  get().then((res) =>
    res?.rules?.reduce(
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
  )

export const setProxy = async (value: ProxyConfig) => {
  const context = await chrome.runtime.getContexts({})
  const scope = context[0]?.incognito ? 'incognito_persistent' : 'regular'

  chrome.proxy.settings.set({ value, scope }, () => {
    if (chrome.runtime.lastError) {
      console.error('设置代理失败', chrome.runtime.lastError)
    } else {
      console.info('代理设置成功！', value, scope)
    }
  })
}

export const getProxyConfig = async (id: string): Promise<ProxyConfig> => {
  let mode: string = ModeEnum.Direct
  let rules = undefined
  let pacScript = undefined

  if (id == direct.id) {
    mode = ModeEnum.Direct
  } else if (id == system.id) {
    mode = ModeEnum.System
  } else {
    const all = await get()
    const rule = all?.rules?.find((item) => item.id == id)

    if (rule.mode == ModeEnum.FixedServers) {
      mode = ModeEnum.FixedServers
      rules = makeFixedConfig(rule)
    } else if (rule.mode == ModeEnum.PacScript) {
      mode = ModeEnum.PacScript
      const fixeds = all?.rules?.filter((item) => item.mode == ModeEnum.FixedServers)
      pacScript = { data: await makePacConfig(rule, fixeds ?? []) }
    }
  }

  return { mode, rules, pacScript }
}

export default {
  direct,
  system,
  get,
  set,
  getFixedModes,
  getAllModes,
  setProxy,
  getProxyConfig
}

const makeFixedConfig = (rule: any): chrome.proxy.ProxyRules => {
  return {
    singleProxy: {
      scheme: rule.scheme,
      host: rule.host,
      port: rule.port
    },
    bypassList: (rule.bypassList as string)
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item != '')
  }
}

const makePacConfig = async (config: any, fixeds: any[]) => {
  let pac = `function FindProxyForURL(url, host) {`
  config.rules.forEach((rule: any) => {
    const fixed = fixeds.find((item) => item.id == rule.proxy)
    const proxy = fixedProxy(fixed)
    if (rule.mode == 'domain') {
      pac += ` if (shExpMatch(host, "${rule.value}")) {return "${proxy}";}`
    } else if (rule.mode == 'regex') {
      pac += ` if (/${rule.value}/.test(host)) {return "${proxy}";}`
    } else if (rule.mode == 'ip') {
      const [ip, prefix] = rule.value.split('/')
      pac += ` if (isInNet(host, "${ip}", "${ipToNetmask(prefix)}")) {return "${proxy}";}`
    }
  })

  pac += ` return "${fixedProxy(config.default)}"; }`
  return pac
}

const ipToNetmask = (prefix: number) => {
  const mask = []
  for (let i = 0; i < 4; i++) {
    const bits = Math.min(prefix, 8)
    mask.push(256 - Math.pow(2, 8 - bits))
    prefix -= bits
  }
  return mask.join('.')
}

const fixedProxy = (proxy: any) => {
  if (proxy.id == direct.id) {
    return 'DIRECT'
  }
  return `${proxy.scheme} ${proxy.host}:${proxy.port}`
}
