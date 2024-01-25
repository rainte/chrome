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
  console.log('onMessage', message, sender, sendResponse)
  onClear()

  chrome.tabs.query({ currentWindow: true, active: true }).then(() => {
    sendResponse({ ok: true })
  })
})

const onChanged = () => {
  chrome.action.setBadgeText({ text: '!' })
  chrome.action.setBadgeBackgroundColor({ color: 'red' })
}

const onClear = () => {
  chrome.action.setBadgeText({ text: '' })
}

chrome.bookmarks.onCreated.addListener(onChanged)
chrome.bookmarks.onChanged.addListener(onChanged)
chrome.bookmarks.onRemoved.addListener(onChanged)
chrome.bookmarks.onMoved.addListener(onChanged)
chrome.bookmarks.onImportBegan.addListener(onChanged)
chrome.bookmarks.onImportEnded.addListener(onChanged)
chrome.bookmarks.onChildrenReordered.addListener(onChanged)
