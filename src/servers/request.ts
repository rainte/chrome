export const get = (url: string, data: any) => {
  const body = new URLSearchParams()
  Object.keys(data).forEach((key) => body.append(key, data[key]))

  return request(url, { method: 'GET', body })
}

export const post = (url: string, data: any) => {
  const body = new FormData()
  Object.keys(data).forEach((key) => body.append(key, data[key]))

  return request(url, { method: 'POST', body })
}

export const request = (url: string, init: RequestInit) => {
  return fetch(url, init).then((res) => {
    console.log('res', res)
  })
}
