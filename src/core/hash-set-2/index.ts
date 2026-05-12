import type { EqualityComparator, HashFunction, HashSetOptions, HashSetStats } from './types.js'

const DEFAULT_INITIAL_CAPACITY = 16
const DEFAULT_LOAD_FACTOR = 0.75
const MIN_CAPACITY = 4

function defaultHash<T>(value: T): number {
  if (typeof value === 'string') {
    let h = 0
    for (let i = 0; i < value.length; i++) {
      h = (31 * h + value.charCodeAt(i)) | 0
    }
    return h
  }
  if (typeof value === 'number') {
    return value | 0
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  if (value === null || value === undefined) {
    return 0
  }
  return String(value)
    .split('')
    .reduce((h, c) => (31 * h + c.charCodeAt(0)) | 0, 0)
}

function defaultEquals<T>(a: T, b: T): boolean {
  if (typeof a === 'number' && typeof b === 'number') {
    if (a === b) return true
    return Number.isNaN(a) && Number.isNaN(b)
  }
  return a === b
}

export class HashSet<T> {
  private buckets: (T | undefined)[]
  private state: ('empty' | 'occupied' | 'deleted')[]
  private _size = 0
  private hashFn: HashFunction<T>
  private eq: EqualityComparator<T>
  private maxLoadFactor: number
  private _collisions = 0

  constructor(options?: HashSetOptions<T>) {
    const cap = options?.initialCapacity ?? DEFAULT_INITIAL_CAPACITY
    this.buckets = new Array(Math.max(MIN_CAPACITY, cap)).fill(undefined)
    this.state = new Array(this.buckets.length).fill('empty')
    this.hashFn = options?.hashFunction ?? defaultHash
    this.eq = options?.equals ?? defaultEquals
    this.maxLoadFactor = options?.loadFactor ?? DEFAULT_LOAD_FACTOR
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  add(value: T): boolean {
    if (this._size + 1 > this.buckets.length * this.maxLoadFactor) {
      this.resize(this.buckets.length * 2)
    }
    const idx = this.probeInsert(value)
    if (this.state[idx] === 'occupied' && this.eq(this.buckets[idx]!, value)) {
      return false
    }
    this.buckets[idx] = value
    this.state[idx] = 'occupied'
    this._size++
    return true
  }

  has(value: T): boolean {
    const idx = this.probeFind(value)
    return idx !== -1
  }

  delete(value: T): boolean {
    const idx = this.probeFind(value)
    if (idx === -1) return false
    this.state[idx] = 'deleted'
    this.buckets[idx] = undefined
    this._size--
    return true
  }

  clear(): void {
    this.buckets.fill(undefined)
    this.state.fill('empty')
    this._size = 0
    this._collisions = 0
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        result.push(this.buckets[i]!)
      }
    }
    return result
  }

  forEach(callback: (value: T, index: number) => void): void {
    let idx = 0
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        callback(this.buckets[i]!, idx)
        idx++
      }
    }
  }

  *values(): Generator<T> {
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        yield this.buckets[i]!
      }
    }
  }

  union(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      hashFunction: this.hashFn,
      equals: this.eq,
      loadFactor: this.maxLoadFactor,
    })
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        result.add(this.buckets[i]!)
      }
    }
    for (let i = 0; i < other.buckets.length; i++) {
      if (other.state[i] === 'occupied') {
        result.add(other.buckets[i]!)
      }
    }
    return result
  }

  intersection(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      hashFunction: this.hashFn,
      equals: this.eq,
      loadFactor: this.maxLoadFactor,
    })
    const [smaller, larger] =
      this._size <= other._size ? [this, other] : [other, this]
    for (let i = 0; i < smaller.buckets.length; i++) {
      if (smaller.state[i] === 'occupied') {
        const val = smaller.buckets[i]!
        if (larger.has(val)) {
          result.add(val)
        }
      }
    }
    return result
  }

  difference(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      hashFunction: this.hashFn,
      equals: this.eq,
      loadFactor: this.maxLoadFactor,
    })
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        const val = this.buckets[i]!
        if (!other.has(val)) {
          result.add(val)
        }
      }
    }
    return result
  }

  symmetricDifference(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      hashFunction: this.hashFn,
      equals: this.eq,
      loadFactor: this.maxLoadFactor,
    })
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        const val = this.buckets[i]!
        if (!other.has(val)) {
          result.add(val)
        }
      }
    }
    for (let i = 0; i < other.buckets.length; i++) {
      if (other.state[i] === 'occupied') {
        const val = other.buckets[i]!
        if (!this.has(val)) {
          result.add(val)
        }
      }
    }
    return result
  }

  isSubsetOf(other: HashSet<T>): boolean {
    if (this._size > other._size) return false
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        if (!other.has(this.buckets[i]!)) return false
      }
    }
    return true
  }

  isSupersetOf(other: HashSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  equals(other: HashSet<T>): boolean {
    if (this._size !== other._size) return false
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        if (!other.has(this.buckets[i]!)) return false
      }
    }
    return true
  }

  stats(): HashSetStats {
    return {
      size: this._size,
      capacity: this.buckets.length,
      loadFactor: this._size / this.buckets.length,
      buckets: this.buckets.length,
      collisions: this._collisions,
    }
  }

  *[Symbol.iterator](): Iterator<T> {
    for (let i = 0; i < this.buckets.length; i++) {
      if (this.state[i] === 'occupied') {
        yield this.buckets[i]!
      }
    }
  }

  static from<T>(arr: T[], options?: HashSetOptions<T>): HashSet<T> {
    const set = new HashSet<T>(options)
    for (const item of arr) {
      set.add(item)
    }
    return set
  }

  private hashIndex(value: T): number {
    const h = this.hashFn(value)
    return ((h % this.buckets.length) + this.buckets.length) % this.buckets.length
  }

  private probeFind(value: T): number {
    const start = this.hashIndex(value)
    let firstDeleted = -1
    for (let i = 0; i < this.buckets.length; i++) {
      const idx = (start + i) % this.buckets.length
      if (this.state[idx] === 'empty') {
        return firstDeleted !== -1 ? -1 : -1
      }
      if (this.state[idx] === 'deleted') {
        if (firstDeleted === -1) firstDeleted = idx
        continue
      }
      if (this.state[idx] === 'occupied' && this.eq(this.buckets[idx]!, value)) {
        return idx
      }
    }
    return -1
  }

  private probeInsert(value: T): number {
    const start = this.hashIndex(value)
    let firstDeleted = -1
    for (let i = 0; i < this.buckets.length; i++) {
      const idx = (start + i) % this.buckets.length
      if (this.state[idx] === 'empty') {
        return firstDeleted !== -1 ? firstDeleted : idx
      }
      if (this.state[idx] === 'deleted') {
        if (firstDeleted === -1) firstDeleted = idx
        continue
      }
      if (this.state[idx] === 'occupied' && this.eq(this.buckets[idx]!, value)) {
        return idx
      }
      if (i > 0) this._collisions++
    }
    return firstDeleted !== -1 ? firstDeleted : start
  }

  private resize(newCapacity: number): void {
    const oldBuckets = this.buckets
    const oldState = this.state
    const cap = Math.max(MIN_CAPACITY, newCapacity)
    this.buckets = new Array(cap).fill(undefined)
    this.state = new Array(cap).fill('empty')
    this._collisions = 0
    for (let i = 0; i < oldBuckets.length; i++) {
      if (oldState[i] === 'occupied') {
        const value = oldBuckets[i]!
        const start = this.hashIndex(value)
        let placed = false
        for (let j = 0; j < this.buckets.length; j++) {
          const idx = (start + j) % this.buckets.length
          if (this.state[idx] === 'empty') {
            this.buckets[idx] = value
            this.state[idx] = 'occupied'
            placed = true
            break
          }
        }
        if (!placed) {
          this.buckets[start] = value
          this.state[start] = 'occupied'
        }
      }
    }
  }
}
