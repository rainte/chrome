import request from '@/utils/request'
import { storage } from '@/utils/browser'
import error from '@/utils/error'
import { Octokit } from '@octokit/core'

const DOMAIN = 'bookmark'
const GIST_API = 'https://api.github.com/gists'

// // Octokit.js
// // https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: 'YOUR-TOKEN'
})

// await octokit.request('POST /gists', {
//   description: 'Example of a gist',
//   public: false,
//   files: {
//     'README.md': {
//       content: 'Hello World'
//     }
//   },
//   headers: {
//     'X-GitHub-Api-Version': '2022-11-28'
//   }
// })

export type BookmarkProps = {
  githubToken?: string
  gistId?: string
  isNotice?: boolean
}

const config = {
  get: () => storage.cloud.get(DOMAIN),
  set: (data: BookmarkProps) => storage.cloud.set(DOMAIN, data)
}

const gist = {
  upload: () => {
    const bookmarkConfig = config.get()
    const bookmarkTree = chrome.bookmarks.getTree()

    return Promise.all([bookmarkConfig, bookmarkTree]).then((res) => {
      const env = res[0]
      const tree = res[1]

      return request.post(`${GIST_API}/${env.gistId}`, tree)
    })
  },
  down: () => {
    return config.get().then((env) => {
      env.gistId || error.fail('请先设置 Gist ID.')

      return request.get(`${GIST_API}/${env.gistId}`).then((res) => {
        const files = Object.keys(res.files).map((file) => {
          return res.files[file].content
        })

        return files[0]
      })
    })
  }
}

export default { config, gist }
