import type { CuckooEntry, HashFunction, CuckooHashOptions } from './types.js'

function defaultHash1(key: unknown, tableSize: number): number {
  const str = String(key)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) - hash + ch) | 0
  }
  return ((hash >>> 0) % (tableSize >>> 0))
}

function defaultHash2(key: unknown, tableSize: number): number {
  const str = String(key)
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    hash = ((hash << 5) + hash + ch) | 0
  }
  return ((hash >>> 0) % (tableSize >>> 0))
}

export class CuckooHash<K, V> {
  private table1: Array<CuckooEntry<K, V> | null>
  private table2: Array<CuckooEntry<K, V> | null>
  private _capacity: number
  private _size = 0
  private maxLoadFactor: number
  private maxKicks: number
  private hash1: HashFunction<K>
  private hash2: HashFunction<K>

  constructor(options?: CuckooHashOptions<K>) {
    this._capacity = options?.initialCapacity ?? 16
    this.maxLoadFactor = options?.maxLoadFactor ?? 0.5
    this.maxKicks = options?.maxKicks ?? 500
    this.hash1 = options?.hash1 ?? (defaultHash1 as HashFunction<K>)
    this.hash2 = options?.hash2 ?? (defaultHash2 as HashFunction<K>)
    this.table1 = new Array(this._capacity).fill(null)
    this.table2 = new Array(this._capacity).fill(null)
  }

  set(key: K, value: V): void {
    const idx1 = this.hash1(key, this._capacity)
    const idx2 = this.hash2(key, this._capacity)

    if (this.table1[idx1] !== null && Object.is(this.table1[idx1]!.key, key)) {
      this.table1[idx1]!.value = value
      return
    }
    if (this.table2[idx2] !== null && Object.is(this.table2[idx2]!.key, key)) {
      this.table2[idx2]!.value = value
      return
    }

    if (this.loadFactor >= this.maxLoadFactor) {
      this.resize()
    }

    let entry: CuckooEntry<K, V> = { key, value }
    let useTable1 = true

    for (let i = 0; i < this.maxKicks; i++) {
      if (useTable1) {
        const idx = this.hash1(entry.key, this._capacity)
        if (this.table1[idx] === null) {
          this.table1[idx] = entry
          this._size++
          return
        }
        const evicted = this.table1[idx]!
        this.table1[idx] = entry
        entry = evicted
      } else {
        const idx = this.hash2(entry.key, this._capacity)
        if (this.table2[idx] === null) {
          this.table2[idx] = entry
          this._size++
          return
        }
        const evicted = this.table2[idx]!
        this.table2[idx] = entry
        entry = evicted
      }
      useTable1 = !useTable1
    }

    this.resize()
    this.set(entry.key, entry.value)
  }

  get(key: K): V | undefined {
    const idx1 = this.hash1(key, this._capacity)
    if (this.table1[idx1] !== null && Object.is(this.table1[idx1]!.key, key)) {
      return this.table1[idx1]!.value
    }
    const idx2 = this.hash2(key, this._capacity)
    if (this.table2[idx2] !== null && Object.is(this.table2[idx2]!.key, key)) {
      return this.table2[idx2]!.value
    }
    return undefined
  }

  delete(key: K): boolean {
    const idx1 = this.hash1(key, this._capacity)
    if (this.table1[idx1] !== null && Object.is(this.table1[idx1]!.key, key)) {
      this.table1[idx1] = null
      this._size--
      return true
    }
    const idx2 = this.hash2(key, this._capacity)
    if (this.table2[idx2] !== null && Object.is(this.table2[idx2]!.key, key)) {
      this.table2[idx2] = null
      this._size--
      return true
    }
    return false
  }

  has(key: K): boolean {
    const idx1 = this.hash1(key, this._capacity)
    if (this.table1[idx1] !== null && Object.is(this.table1[idx1]!.key, key)) {
      return true
    }
    const idx2 = this.hash2(key, this._capacity)
    if (this.table2[idx2] !== null && Object.is(this.table2[idx2]!.key, key)) {
      return true
    }
    return false
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.table1 = new Array(this._capacity).fill(null)
    this.table2 = new Array(this._capacity).fill(null)
    this._size = 0
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this._capacity; i++) {
      if (this.table1[i] !== null) {
        result.push(this.table1[i]!.key)
      }
      if (this.table2[i] !== null) {
        result.push(this.table2[i]!.key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._capacity; i++) {
      if (this.table1[i] !== null) {
        result.push(this.table1[i]!.value)
      }
      if (this.table2[i] !== null) {
        result.push(this.table2[i]!.value)
      }
    }
    return result
  }

  entries(): [K, V][] {
    const result: [K, V][] = []
    for (let i = 0; i < this._capacity; i++) {
      if (this.table1[i] !== null) {
        const e = this.table1[i]!
        result.push([e.key, e.value])
      }
      if (this.table2[i] !== null) {
        const e = this.table2[i]!
        result.push([e.key, e.value])
      }
    }
    return result
  }

  forEach(callback: (key: K, value: V, table: CuckooHash<K, V>) => void): void {
    for (let i = 0; i < this._capacity; i++) {
      if (this.table1[i] !== null) {
        const e = this.table1[i]!
        callback(e.key, e.value, this)
      }
      if (this.table2[i] !== null) {
        const e = this.table2[i]!
        callback(e.key, e.value, this)
      }
    }
  }

  toArray(): [K, V][] {
    return this.entries()
  }

  get loadFactor(): number {
    return this._size / (this._capacity * 2)
  }

  resize(newCapacity?: number): void {
    const cap = newCapacity ?? this._capacity * 2
    const oldTable1 = this.table1
    const oldTable2 = this.table2
    const oldCapacity = this._capacity

    this._capacity = cap
    this.table1 = new Array(cap).fill(null)
    this.table2 = new Array(cap).fill(null)
    this._size = 0

    for (let i = 0; i < oldCapacity; i++) {
      if (oldTable1[i] !== null) {
        const e = oldTable1[i]!
        this.set(e.key, e.value)
      }
      if (oldTable2[i] !== null) {
        const e = oldTable2[i]!
        this.set(e.key, e.value)
      }
    }
  }

  clone(): CuckooHash<K, V> {
    const copy = new CuckooHash<K, V>({
      initialCapacity: this._capacity,
      maxLoadFactor: this.maxLoadFactor,
      maxKicks: this.maxKicks,
      hash1: this.hash1,
      hash2: this.hash2,
    })
    copy._size = this._size
    for (let i = 0; i < this._capacity; i++) {
      if (this.table1[i] !== null) {
        const e = this.table1[i]!
        copy.table1[i] = { key: e.key, value: e.value }
      }
      if (this.table2[i] !== null) {
        const e = this.table2[i]!
        copy.table2[i] = { key: e.key, value: e.value }
      }
    }
    return copy
  }

  containsValue(value: V): boolean {
    for (let i = 0; i < this._capacity; i++) {
      if (this.table1[i] !== null && this.table1[i]!.value === value) {
        return true
      }
      if (this.table2[i] !== null && this.table2[i]!.value === value) {
        return true
      }
    }
    return false
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const entries = this.entries()
    let idx = 0
    return {
      next: () => {
        if (idx < entries.length) {
          const value = entries[idx]!
          idx++
          return { value, done: false }
        }
        return { value: undefined, done: true } as IteratorResult<[K, V]>
      },
    }
  }

  static from<K, V>(
    entries: Iterable<readonly [K, V]> | ArrayLike<readonly [K, V]>,
    options?: CuckooHashOptions<K>,
  ): CuckooHash<K, V> {
    const map = new CuckooHash<K, V>(options)
    if (Symbol.iterator in entries) {
      for (const [key, value] of entries as Iterable<readonly [K, V]>) {
        map.set(key, value)
      }
    }
    return map
  }

  toString(): string {
    return `${CuckooHash}({ size: ${this.size}, items: ${JSON.stringify(this.toArray())} })`
  }
}
