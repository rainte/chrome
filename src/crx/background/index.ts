chrome.runtime.onInstalled.addListener(() => {
  console.log('background onInstalled')
  chrome.action.disable()
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { schemes: ['https'] }
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
      }
    ])
  })
})

chrome.action.onClicked.addListener((tab) => {
  console.log('background onClicked')
  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    files: ['content.js']
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background onMessage')
  chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
    sendResponse({ ok: true })
  })
})
