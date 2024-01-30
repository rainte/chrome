export type ChromeSettingSetDetails = chrome.types.ChromeSettingSetDetails

export default {
  set: (config: ChromeSettingSetDetails) => {
    chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {})
  }
}
