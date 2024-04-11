import { Octokit } from '@octokit/core'
import storage, { StoreEnum, CRXProps } from '@/utils/storage'
import fast from '@/utils/fast'

export enum HubEnum {
  Bookmark = 'bookmark.json',
  Tab = 'tab.json'
}
export type SetProps = {
  key: HubEnum
  data: string | null
}

const crx = async () => {
  const config = await storage.get<CRXProps>(StoreEnum.CRX)
  config || fast.warn('请先到配置菜单,配置 Github 相关参数.')
  return config
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
      .catch((error) => fast.warn(error.message))
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
  getJson: function <T = any>(key: HubEnum): Promise<T> {
    return this.get()
      .then((res) => res[key]?.content || '{}')
      .then(JSON.parse)
  },
  setJson: function (key: HubEnum, data: any) {
    return this.set([{ key, data: JSON.stringify(data) }])
  }
}

export default octokit
