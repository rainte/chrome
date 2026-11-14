import { useEffect, useState } from 'react'
import { Flex } from 'antd'
import FixedProxyEditor from './FixedProxyEditor'
import PacProxyEditor from './PacProxyEditor'
import ProxySidebar, { type Selection } from './ProxySidebar'
import { fetchGfwList, loadProxySettings, ProxyKind, saveProxySettings } from './actions'
import type { FixedProxy, PacProxy, ProxySettings } from '@/utils/proxy'
import { antd } from '@rainte/ant'

const fixedInit: FixedProxy = {
  id: '',
  name: '',
  scheme: 'http',
  host: '127.0.0.1',
  port: 1080
}

const pacInit: PacProxy = {
  id: '',
  name: '',
  fixedProxyId: '',
  rules: [],
  gfwUrl: ''
}

export default function Proxy() {
  const [settings, setSettings] = useState<ProxySettings>()
  const [selection, setSelection] = useState<Selection>(null)

  useEffect(() => {
    loadProxySettings().then(setSettings)
  }, [])

  const updateSettings = async (next: ProxySettings) => {
    setSettings(next)
    await saveProxySettings(next)
  }

  const onSaved = async (kind: ProxyKind, item: FixedProxy | PacProxy) => {
    await antd.safeRun(async () => {
      if (kind === ProxyKind.Pac && 'gfwUrl' in item && item.gfwUrl) {
        item = { ...item, gfwlist: await fetchGfwList(item.gfwUrl) }
      }

      const state = await loadProxySettings()
      const key = kind === ProxyKind.Fixed ? 'fixedProxies' : 'pacProxies'
      const list = state[key] as Array<FixedProxy | PacProxy>

      const exists = list.some((p) => p.id === item.id)
      const next = exists ? list.map((p) => (p.id === item.id ? item : p)) : [...list, item]

      await updateSettings({ ...state, [key]: next })
    })
  }

  const selectedFixed = settings?.fixedProxies.find((p) => p.id === selection?.id)
  const selectedPac = settings?.pacProxies.find((p) => p.id === selection?.id)

  return (
    <Flex gap={16}>
      <ProxySidebar
        settings={settings}
        selection={selection}
        onSelect={setSelection}
        onAdd={(kind) => setSelection({ kind, id: crypto.randomUUID() })}
        onChange={updateSettings}
      />

      <Flex vertical style={{ flex: 1 }}>
        {selection?.kind === ProxyKind.Fixed && (
          <FixedProxyEditor
            key={selection.id}
            item={selectedFixed || { ...fixedInit, id: selection.id }}
            settings={settings}
            onSave={onSaved}
          />
        )}
        {selection?.kind === ProxyKind.Pac && (
          <PacProxyEditor
            key={selection.id}
            item={selectedPac || { ...pacInit, id: selection.id }}
            settings={settings}
            onSave={onSaved}
          />
        )}
      </Flex>
    </Flex>
  )
}
