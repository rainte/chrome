import { gist } from '@/utils/octokit'
import { toBase64 } from './file'

export enum HubEnum {
  Bookmark = 'bookmark',
  Tab = 'tab'
}

export enum FileEnum {
  NewTabBgImg = 'file-newTabBgImg'
}

export type FileNameProps = HubEnum | FileEnum

export default {
  get: (fileName: FileNameProps) => {
    return gist
      .get()
      .then((res) => res.files[fileName]?.content)
      .then(JSON.parse)
  },
  set: (fileName: FileNameProps, data: any) => gist.set(fileName, JSON.stringify(data)),
  file: {
    get: (fileName: FileNameProps) => {
      return gist
        .get()
        .then((res) => res.files[`${fileName}`]?.raw_url)
        .then((res) => (res ? fetch(res) : res))
        .then((res) => (res ? res.text() : res))
        .then((res: string) => res)
    },
    set: (fileName: FileNameProps, blob?: Blob) => {
      let request
      if (blob instanceof Blob) {
        request = toBase64(blob).then((res) => gist.set(fileName, res))
      } else {
        request = gist.set(fileName, '')
      }
      return request
        .then((res) => res.files[fileName]?.raw_url)
        .then(fetch)
        .then((res) => res.text())
    }
  }
}
