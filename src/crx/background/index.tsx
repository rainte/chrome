import bookmark from '@/services/bookmark'

console.log('background')

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

bookmark.listener()
