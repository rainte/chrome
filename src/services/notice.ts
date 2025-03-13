export enum NoticeEnum {
  Bookmark = 'Bookmark'
}

export type NoticeProps = {
  type: NoticeEnum
  text: any
}

const send = (type: NoticeEnum, text?: any) => chrome.runtime.sendMessage({ type, text })

const clear = () => chrome.action.setBadgeText({ text: '' })

export default {
  send,
  clear
}
