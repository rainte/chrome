export default {
  get: function (url: string, data: any) {
    const body = new URLSearchParams()
    Object.keys(data).forEach((key) => body.append(key, data[key]))

    return this.fetch(url, { method: 'GET', body })
  },
  post: function (url: string, data: any) {
    const body = new FormData()
    Object.keys(data).forEach((key) => body.append(key, data[key]))

    return this.fetch(url, { method: 'POST', body })
  },
  fetch: function (url: string, init: RequestInit) {
    return fetch(url, init).then((res) => {
      console.log('res', res)
    })
  }
}
