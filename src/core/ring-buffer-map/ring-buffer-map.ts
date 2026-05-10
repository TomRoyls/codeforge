import type { RingBufferMapOptions, RingBufferMapJSON, RingBufferMapStatistics } from './types.js'
import { DEFAULT_RING_BUFFER_MAP_OPTIONS } from './types.js'

interface RingEntry<K, V> {
  key: K
  value: V
}

export class RingBufferMap<K, V> {
  private _capacity: number
  private _buffer: Array<RingEntry<K, V> | undefined>
  private _map: Map<K, number>
  private _head: number = 0
  private _tail: number = 0
  private _size: number = 0
  private _stats: RingBufferMapStatistics = {
    sets: 0,
    gets: 0,
    deletes: 0,
    evictions: 0,
    overwrites: 0,
    maxSize: 0,
  }

  constructor(capacity: number)
  constructor(options: RingBufferMapOptions)
  constructor(capacityOrOptions: number | RingBufferMapOptions) {
    let cap: number
    if (typeof capacityOrOptions === 'object' && capacityOrOptions !== null) {
      cap = capacityOrOptions.capacity ?? DEFAULT_RING_BUFFER_MAP_OPTIONS.capacity
    } else if (typeof capacityOrOptions === 'number') {
      cap = capacityOrOptions
    } else {
      cap = DEFAULT_RING_BUFFER_MAP_OPTIONS.capacity
    }
    if (!Number.isFinite(cap) || cap <= 0 || !Number.isInteger(cap)) {
      throw new Error('Capacity must be a positive integer')
    }
    this._capacity = cap
    this._buffer = new Array<RingEntry<K, V> | undefined>(cap)
    this._map = new Map()
  }

  set(key: K, value: V): V | undefined {
    const existingIndex = this._map.get(key)
    if (existingIndex !== undefined) {
      const old = this._buffer[existingIndex]!.value
      this._buffer[existingIndex]!.value = value
      this._stats.sets++
      this._stats.overwrites++
      return old
    }

    let evicted: V | undefined

    if (this._size === this._capacity) {
      const oldestEntry = this._buffer[this._head]!
      this._map.delete(oldestEntry.key)
      evicted = oldestEntry.value
      this._buffer[this._head] = undefined
      this._head = (this._head + 1) % this._capacity
      this._size--
      this._stats.evictions++
    }

    const index = this._tail
    this._buffer[index] = { key, value }
    this._map.set(key, index)
    this._tail = (this._tail + 1) % this._capacity
    this._size++
    this._stats.sets++
    if (this._size > this._stats.maxSize) {
      this._stats.maxSize = this._size
    }

    return evicted
  }

  get(key: K): V | undefined {
    this._stats.gets++
    const index = this._map.get(key)
    if (index === undefined) {
      return undefined
    }
    return this._buffer[index]!.value
  }

  delete(key: K): boolean {
    this._stats.deletes++
    const index = this._map.get(key)
    if (index === undefined) {
      return false
    }

    this._buffer[index] = undefined
    this._map.delete(key)
    this._size--

    this.compact()

    return true
  }

  has(key: K): boolean {
    return this._map.has(key)
  }

  get size(): number {
    return this._size
  }

  get isEmpty(): boolean {
    return this._size === 0
  }

  get capacity(): number {
    return this._capacity
  }

  get isFull(): boolean {
    return this._size === this._capacity
  }

  clear(): void {
    this._buffer = new Array<RingEntry<K, V> | undefined>(this._capacity)
    this._map.clear()
    this._head = 0
    this._tail = 0
    this._size = 0
    this._stats = {
      sets: 0,
      gets: 0,
      deletes: 0,
      evictions: 0,
      overwrites: 0,
      maxSize: 0,
    }
  }

  peekOldest(): [K, V] | undefined {
    if (this._size === 0) return undefined

    let idx = this._head
    const start = this._head
    const limit = this._capacity
    for (let i = 0; i < limit; i++) {
      idx = (start + i) % this._capacity
      const entry = this._buffer[idx]
      if (entry !== undefined) {
        return [entry.key, entry.value]
      }
    }
    return undefined
  }

  peekNewest(): [K, V] | undefined {
    if (this._size === 0) return undefined

    let idx = this._tail
    for (let i = 1; i <= this._capacity; i++) {
      idx = ((this._tail - i) + this._capacity) % this._capacity
      const entry = this._buffer[idx]
      if (entry !== undefined) {
        return [entry.key, entry.value]
      }
    }
    return undefined
  }

  keys(): K[] {
    const result: K[] = []
    for (let i = 0; i < this._capacity; i++) {
      const idx = (this._head + i) % this._capacity
      const entry = this._buffer[idx]
      if (entry !== undefined) {
        result.push(entry.key)
        if (result.length === this._size) break
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (let i = 0; i < this._capacity; i++) {
      const idx = (this._head + i) % this._capacity
      const entry = this._buffer[idx]
      if (entry !== undefined) {
        result.push(entry.value)
        if (result.length === this._size) break
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this._capacity; i++) {
      const idx = (this._head + i) % this._capacity
      const entry = this._buffer[idx]
      if (entry !== undefined) {
        result.push([entry.key, entry.value])
        if (result.length === this._size) break
      }
    }
    return result
  }

  forEach(callback: (value: V, key: K, map: RingBufferMap<K, V>) => void): void {
    for (let i = 0; i < this._capacity; i++) {
      const idx = (this._head + i) % this._capacity
      const entry = this._buffer[idx]
      if (entry !== undefined) {
        callback(entry.value, entry.key, this)
        if (this._map.size === 0) break
      }
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    for (let i = 0; i < this._capacity; i++) {
      const idx = (this._head + i) % this._capacity
      const entry = this._buffer[idx]
      if (entry !== undefined) {
        yield [entry.key, entry.value]
      }
    }
  }

  getStatistics(): RingBufferMapStatistics {
    return { ...this._stats }
  }

  toJSON(): RingBufferMapJSON<K, V> {
    return {
      entries: this.entries(),
      capacity: this._capacity,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<K, V>(data: RingBufferMapJSON<K, V>): RingBufferMap<K, V> {
    const rbm = new RingBufferMap<K, V>(data.capacity)
    for (const [key, value] of data.entries) {
      rbm.set(key, value)
    }
    rbm._stats = { ...data.statistics }
    return rbm
  }

  private compact(): void {
    const newBuffer = new Array<RingEntry<K, V> | undefined>(this._capacity)
    let newIdx = 0
    for (let i = 0; i < this._capacity; i++) {
      const oldIdx = (this._head + i) % this._capacity
      const entry = this._buffer[oldIdx]
      if (entry !== undefined) {
        newBuffer[newIdx] = entry
        this._map.set(entry.key, newIdx)
        newIdx++
      }
    }
    this._buffer = newBuffer
    this._head = 0
    this._tail = newIdx
  }
}

export { DEFAULT_RING_BUFFER_MAP_OPTIONS } from './types.js'
export type { RingBufferMapOptions, RingBufferMapJSON, RingBufferMapStatistics } from './types.js'
