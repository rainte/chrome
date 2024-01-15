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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background onMessage', message, sender)

  chrome.tabs.query({ currentWindow: true, active: true }, () => {
    sendResponse({ ok: true })
  })
})
