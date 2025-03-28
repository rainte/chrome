class Action {
  send(text: string = '!', color: string | chrome.action.ColorArray = 'red') {
    return () => () => {
      chrome.action.setBadgeText({ text })
      chrome.action.setBadgeBackgroundColor({ color })
    }
  }
  clear() {
    return chrome.action.setBadgeText({ text: '' })
  }
}

export default new Action()
