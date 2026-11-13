import { browser, type Browser } from '#imports'
import { assertWithinLimit, fetchGist, patchGist, readGistFile, type GistFiles } from './gist'

const BOOKMARKS = 'bookmarks.json'
const STORAGE_PREFIX = 'local-'

export type SlimBookmark = {
  title: string
  url?: string
  folderType?: string
  children?: SlimBookmark[]
}

export type BackupResult = {
  updatedAt: string
  bookmarks: SlimBookmark[]
  storage: Record<string, unknown>
}

export type UploadOptions = {
  token: string
  gistId: string
  keys: string[]
  includeBookmarks?: boolean
}

export type DownloadOptions = {
  token: string
  gistId: string
}

const toFileName = (key: string) => `${STORAGE_PREFIX}${encodeURIComponent(key)}.json`

const fromFileName = (filename: string): string | null => {
  if (!filename.startsWith(STORAGE_PREFIX)) return null
  if (!filename.endsWith('.json')) return null
  const raw = filename.slice(STORAGE_PREFIX.length, -'.json'.length)
  return decodeURIComponent(raw)
}

const toGistFiles = (storage: Record<string, unknown>): GistFiles => {
  const files: GistFiles = {}
  for (const [key, value] of Object.entries(storage)) {
    const filename = toFileName(key)
    const content = JSON.stringify(value, null, 2)
    assertWithinLimit(filename, content)
    files[filename] = { content }
  }
  return files
}

const readStorage = async (keys: string[]): Promise<Record<string, unknown>> => {
  const raw = await browser.storage.local.get(keys)
  const storage: Record<string, unknown> = {}
  for (const key of keys) {
    if (raw[key] !== undefined) storage[key] = raw[key]
  }
  return storage
}

const slimBookmarks = (
  nodes: Browser.bookmarks.BookmarkTreeNode[],
  isRootLevel = false
): SlimBookmark[] =>
  nodes.map((node) => {
    const slim: SlimBookmark = { title: node.title }
    if (node.url) slim.url = node.url
    if (isRootLevel && node.folderType) slim.folderType = node.folderType
    if (node.children?.length) {
      slim.children = slimBookmarks(node.children, false)
    }
    return slim
  })

/**
 * 上传备份到 Gist。
 *
 * 每个文件写入前检查是否超过 1MB，任一超限直接抛错，不发起请求。
 *
 * @throws 文件超限或请求失败时抛出
 */
export async function uploadBackup(opts: UploadOptions): Promise<BackupResult> {
  const { token, gistId, keys, includeBookmarks = true } = opts

  const storage = await readStorage(keys)

  let bookmarks: SlimBookmark[] = []
  if (includeBookmarks && browser.bookmarks) {
    const tree = await browser.bookmarks.getTree()
    const root = tree[0]
    bookmarks = slimBookmarks(root?.children ?? [], true)
  }

  const bookmarksContent = JSON.stringify(bookmarks, null, 2)
  assertWithinLimit(BOOKMARKS, bookmarksContent)

  const files: GistFiles = {
    [BOOKMARKS]: { content: bookmarksContent },
    ...toGistFiles(storage)
  }

  const data = await patchGist(token, gistId, files)

  return {
    updatedAt: data.updated_at,
    bookmarks,
    storage
  }
}

/**
 * 从 Gist 读取备份。
 *
 * @throws 文件被截断或请求失败时抛出
 */
export async function downloadBackup(opts: DownloadOptions): Promise<BackupResult> {
  const { token, gistId } = opts
  const gist = await fetchGist(token, gistId)

  const bookmarksRaw = readGistFile(gist, BOOKMARKS)
  const bookmarks = bookmarksRaw ? JSON.parse(bookmarksRaw) : []

  const storage: Record<string, unknown> = {}

  for (const filename of Object.keys(gist.files)) {
    const key = fromFileName(filename)
    if (key === null) continue

    const raw = readGistFile(gist, filename)
    if (raw === null) {
      console.warn(`Gist 中缺少 ${filename}，已跳过`)
      continue
    }

    storage[key] = JSON.parse(raw)
  }

  return { bookmarks, storage, updatedAt: gist.updated_at }
}

/**
 * 从备份恢复书签。
 */
async function restoreBookmarks(tree: SlimBookmark[]): Promise<void> {
  const roots = await browser.bookmarks.getTree()
  const root = roots[0]
  if (!root?.children?.length) return

  // 递归创建单个节点到指定父节点下
  const createNode = async (node: SlimBookmark, parentId: string) => {
    if (node.url) {
      await browser.bookmarks.create({ parentId, title: node.title, url: node.url })
      return
    }

    const folder = await browser.bookmarks.create({ parentId, title: node.title })
    for (const child of node.children ?? []) {
      await createNode(child, folder.id)
    }
  }

  // 按 folderType 找到根节点下的目标文件夹
  const findTargetFolder = (folderType?: string) => {
    if (!folderType) return undefined
    return root.children?.find((c) => c.folderType === folderType)
  }

  for (const top of tree) {
    const target = findTargetFolder(top.folderType)

    // 备份里的顶层项没有 folderType，或浏览器里找不到对应文件夹跳过
    if (!target?.id) {
      console.warn(`Skipping backup folder "${top.title}": target folder not found`)
      continue
    }

    // 清空目标文件夹现有内容（只删子项，不删文件夹本身）
    for (const child of target.children ?? []) {
      if (child.id) await browser.bookmarks.removeTree(child.id)
    }

    // 按备份结构重建
    for (const child of top.children ?? []) {
      await createNode(child, target.id)
    }
  }
}

/**
 * 一键恢复：从 Gist 读取 -> 只覆盖备份里包含的 key。
 */
export async function restoreFromGist(opts: DownloadOptions): Promise<BackupResult> {
  const data = await downloadBackup(opts)

  await browser.storage.local.set(data.storage)

  if (browser.bookmarks && Array.isArray(data.bookmarks) && data.bookmarks.length) {
    await restoreBookmarks(data.bookmarks)
  }

  return data
}
