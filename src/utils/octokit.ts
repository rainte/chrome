import { Octokit } from '@octokit/core'
import { store } from '@/utils/browser'
import error from '@/utils/error'

const octokit = {
  request: async (url: string, options: any) => {
    const config = await store.get()
    config || error.fail('请先配置 Github Token.')

    return new Octokit({ auth: config.githubToken })
      .request(url, options)
      .then((res) => res.data)
      .then((res) => {
        console.log('octokit.res', res)
        return res
      })
  }
}

export const gist = {
  add: () => {
    return octokit.request('POST /gists', {
      description: 'Rainte Chrome CRX',
      public: false,
      files: { '-rainte': { content: 'Rainte Chrome CRX' } }
    })
  },
  get: async () => {
    const config = await store.get()
    return octokit.request(`GET /gists/${config.gistId}`, { gist_id: config.gistId })
  },
  set: async (fileName: string, content: string) => {
    const config = await store.get()
    return octokit.request(`PATCH /gists/${config.gistId}`, {
      gist_id: config.gistId,
      files: { [fileName]: { content: content } }
    })
  }
}

export default octokit
