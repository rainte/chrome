import { downloadGfwList } from '@/lib/gfwlist'
import type { FixedProxy, PacProxy, ProxySettings } from '@/utils/proxy'
import { proxyState } from '@/utils/storage'

export const DEFAULT_FIXED_PROXY: FixedProxy = {
  id: '',
  name: '',
  scheme: 'http',
  host: '127.0.0.1',
  port: 1080
}

export const DEFAULT_PAC_PROXY: PacProxy = {
  id: '',
  name: '',
  fixedProxyId: '',
  rules: [],
  gfwUrl: ''
}

export enum ProxyKind {
  Fixed = 'fixed',
  Pac = 'pac'
}

export type ProxyEditorProps = {
  item?: FixedProxy | PacProxy
  settings?: ProxySettings
  onSave: (kind: ProxyKind, item: PacProxy) => void
}

export type Selection = { kind: ProxyKind; id: string } | null

export const loadProxySettings = () => proxyState.getValue()

export const saveProxySettings = (state: ProxySettings) => proxyState.setValue(state)

export const fetchGfwList = async (url: string): Promise<PacProxy['gfwlist']> => {
  const text = await downloadGfwList(url)
  return { text, updatedAt: new Date().toISOString() }
}
