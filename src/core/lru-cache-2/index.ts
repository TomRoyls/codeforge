import type { LRU2CacheOptions, LRU2Entry } from './types.js'

const DEFAULT_MAX_SIZE = 100
const K = 2

export class LRU2Cache<K, V> {
  private _map: Map<K, LRU2Entry<V>> = new Map()
  private _maxSize: number
  private _counter: number = 0

  constructor(options?: LRU2CacheOptions) {
    const maxSize = options?.maxSize
    if (maxSize !== undefined && maxSize < 1) {
      throw new RangeError('maxSize must be at least 1')
    }
    this._maxSize = maxSize ?? DEFAULT_MAX_SIZE
  }

  private nextTimestamp(): number {
    return ++this._counter
  }

  private recordAccess(entry: LRU2Entry<V>): void {
    entry.accessTimes.push(this.nextTimestamp())
    if (entry.accessTimes.length > K) {
      entry.accessTimes.shift()
    }
  }

  private evictionPriority(entry: LRU2Entry<V>): number {
    if (entry.accessTimes.length >= K) {
      return entry.accessTimes[0]!
    }
    // Entries with fewer than K accesses are always evicted before
    // entries that have been accessed K times
    return -Infinity
  }

  private findEvictionKey(): K | undefined {
    let bestKey: K | undefined
    let bestPriority = Infinity

    for (const [key, entry] of this._map) {
      const priority = this.evictionPriority(entry)
      if (priority < bestPriority) {
        bestPriority = priority
        bestKey = key
      }
    }

    return bestKey
  }

  private evictIfNeeded(): void {
    if (this._map.size >= this._maxSize) {
      const evictKey = this.findEvictionKey()
      if (evictKey !== undefined) {
        this._map.delete(evictKey)
      }
    }
  }

  get(key: K): V | undefined {
    const entry = this._map.get(key)
    if (entry === undefined) return undefined
    this.recordAccess(entry)
    this._map.delete(key)
    this._map.set(key, entry)
    return entry.value
  }

  set(key: K, value: V): void {
    const existing = this._map.get(key)
    if (existing !== undefined) {
      existing.value = value
      this.recordAccess(existing)
      this._map.delete(key)
      this._map.set(key, existing)
      return
    }

    this.evictIfNeeded()

    const entry: LRU2Entry<V> = {
      value,
      accessTimes: [this.nextTimestamp()],
    }
    this._map.set(key, entry)
  }

  has(key: K): boolean {
    return this._map.has(key)
  }

  delete(key: K): boolean {
    return this._map.delete(key)
  }

  peek(key: K): V | undefined {
    const entry = this._map.get(key)
    if (entry === undefined) return undefined
    return entry.value
  }

  size(): number {
    return this._map.size
  }

  isEmpty(): boolean {
    return this._map.size === 0
  }

  clear(): void {
    this._map.clear()
  }

  get maxSize(): number {
    return this._maxSize
  }

  resize(newSize: number): void {
    if (newSize < 1) {
      throw new RangeError('maxSize must be at least 1')
    }
    this._maxSize = newSize
    while (this._map.size > newSize) {
      const evictKey = this.findEvictionKey()
      if (evictKey !== undefined) {
        this._map.delete(evictKey)
      } else {
        break
      }
    }
  }

  keys(): K[] {
    return [...this._map.keys()]
  }

  values(): V[] {
    const result: V[] = []
    for (const entry of this._map.values()) {
      result.push(entry.value)
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (const [key, entry] of this._map) {
      result.push([key, entry.value])
    }
    return result
  }

  forEach(callback: (value: V, key: K) => void): void {
    for (const [key, entry] of this._map) {
      callback(entry.value, key)
    }
  }

  accessHistory(key: K): number[] {
    const entry = this._map.get(key)
    if (entry === undefined) return []
    return [...entry.accessTimes]
  }

  clone(): LRU2Cache<K, V> {
    const cloned = new LRU2Cache<K, V>({ maxSize: this._maxSize })
    const entries: Array<[K, LRU2Entry<V>]> = []
    for (const [key, entry] of this._map) {
      entries.push([key, entry])
    }
    for (const [key, entry] of entries) {
      const clonedEntry: LRU2Entry<V> = {
        value: entry.value,
        accessTimes: [...entry.accessTimes],
      }
      cloned._map.set(key, clonedEntry)
    }
    cloned._counter = this._counter
    return cloned
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    const items = this.entries();
    let index = 0;
    return {
      next(): IteratorResult<[K, V]> {
        if (index < items.length) {
          return { value: items[index++]!, done: false };
        }
        return { value: undefined as unknown as [K, V], done: true };
      },
    };
  }

  toArray(): any[] {
    return [...this]
  }

  toString(): string {
    return `LRU2Cache()`
  }

  toJSON() {
    return { type: 'LRU2Cache', items: this.toArray() }
  }
}

export type { LRU2CacheOptions } from './types.js'
