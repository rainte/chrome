import { storage } from '@/utils/browser'
import octokit from '@/utils/octokit'
import error from '@/utils/error'

export const DOMAIN = 'bookmark'

export type BookmarkProps = {
  gistId?: string
}

const config = {
  get: () => storage.cloud.get(DOMAIN),
  set: (data: BookmarkProps) => storage.cloud.set(DOMAIN, data)
}

const gist = {
  add: () => {
    return octokit
      .request('POST /gists', {
        description: 'Rainte Chrome CRX ' + DOMAIN,
        public: false,
        files: { [DOMAIN]: { content: '{}' } }
      })
      .then(async (res) => {
        await storage.cloud.set(DOMAIN, { gistId: res.id })
        return res
      })
  },
  // get: () => {
  //   // env.gistId || error.fail('请先设置 Gist ID.')
  //   // fetchOctokit(`GET /gists/${gist_id}`, {
  //   //   description: 'rainte',
  //   //   public: false,
  //   //   files: {
  //   //     rainte: {
  //   //       content: 'Hello World'
  //   //     }
  //   //   }
  //   // }).then((res) => {
  //   //   console.log(123, res)
  //   // })

  //   //

  //   octokit()
  //     .request('POST /gists', {
  //       description: 'rainte',
  //       public: false,
  //       files: {
  //         rainte: {
  //           content: 'Hello World'
  //         }
  //       }
  //     })
  //     .then((res) => {
  //       console.log(123, res)
  //     })
  // },
  // upload: () => {
  //   const bookmarkConfig = config.get()
  //   const bookmarkTree = chrome.bookmarks.getTree()

  //   return Promise.all([bookmarkConfig, bookmarkTree]).then((res) => {
  //     const env = res[0]
  //     const tree = res[1]

  //     return request.post(`${GIST_API}/${env.gistId}`, tree)
  //   })
  // },
  down: () => {
    return config.get().then((gist) => {
      gist.gistId || error.fail('请先设置 Gist ID.')

      return octokit
        .request(`GET /gists/${gist.gistId}`, { gist_id: gist.gistId })
        .then((res) => res.files[DOMAIN].content)
        .then((res) => res)
    })
  }
}

export default { config, gist }
