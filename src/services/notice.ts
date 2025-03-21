export const send =
  (text: string = '!', color: string | chrome.action.ColorArray = 'red') =>
  () =>
  () => {
    chrome.action.setBadgeText({ text })
    chrome.action.setBadgeBackgroundColor({ color })
  }

export const clear = () => chrome.action.setBadgeText({ text: '' })

export default {
  send,
  clear
}
