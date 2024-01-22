export default {
  open: (url?: string | URL, target?: string, features?: string) => {
    target = target || '_blank'
    window.open(url, target, features)
  },
  toCrxTab: (url?: string) => {
    url = '/index.html#' + (url || '')
    chrome.tabs.create({ url: chrome.runtime.getURL(url) })
  }
}
