class Tab {
  async add(url?: string) {
    location.href = '/#' + (url ?? '/')
  }
  todo(callback: (tabs: chrome.tabs.Tab[]) => any) {
    return callback([{ url: location.href }] as chrome.tabs.Tab[])
  }
  async reload(_: chrome.tabs.Tab[]) {
    location.reload()
  }
}

export default new Tab()
