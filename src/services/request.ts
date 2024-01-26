export default {
  get: function (url: string, data?: Record<string, any>) {
    const body = new URLSearchParams()
    data && Object.entries(data).map((item) => body.append(...item))
    body.size && (url = url + '?' + body.toString())

    return this.fetch(url, { method: 'GET' })
  },
  post: function (url: string, data?: Record<string, any>) {
    const body = new FormData()
    data && Object.entries(data).map((item) => body.append(...item))

    return this.fetch(url, { method: 'POST', body })
  },
  fetch: (url: string, init?: RequestInit) => {
    return fetch(url, init).then((res) => res.json())
  }
}
