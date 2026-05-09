import type { HashSetOptions, HashSetStats } from './types.js'
import { DEFAULT_HASH_SET_OPTIONS } from './types.js'

const EMPTY = Symbol('EMPTY')
const TOMBSTONE = Symbol('TOMBSTONE')

type Slot<T> = T | typeof EMPTY | typeof TOMBSTONE

const DEFAULT_CAPACITY = 16
const MIN_CAPACITY = 8

function hashString(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return h
}

function defaultHash<T>(value: T): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  return hashString(String(value))
}

function defaultEquals<T>(a: T, b: T): boolean {
  return Object.is(a, b)
}

export class HashSet<T> {
  private slots: Slot<T>[]
  private _capacity: number
  private _size: number
  private _tombstones: number
  private readonly _hash: (value: T) => number
  private readonly _equals: (a: T, b: T) => boolean
  private readonly _loadFactorThreshold: number
  private readonly _minLoadFactor: number

  constructor(options?: HashSetOptions<T>)
  constructor(options?: HashSetOptions<T>) {
    const opts = options ?? {}
    this._capacity = Math.max(MIN_CAPACITY, opts.capacity ?? DEFAULT_CAPACITY)
    this._loadFactorThreshold = opts.loadFactorThreshold ?? DEFAULT_HASH_SET_OPTIONS.loadFactorThreshold ?? 0.75
    this._minLoadFactor = opts.minLoadFactor ?? DEFAULT_HASH_SET_OPTIONS.minLoadFactor ?? 0.25
    this._hash = opts.hash ?? defaultHash
    this._equals = opts.equals ?? defaultEquals
    this.slots = new Array<Slot<T>>(this._capacity).fill(EMPTY)
    this._size = 0
    this._tombstones = 0
  }

  private indexOf(value: T): number {
    const h = this._hash(value)
    const start = ((h % this._capacity) + this._capacity) % this._capacity
    for (let i = 0; i < this._capacity; i++) {
      const idx = (start + i) % this._capacity
      const slot = this.slots[idx]!
      if (slot === EMPTY) {
        return -1
      }
      if (slot !== TOMBSTONE && this._equals(slot as T, value)) {
        return idx
      }
    }
    return -1
  }

  add(value: T): boolean {
    const h = this._hash(value)
    const start = ((h % this._capacity) + this._capacity) % this._capacity
    let firstTombstone = -1
    for (let i = 0; i < this._capacity; i++) {
      const idx = (start + i) % this._capacity
      const slot = this.slots[idx]!
      if (slot === EMPTY) {
        const target = firstTombstone >= 0 ? firstTombstone : idx
        this.slots[target] = value
        if (target !== idx && firstTombstone >= 0) {
          this._tombstones--
        }
        this._size++
        this.maybeGrow()
        return true
      }
      if (slot === TOMBSTONE) {
        if (firstTombstone < 0) {
          firstTombstone = idx
        }
        continue
      }
      if (this._equals(slot as T, value)) {
        return false
      }
    }
    if (firstTombstone >= 0) {
      this.slots[firstTombstone] = value
      this._tombstones--
      this._size++
      this.maybeGrow()
      return true
    }
    return false
  }

  delete(value: T): boolean {
    const idx = this.indexOf(value)
    if (idx < 0) {
      return false
    }
    this.slots[idx] = TOMBSTONE
    this._tombstones++
    this._size--
    this.maybeShrink()
    return true
  }

  has(value: T): boolean {
    return this.indexOf(value) >= 0
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.slots.fill(EMPTY)
    this._size = 0
    this._tombstones = 0
  }

  clone(): HashSet<T> {
    const copy = new HashSet<T>({
      capacity: this._capacity,
      loadFactorThreshold: this._loadFactorThreshold,
      minLoadFactor: this._minLoadFactor,
      hash: this._hash,
      equals: this._equals,
    })
    copy.slots = [...this.slots]
    copy._size = this._size
    copy._tombstones = this._tombstones
    return copy
  }

  static from<T>(iterable: Iterable<T>, options?: HashSetOptions<T>): HashSet<T> {
    const set = new HashSet<T>(options)
    for (const value of iterable) {
      set.add(value)
    }
    return set
  }

  toArray(): T[] {
    const result: T[] = []
    for (let i = 0; i < this._capacity; i++) {
      const slot = this.slots[i]!
      if (slot !== EMPTY && slot !== TOMBSTONE) {
        result.push(slot as T)
      }
    }
    return result
  }

  forEach(callback: (value: T) => void): void {
    for (let i = 0; i < this._capacity; i++) {
      const slot = this.slots[i]!
      if (slot !== EMPTY && slot !== TOMBSTONE) {
        callback(slot as T)
      }
    }
  }

  union(other: HashSet<T>): HashSet<T> {
    const result = this.clone()
    other.forEach((v) => result.add(v))
    return result
  }

  intersection(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      capacity: this._capacity,
      loadFactorThreshold: this._loadFactorThreshold,
      minLoadFactor: this._minLoadFactor,
      hash: this._hash,
      equals: this._equals,
    })
    const smaller = this._size <= other._size ? this : other
    const larger = this._size <= other._size ? other : this
    smaller.forEach((v) => {
      if (larger.has(v)) {
        result.add(v)
      }
    })
    return result
  }

  difference(other: HashSet<T>): HashSet<T> {
    const result = new HashSet<T>({
      capacity: this._capacity,
      loadFactorThreshold: this._loadFactorThreshold,
      minLoadFactor: this._minLoadFactor,
      hash: this._hash,
      equals: this._equals,
    })
    this.forEach((v) => {
      if (!other.has(v)) {
        result.add(v)
      }
    })
    return result
  }

  symmetricDifference(other: HashSet<T>): HashSet<T> {
    const result = this.difference(other)
    other.forEach((v) => {
      if (!this.has(v)) {
        result.add(v)
      }
    })
    return result
  }

  isSubsetOf(other: HashSet<T>): boolean {
    if (this._size > other._size) {
      return false
    }
    let allFound = true
    this.forEach((v) => {
      if (!other.has(v)) {
        allFound = false
      }
    })
    return allFound
  }

  isSupersetOf(other: HashSet<T>): boolean {
    return other.isSubsetOf(this)
  }

  isDisjointFrom(other: HashSet<T>): boolean {
    const smaller = this._size <= other._size ? this : other
    const larger = this._size <= other._size ? other : this
    let disjoint = true
    smaller.forEach((v) => {
      if (larger.has(v)) {
        disjoint = false
      }
    })
    return disjoint
  }

  stats(): HashSetStats {
    return {
      size: this._size,
      capacity: this._capacity,
      loadFactor: this._size / this._capacity,
      tombstones: this._tombstones,
    }
  }

  loadFactor(): number {
    return this._size / this._capacity
  }

  private maybeGrow(): void {
    if ((this._size + this._tombstones) / this._capacity >= this._loadFactorThreshold) {
      this.rehashInternal(this._capacity * 2)
    }
  }

  private maybeShrink(): void {
    if (this._capacity > MIN_CAPACITY && this._size / this._capacity < this._minLoadFactor) {
      this.rehashInternal(Math.max(MIN_CAPACITY, this._capacity / 2))
    }
  }

  rehash(newCapacity?: number): void {
    const cap = Math.max(MIN_CAPACITY, newCapacity ?? this._capacity)
    this.rehashInternal(cap)
  }

  private rehashInternal(newCapacity: number): void {
    const oldSlots = this.slots
    this._capacity = newCapacity
    this.slots = new Array<Slot<T>>(newCapacity).fill(EMPTY)
    this._size = 0
    this._tombstones = 0
    for (let i = 0; i < oldSlots.length; i++) {
      const slot = oldSlots[i]!
      if (slot !== EMPTY && slot !== TOMBSTONE) {
        this.add(slot as T)
      }
    }
  }
}

export type { HashSetOptions, HashSetStats } from './types.js'
export { DEFAULT_HASH_SET_OPTIONS } from './types.js'
