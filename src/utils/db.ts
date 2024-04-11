import Dexie, { Table } from 'dexie'

export interface DexieRow {
  id?: number
  key: string
  value: any
}

export class SubDexie extends Dexie {
  rows!: Table<DexieRow>

  constructor() {
    super('db')
    this.version(1).stores({
      rows: '++id, key'
    })
  }
}

export const db = new SubDexie()
