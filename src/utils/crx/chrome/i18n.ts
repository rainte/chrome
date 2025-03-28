class I18n {
  get(messageName: string, substitutions?: string | string[]) {
    return chrome.i18n.getMessage(messageName, substitutions)
  }
}

export default new I18n()
