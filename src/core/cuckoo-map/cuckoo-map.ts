import { DEFAULT_CUCKOO_MAP_OPTIONS } from './types.js'
import type { CuckooMapOptions, CuckooMapStats } from './types.js'

const EMPTY: unique symbol = Symbol('empty')

interface Entry<K, V> {
  key: K
  value: V
}

type Slot<K, V> = Entry<K, V> | typeof EMPTY

export class CuckooMap<K = string, V = unknown> {
  private table1: Slot<K, V>[]
  private table2: Slot<K, V>[]
  private _capacity: number
  private _size: number = 0
  private _maxChainLength: number = 0
  private _resizeCount: number = 0
  private _maxKicks: number
  private seed1: number
  private seed2: number

  constructor(capacity?: number)
  constructor(options?: Partial<CuckooMapOptions>)
  constructor(arg?: number | Partial<CuckooMapOptions>) {
    if (arg === undefined) {
      this._capacity = DEFAULT_CUCKOO_MAP_OPTIONS.capacity
      this._maxKicks = DEFAULT_CUCKOO_MAP_OPTIONS.maxKicks
    } else if (typeof arg === 'number') {
      this._capacity = Math.max(2, arg)
      this._maxKicks = DEFAULT_CUCKOO_MAP_OPTIONS.maxKicks
    } else {
      this._capacity = Math.max(2, arg.capacity ?? DEFAULT_CUCKOO_MAP_OPTIONS.capacity)
      this._maxKicks = arg.maxKicks ?? DEFAULT_CUCKOO_MAP_OPTIONS.maxKicks
    }
    const half = Math.ceil(this._capacity / 2)
    this.table1 = new Array<Slot<K, V>>(half).fill(EMPTY)
    this.table2 = new Array<Slot<K, V>>(half).fill(EMPTY)
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

  private isOccupied(slot: Slot<K, V>): slot is Entry<K, V> {
    return slot !== EMPTY
  }

  private findEntry(key: K): { table: Slot<K, V>[]; idx: number } | null {
    const i1 = this.index1(key)
    const s1 = this.table1[i1]!
    if (this.isOccupied(s1) && s1.key === key) {
      return { table: this.table1, idx: i1 }
    }
    const i2 = this.index2(key)
    const s2 = this.table2[i2]!
    if (this.isOccupied(s2) && s2.key === key) {
      return { table: this.table2, idx: i2 }
    }
    return null
  }

  set(key: K, value: V): void {
    const found = this.findEntry(key)
    if (found) {
      found.table[found.idx] = { key, value }
      return
    }

    let current: Entry<K, V> = { key, value }
    let useTable1 = true
    let displacements = 0

    while (displacements < this._maxKicks) {
      if (useTable1) {
        const idx = this.index1(current.key)
        const existing = this.table1[idx]!
        if (!this.isOccupied(existing)) {
          this.table1[idx] = current
          this._size++
          this._maxChainLength = Math.max(this._maxChainLength, displacements)
          return
        }
        this.table1[idx] = current
        current = existing
      } else {
        const idx = this.index2(current.key)
        const existing = this.table2[idx]!
        if (!this.isOccupied(existing)) {
          this.table2[idx] = current
          this._size++
          this._maxChainLength = Math.max(this._maxChainLength, displacements)
          return
        }
        this.table2[idx] = current
        current = existing
      }
      useTable1 = !useTable1
      displacements++
    }

    this.rehash(this._capacity * 2)
    this.set(current.key, current.value)
  }

  get(key: K): V | undefined {
    const found = this.findEntry(key)
    if (found) {
      const slot = found.table[found.idx]!
      if (this.isOccupied(slot)) {
        return slot.value
      }
    }
    return undefined
  }

  delete(key: K): boolean {
    const found = this.findEntry(key)
    if (found) {
      found.table[found.idx] = EMPTY
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

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this.table1.length; i++) {
      this.table1[i] = EMPTY
    }
    for (let i = 0; i < this.table2.length; i++) {
      this.table2[i] = EMPTY
    }
    this._size = 0
    this._maxChainLength = 0
  }

  clone(): CuckooMap<K, V> {
    const cloned = new CuckooMap<K, V>(this._capacity)
    cloned.seed1 = this.seed1
    cloned.seed2 = this.seed2
    cloned._size = this._size
    cloned._maxChainLength = this._maxChainLength
    cloned._resizeCount = this._resizeCount
    cloned._maxKicks = this._maxKicks
    cloned.table1 = [...this.table1]
    cloned.table2 = [...this.table2]
    return cloned
  }

  toArray(): [K, V][] {
    const result: [K, V][] = []
    for (let i = 0; i < this.table1.length; i++) {
      const slot = this.table1[i]!
      if (this.isOccupied(slot)) {
        result.push([slot.key, slot.value])
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const slot = this.table2[i]!
      if (this.isOccupied(slot)) {
        result.push([slot.key, slot.value])
      }
    }
    return result
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this.table1.length; i++) {
      const slot = this.table1[i]!
      if (this.isOccupied(slot)) {
        result.push(slot.key)
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const slot = this.table2[i]!
      if (this.isOccupied(slot)) {
        result.push(slot.key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this.table1.length; i++) {
      const slot = this.table1[i]!
      if (this.isOccupied(slot)) {
        result.push(slot.value)
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const slot = this.table2[i]!
      if (this.isOccupied(slot)) {
        result.push(slot.value)
      }
    }
    return result
  }

  entries(): [K, V][] {
    return this.toArray()
  }

  forEach(callback: (key: K, value: V) => void): void {
    for (let i = 0; i < this.table1.length; i++) {
      const slot = this.table1[i]!
      if (this.isOccupied(slot)) {
        callback(slot.key, slot.value)
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const slot = this.table2[i]!
      if (this.isOccupied(slot)) {
        callback(slot.key, slot.value)
      }
    }
  }

  static from<K, V>(entries: Iterable<[K, V]>, capacity?: number): CuckooMap<K, V> {
    const arr = Array.from(entries)
    const map = new CuckooMap<K, V>(capacity ?? Math.max(2, arr.length * 2))
    for (const [key, value] of arr) {
      map.set(key, value)
    }
    return map
  }

  get capacity(): number {
    return this._capacity
  }

  get loadFactor(): number {
    return this._size / this._capacity
  }

  rehash(newCapacity?: number): void {
    const cap = Math.max(2, newCapacity ?? this._capacity)
    const oldEntries = this.toArray()
    this._capacity = cap
    const half = Math.ceil(cap / 2)
    this.table1 = new Array<Slot<K, V>>(half).fill(EMPTY)
    this.table2 = new Array<Slot<K, V>>(half).fill(EMPTY)
    this._size = 0
    this._maxChainLength = 0
    this.seed1 = (this.seed1 * 0x9e3779b9 + 0x6a09e667) | 0
    this.seed2 = (this.seed2 * 0x517cc1b7 + 0xbb67ae85) | 0
    for (const [key, value] of oldEntries) {
      this.set(key, value)
    }
  }

  stats(): CuckooMapStats {
    let table1Occupancy = 0
    for (let i = 0; i < this.table1.length; i++) {
      if (this.isOccupied(this.table1[i]!)) {
        table1Occupancy++
      }
    }
    let table2Occupancy = 0
    for (let i = 0; i < this.table2.length; i++) {
      if (this.isOccupied(this.table2[i]!)) {
        table2Occupancy++
      }
    }
    return {
      size: this._size,
      capacity: this._capacity,
      loadFactor: this.loadFactor,
      maxChainLength: this._maxChainLength,
      table1Occupancy,
      table2Occupancy,
      resizeCount: this._resizeCount,
    }
  }
}

export { DEFAULT_CUCKOO_MAP_OPTIONS } from './types.js'
export type { CuckooMapOptions, CuckooMapStats } from './types.js'
