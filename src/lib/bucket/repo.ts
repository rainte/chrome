import { API, authHeaders, fromBase64, jsonHeaders, request, toBase64 } from './http'
import type { Bucket, FileMap, ReadResult, RepoLocation } from './index'

type RefResponse = { object: { sha: string } }
type CommitResponse = { sha: string; tree: { sha: string }; committer: { date: string } }
type TreeResponse = { sha: string; tree: Array<{ path: string; type: string; sha: string }> }
type BlobResponse = { content: string; encoding: string }

export function createRepoBucket(loc: RepoLocation): Bucket {
  const { token, repo, branch = 'main', path = 'crx' } = loc
  const base = `${API}/repos/${repo}/git`
  const refName = `heads/${branch}`

  async function headSha(): Promise<string> {
    const ref = await request<RefResponse>(
      `${base}/ref/${refName}`,
      { headers: authHeaders(token) },
      'get ref'
    )
    return ref.object.sha
  }

  async function treeShaOfCommit(commitSha: string): Promise<string> {
    const commit = await request<CommitResponse>(
      `${base}/commits/${commitSha}`,
      { headers: authHeaders(token) },
      'get commit'
    )
    return commit.tree.sha
  }

  async function listBlobs(treeSha: string): Promise<Record<string, string>> {
    const tree = await request<TreeResponse>(
      `${base}/trees/${treeSha}?recursive=1`,
      { headers: authHeaders(token) },
      'get tree'
    )
    const out: Record<string, string> = {}
    const prefix = `${path}/`
    for (const item of tree.tree) {
      if (item.type !== 'blob') continue
      if (!item.path.startsWith(prefix)) continue
      const name = item.path.slice(prefix.length)
      if (name.includes('/')) continue
      out[name] = item.sha
    }
    return out
  }

  return {
    async readAll(): Promise<ReadResult> {
      const commitSha = await headSha()

      // 一次请求拿 commit 详情（含 tree sha + committer.date）
      const commit = await request<CommitResponse>(
        `${base}/commits/${commitSha}`,
        { headers: authHeaders(token) },
        'get commit'
      )
      const treeSha = commit.tree.sha

      const blobs = await listBlobs(treeSha)
      const files: FileMap = {}
      await Promise.all(
        Object.entries(blobs).map(async ([name, sha]) => {
          const blob = await request<BlobResponse>(
            `${base}/blobs/${sha}`,
            { headers: authHeaders(token) },
            `get blob ${name}`
          )
          if (blob.encoding !== 'base64') {
            throw new Error(`${name} has unexpected encoding: ${blob.encoding}`)
          }
          files[name] = fromBase64(blob.content)
        })
      )

      return { files, updatedAt: commit.committer.date }
    },

    async writeAll(files) {
      const commitSha = await headSha()
      const baseTreeSha = await treeShaOfCommit(commitSha)

      // 1) 每个文件一个 blob
      const entries = await Promise.all(
        Object.entries(files).map(async ([name, content]) => {
          const blob = await request<{ sha: string }>(
            `${base}/blobs`,
            {
              method: 'POST',
              headers: jsonHeaders(token),
              body: JSON.stringify({ content: toBase64(content), encoding: 'base64' })
            },
            `create blob ${name}`
          )
          return {
            path: `${path}/${name}`,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blob.sha
          }
        })
      )

      // 2) 删除目录下多余旧文件（严格全量覆盖）
      const existing = await listBlobs(baseTreeSha)
      const deletions = Object.keys(existing)
        .filter((name) => !(name in files))
        .map((name) => ({
          path: `${path}/${name}`,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: null
        }))

      // 3) 新 tree（base_tree 保证目录外文件不丢）
      const tree = await request<{ sha: string }>(
        `${base}/trees`,
        {
          method: 'POST',
          headers: jsonHeaders(token),
          body: JSON.stringify({
            base_tree: baseTreeSha,
            tree: [...entries, ...deletions]
          })
        },
        'create tree'
      )

      // 4) commit
      const commit = await request<CommitResponse>(
        `${base}/commits`,
        {
          method: 'POST',
          headers: jsonHeaders(token),
          body: JSON.stringify({
            message: `backup: ${new Date().toISOString()}`,
            tree: tree.sha,
            parents: [commitSha]
          })
        },
        'create commit'
      )

      // 5) 移动分支
      await request<unknown>(
        `${base}/refs/${refName}`,
        {
          method: 'PATCH',
          headers: jsonHeaders(token),
          body: JSON.stringify({ sha: commit.sha, force: false })
        },
        'update ref'
      )

      return { updatedAt: commit.committer?.date ?? new Date().toISOString() }
    }
  }
}
