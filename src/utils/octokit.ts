import { Octokit } from '@octokit/core'
import { store, StoreEnum, CRXProps } from './storage'
import { popup } from './show'
import error from './error'

export enum HubEnum {
  Bookmark = 'bookmark.json',
  Tab = 'tab.json'
}
export type SetProps = {
  key: HubEnum
  data: string | null
}

const crx = async () => {
  const config = await store.get(StoreEnum.CRX)
  config.githubToken || error.fail('请先配置 Github Token.')
  config.gistId || error.fail('请先配置 Github Gist.')
  return config as CRXProps
}

const octokit = {
  request: async (url: string, options: Record<string, any>) => {
    const config = await crx()
    return new Octokit({ auth: config.githubToken })
      .request(url, options)
      .then((res) => res.data)
      .then((res) => {
        console.log('octokit response', res)
        return res
      })
  }
}

const content = (data: any) => (data === null ? null : { content: data })

export const gist = {
  add: () => {
    return octokit.request('POST /gists', {
      description: 'Rainte Chrome CRX',
      public: false,
      files: { '-rainte': { content: 'Rainte Chrome CRX' } }
    })
  },
  get: async () => {
    const config = await crx()
    const url = `GET /gists/${config.gistId}`
    const options = { gist_id: config.gistId }
    return octokit.request(url, options).then((res) => res.files)
  },
  set: async (props: SetProps[]) => {
    const config = await crx()
    const files: Record<string, any> = {}
    props.map((item) => (files[item.key] = content(item.data)))
    const url = `PATCH /gists/${config.gistId}`
    const options = { gist_id: config.gistId, files }
    return octokit.request(url, options)
  },
  getJson: function (key: HubEnum) {
    return this.get()
      .then((res) => res[key]?.content || '{}')
      .then(JSON.parse)
  },
  setJson: function (key: HubEnum, data: any, isOk?: boolean) {
    const res = this.set([{ key, data: JSON.stringify(data) }])
    return isOk ? res.then(() => popup.success()) : res
  }
}

export default octokit
