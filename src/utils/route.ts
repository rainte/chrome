import { Location } from 'react-router-dom'

export default {
  toCrxTab: (url?: string) => {
    url = '/index.html#' + (url || '')
    console.log('toCrxTab', url)
    chrome.tabs.create({ url: chrome.runtime.getURL(url) })
  },
  add: (location: Location<any>, params: Record<string, string>) => {
    const data = new URLSearchParams(location.search)
    Object.entries(params).map((item) => data.set(...item))
    return `${location.pathname}?${data.toString()}`
  }
}
