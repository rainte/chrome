import * as crx from './chrome'
import * as web from './web'

export enum SyncEnum {
  CRX = 'crx',
  Proxy = 'proxy'
}

export enum DbEnum {
  Tab = 'tab'
}

export default import.meta.env.MODE == 'development' ? web : crx
