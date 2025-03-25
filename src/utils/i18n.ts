const i18nWeb = {
  get: (messageName: string, substitutions?: string[] | string) => {
    console.log('i18nWeb.get', messageName, substitutions)
    return messageName
  }
}

const isDev = import.meta.env.MODE == 'development'
const i18n = isDev ? i18nWeb : { get: chrome.i18n.getMessage }
export default i18n
