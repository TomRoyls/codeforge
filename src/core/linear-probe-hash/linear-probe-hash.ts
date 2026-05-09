import type { HashEntry } from './types.js'

const TOMBSTONE = 'deleted'
const EMPTY = 'empty'
const OCCUPIED = 'occupied'
const DEFAULT_CAPACITY = 16
const LOAD_FACTOR_THRESHOLD = 0.7
const RESIZE_MULTIPLIER = 2

export class LinearProbeHashTable<K, V> {
  private buckets: HashEntry<K, V>[]
  private _size: number = 0
  private _capacity: number
  private _tombstoneCount: number = 0

  constructor(capacity: number = DEFAULT_CAPACITY) {
    if (capacity < 1) {
      throw new RangeError('Capacity must be at least 1')
    }
    this._capacity = capacity
    this.buckets = this.createBuckets(capacity)
  }

  private createBuckets(count: number): HashEntry<K, V>[] {
    const arr: HashEntry<K, V>[] = []
    for (let i = 0; i < count; i++) {
      arr.push({ key: undefined as unknown as K, value: undefined as unknown as V, state: EMPTY })
    }
    return arr
  }

  private hash(key: K): number {
    const str = String(key)
    let h = 0
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0
    }
    return Math.abs(h)
  }

  private getEntry(idx: number): HashEntry<K, V> {
    return this.buckets[idx]!
  }

  private indexOf(key: K): number {
    const baseHash = this.hash(key)
    const cap = this._capacity
    for (let i = 0; i < cap; i++) {
      const idx = (baseHash + i) % cap
      const entry = this.getEntry(idx)
      if (entry.state === EMPTY) {
        return -1
      }
      if (entry.state === OCCUPIED && entry.key === key) {
        return idx
      }
    }
    return -1
  }

  private shouldResize(): boolean {
    return (this._size + this._tombstoneCount + 1) / this._capacity > LOAD_FACTOR_THRESHOLD
  }

  private resize(): void {
    const newCap = this._capacity * RESIZE_MULTIPLIER
    this.rehashTo(newCap)
  }

  private insertDirect(key: K, value: V): void {
    const baseHash = this.hash(key)
    const cap = this._capacity
    for (let i = 0; i < cap; i++) {
      const idx = (baseHash + i) % cap
      const entry = this.getEntry(idx)
      if (entry.state === EMPTY || entry.state === TOMBSTONE) {
        this.buckets[idx] = { key, value, state: OCCUPIED }
        return
      }
      if (entry.state === OCCUPIED && entry.key === key) {
        this.buckets[idx] = { key, value, state: OCCUPIED }
        return
      }
    }
  }

  private rehashTo(newCapacity: number): void {
    const oldBuckets = this.buckets
    const oldCapacity = this._capacity
    this._capacity = newCapacity
    this.buckets = this.createBuckets(newCapacity)
    this._size = 0
    this._tombstoneCount = 0

    for (let i = 0; i < oldCapacity; i++) {
      const entry = oldBuckets[i]!
      if (entry.state === OCCUPIED) {
        this.insertDirect(entry.key, entry.value)
        this._size++
      }
    }
  }

  set(key: K, value: V): void {
    if (this.shouldResize()) {
      this.resize()
    }
    const baseHash = this.hash(key)
    const cap = this._capacity
    let firstTombstone = -1

    for (let i = 0; i < cap; i++) {
      const idx = (baseHash + i) % cap
      const entry = this.getEntry(idx)
      if (entry.state === EMPTY) {
        const target = firstTombstone !== -1 ? firstTombstone : idx
        this.buckets[target] = { key, value, state: OCCUPIED }
        if (firstTombstone !== -1) {
          this._tombstoneCount--
        }
        this._size++
        return
      }
      if (entry.state === TOMBSTONE && firstTombstone === -1) {
        firstTombstone = idx
      }
      if (entry.state === OCCUPIED && entry.key === key) {
        this.buckets[idx] = { key, value, state: OCCUPIED }
        return
      }
    }

    if (firstTombstone !== -1) {
      this.buckets[firstTombstone] = { key, value, state: OCCUPIED }
      this._tombstoneCount--
      this._size++
    }
  }

  get(key: K): V | undefined {
    const idx = this.indexOf(key)
    if (idx === -1) return undefined
    return this.getEntry(idx).value
  }

  has(key: K): boolean {
    return this.indexOf(key) !== -1
  }

  delete(key: K): boolean {
    const idx = this.indexOf(key)
    if (idx === -1) return false
    this.buckets[idx] = {
      key: undefined as unknown as K,
      value: undefined as unknown as V,
      state: TOMBSTONE,
    }
    this._size--
    this._tombstoneCount++
    return true
  }

  size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this.buckets[i] = {
        key: undefined as unknown as K,
        value: undefined as unknown as V,
        state: EMPTY,
      }
    }
    this._size = 0
    this._tombstoneCount = 0
  }

  capacity(): number {
    return this._capacity
  }

  loadFactor(): number {
    return this._size / this._capacity
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.getEntry(i)
      if (entry.state === OCCUPIED) {
        result.push(entry.key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.getEntry(i)
      if (entry.state === OCCUPIED) {
        result.push(entry.value)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.getEntry(i)
      if (entry.state === OCCUPIED) {
        result.push([entry.key, entry.value])
      }
    }
    return result
  }

  forEach(fn: (key: K, value: V) => void): void {
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.getEntry(i)
      if (entry.state === OCCUPIED) {
        fn(entry.key, entry.value)
      }
    }
  }

  rehash(newCapacity?: number): void {
    const cap = newCapacity ?? this._capacity
    if (cap < 1) {
      throw new RangeError('New capacity must be at least 1')
    }
    if (cap < this._size) {
      throw new RangeError('New capacity is too small for current elements')
    }
    this.rehashTo(cap)
  }

  clone(): LinearProbeHashTable<K, V> {
    const cloned = new LinearProbeHashTable<K, V>(this._capacity)
    cloned._size = this._size
    cloned._tombstoneCount = this._tombstoneCount
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.getEntry(i)
      cloned.buckets[i] = {
        key: entry.key,
        value: entry.value,
        state: entry.state,
      }
    }
    return cloned
  }

  toString(): string {
    const parts: string[] = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.getEntry(i)
      if (entry.state === OCCUPIED) {
        parts.push(`${String(entry.key)} => ${String(entry.value)}`)
      }
    }
    return `{${parts.join(', ')}}`
  }

  containsValue(value: V, comparator?: (a: V, b: V) => boolean): boolean {
    const cmp = comparator ?? ((a: V, b: V) => a === b)
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.getEntry(i)
      if (entry.state === OCCUPIED && cmp(entry.value, value)) {
        return true
      }
    }
    return false
  }

  probeCount(key: K): number {
    const baseHash = this.hash(key)
    const cap = this._capacity
    for (let i = 0; i < cap; i++) {
      const idx = (baseHash + i) % cap
      const entry = this.getEntry(idx)
      if (entry.state === EMPTY) {
        return i + 1
      }
      if (entry.state === OCCUPIED && entry.key === key) {
        return i + 1
      }
    }
    return cap
  }
}
