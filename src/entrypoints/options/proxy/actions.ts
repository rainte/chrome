import { proxyState } from '@/utils/storage'
import { downloadGfwList } from '@/lib/gfwlist'
import type { FixedProxy, PacProxy, ProxySettings } from '@/utils/proxy'

export enum ProxyKind {
  Fixed = 'fixed',
  Pac = 'pac'
}

export type ProxyEditorProps = {
  item?: FixedProxy | PacProxy
  settings?: ProxySettings
  onSave: (kind: ProxyKind, item: PacProxy) => void
}

export const loadProxySettings = () => proxyState.getValue()

export const saveProxySettings = (state: ProxySettings) => proxyState.setValue(state)

export const fetchGfwList = async (url: string): Promise<PacProxy['gfwlist']> => {
  const text = await downloadGfwList(url)
  return { text, updatedAt: new Date().toISOString() }
}
