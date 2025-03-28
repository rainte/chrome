class Proxy {
  async set(value: chrome.proxy.ProxyConfig, callback?: () => void) {
    const context = await chrome.runtime.getContexts({})
    const scope = context[0]?.incognito ? 'incognito_persistent' : 'regular'

    console.log('设置代理', value, scope)
    chrome.proxy.settings.set({ value, scope }, () => {
      if (chrome.runtime.lastError) {
        console.error('设置代理失败', chrome.runtime.lastError)
      } else {
        console.log('代理设置成功', value, scope)
        callback && callback()
      }
    })
  }
}

export default new Proxy()
