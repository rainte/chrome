import messages from '@/../public/_locales/zh_CN/messages.json'

class I18n {
  get(messageName: string, _?: string | string[]) {
    return (messages as Record<string, { message: string }>)[messageName].message
  }
}

export default new I18n()
