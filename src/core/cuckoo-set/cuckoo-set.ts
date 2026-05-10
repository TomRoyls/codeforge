import { DEFAULT_CUCKOO_SET_OPTIONS } from './types.js'
import type { CuckooSetOptions, CuckooStats } from './types.js'

const EMPTY: unique symbol = Symbol('empty')
type Slot<T> = T | typeof EMPTY

export class CuckooSet<T = string> {
  private table1: Slot<T>[]
  private table2: Slot<T>[]
  private _capacity: number
  private _size: number = 0
  private _maxChainLength: number = 0
  private _resizeCount: number = 0
  private _maxKicks: number
  private seed1: number
  private seed2: number

  constructor(capacity?: number)
  constructor(options?: Partial<CuckooSetOptions>)
  constructor(arg?: number | Partial<CuckooSetOptions>) {
    if (arg === undefined) {
      this._capacity = DEFAULT_CUCKOO_SET_OPTIONS.capacity
      this._maxKicks = DEFAULT_CUCKOO_SET_OPTIONS.maxKicks
    } else if (typeof arg === 'number') {
      this._capacity = Math.max(2, arg)
      this._maxKicks = DEFAULT_CUCKOO_SET_OPTIONS.maxKicks
    } else {
      this._capacity = Math.max(2, arg.capacity ?? DEFAULT_CUCKOO_SET_OPTIONS.capacity)
      this._maxKicks = arg.maxKicks ?? DEFAULT_CUCKOO_SET_OPTIONS.maxKicks
    }
    const half = Math.ceil(this._capacity / 2)
    this.table1 = new Array<Slot<T>>(half).fill(EMPTY)
    this.table2 = new Array<Slot<T>>(half).fill(EMPTY)
    this.seed1 = 0x9e3779b9
    this.seed2 = 0x517cc1b7
  }

  private hashValue(value: T, seed: number): number {
    const str = String(value)
    let hash = seed
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      hash = ((hash << 5) - hash + ch) | 0
      hash = Math.imul(hash, 0x5bd1e995)
      hash ^= hash >>> 15
    }
    return Math.abs(hash)
  }

  private index1(value: T): number {
    return this.hashValue(value, this.seed1) % this.table1.length
  }

  private index2(value: T): number {
    return this.hashValue(value, this.seed2) % this.table2.length
  }

  private isOccupied(slot: Slot<T>): slot is T {
    return slot !== EMPTY
  }

  private findPosition(value: T): { table: Slot<T>[]; idx: number } | null {
    const i1 = this.index1(value)
    const v1 = this.table1[i1]!
    if (this.isOccupied(v1) && v1 === value) {
      return { table: this.table1, idx: i1 }
    }
    const i2 = this.index2(value)
    const v2 = this.table2[i2]!
    if (this.isOccupied(v2) && v2 === value) {
      return { table: this.table2, idx: i2 }
    }
    return null
  }

  add(value: T): boolean {
    const found = this.findPosition(value)
    if (found) {
      return false
    }

    let current: T = value
    let useTable1 = true
    let displacements = 0

    while (displacements < this._maxKicks) {
      if (useTable1) {
        const idx = this.index1(current)
        const existing = this.table1[idx]!
        if (!this.isOccupied(existing)) {
          this.table1[idx] = current
          this._size++
          this._maxChainLength = Math.max(this._maxChainLength, displacements)
          return true
        }
        this.table1[idx] = current
        current = existing
      } else {
        const idx = this.index2(current)
        const existing = this.table2[idx]!
        if (!this.isOccupied(existing)) {
          this.table2[idx] = current
          this._size++
          this._maxChainLength = Math.max(this._maxChainLength, displacements)
          return true
        }
        this.table2[idx] = current
        current = existing
      }
      useTable1 = !useTable1
      displacements++
    }

    this.rehash(this._capacity * 2)
    return this.add(current)
  }

  delete(value: T): boolean {
    const i1 = this.index1(value)
    const v1 = this.table1[i1]!
    if (this.isOccupied(v1) && v1 === value) {
      this.table1[i1] = EMPTY
      this._size--
      return true
    }
    const i2 = this.index2(value)
    const v2 = this.table2[i2]!
    if (this.isOccupied(v2) && v2 === value) {
      this.table2[i2] = EMPTY
      this._size--
      return true
    }
    return false
  }

  has(value: T): boolean {
    return this.findPosition(value) !== null
  }

  contains(value: T): boolean {
    return this.has(value)
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

  clone(): CuckooSet<T> {
    const cloned = new CuckooSet<T>(this._capacity)
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

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.table1.length; i++) {
      const val = this.table1[i]!
      if (this.isOccupied(val)) {
        result.push(val)
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const val = this.table2[i]!
      if (this.isOccupied(val)) {
        result.push(val)
      }
    }
    return result
  }

  static from<T>(items: Iterable<T>, capacity?: number): CuckooSet<T> {
    const arr = Array.from(items)
    const set = new CuckooSet<T>(capacity ?? Math.max(2, arr.length * 2))
    for (const item of arr) {
      set.add(item)
    }
    return set
  }

  forEach(callback: (value: T) => void): void {
    for (let i = 0; i < this.table1.length; i++) {
      const val = this.table1[i]!
      if (this.isOccupied(val)) {
        callback(val)
      }
    }
    for (let i = 0; i < this.table2.length; i++) {
      const val = this.table2[i]!
      if (this.isOccupied(val)) {
        callback(val)
      }
    }
  }

  get capacity(): number {
    return this._capacity
  }

  get loadFactor(): number {
    return this._size / this._capacity
  }

  rehash(newCapacity?: number): void {
    const cap = Math.max(2, newCapacity ?? this._capacity)
    const oldValues = this.toArray()
    this._capacity = cap
    const half = Math.ceil(cap / 2)
    this.table1 = new Array<Slot<T>>(half).fill(EMPTY)
    this.table2 = new Array<Slot<T>>(half).fill(EMPTY)
    this._size = 0
    this._maxChainLength = 0
    this.seed1 = (this.seed1 * 0x9e3779b9 + 0x6a09e667) | 0
    this.seed2 = (this.seed2 * 0x517cc1b7 + 0xbb67ae85) | 0
    for (const value of oldValues) {
      this.add(value)
    }
  }

  stats(): CuckooStats {
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

export { DEFAULT_CUCKOO_SET_OPTIONS } from './types.js'
export type { CuckooSetOptions, CuckooStats } from './types.js'
