import { gist } from '@/utils/octokit'
import { fileToURL } from '@/utils/browser'

export enum HubEnum {
  Bookmark = 'bookmark',
  Tab = 'tab'
}

export enum FileEnum {
  NewTabBgImg = 'file.newTabBgImg'
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
  upload: (fileName: FileNameProps, blob: Blob) => {
    return fileToURL(blob)
      .then((res) => gist.set(fileName, res))
      .then((res) => res.files[fileName]?.raw_url)
      .then(fetch)
      .then((res) => res.text())
  },
  url: (fileName: FileNameProps) => {
    return gist
      .get()
      .then((res) => res.files[fileName]?.raw_url)
      .then((res) =>fetch(res))
      .then((res) => res.text())
  }
}
