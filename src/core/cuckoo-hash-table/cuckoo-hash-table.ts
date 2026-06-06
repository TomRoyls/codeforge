import type { CuckooHashTableOptions, CuckooHashTableStatistics, CuckooEntry } from './types.js'
import { DEFAULT_CUCKOO_OPTIONS } from './types.js'

export class CuckooHashTable<K, V> {
  private tables: (CuckooEntry<K, V> | undefined)[][]
  private _capacity: number
  private _size = 0
  private maxEvictions: number
  private numTables: number
  private stats: CuckooHashTableStatistics
  private seed: number

  constructor(options?: Partial<CuckooHashTableOptions>) {
    const opts: CuckooHashTableOptions = { ...DEFAULT_CUCKOO_OPTIONS, ...options }
    this._capacity = opts.capacity
    this.maxEvictions = opts.maxEvictions
    this.numTables = opts.numTables
    this.seed = Math.floor(Math.random() * 0xffffffff) >>> 0
    this.tables = []
    for (let t = 0; t < this.numTables; t++) {
      this.tables.push(new Array<CuckooEntry<K, V> | undefined>(this._capacity).fill(undefined))
    }
    this.stats = { insertions: 0, evictions: 0, resizes: 0, lookups: 0, deletions: 0 }
  }

  set(key: K, value: V): void {
    for (let t = 0; t < this.numTables; t++) {
      const idx = this.hash(key, t)
      const entry = this.tables[t]![idx]
      if (entry !== undefined && this.keyEquals(entry.key, key)) {
        this.tables[t]![idx] = { key, value }
        return
      }
    }

    for (let growAttempt = 0; growAttempt < 20; growAttempt++) {
      const result = this.tryPlace(key, value)
      if (result === null) {
        this._size++
        this.stats.insertions++
        return
      }
      // tryPlace failed — collect all entries, resize, and reinsert
      const displaced = result
      const allEntries = this.entries()
      allEntries.push({ key: displaced.key, value: displaced.value })
      const sizeBefore = allEntries.length
      this.rebuildTables(Math.max(this._capacity * 2, sizeBefore))
      for (const e of allEntries) {
        this.placeEntry(e.key, e.value)
      }
      // If all entries were placed successfully, we're done.
      // The new entry was part of allEntries, so _size already reflects it.
      if (this._size === sizeBefore) return
      // Some entries were lost during placement — loop and retry
    }
  }

  private tryPlace(key: K, value: V): CuckooEntry<K, V> | null {
    for (let t = 0; t < this.numTables; t++) {
      const idx = this.hash(key, t)
      if (this.tables[t]![idx] === undefined) {
        this.tables[t]![idx] = { key, value }
        return null
      }
    }

    let currentKey = key
    let currentValue = value
    let tableIndex = 0

    for (let i = 0; i < this.maxEvictions; i++) {
      const idx = this.hash(currentKey, tableIndex)
      const evicted = this.tables[tableIndex]![idx]!
      this.tables[tableIndex]![idx] = { key: currentKey, value: currentValue }
      this.stats.evictions++

      currentKey = evicted.key
      currentValue = evicted.value
      tableIndex = (tableIndex + 1) % this.numTables

      const newIdx = this.hash(currentKey, tableIndex)
      if (this.tables[tableIndex]![newIdx] === undefined) {
        this.tables[tableIndex]![newIdx] = { key: currentKey, value: currentValue }
        return null
      }
    }

    return { key: currentKey, value: currentValue }
  }

  private placeEntry(key: K, value: V): void {
    for (let t = 0; t < this.numTables; t++) {
      const idx = this.hash(key, t)
      if (this.tables[t]![idx] === undefined) {
        this.tables[t]![idx] = { key, value }
        this._size++
        this.stats.insertions++
        return
      }
    }

    let currentKey = key
    let currentValue = value
    let tableIndex = 0

    for (let i = 0; i < this.maxEvictions * 4; i++) {
      const idx = this.hash(currentKey, tableIndex)
      const evicted = this.tables[tableIndex]![idx]!
      this.tables[tableIndex]![idx] = { key: currentKey, value: currentValue }
      this.stats.evictions++

      currentKey = evicted.key
      currentValue = evicted.value
      tableIndex = (tableIndex + 1) % this.numTables

      const newIdx = this.hash(currentKey, tableIndex)
      if (this.tables[tableIndex]![newIdx] === undefined) {
        this.tables[tableIndex]![newIdx] = { key: currentKey, value: currentValue }
        this._size++
        this.stats.insertions++
        return
      }
    }
  }

  get(key: K): V | undefined {
    this.stats.lookups++
    for (let t = 0; t < this.numTables; t++) {
      const idx = this.hash(key, t)
      const entry = this.tables[t]![idx]
      if (entry !== undefined && this.keyEquals(entry.key, key)) {
        return entry.value
      }
    }
    return undefined
  }

  delete(key: K): boolean {
    this.stats.deletions++
    for (let t = 0; t < this.numTables; t++) {
      const idx = this.hash(key, t)
      const entry = this.tables[t]![idx]
      if (entry !== undefined && this.keyEquals(entry.key, key)) {
        this.tables[t]![idx] = undefined
        this._size--
        return true
      }
    }
    return false
  }

  has(key: K): boolean {
    this.stats.lookups++
    for (let t = 0; t < this.numTables; t++) {
      const idx = this.hash(key, t)
      const entry = this.tables[t]![idx]
      if (entry !== undefined && this.keyEquals(entry.key, key)) {
        return true
      }
    }
    return false
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let t = 0; t < this.numTables; t++) {
      this.tables[t] = new Array<CuckooEntry<K, V> | undefined>(this._capacity).fill(undefined)
    }
    this._size = 0
  }

  keys(): K[] {
    const result: K[] = []
    for (let t = 0; t < this.numTables; t++) {
      for (let i = 0; i < this._capacity; i++) {
        const entry = this.tables[t]![i]
        if (entry !== undefined) {
          result.push(entry.key)
        }
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let t = 0; t < this.numTables; t++) {
      for (let i = 0; i < this._capacity; i++) {
        const entry = this.tables[t]![i]
        if (entry !== undefined) {
          result.push(entry.value)
        }
      }
    }
    return result
  }

  entries(): CuckooEntry<K, V>[] {
    const result: CuckooEntry<K, V>[] = []
    for (let t = 0; t < this.numTables; t++) {
      for (let i = 0; i < this._capacity; i++) {
        const entry = this.tables[t]![i]
        if (entry !== undefined) {
          result.push(entry)
        }
      }
    }
    return result
  }

  forEach(callback: (key: K, value: V) => void): void {
    for (let t = 0; t < this.numTables; t++) {
      for (let i = 0; i < this._capacity; i++) {
        const entry = this.tables[t]![i]
        if (entry !== undefined) {
          callback(entry.key, entry.value)
        }
      }
    }
  }

  [Symbol.iterator](): Iterator<CuckooEntry<K, V>> {
    const allEntries = this.entries()
    let index = 0
    return {
      next: () => {
        if (index < allEntries.length) {
          return { value: allEntries[index++]!, done: false }
        }
        return { value: undefined as unknown as CuckooEntry<K, V>, done: true }
      },
    }
  }

  get loadFactor(): number {
    const totalSlots = this._capacity * this.numTables
    if (totalSlots === 0) return 0
    return this._size / totalSlots
  }

  get capacity(): number {
    return this._capacity
  }

  getStatistics(): CuckooHashTableStatistics {
    return { ...this.stats }
  }

  rehash(newCapacity: number): void {
    const allEntries = this.entries()
    this.rebuildTables(newCapacity)
    for (const entry of allEntries) {
      this.placeEntry(entry.key, entry.value)
    }
  }

  private rebuildTables(newCapacity: number): void {
    this._capacity = newCapacity
    this.seed = (this.seed + 1) >>> 0
    this.tables = []
    for (let t = 0; t < this.numTables; t++) {
      this.tables.push(new Array<CuckooEntry<K, V> | undefined>(this._capacity).fill(undefined))
    }
    this._size = 0
    this.stats.resizes++
  }

  reserve(n: number): void {
    const requiredCapacity = Math.ceil(n / this.numTables)
    if (requiredCapacity > this._capacity) {
      this.rehash(requiredCapacity)
    }
  }

  private hash(key: K, tableIndex: number): number {
    const str = this.stringifyKey(key)
    let h = this.seed
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i)
      h = ((h << 5) - h + c) >>> 0
    }
    h ^= tableIndex * 0x9e3779b9
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = ((h >> 16) ^ h) * 0x45d9f3b
    h = (h >> 16) ^ h
    return h % this._capacity
  }

  private stringifyKey(key: K): string {
    if (key === null) return '__null__'
    if (key === undefined) return '__undefined__'
    if (typeof key === 'number' || typeof key === 'boolean') {
      return String(key)
    }
    if (typeof key === 'string') {
      return '__str__' + key
    }
    try {
      return '__obj__' + JSON.stringify(key)
    } catch {
      return String(key)
    }
  }

  private keyEquals(a: K, b: K): boolean {
    if (a === b) return true
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b)
    }
    return false
  }
}

export { DEFAULT_CUCKOO_OPTIONS } from './types.js'
export type { CuckooHashTableOptions, CuckooHashTableStatistics, CuckooEntry } from './types.js'
