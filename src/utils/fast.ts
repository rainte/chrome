import { fast, file as fastFile } from '@rainte/react'
import { Location } from 'react-router-dom'
import { message } from '@/utils/show'

const file = {
  percentTimer: (onProgress: any) => {
    let percent = 0
    return setInterval(() => {
      percent += Math.floor(Math.random() * 10)
      percent >= 100 && (percent = 99)
      onProgress({ percent })
    }, 100)
  },
  onUpload: async function (options: any) {
    const { file, onProgress, onSuccess } = options
    const timer = this.percentTimer(onProgress)

    file.thumbUrl = URL.createObjectURL(file)
    file.url = await fastFile.toBase64(file)
    file.status = 'done'

    onSuccess?.(file, file.url)
    clearInterval(timer)
  }
}

const url = {
  ...fast.url,
  toCrxTab: (url?: string) => {
    url = '/index.html#' + (url || '')
    console.log('toCrxTab', url)
    chrome.tabs.create({ url: chrome.runtime.getURL(url) })
  },
  add: (location: Location<any>, params: Record<string, string>) => {
    const data = new URLSearchParams(location.search)
    Object.entries(params).map((item) => data.set(...item))
    return `${location.pathname}?${data.toString()}`
  },
  get: (location: Location<any>, key: string, value?: any) => {
    const data = new URLSearchParams(location.search)
    return data.get(key) || value
  }
}

const warn = (text: string) => {
  message.error(text)
  fast.fail(text)
}

export default {
  ...fast,
  file,
  url,
  warn
}
