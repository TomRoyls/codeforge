import type { BatchMapOptions, BatchMapStatistics } from './types.js'
import { DEFAULT_BATCH_MAP_OPTIONS } from './types.js'

interface Entry<K, V> {
  key: K
  value: V
  next: Entry<K, V> | null
}

export class BatchMap<K, V> {
  private buckets: Array<Entry<K, V> | null>
  private _size: number = 0
  private options: BatchMapOptions
  private stats: BatchMapStatistics = {
    sets: 0,
    gets: 0,
    deletes: 0,
    batchSets: 0,
    batchGets: 0,
    batchDeletes: 0,
    totalItemsProcessed: 0,
  }

  constructor(options?: Partial<BatchMapOptions>) {
    this.options = { ...DEFAULT_BATCH_MAP_OPTIONS, ...options }
    this.buckets = new Array<Entry<K, V> | null>(this.options.initialCapacity).fill(null)
  }

  private hash(key: K): number {
    const str = String(key)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      hash = ((hash << 5) - hash + ch) | 0
    }
    return hash >>> 0
  }

  private getIndex(key: K): number {
    return this.hash(key) % this.buckets.length
  }

  private resize(): void {
    const oldBuckets = this.buckets
    const newCapacity = oldBuckets.length * 2
    this.buckets = new Array<Entry<K, V> | null>(newCapacity).fill(null)
    const oldSize = this._size
    this._size = 0
    for (let i = 0; i < oldBuckets.length; i++) {
      let current = oldBuckets[i]!
      while (current !== null) {
        this.set(current.key, current.value)
        current = current.next!
      }
    }
    this._size = oldSize
  }

  private checkResize(): void {
    if (this._size / this.buckets.length >= this.options.loadFactor) {
      this.resize()
    }
  }

  set(key: K, value: V): void {
    const index = this.getIndex(key)
    const bucket = this.buckets[index]!
    if (bucket === null) {
      this.buckets[index] = { key, value, next: null }
      this._size++
      this.stats.sets++
      this.stats.totalItemsProcessed++
      this.checkResize()
      return
    }
    let current: Entry<K, V> | null = bucket
    while (current !== null) {
      if (current.key === key) {
        current.value = value
        this.stats.sets++
        this.stats.totalItemsProcessed++
        return
      }
      if (current.next === null) {
        current.next = { key, value, next: null }
        this._size++
        this.stats.sets++
        this.stats.totalItemsProcessed++
        this.checkResize()
        return
      }
      current = current.next!
    }
  }

  get(key: K): V | undefined {
    const index = this.getIndex(key)
    let current = this.buckets[index]!
    while (current !== null) {
      if (current.key === key) {
        this.stats.gets++
        this.stats.totalItemsProcessed++
        return current.value
      }
      current = current.next!
    }
    this.stats.gets++
    this.stats.totalItemsProcessed++
    return undefined
  }

  delete(key: K): boolean {
    const index = this.getIndex(key)
    const bucket = this.buckets[index]!
    if (bucket === null) {
      this.stats.deletes++
      this.stats.totalItemsProcessed++
      return false
    }
    if (bucket.key === key) {
      this.buckets[index] = bucket.next
      this._size--
      this.stats.deletes++
      this.stats.totalItemsProcessed++
      return true
    }
    let prev: Entry<K, V> = bucket
    let current: Entry<K, V> | null = bucket.next
    while (current !== null) {
      if (current.key === key) {
        prev.next = current.next
        this._size--
        this.stats.deletes++
        this.stats.totalItemsProcessed++
        return true
      }
      prev = current
      current = current.next!
    }
    this.stats.deletes++
    this.stats.totalItemsProcessed++
    return false
  }

  has(key: K): boolean {
    const index = this.getIndex(key)
    let current = this.buckets[index]!
    while (current !== null) {
      if (current.key === key) {
        return true
      }
      current = current.next!
    }
    return false
  }

  batchSet(entries: Array<readonly [K, V]>): void {
    this.stats.batchSets++
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!
      const index = this.getIndex(entry[0])
      const bucket = this.buckets[index]!
      if (bucket === null) {
        this.buckets[index] = { key: entry[0], value: entry[1], next: null }
        this._size++
        this.stats.totalItemsProcessed++
        this.checkResize()
        continue
      }
      let current: Entry<K, V> | null = bucket
      let found = false
      while (current !== null) {
        if (current.key === entry[0]) {
          current.value = entry[1]
          this.stats.totalItemsProcessed++
          found = true
          break
        }
        if (current.next === null) {
          current.next = { key: entry[0], value: entry[1], next: null }
          this._size++
          this.stats.totalItemsProcessed++
          this.checkResize()
          found = true
          break
        }
        current = current.next!
      }
      if (!found) {
        this.stats.totalItemsProcessed++
      }
    }
  }

  batchGet(keys: readonly K[]): Array<V | undefined> {
    this.stats.batchGets++
    const results: Array<V | undefined> = new Array(keys.length)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!
      const index = this.getIndex(key)
      let current = this.buckets[index]!
      let found = false
      while (current !== null) {
        if (current.key === key) {
          results[i] = current.value
          this.stats.totalItemsProcessed++
          found = true
          break
        }
        current = current.next!
      }
      if (!found) {
        results[i] = undefined
        this.stats.totalItemsProcessed++
      }
    }
    return results
  }

  batchDelete(keys: readonly K[]): boolean[] {
    this.stats.batchDeletes++
    const results: boolean[] = new Array(keys.length)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!
      const index = this.getIndex(key)
      const bucket = this.buckets[index]!
      if (bucket === null) {
        results[i] = false
        this.stats.totalItemsProcessed++
        continue
      }
      if (bucket.key === key) {
        this.buckets[index] = bucket.next
        this._size--
        results[i] = true
        this.stats.totalItemsProcessed++
        continue
      }
      let prev: Entry<K, V> = bucket
      let current: Entry<K, V> | null = bucket.next
      let deleted = false
      while (current !== null) {
        if (current.key === key) {
          prev.next = current.next
          this._size--
          results[i] = true
          this.stats.totalItemsProcessed++
          deleted = true
          break
        }
        prev = current
        current = current.next!
      }
      if (!deleted) {
        results[i] = false
        this.stats.totalItemsProcessed++
      }
    }
    return results
  }

  batchHas(keys: readonly K[]): boolean[] {
    const results: boolean[] = new Array(keys.length)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!
      const index = this.getIndex(key)
      let current = this.buckets[index]!
      let found = false
      while (current !== null) {
        if (current.key === key) {
          found = true
          break
        }
        current = current.next!
      }
      results[i] = found
    }
    return results
  }

  get size(): number {
    return this._size
  }

  isEmpty(): boolean {
    return this._size === 0
  }

  clear(): void {
    this.buckets = new Array<Entry<K, V> | null>(this.options.initialCapacity).fill(null)
    this._size = 0
  }

  *keys(): IterableIterator<K> {
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i]!
      while (current !== null) {
        yield current.key
        current = current.next!
      }
    }
  }

  *values(): IterableIterator<V> {
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i]!
      while (current !== null) {
        yield current.value
        current = current.next!
      }
    }
  }

  *entries(): IterableIterator<[K, V]> {
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i]!
      while (current !== null) {
        yield [current.key, current.value]
        current = current.next!
      }
    }
  }

  forEach(callback: (value: V, key: K, map: BatchMap<K, V>) => void): void {
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i]!
      while (current !== null) {
        callback(current.value, current.key, this)
        current = current.next!
      }
    }
  }

  *[Symbol.iterator](): IterableIterator<[K, V]> {
    yield* this.entries()
  }

  toArray(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (let i = 0; i < this.buckets.length; i++) {
      let current = this.buckets[i]!
      while (current !== null) {
        result.push([current.key, current.value])
        current = current.next!
      }
    }
    return result
  }

  merge(other: BatchMap<K, V>): void {
    const otherEntries = other.entries()
    for (const entry of otherEntries) {
      this.set(entry[0], entry[1])
    }
  }

  getStatistics(): BatchMapStatistics {
    return { ...this.stats }
  }
}
