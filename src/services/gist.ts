import { Octokit } from '@octokit/core'
import storage, { StorageEnum } from '@/services/storage'
import { json } from '@rainte/js'
import { popup } from '@/utils/show'

export type CRXProps = {
  githubToken: string
  gistId?: string
}

class Gist {
  private config?: CRXProps
  extension = '.json'

  async setConfig() {
    this.config ??= await storage.get<CRXProps>(StorageEnum.CRX)
    this.config ?? popup.error('请先配置 Gist.')
  }

  request(url: string, options: ObjectProps) {
    return new Octokit({ auth: this.config!.githubToken })
      .request(url, options)
      .then((res) => {
        console.log('octokit response', res.data)
        return res.data
      })
      .catch((error) => popup.error(error.message))
  }

  add(githubToken: string) {
    this.config = { githubToken }

    return this.request('POST /gists', {
      description: 'Rainte Chrome CRX',
      public: false,
      files: { '-rainte': { content: 'Rainte Chrome CRX' } }
    })
  }

  async get<T = any>(key: StorageEnum, raw: boolean = false): Promise<T> {
    const url = `GET /gists/${this.config!.gistId}`
    const options = { gist_id: this.config!.gistId }

    return this.request(url, options)
      .then((res) => res.files)
      .then((res) => res[key + this.extension]?.content)
      .then((res) => (raw ? res : res ? json.parse(res) : null))
  }

  async set(files: Partial<{ [x in StorageEnum]: any }>, raw: boolean = false) {
    files = Object.entries(files).reduce((acc: any, [key, value]) => {
      acc[key + this.extension] = { content: raw ? value : json.stringify(value) }
      return acc
    }, {})

    const url = `PATCH /gists/${this.config!.gistId}`
    const options = { gist_id: this.config!.gistId, files }
    return this.request(url, options)
  }
}

export default new Proxy(new Gist(), {
  get(target, prop, receiver) {
    const method = Reflect.get(target, prop)
    if (typeof method === 'function' && prop != 'setConfig' && prop != 'add') {
      return async function (this: Gist, ...args: any[]) {
        await this.setConfig()
        return method.apply(this, args)
      }
    }
    return Reflect.get(target, prop, receiver)
  }
})
