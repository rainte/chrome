import { Location } from 'react-router-dom'

export default {
  open: (url?: string | URL, target?: string, features?: string) => {
    target = target || '_blank'
    window.open(url, target, features)
  },
  toCrxTab: (url?: string) => {
    url = '/index.html#' + (url || '')
    chrome.tabs.create({ url: chrome.runtime.getURL(url) })
  },
  get: (location: Location<any>, key: string, defaultValue?: any) => {
    const data = new URLSearchParams(location.search)
    return data.get(key) || defaultValue
  },
  add: (location: Location<any>, params: Record<string, string>) => {
    const data = new URLSearchParams(location.search)
    Object.entries(params).map((item) => data.set(...item))
    return `${location.pathname}?${data.toString()}`
  }
}
