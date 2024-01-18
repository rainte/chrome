export default {
  get: function (url: string, data?: any) {
    const body = new URLSearchParams()
    data && Object.keys(data).forEach((key) => body.append(key, data[key]))
    body.size && (url = url + '?' + body.toString())

    return this.fetch(url, { method: 'GET' })
  },
  post: function (url: string, data?: any) {
    const body = new FormData()
    data && Object.keys(data).forEach((key) => body.append(key, data[key]))

    return this.fetch(url, { method: 'POST', body })
  },
  fetch: function (url: string, init?: RequestInit) {
    return fetch(url, init)
      .then((res) => res.json())
      .then((res) => {
        console.log('fetch.res', res)
        return res
      })
  }
}
