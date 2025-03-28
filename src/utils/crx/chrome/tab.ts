class Tab {
  add(url?: string) {
    url = '/index.html#' + (url ?? '')
    return chrome.tabs.create({ url: chrome.runtime.getURL(url) })
  }
  todo(callback: (tabs: chrome.tabs.Tab[]) => any) {
    const info = { active: true, currentWindow: true }
    chrome.tabs.query(info, (tabs: chrome.tabs.Tab[]) => {
      tabs && tabs[0] && callback(tabs ?? [])
    })
  }
  reload(tabs: chrome.tabs.Tab[]) {
    return tabs[0]?.id && chrome.tabs.reload(tabs[0].id)
  }
}

export default new Tab()
