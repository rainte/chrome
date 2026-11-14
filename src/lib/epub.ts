/* eslint-disable no-control-regex */
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import { uuidV5 } from './uuid'

// ============================ 类型 ============================
export interface EpubConfig {
  /** 章节匹配正则的源码字符串（不含 /…/g 包裹） */
  chapterPattern: string
  /** 作者；留空则使用 EPUB 内置作者 */
  author: string
  /** 起始标记；标记之前的内容被丢弃 */
  startMarker: string
  /** 屏蔽词，英文逗号分隔 */
  blockWords: string
}

export interface EpubResult {
  title: string
  author: string
  chapterCount: number
  epubBlob: Blob
  txtBlob: Blob
}

export enum EpubKind {
  Epub = 'epub',
  Txt = 'txt'
}

/** [标题, 正文] */
export type Chapter = [title: string, content: string]

export interface ChapterItem {
  title: string
  content: string
}

export interface BatchItemResult {
  file: File
  ok: boolean
  result?: EpubResult
  error?: string
}

export interface FilePreview {
  title: string
  text: string
  author: string
  kind: `${EpubKind.Epub | EpubKind.Txt}`
  size: number
  chapters?: ChapterItem[]
}

// ============================ 默认配置 ============================
export const CHAPTER_RE = String.raw`^[ \t]*第[ \t]*[一二三四五六七八九十百千万零〇\d]+[ \t]*(?:章|卷|回|节|集|部|篇|折)[^\n]*`
export const DEFAULT_CONFIG: EpubConfig = {
  chapterPattern: CHAPTER_RE,
  author: '',
  startMarker: '',
  blockWords: ''
}

const FIXED_ZIP_DATE = new Date(Date.UTC(2000, 0, 1, 0, 0, 0))
const FIXED_MODIFIED = '2000-01-01T00:00:00Z'

// ============================ 工具 ============================
function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function sanitize(text: string): string {
  text = text.replace(/[\uFEFF\uFFFD\u200B-\u200F\u202A-\u202E\u2060-\u206F]/g, '')
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  return text.replace(/\n\s*\n/g, '\n\n').trim()
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function stripHtml(html: string): string {
  let m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (m) html = m[1]!
  else html = html.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
  html = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
  html = html.replace(/<br\s*\/?>/gi, '\n')
  html = html.replace(/<\/p>/gi, '\n')
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ''))
}

function textToXhtml(text: string): string {
  const parts: string[] = []
  for (const para of text.split('\n\n')) {
    const lines = para
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length) {
      parts.push(`<p>${lines.map(escapeXml).join('<br/>')}</p>`)
    }
  }
  return parts.join('\n')
}

function cleanLines(text: string): string {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
}

function posixNormalize(p: string): string {
  const out: string[] = []
  for (const seg of p.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') out.pop()
    else out.push(seg)
  }
  return out.join('/')
}

function findDeep(obj: unknown, key: string): unknown {
  if (obj && typeof obj === 'object') {
    const record = obj as Record<string, unknown>
    if (key in record) return record[key]
    for (const v of Object.values(record)) {
      const r = findDeep(v, key)
      if (r !== undefined) return r
    }
  }
  return undefined
}

function findAllDeep(obj: unknown, key: string, acc: unknown[] = []): unknown[] {
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (k === key) {
        if (Array.isArray(v)) acc.push(...v)
        else acc.push(v)
      } else {
        findAllDeep(v, key, acc)
      }
    }
  }
  return acc
}

// ============================ 解码文本 ============================
export function decodeText(arrayBuffer: ArrayBuffer): string {
  const buf = new Uint8Array(arrayBuffer)
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(buf.subarray(3))
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    try {
      return new TextDecoder('gbk').decode(buf)
    } catch {
      return new TextDecoder('utf-8').decode(buf)
    }
  }
}

// ============================ 读 EPUB ============================
async function readEpub(arrayBuffer: ArrayBuffer): Promise<{ text: string; author: string }> {
  const zip = await JSZip.loadAsync(arrayBuffer)
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: true })

  const containerFile = zip.file('META-INF/container.xml')
  if (!containerFile) throw new Error('EPUB 缺少 META-INF/container.xml')
  const container = parser.parse(await containerFile.async('string'))

  const rootfile = findDeep(container, 'rootfile') as Record<string, string> | undefined
  if (!rootfile?.['@_full-path']) {
    throw new Error('EPUB 缺少 rootfile 定义')
  }
  const opfPath = rootfile['@_full-path']
  const opfFile = zip.file(opfPath)
  if (!opfFile) throw new Error(`EPUB 缺少 OPF 文件：${opfPath}`)
  const opf = parser.parse(await opfFile.async('string'))

  let author = ''
  const creators = findAllDeep(opf, 'dc:creator')
  if (creators.length) {
    const c = creators[0]
    author = (
      typeof c === 'string' ? c : ((c as Record<string, unknown>)['#text'] as string) || ''
    ).trim()
  }

  const manifest = new Map<string, string>()
  for (const it of findAllDeep(opf, 'item')) {
    const item = it as Record<string, string>
    if (item['@_id'] && item['@_href']) manifest.set(item['@_id'], item['@_href'])
  }
  const spine = findAllDeep(opf, 'itemref')
    .map((r) => (r as Record<string, string>)['@_idref'])
    .filter((id): id is string => Boolean(id))

  const base = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/') + 1) : ''
  const names = new Set(Object.keys(zip.files))

  const parts: string[] = []
  for (const idref of spine) {
    let href = manifest.get(idref)
    if (!href) continue
    href = decodeURIComponent(href).split('#')[0]
    const full = posixNormalize(base + href)
    if (!names.has(full)) continue
    const f = zip.file(full)
    if (!f) continue
    parts.push(stripHtml(await f.async('string')))
  }
  return { text: parts.join('\n\n'), author }
}

// ============================ 拆章 ============================
function splitChapters(text: string, chapterRe: RegExp): Chapter[] {
  const matches = [...text.matchAll(chapterRe)]
  if (!matches.length) return [['全文', text]]

  const chapters: Chapter[] = []

  // ---------- 前言 ----------
  let firstStart = matches[0]!.index
  while (firstStart < text.length && '\r\n'.includes(text[firstStart]!)) firstStart++
  const preface = text.slice(0, firstStart)

  if (preface.trim()) {
    chapters.push(['前言', preface.trim()])
  }

  // ---------- 正文各章 ----------
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!
    const end = i + 1 < matches.length ? matches[i + 1]!.index : text.length

    let anchor = m.index
    while (anchor < text.length && '\r\n'.includes(text[anchor]!)) anchor++

    const lineStart = text.lastIndexOf('\n', anchor - 1) + 1
    let lineEnd = text.indexOf('\n', anchor)
    if (lineEnd === -1) lineEnd = text.length

    const title = text.slice(lineStart, lineEnd).trim()
    const content = text.slice(lineEnd, end).trim()

    if (content) {
      chapters.push([title || `第 ${i + 1} 章`, content])
    }
  }

  return chapters.length ? chapters : [['全文', text]]
}

// ============================ XHTML 文档 ============================
function xhtmlDoc(title: string, bodyInner: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="zh" lang="zh">
<head><title>${escapeXml(title)}</title></head>
<body>
${bodyInner}
</body>
</html>`
}

// ============================ 生成 EPUB Blob ============================
async function buildEpubBlob(chapters: Chapter[], title: string, author: string): Promise<Blob> {
  const bookId = await uuidV5(`book:${title}`)

  const chapterItems = chapters.map(([t, content], i) => {
    const safeTitle = t.replace(/<[^>]+>/g, '') || `第 ${i + 1} 章`
    const id = `chap_${String(i + 1).padStart(3, '0')}`
    return {
      id,
      href: `${id}.xhtml`,
      title: safeTitle,
      xhtml: xhtmlDoc(safeTitle, `<h1>${escapeXml(safeTitle)}</h1>\n${textToXhtml(content)}`)
    }
  })

  const containerXml = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`

  const navLis = chapterItems
    .map((c) => `<li><a href="${c.href}">${escapeXml(c.title)}</a></li>`)
    .join('\n')
  const navXhtml = xhtmlDoc(
    '目录',
    `<nav epub:type="toc" id="toc"><h1>目录</h1><ol>\n${navLis}\n</ol></nav>`
  )

  const manifestItems = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    ...chapterItems.map(
      (c) => `<item id="${c.id}" href="${c.href}" media-type="application/xhtml+xml"/>`
    )
  ].join('\n')

  const spineItems = chapterItems.map((c) => `<itemref idref="${c.id}"/>`).join('\n')
  const creatorXml = author ? `<dc:creator id="creator">${escapeXml(author)}</dc:creator>` : ''

  const opfXml = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">urn:uuid:${bookId}</dc:identifier>
<dc:title>${escapeXml(title)}</dc:title>
<dc:language>zh</dc:language>
${creatorXml}
<meta property="dcterms:modified">${FIXED_MODIFIED}</meta>
</metadata>
<manifest>
${manifestItems}
</manifest>
<spine>
${spineItems}
</spine>
</package>`

  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', {
    date: FIXED_ZIP_DATE,
    compression: 'STORE',
    createFolders: false
  })
  const add = (name: string, content: string) =>
    zip.file(name, content, {
      date: FIXED_ZIP_DATE,
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
      createFolders: false
    })
  add('META-INF/container.xml', containerXml)
  add('OEBPS/content.opf', opfXml)
  add('OEBPS/nav.xhtml', navXhtml)
  for (const c of chapterItems) add(`OEBPS/${c.href}`, c.xhtml)

  const buf = await zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
    platform: 'UNIX',
    streamFiles: true
  })
  return new Blob([buf], { type: 'application/epub+zip' })
}

// ============================ 生成 TXT Blob ============================
function buildTxtBlob(chapters: Chapter[], title: string, author: string): Blob {
  const parts: string[] = []
  const header: string[] = []
  if (title.trim()) header.push(`《${title.trim()}》`)
  if (author.trim()) header.push(`作者：${author.trim()}`)
  if (header.length) parts.push(header.join('\n'))

  for (const [t, content] of chapters) {
    const ct = t.replace(/<[^>]+>/g, '')
    if (ct) parts.push(cleanLines(ct))
    if (content.trim()) parts.push(cleanLines(content))
  }
  return new Blob([parts.join('\n\n')], { type: 'text/plain;charset=utf-8' })
}

// ============================ 单文件入口 ============================
export async function convertFile(
  file: File,
  config: Partial<EpubConfig> = {}
): Promise<EpubResult> {
  const cfg: EpubConfig = { ...DEFAULT_CONFIG, ...config }
  const title = file.name.replace(/\.(txt|epub)$/i, '')

  const arrayBuffer = await file.arrayBuffer()
  let rawText: string
  let epubAuthor = ''
  if (/\.epub$/i.test(file.name)) {
    const r = await readEpub(arrayBuffer)
    rawText = r.text
    epubAuthor = r.author
  } else {
    rawText = decodeText(arrayBuffer)
  }

  let text = rawText
  const blockWords = cfg.blockWords
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean)
  if (blockWords.length) {
    text = text.replace(new RegExp(blockWords.map(escapeRe).join('|'), 'g'), '')
  }
  text = sanitize(text)

  if (cfg.startMarker) {
    const idx = text.indexOf(cfg.startMarker)
    if (idx === -1) throw new Error(`找不到起始标记：${cfg.startMarker}`)
    text = text.slice(idx)
  }
  if (!text.trim()) throw new Error('起始标记之后没有内容')

  const chapterRe = new RegExp(cfg.chapterPattern, 'gim')
  let chapters: Chapter[] = splitChapters(text, chapterRe)
    .map(([t, c]) => [t.trim(), c.trim()] as Chapter)
    .filter(([, c]) => c)
  chapters = chapters.map(([t, c]) => [t || `${title} 片段`, c] as Chapter)

  const author = (cfg.author || epubAuthor || '').trim()
  const epubBlob = await buildEpubBlob(chapters, title, author)
  const txtBlob = buildTxtBlob(chapters, title, author)

  return { title, epubBlob, txtBlob, chapterCount: chapters.length, author }
}

// ============================ 批量入口 ============================
/**
 * 批量转换。串行执行，避免多本大文件同时占用内存。
 * onProgress 在每个文件完成时回调，用于更新 UI。
 */
export async function convertFiles(
  files: File[],
  config: Partial<EpubConfig> = {},
  onProgress?: (done: number, total: number, item: BatchItemResult) => void
): Promise<BatchItemResult[]> {
  const results: BatchItemResult[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    let item: BatchItemResult
    try {
      const result = await convertFile(file, config)
      item = { file, ok: true, result }
    } catch (err) {
      item = {
        file,
        ok: false,
        error: err instanceof Error ? err.message : String(err)
      }
    }
    results.push(item)
    onProgress?.(i + 1, files.length, item)
  }
  return results
}

/**
 * 读取文件并返回纯文本预览。
 * 不做拆章、不清洗，只解码和去 HTML 标签，速度快。
 */
export async function readFilePreview(file: File): Promise<FilePreview> {
  const arrayBuffer = await file.arrayBuffer()
  const title = file.name.replace(/\.(txt|epub)$/i, '')

  if (/\.epub$/i.test(file.name)) {
    const { text, author } = await readEpub(arrayBuffer)
    return { title, text, author, kind: 'epub', size: file.size }
  }

  const text = decodeText(arrayBuffer)
  return { title, text, author: '', kind: 'txt', size: file.size }
}
