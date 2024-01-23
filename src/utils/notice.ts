export enum NoticeEnum {
  Bookmark = 'Bookmark'
}

export type NoticeProps = {
  type: NoticeEnum
  text: any
}

export default {
  send: (type: NoticeEnum, text?: any) =>
    chrome.runtime.sendMessage({
      type,
      text
    })
}
