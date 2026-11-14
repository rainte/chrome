import { CHAPTER_RE } from '@/lib/epub'

export enum Theme {
  Light = 'light',
  Sepia = 'sepia',
  Dark = 'dark'
}

export interface ChapterItem {
  title: string
  content: string
}

export const THEMES: Record<Theme, { bg: string; text: string; name: string }> = {
  [Theme.Light]: { bg: '#ffffff', text: '#222', name: '浅色' },
  [Theme.Sepia]: { bg: '#f5efe0', text: '#5b4636', name: '护眼' },
  [Theme.Dark]: { bg: '#1e1e1e', text: '#d4d4d4', name: '深色' }
}

/** 按章节正则拆分，没匹配到就整本作为一章 */
export function splitPreviewChapters(text: string): ChapterItem[] {
  const matches = [...text.matchAll(new RegExp(CHAPTER_RE, 'gim'))]
  if (!matches.length) return [{ title: '全文', content: text }]

  const chapters: ChapterItem[] = []

  const firstStart = matches[0]!.index
  const preface = text.slice(0, firstStart).trim()
  if (preface) chapters.push({ title: '前言', content: preface })

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]!
    const start = m.index
    const end = i + 1 < matches.length ? matches[i + 1]!.index : text.length
    const block = text.slice(start, end)
    const nl = block.indexOf('\n')
    const title = (nl === -1 ? block : block.slice(0, nl)).trim()
    const content = nl === -1 ? '' : block.slice(nl + 1).trim()
    if (content) chapters.push({ title: title || `第 ${i + 1} 章`, content })
  }
  return chapters.length ? chapters : [{ title: '全文', content: text }]
}
