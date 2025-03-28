export enum SyncEnum {
  CRX = 'crx',
  Proxy = 'proxy'
}

export enum DbEnum {
  Tab = 'tab'
}

const extension = {
  action: (await import('./chrome/action')).default,
  bookmark: (await import('./chrome/bookmark')).default,
  i18n: (await import('./chrome/i18n')).default,
  proxy: (await import('./chrome/proxy')).default,
  sync: (await import('./chrome/sync')).default,
  system: (await import('./chrome/system')).default,
  tab: (await import('./chrome/tab')).default
}

const web = {
  action: (await import('./web/action')).default,
  bookmark: (await import('./web/bookmark')).default,
  i18n: (await import('./web/i18n')).default,
  proxy: (await import('./web/proxy')).default,
  sync: (await import('./web/sync')).default,
  system: (await import('./web/system')).default,
  tab: (await import('./web/tab')).default
}

const isDev = import.meta.env.MODE == 'development'
export default isDev ? web : extension
