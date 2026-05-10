import type { WeakRefCacheOptions, WeakRefCacheJSON, WeakRefCacheStatistics } from './types.js'
import { DEFAULT_WEAK_REF_CACHE_OPTIONS } from './types.js'

interface CacheEntry<V extends object> {
  ref: WeakRef<V>
  addedAt: number
  accessAt: number
}

export class WeakRefCache<K extends string | number, V extends object> {
  private _map = new Map<K, CacheEntry<V>>()
  private _maxSize: number
  private _ttl: number
  private _registry: FinalizationRegistry<K>
  private _stats: WeakRefCacheStatistics = {
    gets: 0,
    sets: 0,
    deletes: 0,
    hits: 0,
    misses: 0,
    gcCollections: 0,
    maxAlive: 0,
  }

  constructor(options?: WeakRefCacheOptions) {
    const opts = { ...DEFAULT_WEAK_REF_CACHE_OPTIONS, ...options }
    this._maxSize = opts.maxSize
    this._ttl = opts.ttl
    this._registry = new FinalizationRegistry((key: K) => {
      this._map.delete(key)
      this._stats.gcCollections++
    })
  }

  get(key: K): V | undefined {
    this._stats.gets++
    const entry = this._map.get(key)
    if (!entry) {
      this._stats.misses++
      return undefined
    }
    const value = entry.ref.deref()
    if (value === undefined) {
      this._map.delete(key)
      this._stats.misses++
      return undefined
    }
    if (this._isExpired(entry)) {
      this._deleteEntry(key, entry)
      this._stats.misses++
      return undefined
    }
    entry.accessAt = Date.now()
    this._stats.hits++
    return value
  }

  set(key: K, value: V): void {
    this._stats.sets++
    const existing = this._map.get(key)
    if (existing) {
      this._registry.unregister(existing)
    }
    if (this._map.size >= this._maxSize && !this._map.has(key)) {
      this.evictOldest()
    }
    const entry: CacheEntry<V> = {
      ref: new WeakRef(value),
      addedAt: Date.now(),
      accessAt: Date.now(),
    }
    this._map.set(key, entry)
    this._registry.register(value, key, entry)
    this._updateMaxAlive()
  }

  delete(key: K): boolean {
    this._stats.deletes++
    const entry = this._map.get(key)
    if (!entry) return false
    this._deleteEntry(key, entry)
    return true
  }

  has(key: K): boolean {
    const entry = this._map.get(key)
    if (!entry) return false
    const value = entry.ref.deref()
    if (value === undefined) {
      this._map.delete(key)
      return false
    }
    if (this._isExpired(entry)) {
      this._deleteEntry(key, entry)
      return false
    }
    return true
  }

  get size(): number {
    let count = 0
    for (const [, entry] of this._map) {
      const value = entry.ref.deref()
      if (value !== undefined && !this._isExpired(entry)) {
        count++
      }
    }
    return count
  }

  get isEmpty(): boolean {
    return this.size === 0
  }

  clear(): void {
    for (const [, entry] of this._map) {
      this._registry.unregister(entry)
    }
    this._map.clear()
    this._stats = {
      gets: 0,
      sets: 0,
      deletes: 0,
      hits: 0,
      misses: 0,
      gcCollections: 0,
      maxAlive: 0,
    }
  }

  keys(): K[] {
    const result: K[] = []
    for (const [key, entry] of this._map) {
      const value = entry.ref.deref()
      if (value !== undefined && !this._isExpired(entry)) {
        result.push(key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const [, entry] of this._map) {
      const value = entry.ref.deref()
      if (value !== undefined && !this._isExpired(entry)) {
        result.push(value)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (const [key, entry] of this._map) {
      const value = entry.ref.deref()
      if (value !== undefined && !this._isExpired(entry)) {
        result.push([key, value])
      }
    }
    return result
  }

  forEach(callback: (value: V, key: K, cache: this) => void): void {
    for (const [key, entry] of this._map) {
      const value = entry.ref.deref()
      if (value !== undefined && !this._isExpired(entry)) {
        callback(value, key, this)
      }
    }
  }

  peek(key: K): V | undefined {
    const entry = this._map.get(key)
    if (!entry) return undefined
    const value = entry.ref.deref()
    if (value === undefined) {
      this._map.delete(key)
      return undefined
    }
    if (this._isExpired(entry)) {
      this._deleteEntry(key, entry)
      return undefined
    }
    return value
  }

  refresh(key: K): boolean {
    const entry = this._map.get(key)
    if (!entry) return false
    const value = entry.ref.deref()
    if (value === undefined) {
      this._map.delete(key)
      return false
    }
    if (this._isExpired(entry)) {
      this._deleteEntry(key, entry)
      return false
    }
    entry.accessAt = Date.now()
    return true
  }

  purge(): number {
    let removed = 0
    const now = Date.now()
    for (const [key, entry] of this._map) {
      const value = entry.ref.deref()
      if (value === undefined || this._isExpired(entry)) {
        if (value !== undefined) {
          this._registry.unregister(entry)
        }
        this._map.delete(key)
        removed++
      }
    }
    void now
    return removed
  }

  getStatistics(): WeakRefCacheStatistics {
    return { ...this._stats }
  }

  toJSON(): WeakRefCacheJSON<K> {
    const entries: Array<{ key: K; alive: boolean }> = []
    for (const [key, entry] of this._map) {
      const value = entry.ref.deref()
      entries.push({ key, alive: value !== undefined })
    }
    return {
      entries,
      options: { maxSize: this._maxSize, ttl: this._ttl },
      statistics: { ...this._stats },
    }
  }

  static fromJSON<K extends string | number, V extends object>(
    data: WeakRefCacheJSON<K>,
    revive: (key: K) => V,
  ): WeakRefCache<K, V> {
    const cache = new WeakRefCache<K, V>({
      maxSize: data.options.maxSize,
      ttl: data.options.ttl,
    })
    for (const entry of data.entries) {
      if (entry.alive) {
        const value = revive(entry.key)
        cache.set(entry.key, value)
      }
    }
    return cache
  }

  private _isExpired(entry: CacheEntry<V>): boolean {
    if (this._ttl === Infinity) return false
    return Date.now() - entry.accessAt > this._ttl
  }

  private _deleteEntry(key: K, entry: CacheEntry<V>): void {
    this._registry.unregister(entry)
    this._map.delete(key)
  }

  private evictOldest(): void {
    let oldestKey: K | undefined
    let oldestTime = Infinity
    for (const [key, entry] of this._map) {
      if (entry.accessAt < oldestTime) {
        oldestTime = entry.accessAt
        oldestKey = key
      }
    }
    if (oldestKey !== undefined) {
      const entry = this._map.get(oldestKey)
      if (entry) {
        this._deleteEntry(oldestKey, entry)
      }
    }
  }

  private _updateMaxAlive(): void {
    const current = this.size
    if (current > this._stats.maxAlive) {
      this._stats.maxAlive = current
    }
  }
}

export { DEFAULT_WEAK_REF_CACHE_OPTIONS } from './types.js'
export type { WeakRefCacheOptions, WeakRefCacheJSON, WeakRefCacheStatistics } from './types.js'
