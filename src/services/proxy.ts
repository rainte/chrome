import { http } from '@rainte/js'
import storage, { StorageEnum } from '@/services/storage'
import { gfwlistToPAC, gfwlistToPACProps } from '@/services/gfwlist'

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
  get()
    .then((res) => {
      res.rules ??= []
      return res
    })
    .then((res) =>
      res.rules?.reduce(
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

export const _setProxy = async (value: ProxyConfig, callback?: () => void) => {
  const context = await chrome.runtime.getContexts({})
  const scope = context[0]?.incognito ? 'incognito_persistent' : 'regular'

  console.log('设置代理', { value, scope })
  return chrome.proxy.settings.set({ value, scope }, () => {
    if (chrome.runtime.lastError) {
      console.error('设置代理失败', chrome.runtime.lastError)
    } else {
      console.info('代理设置成功！', value, scope)
      callback && callback()
    }
  })
}

export const setProxy = async (id: string): Promise<void> => {
  let mode: string = ModeEnum.Direct
  let rules = undefined
  let pacScript = undefined

  if (id == direct.id) {
    mode = ModeEnum.Direct
  } else if (id == system.id) {
    mode = ModeEnum.System
  } else {
    const all = await get()

    const fixeds = all?.rules?.filter((item) => item.mode == ModeEnum.FixedServers)
    fixeds?.unshift(direct)
    const rule = all?.rules?.find((item) => item.id == id)
    if (rule.mode == ModeEnum.FixedServers) {
      mode = ModeEnum.FixedServers
      rules = makeFixedConfig(rule)
      _setProxy({ mode, rules })
    } else if (rule.mode == ModeEnum.PacScript) {
      const proxy = fixeds?.find((item) => item.id == rule.default)

      _setProxy({ mode: ModeEnum.FixedServers, rules: makeFixedConfig(proxy) }, async () => {
        mode = ModeEnum.PacScript
        pacScript = { data: await makePacConfig(rule, [direct, ...(fixeds ?? [])]) }
        _setProxy({ mode, pacScript })
      })
    }
  }
}

export const fetchPacData = (url: string, format: string) => {
  return http.axios
    .get(url)
    .then((res) => res.data)
    .then((data) => (format == 'base64' ? atob(data) : data))
}

export default {
  direct,
  system,
  get,
  set,
  getFixedModes,
  getAllModes,
  _setProxy,
  setProxy
}

const makeFixedConfig = (rule: any): chrome.proxy.ProxyRules => {
  return {
    singleProxy: {
      scheme: 'PROXY' == rule.scheme ? 'http' : rule.scheme?.toLocaleLowerCase(),
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
  const rules = config.rules
    .filter((item: any) => item.stauts)
    .map((item: any) => {
      const proxy = fixedProxy(fixeds, item.proxy)
      return { rule: item.value, proxy }
    })

  const gfwlist: gfwlistToPACProps = {
    proxy: fixedProxy(fixeds, config.default),
    rules
  }
  if (config.pac.status) {
    gfwlist.data = await fetchPacData(config.pac.url, config.pac.format)
    console.log('fetchPacData', gfwlist.data)
  }

  return gfwlistToPAC(gfwlist)
}

const fixedProxy = (fixeds: any[], id: any) => {
  if (id == direct.id) {
    return 'DIRECT'
  }

  const proxy = fixeds.find((item) => item.id == id)
  return `${proxy.scheme} ${proxy.host}:${proxy.port}`
}
