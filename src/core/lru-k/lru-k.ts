import {
  DEFAULT_LRU_K_OPTIONS,
  type LruKEntry,
  type LruKOptions,
  type LruKStatistics,
} from './types.js'

export class LruKCache<V> {
  private _capacity: number
  private _k: number
  private _map: Map<string, LruKEntry<V>>
  private _counter: number
  private _stats: LruKStatistics

  constructor(options: Partial<LruKOptions> = {}) {
    const resolved = { ...DEFAULT_LRU_K_OPTIONS, ...options }
    if (resolved.capacity < 1) {
      throw new RangeError('capacity must be at least 1')
    }
    if (resolved.k < 1) {
      throw new RangeError('k must be at least 1')
    }
    this._capacity = resolved.capacity
    this._k = resolved.k
    this._map = new Map()
    this._counter = 0
    this._stats = { hits: 0, misses: 0, evictions: 0 }
  }

  private nextTimestamp(): number {
    this._counter += 1
    return this._counter
  }

  private recordAccess(entry: LruKEntry<V>): void {
    entry.accessHistory.push(this.nextTimestamp())
    if (entry.accessHistory.length > this._k) {
      entry.accessHistory.shift()
    }
  }

  private findEvictionKey(): string | undefined {
    let bestKey: string | undefined
    let bestTier = Infinity
    let bestTimestamp = Infinity

    for (const [key, entry] of this._map) {
      const historyLen = entry.accessHistory.length
      const tier = historyLen >= this._k ? 1 : 0
      const timestamp = entry.accessHistory[0]!

      if (tier < bestTier || (tier === bestTier && timestamp < bestTimestamp)) {
        bestTier = tier
        bestTimestamp = timestamp
        bestKey = key
      }
    }

    return bestKey
  }

  get(key: string): V | undefined {
    const entry = this._map.get(key)
    if (entry === undefined) {
      this._stats.misses += 1
      return undefined
    }
    this._stats.hits += 1
    this.recordAccess(entry)
    return entry.value
  }

  set(key: string, value: V): void {
    const existing = this._map.get(key)
    if (existing !== undefined) {
      existing.value = value
      this.recordAccess(existing)
      this._map.delete(key)
      this._map.set(key, existing)
      return
    }

    if (this._map.size >= this._capacity) {
      const evictKey = this.findEvictionKey()
      if (evictKey !== undefined) {
        this._map.delete(evictKey)
        this._stats.evictions += 1
      }
    }

    const entry: LruKEntry<V> = {
      key,
      value,
      accessHistory: [this.nextTimestamp()],
    }
    this._map.set(key, entry)
  }

  has(key: string): boolean {
    return this._map.has(key)
  }

  delete(key: string): boolean {
    return this._map.delete(key)
  }

  peek(key: string): V | undefined {
    const entry = this._map.get(key)
    if (entry === undefined) {
      return undefined
    }
    return entry.value
  }

  getAccessHistory(key: string): number[] {
    const entry = this._map.get(key)
    if (entry === undefined) {
      return []
    }
    return [...entry.accessHistory]
  }

  getStatistics(): LruKStatistics {
    return { ...this._stats }
  }

  get size(): number {
    return this._map.size
  }

  get capacity(): number {
    return this._capacity
  }

  get isEmpty(): boolean {
    return this._map.size === 0
  }

  clear(): void {
    this._map.clear()
    this._stats = { hits: 0, misses: 0, evictions: 0 }
  }

  keys(): string[] {
    return [...this._map.keys()]
  }

  values(): V[] {
    const result: V[] = []
    for (const entry of this._map.values()) {
      result.push(entry.value)
    }
    return result
  }

  entries(): [string, V][] {
    const result: [string, V][] = []
    for (const [key, entry] of this._map) {
      result.push([key, entry.value])
    }
    return result
  }

  forEach(callback: (value: V, key: string, cache: LruKCache<V>) => void): void {
    for (const [key, entry] of this._map) {
      callback(entry.value, key, this)
    }
  }

  [Symbol.iterator](): Iterator<[string, V]> {
    const iter = this._map.entries()
    return {
      next(): IteratorResult<[string, V]> {
        const result = iter.next()
        if (result.done === true) {
          return { done: true, value: undefined }
        }
        const [key, entry] = result.value
        return { done: false, value: [key, entry.value] }
      },
    }
  }
}
