const API = 'https://api.github.com'

/**
 * Gist API 单个文件的上限：1MB。
 */
export const MAX_FILE_BYTES = 1024 * 1024

/**
 * Gist 中单个文件的结构（只声明用到的字段）。
 */
export type GistFile = {
  content?: string
  truncated?: boolean
}

/**
 * GET /gists/{id} 的响应结构（只声明用到的字段）。
 */
export type GistResponse = {
  updated_at: string
  files: Record<string, GistFile>
}

/**
 * PATCH /gists/{id} 的请求体里 `files` 字段的结构。
 */
export type GistFiles = Record<string, { content: string }>

/**
 * 生成只读请求的鉴权头。
 */
const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json'
})

/**
 * 生成写请求的鉴权头，在只读头基础上补充 JSON Content-Type。
 */
const jsonHeaders = (token: string) => ({
  ...authHeaders(token),
  'Content-Type': 'application/json'
})

/**
 * 计算字符串的 UTF-8 字节数。
 */
export const byteLength = (s: string): number => new Blob([s]).size

/**
 * 上传前检查单个文件是否超过 Gist 的 1MB 读取上限。
 *
 * @param filename 用于错误提示的文件名
 * @param content 序列化后的文件内容
 * @throws 内容超过 1MB 时抛出，错误信息包含实际体积
 */
export const assertWithinLimit = (filename: string, content: string): void => {
  const size = byteLength(content)
  if (size > MAX_FILE_BYTES) {
    throw new Error(`${filename} exceeds 1MB (${(size / 1024).toFixed(1)}KB)`)
  }
}

/**
 * 从 Gist 响应中读取单个文件的内容。
 *
 * 三种情况：
 * - 文件不存在或没有 `content`：返回 null，由调用方决定是跳过还是报错。
 * - 文件存在但 `truncated` 为 true：说明内容超过 1MB 被截断，
 *   此时直接抛错，避免把不完整内容当成完整数据解析。
 * - 正常情况：返回完整内容。
 *
 * @param gist GET /gists/{id} 的响应
 * @param filename Gist 中的文件名
 * @returns 文件内容；文件不存在时返回 null
 * @throws 文件被截断时抛出
 */
export const readGistFile = (gist: GistResponse, filename: string): string | null => {
  const file = gist.files[filename]
  if (!file?.content) return null
  if (file.truncated) {
    throw new Error(`${filename} exceeds 1MB and was truncated`)
  }
  return file.content
}

/**
 * 获取 Gist 详情。
 *
 * @param token GitHub Personal Access Token
 * @param gistId Gist ID
 * @returns Gist 详情
 * @throws HTTP 状态非 2xx 时抛出
 */
export async function fetchGist(token: string, gistId: string): Promise<GistResponse> {
  const res = await fetch(`${API}/gists/${gistId}`, {
    headers: authHeaders(token)
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch Gist: ${res.status}`)
  }
  return res.json() as Promise<GistResponse>
}

/**
 * 批量写入/覆盖 Gist 中的文件。
 *
 * @param token GitHub Personal Access Token
 * @param gistId Gist ID
 * @param files 文件名到内容的映射
 * @returns 更新后的 Gist 详情
 * @throws HTTP 状态非 2xx 时抛出
 */
export async function patchGist(
  token: string,
  gistId: string,
  files: GistFiles
): Promise<GistResponse> {
  const res = await fetch(`${API}/gists/${gistId}`, {
    method: 'PATCH',
    headers: jsonHeaders(token),
    body: JSON.stringify({ files })
  })
  if (!res.ok) {
    throw new Error(`Failed to update Gist: ${res.status}`)
  }
  return res.json() as Promise<GistResponse>
}
