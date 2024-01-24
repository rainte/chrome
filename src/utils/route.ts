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
  add: (location: Location<any>, args: { key: string; value: string }[]) => {
    const data = new URLSearchParams(location.search)
    args.map((item) => data.set(item.key, item.value))
    return `${location.pathname}?${data.toString()}`
  }
}
