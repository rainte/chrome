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

export const get = (key: string, value = true) => {
  return db.rows
    .where({ key })
    .first()
    .then((res) => (value ? res?.value : res))
}

export const set = async (key: string, value: any) => {
  const ok = await get(key, false)
  if (ok) {
    await db.rows.where({ key }).modify({ value })
  } else {
    await db.rows.add({ key, value })
  }
}

export default {
  get,
  set
}
