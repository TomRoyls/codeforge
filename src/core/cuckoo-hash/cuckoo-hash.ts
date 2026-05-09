import type { CuckooEntry } from './types.js'

export class CuckooHashTable<K, V> {
  private table1: (CuckooEntry<K, V> | null)[]
  private table2: (CuckooEntry<K, V> | null)[]
  private _capacity: number
  private _size: number = 0
  private _maxChainLength: number = 0
  private seed1: number
  private seed2: number
  private static readonly MAX_DISPLACEMENTS = 500
  private static readonly DEFAULT_CAPACITY = 16

  constructor(capacity?: number) {
    this._capacity = Math.max(2, capacity ?? CuckooHashTable.DEFAULT_CAPACITY)
    const half = Math.ceil(this._capacity / 2)
    this.table1 = new Array<CuckooEntry<K, V> | null>(half).fill(null)
    this.table2 = new Array<CuckooEntry<K, V> | null>(half).fill(null)
    this.seed1 = 0x9e3779b9
    this.seed2 = 0x517cc1b7
  }

  private hashKey(key: K, seed: number): number {
    const str = String(key)
    let hash = seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      hash = ((hash << 5) - hash + ch) | 0
      hash = Math.imul(hash, 0x5bd1e995)
      hash ^= hash >>> 15
    }
    return Math.abs(hash)
  }

  private index1(key: K): number {
    return this.hashKey(key, this.seed1) % this.table1.length
  }

  private index2(key: K): number {
    return this.hashKey(key, this.seed2) % this.table2.length
  }

  private findEntry(key: K): { table: (CuckooEntry<K, V> | null)[]; idx: number; entry: CuckooEntry<K, V> } | null {
    const i1 = this.index1(key)
    const e1 = this.table1[i1]!
    if (e1 !== null && e1.key === key) {
      return { table: this.table1, idx: i1, entry: e1 }
    }
    const i2 = this.index2(key)
    const e2 = this.table2[i2]!
    if (e2 !== null && e2.key === key) {
      return { table: this.table2, idx: i2, entry: e2 }
    }
    return null
  }

  set(key: K, value: V): boolean {
    const found = this.findEntry(key)
    if (found) {
      found.entry.value = value
      return true
    }

    const entry: CuckooEntry<K, V> = { key, value }
    let current: CuckooEntry<K, V> = entry
    let useTable1 = true
    let displacements = 0

    while (displacements < CuckooHashTable.MAX_DISPLACEMENTS) {
      if (useTable1) {
        const idx = this.index1(current.key)
        const existing = this.table1[idx]
        if (existing === null) {
          this.table1[idx] = current
          this._size++
          this._maxChainLength = Math.max(this._maxChainLength, displacements)
          return true
        }
        this.table1[idx] = current
        current = existing!
      } else {
        const idx = this.index2(current.key)
        const existing = this.table2[idx]
        if (existing === null) {
          this.table2[idx] = current
          this._size++
          this._maxChainLength = Math.max(this._maxChainLength, displacements)
          return true
        }
        this.table2[idx] = current
        current = existing!
      }
      useTable1 = !useTable1
      displacements++
    }

    this.rehash(this._capacity * 2)
    return this.set(current.key, current.value)
  }

  get(key: K): V | undefined {
    const found = this.findEntry(key)
    return found ? found.entry.value : undefined
  }

  has(key: K): boolean {
    return this.findEntry(key) !== null
  }

  delete(key: K): boolean {
    const i1 = this.index1(key)
    const e1 = this.table1[i1]!
    if (e1 !== null && e1.key === key) {
      this.table1[i1] = null
      this._size--
      return true
    }
    const i2 = this.index2(key)
    const e2 = this.table2[i2]!
    if (e2 !== null && e2.key === key) {
      this.table2[i2] = null
      this._size--
      return true
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
    for (let i = 0; i < this.table1.length; i++) {
      this.table1[i] = null
    }
    for (let i = 0; i < this.table2.length; i++) {
      this.table2[i] = null
    }
    this._size = 0
    this._maxChainLength = 0
  }

  capacity(): number {
    return this._capacity
  }

  loadFactor(): number {
    return this._size / this._capacity
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this.table1.length; i++) {
      const entry = this.table1[i]!
      if (entry !== null) {
        result.push(entry.key)
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const entry = this.table2[i]!
      if (entry !== null) {
        result.push(entry.key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this.table1.length; i++) {
      const entry = this.table1[i]!
      if (entry !== null) {
        result.push(entry.value)
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const entry = this.table2[i]!
      if (entry !== null) {
        result.push(entry.value)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this.table1.length; i++) {
      const entry = this.table1[i]!
      if (entry !== null) {
        result.push([entry.key, entry.value])
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const entry = this.table2[i]!
      if (entry !== null) {
        result.push([entry.key, entry.value])
      }
    }
    return result
  }

  forEach(fn: (key: K, value: V) => void): void {
    for (let i = 0; i < this.table1.length; i++) {
      const entry = this.table1[i]!
      if (entry !== null) {
        fn(entry.key, entry.value)
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const entry = this.table2[i]!
      if (entry !== null) {
        fn(entry.key, entry.value)
      }
    }
  }

  rehash(newCapacity?: number): void {
    const cap = Math.max(2, newCapacity ?? this._capacity)
    const oldEntries = this.entries()
    this._capacity = cap
    const half = Math.ceil(cap / 2)
    this.table1 = new Array<CuckooEntry<K, V> | null>(half).fill(null)
    this.table2 = new Array<CuckooEntry<K, V> | null>(half).fill(null)
    this._size = 0
    this._maxChainLength = 0
    this.seed1 = (this.seed1 * 0x9e3779b9 + 0x6a09e667) | 0
    this.seed2 = (this.seed2 * 0x517cc1b7 + 0xbb67ae85) | 0
    for (const [key, value] of oldEntries) {
      this.set(key, value)
    }
  }

  clone(): CuckooHashTable<K, V> {
    const cloned = new CuckooHashTable<K, V>(this._capacity)
    cloned.seed1 = this.seed1
    cloned.seed2 = this.seed2
    cloned._size = this._size
    cloned._maxChainLength = this._maxChainLength
    cloned.table1 = this.table1.map(e => e ? { key: e.key, value: e.value } : null)
    cloned.table2 = this.table2.map(e => e ? { key: e.key, value: e.value } : null)
    return cloned
  }

  toString(): string {
    const pairs = this.entries()
      .map(([k, v]) => `${String(k)}:${String(v)}`)
      .join(', ')
    return `CuckooHashTable{${pairs}}`
  }

  maxChainLength(): number {
    return this._maxChainLength
  }
}
