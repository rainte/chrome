class Proxy {
  async set(value: chrome.proxy.ProxyConfig, callback?: () => void) {
    console.log('设置代理', value)
    callback && callback()
  }
}

export default new Proxy()
