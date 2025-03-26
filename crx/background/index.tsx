import notice from '@/services/notice'
import proxy from '@/services/proxy'

console.log('background')

chrome.runtime.onStartup.addListener(() => {
  console.log('background onStartup')

  proxy.get().then(async (res) => {
    if (res.use) {
      const rule = res.rules?.find((item) => item.id == res.use)
      rule.day && proxy.setProxy(await proxy.getProxyConfig(res.use))
    }
  })
})

chrome.runtime.onInstalled.addListener(() => {
  console.log('background onInstalled')
})

chrome.action.onClicked.addListener((tab) => {
  console.log('background onClicked')

  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    files: ['content.js']
  })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('background onMessage', request, sender, sendResponse)

  chrome.tabs.query({ currentWindow: true, active: true }).then(() => {
    sendResponse({ ok: true })
  })
})

chrome.bookmarks.onCreated.addListener(notice.send())
chrome.bookmarks.onChanged.addListener(notice.send())
chrome.bookmarks.onRemoved.addListener(notice.send())
chrome.bookmarks.onMoved.addListener(notice.send())
