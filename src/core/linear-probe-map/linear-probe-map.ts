import type { LinearProbeMapOptions, LinearProbeMapStatistics } from './types.js'
import { DEFAULT_LINEAR_PROBE_MAP_OPTIONS } from './types.js'

type EntryState = 'occupied' | 'deleted' | 'empty'

interface Slot<K, V> {
  key: K
  value: V
  state: EntryState
}

export class LinearProbeMap<K, V> {
  private buckets: Slot<K, V>[]
  private _size: number = 0
  private _capacity: number
  private _loadFactorThreshold: number
  private _tombstones: number = 0
  private _stats: LinearProbeMapStatistics = {
    inserts: 0,
    deletes: 0,
    lookups: 0,
    probes: 0,
    rehashes: 0,
    maxProbeLength: 0,
    collisions: 0,
  }

  constructor(options?: LinearProbeMapOptions) {
    const opts = { ...DEFAULT_LINEAR_PROBE_MAP_OPTIONS, ...options }
    if (opts.capacity < 1) {
      throw new RangeError('Capacity must be at least 1')
    }
    if (opts.loadFactorThreshold <= 0 || opts.loadFactorThreshold > 1) {
      throw new RangeError('Load factor threshold must be in (0, 1]')
    }
    this._capacity = opts.capacity
    this._loadFactorThreshold = opts.loadFactorThreshold
    this.buckets = this.createBuckets(this._capacity)
  }

  private createBuckets(count: number): Slot<K, V>[] {
    const arr: Slot<K, V>[] = []
    for (let i = 0; i < count; i++) {
      arr.push({ key: undefined as unknown as K, value: undefined as unknown as V, state: 'empty' })
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

  private shouldResize(): boolean {
    return (this._size + this._tombstones + 1) / this._capacity >= this._loadFactorThreshold
  }

  private insertDirect(key: K, value: V, trackCollisions: boolean): void {
    const baseHash = this.hash(key)
    const cap = this._capacity
    let probed = false
    for (let i = 0; i < cap; i++) {
      const idx = (baseHash + i) % cap
      const entry = this.buckets[idx]!
      this._stats.probes++
      if (entry.state === 'empty' || entry.state === 'deleted') {
        this.buckets[idx] = { key, value, state: 'occupied' }
        this._stats.maxProbeLength = Math.max(this._stats.maxProbeLength, i + 1)
        if (probed && trackCollisions) {
          this._stats.collisions++
        }
        return
      }
      if (entry.state === 'occupied' && entry.key === key) {
        this.buckets[idx] = { key, value, state: 'occupied' }
        return
      }
      probed = true
    }
  }

  private rehashTo(newCapacity: number): void {
    const oldBuckets = this.buckets
    const oldCapacity = this._capacity
    this._capacity = newCapacity
    this.buckets = this.createBuckets(newCapacity)
    const oldSize = this._size
    this._size = 0
    this._tombstones = 0

    for (let i = 0; i < oldCapacity; i++) {
      const entry = oldBuckets[i]!
      if (entry.state === 'occupied') {
        this.insertDirect(entry.key, entry.value, false)
        this._size++
      }
    }
    this._stats.rehashes++
    if (oldSize > 0) {
      this._stats.maxProbeLength = 0
      for (let i = 0; i < this._capacity; i++) {
        const entry = this.buckets[i]!
        if (entry.state === 'occupied') {
          const baseHash = this.hash(entry.key)
          let probeLen = 0
          for (let j = 0; j < this._capacity; j++) {
            probeLen++
            const idx = (baseHash + j) % this._capacity
            if (idx === i) break
          }
          this._stats.maxProbeLength = Math.max(this._stats.maxProbeLength, probeLen)
        }
      }
    }
  }

  private findIndex(key: K): number {
    const baseHash = this.hash(key)
    const cap = this._capacity
    for (let i = 0; i < cap; i++) {
      const idx = (baseHash + i) % cap
      const entry = this.buckets[idx]!
      this._stats.probes++
      if (entry.state === 'empty') {
        return -1
      }
      if (entry.state === 'occupied' && entry.key === key) {
        return idx
      }
    }
    return -1
  }

  set(key: K, value: V): void {
    if (this.shouldResize()) {
      this.rehashTo(this._capacity * 2)
    }

    const baseHash = this.hash(key)
    const cap = this._capacity
    let firstTombstone = -1

    for (let i = 0; i < cap; i++) {
      const idx = (baseHash + i) % cap
      const entry = this.buckets[idx]!
      this._stats.probes++

      if (entry.state === 'empty') {
        const target = firstTombstone !== -1 ? firstTombstone : idx
        this.buckets[target] = { key, value, state: 'occupied' }
        if (firstTombstone !== -1) {
          this._tombstones--
        }
        this._stats.inserts++
        if (i > 0) {
          this._stats.collisions++
        }
        this._stats.maxProbeLength = Math.max(this._stats.maxProbeLength, i + 1)
        this._size++
        return
      }

      if (entry.state === 'deleted' && firstTombstone === -1) {
        firstTombstone = idx
      }

      if (entry.state === 'occupied' && entry.key === key) {
        this.buckets[idx] = { key, value, state: 'occupied' }
        return
      }
    }

    if (firstTombstone !== -1) {
      this.buckets[firstTombstone] = { key, value, state: 'occupied' }
      this._tombstones--
      this._stats.inserts++
      this._size++
    }
  }

  get(key: K): V | undefined {
    this._stats.lookups++
    const idx = this.findIndex(key)
    if (idx === -1) return undefined
    return this.buckets[idx]!.value
  }

  delete(key: K): boolean {
    this._stats.lookups++
    const idx = this.findIndex(key)
    if (idx === -1) return false
    this.buckets[idx] = {
      key: undefined as unknown as K,
      value: undefined as unknown as V,
      state: 'deleted',
    }
    this._size--
    this._tombstones++
    this._stats.deletes++
    return true
  }

  has(key: K): boolean {
    this._stats.lookups++
    return this.findIndex(key) !== -1
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    for (let i = 0; i < this._capacity; i++) {
      this.buckets[i] = {
        key: undefined as unknown as K,
        value: undefined as unknown as V,
        state: 'empty',
      }
    }
    this._size = 0
    this._tombstones = 0
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.buckets[i]!
      if (entry.state === 'occupied') {
        result.push(entry.key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.buckets[i]!
      if (entry.state === 'occupied') {
        result.push(entry.value)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.buckets[i]!
      if (entry.state === 'occupied') {
        result.push([entry.key, entry.value])
      }
    }
    return result
  }

  forEach(callback: (key: K, value: V) => void): void {
    for (let i = 0; i < this._capacity; i++) {
      const entry = this.buckets[i]!
      if (entry.state === 'occupied') {
        callback(entry.key, entry.value)
      }
    }
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    let idx = 0
    const buckets = this.buckets
    const cap = this._capacity
    return {
      next(): IteratorResult<[K, V]> {
        while (idx < cap) {
          const entry = buckets[idx]!
          idx++
          if (entry.state === 'occupied') {
            return { value: [entry.key, entry.value], done: false }
          }
        }
        return { value: undefined as unknown as [K, V], done: true }
      },
    }
  }

  loadFactor(): number {
    return this._size / this._capacity
  }

  capacity(): number {
    return this._capacity
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

  resize(newCapacity: number): void {
    if (newCapacity < 1) {
      throw new RangeError('New capacity must be at least 1')
    }
    if (newCapacity < this._size) {
      throw new RangeError('New capacity is too small for current elements')
    }
    this.rehashTo(newCapacity)
  }

  toArray(): Array<[K, V]> {
    return this.entries()
  }

  getStatistics(): LinearProbeMapStatistics {
    return { ...this._stats }
  }
}
