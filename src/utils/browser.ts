export const i18n = {
  get: (messageName: string, substitutions?: string[] | string) => {
    console.log('chrome', chrome)
    return chrome.i18n.getMessage(messageName, substitutions)
  }
}
