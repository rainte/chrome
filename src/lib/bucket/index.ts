import { createRepoBucket } from './repo'

export type FileMap = Record<string, string>

export type RepoLocation = {
  kind: 'repo'
  token: string
  repo: string
  branch?: string
  path?: string
}

export type Location = RepoLocation

export type ReadResult = {
  files: FileMap
  updatedAt: string
}

export interface Bucket {
  readAll(): Promise<ReadResult>
  writeAll(files: FileMap): Promise<{ updatedAt: string }>
}

export function createBucket(loc: Location): Bucket {
  switch (loc.kind) {
    case 'repo':
      return createRepoBucket(loc)
  }
}
