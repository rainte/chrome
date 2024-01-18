import { Octokit } from '@octokit/core'
import { storage } from '@/utils/browser'
import { DOMAIN } from '@/services/rainte'

export default {
  request: (url: string, options: any) => {
    return storage.cloud.get(DOMAIN).then((rainte) => {
      const octokit = new Octokit({ auth: rainte.githubToken })
      return octokit
        .request(url, options)
        .then((res) => res.data)
        .then((res) => {
          console.log('octokit.res', res)
          return res
        })
    })
  }
}
