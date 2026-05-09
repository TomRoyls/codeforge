import type { CuckooEntry, CuckooHashMapOptions, CuckooHashMapStats } from './types.js'

const DEFAULT_CAPACITY = 16
const DEFAULT_MAX_KICKS = 50
const LOAD_FACTOR_THRESHOLD = 0.5

export class CuckooHashMap<K, V> {
  private table1: (CuckooEntry<K, V> | null)[]
  private table2: (CuckooEntry<K, V> | null)[]
  private _capacity: number
  private _size: number = 0
  private _maxKicks: number
  private _maxKicksUsed: number = 0
  private _seed: number

  constructor(options?: CuckooHashMapOptions) {
    const capacity = options?.capacity ?? DEFAULT_CAPACITY
    const maxKicks = options?.maxKicks ?? DEFAULT_MAX_KICKS
    this._capacity = Math.max(2, capacity)
    this._maxKicks = Math.max(1, maxKicks)
    this._seed = 0x9e3779b9
    const half = Math.ceil(this._capacity / 2)
    this.table1 = new Array<CuckooEntry<K, V> | null>(half).fill(null)
    this.table2 = new Array<CuckooEntry<K, V> | null>(half).fill(null)
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

  private h1(key: K): number {
    return this.hashKey(key, this._seed) % this.table1.length
  }

  private h2(key: K): number {
    const hash = this.hashKey(key, this._seed)
    const derived = (hash ^ (hash >>> 16)) + 1
    return Math.abs(derived) % this.table2.length
  }

  private findEntry(key: K): { table: (CuckooEntry<K, V> | null)[]; idx: number; entry: CuckooEntry<K, V> } | null {
    const i1 = this.h1(key)
    const e1 = this.table1[i1]!
    if (e1 !== null && e1.key === key) {
      return { table: this.table1, idx: i1, entry: e1 }
    }
    const i2 = this.h2(key)
    const e2 = this.table2[i2]!
    if (e2 !== null && e2.key === key) {
      return { table: this.table2, idx: i2, entry: e2 }
    }
    return null
  }

  set(key: K, value: V): void {
    const found = this.findEntry(key)
    if (found) {
      found.entry.value = value
      return
    }

    if (this.loadFactor >= LOAD_FACTOR_THRESHOLD) {
      this.rehash(this._capacity * 2)
    }

    const entry: CuckooEntry<K, V> = { key, value }
    let current: CuckooEntry<K, V> = entry
    let useTable1 = true
    let kicks = 0

    while (kicks < this._maxKicks) {
      if (useTable1) {
        const idx = this.h1(current.key)
        const existing = this.table1[idx]
        if (existing === null) {
          this.table1[idx] = current
          this._size++
          this._maxKicksUsed = Math.max(this._maxKicksUsed, kicks)
          return
        }
        this.table1[idx] = current
        current = existing!
      } else {
        const idx = this.h2(current.key)
        const existing = this.table2[idx]
        if (existing === null) {
          this.table2[idx] = current
          this._size++
          this._maxKicksUsed = Math.max(this._maxKicksUsed, kicks)
          return
        }
        this.table2[idx] = current
        current = existing!
      }
      useTable1 = !useTable1
      kicks++
    }

    this.rehash(this._capacity * 2)
    this.set(current.key, current.value)
  }

  get(key: K): V | undefined {
    const found = this.findEntry(key)
    return found ? found.entry.value : undefined
  }

  delete(key: K): boolean {
    const i1 = this.h1(key)
    const e1 = this.table1[i1]!
    if (e1 !== null && e1.key === key) {
      this.table1[i1] = null
      this._size--
      return true
    }
    const i2 = this.h2(key)
    const e2 = this.table2[i2]!
    if (e2 !== null && e2.key === key) {
      this.table2[i2] = null
      this._size--
      return true
    }
    return false
  }

  has(key: K): boolean {
    return this.findEntry(key) !== null
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get loadFactor(): number {
    return this._size / this._capacity
  }

  clear(): void {
    for (let i = 0; i < this.table1.length; i++) {
      this.table1[i] = null
    }
    for (let i = 0; i < this.table2.length; i++) {
      this.table2[i] = null
    }
    this._size = 0
    this._maxKicksUsed = 0
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

  [Symbol.iterator](): Iterator<[K, V]> {
    const all = this.entries()
    let idx = 0
    return {
      next(): IteratorResult<[K, V]> {
        if (idx < all.length) {
          return { value: all[idx++]!, done: false }
        }
        return { value: undefined, done: true }
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
    this._maxKicksUsed = 0
    this._seed = (this._seed * 0x9e3779b9 + 0x6a09e667) | 0
    for (const [key, value] of oldEntries) {
      this.set(key, value)
    }
  }

  getStats(): CuckooHashMapStats {
    return {
      size: this._size,
      capacity: this._capacity,
      loadFactor: this.loadFactor,
      maxKicksUsed: this._maxKicksUsed
    }
  }
}
