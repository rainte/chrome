const onUpload = async (options: any) => {
  const { file, onProgress, onSuccess } = options

  let percent = 0
  const timer = setInterval(() => {
    percent += Math.floor(Math.random() * 10)
    percent >= 100 && (percent = 99)
    onProgress({ percent })
  }, 100)

  file.url = URL.createObjectURL(file)

  onSuccess?.({ url: file.url })
  clearInterval(timer)
}

const toCrxTab = (url?: string) => {
  url = '/index.html#' + (url || '')
  console.log('toCrxTab', url)
  chrome.tabs.create({ url: chrome.runtime.getURL(url) })
}

const tabDo = (callback: (tabs: chrome.tabs.Tab[]) => any) =>
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
    tabs && tabs[0] && callback(tabs)
  })

export default {
  onUpload,
  toCrxTab,
  tabDo
}
