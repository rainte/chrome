import { openDB, type DBConfig } from '@/lib/db'
import type { EpubResult } from '@/lib/epub'

const DB_KEY = 'book'
const ReaderConfig: DBConfig = {
  dbName: 'reader-db',
  storeName: 'books'
}

export enum Theme {
  Light = 'light',
  Sepia = 'sepia',
  Dark = 'dark'
}

export interface ReaderSettings {
  theme: Theme
  fontSize: number
  chapter: number
}

export const THEMES: Record<Theme, { bg: string; text: string; name: string }> = {
  [Theme.Light]: { bg: '#ffffff', text: '#222', name: '浅色' },
  [Theme.Sepia]: { bg: '#f5efe0', text: '#5b4636', name: '护眼' },
  [Theme.Dark]: { bg: '#1e1e1e', text: '#d4d4d4', name: '深色' }
}

export function saveBook(book: EpubResult) {
  return openDB(ReaderConfig).save(DB_KEY, book)
}

export function loadBook() {
  return openDB(ReaderConfig).load<EpubResult>(DB_KEY)
}

export function clearBook() {
  return openDB(ReaderConfig).clear(DB_KEY)
}
