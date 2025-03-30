import { Octokit } from '@octokit/core'
import { json } from '@rainte/js'
import { dialog } from '@rainte/ant'
import crx, { SyncEnum } from '@/utils/crx'

export enum GistEnum {
  CRX = '-rainte',
  Bookmark = 'bookmark',
  Storage = 'storage',
  Db = 'db'
}

export type CRXProps = {
  githubToken: string
  gistId?: string
}

class Gist {
  config?: CRXProps
  extension = '.json'
  raw = false

  async init() {
    this.config = await crx.sync.getItem<CRXProps>(SyncEnum.CRX)
    this.config ?? dialog.popup.error(crx.i18n.get('gistIdError'))
  }

  request(url: string, options: ObjectProps) {
    return new Octokit({ auth: this.config!.githubToken })
      .request(url, options)
      .then((res) => {
        console.log('octokit response', res.data)
        return res.data
      })
      .catch((error) => dialog.popup.error(error.message))
  }

  add(githubToken: string) {
    this.config = { githubToken }
    const content = 'Rainte Chrome CRX'

    return this.request('POST /gists', {
      description: content,
      public: false,
      files: { [GistEnum.CRX]: { content } }
    })
  }

  get() {
    const url = `GET /gists/${this.config!.gistId}`
    const options = { gist_id: this.config!.gistId }

    return this.request(url, options)
  }

  files() {
    const url = `GET /gists/${this.config!.gistId}`
    const options = { gist_id: this.config!.gistId }

    return this.request(url, options)
      .then((res) => res.files)
      .then((files) => {
        Object.keys(files).forEach((key) => {
          if (key.endsWith(this.extension)) {
            try {
              files[key].content = files[key].content
                ? json.parse(files[key].content as string)
                : null
            } catch (e) {
              files[key].content = null
            }
          }
        })
        return files
      })
  }

  set(files: { [key: string]: any }) {
    files = Object.entries(files).reduce((acc: any, [key, value]) => {
      acc[key + this.extension] = { content: this.raw ? value : json.stringify(value) }
      return acc
    }, {})

    const url = `PATCH /gists/${this.config!.gistId}`
    const options = { gist_id: this.config!.gistId, files }
    return this.request(url, options)
  }

  async getItem<T = any>(key: GistEnum): Promise<T> {
    return this.files().then((res) => res[key + this.extension]?.content)
  }

  async setItem(key: GistEnum, value: any) {
    return this.set({ [key]: value })
  }
}

export default new Proxy(new Gist(), {
  get(target, prop, receiver) {
    const method = Reflect.get(target, prop)
    if (typeof method === 'function' && prop != 'init' && prop != 'add') {
      return async function (this: Gist, ...args: any[]) {
        await this.init()
        return method.apply(this, args)
      }
    }
    return Reflect.get(target, prop, receiver)
  }
})
