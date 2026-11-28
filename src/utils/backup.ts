import { browser, type Browser } from '#imports'
import { createBucket, type FileMap, type Location } from '@/lib/bucket'

const BOOKMARKS = 'bookmarks.json'
const STORAGE = 'storage.json'

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

export type BackupOptions = {
  location: Location
  keys: string[]
  includeBookmarks?: boolean
}

const readStorage = async (keys: string[]): Promise<Record<string, unknown>> => {
  const raw = await browser.storage.local.get(keys)
  const storage: Record<string, unknown> = {}
  for (const key of keys) if (raw[key] !== undefined) storage[key] = raw[key]
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
    if (node.children?.length) slim.children = slimBookmarks(node.children, false)
    return slim
  })

/** 上传：两个文件，整体交给后端 */
export async function uploadBackup(opts: BackupOptions): Promise<BackupResult> {
  const { location, keys, includeBookmarks = true } = opts
  const backend = createBucket(location)
  const storage = await readStorage(keys)

  let bookmarks: SlimBookmark[] = []
  if (includeBookmarks && browser.bookmarks) {
    const tree = await browser.bookmarks.getTree()
    bookmarks = slimBookmarks(tree[0]?.children ?? [], true)
  }

  const files: FileMap = {
    [BOOKMARKS]: JSON.stringify(bookmarks, null, 2),
    [STORAGE]: JSON.stringify(storage, null, 2)
  }

  const { updatedAt } = await backend.writeAll(files)
  return { updatedAt, bookmarks, storage }
}

/** 下载：读全部文件，按文件名解析 */
export async function downloadBackup(location: Location): Promise<BackupResult> {
  const backend = createBucket(location)
  const { files, updatedAt } = await backend.readAll()
  const bookmarks: SlimBookmark[] = files[BOOKMARKS] ? JSON.parse(files[BOOKMARKS]) : []
  const storage: Record<string, unknown> = files[STORAGE] ? JSON.parse(files[STORAGE]) : {}

  return { bookmarks, storage, updatedAt }
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
    for (const child of node.children ?? []) await createNode(child, folder.id)
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
    for (const child of top.children ?? []) await createNode(child, target.id)
  }
}

/** 一键恢复：storage 按 key 合并（只覆盖备份里包含的 key），书签全量重建 */
export async function restoreBackup(opts: BackupOptions): Promise<BackupResult> {
  const { location, keys, includeBookmarks } = opts
  const data = await downloadBackup(location)

  // 只恢复 keys 指定的项
  const picked: Record<string, unknown> = {}
  for (const key of keys) {
    if (key in data.storage) picked[key] = data.storage[key]
  }
  await browser.storage.local.set(picked)

  if (
    includeBookmarks &&
    browser.bookmarks &&
    Array.isArray(data.bookmarks) &&
    data.bookmarks.length
  ) {
    await restoreBookmarks(data.bookmarks)
  }

  return data
}
