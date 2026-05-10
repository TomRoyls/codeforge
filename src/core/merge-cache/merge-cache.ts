import type {
  MergeCacheOptions,
  MergeCacheStatistics,
  MergeCacheEntryJSON,
  MergeCacheJSON,
} from './types.js'
import { DEFAULT_MERGE_CACHE_OPTIONS } from './types.js'

interface CacheEntry<V> {
  value: V
  expiresAt: number | null
}

export class MergeCache<K = string, V = unknown> {
  private _map = new Map<K, CacheEntry<V>>()
  private _maxSize: number
  private _ttl: number | undefined
  private _defaultTTL: number | undefined
  private _mergeFn: (existing: V, incoming: V) => V
  private _stats: MergeCacheStatistics = {
    gets: 0,
    sets: 0,
    deletes: 0,
    hits: 0,
    misses: 0,
    evictions: 0,
    merges: 0,
    purges: 0,
    maxSizeReached: 0,
  }

  constructor(options?: MergeCacheOptions<V>) {
    const defaults = DEFAULT_MERGE_CACHE_OPTIONS
    this._maxSize = options?.maxSize ?? defaults.maxSize
    this._ttl = options?.ttl ?? defaults.ttl
    this._defaultTTL = options?.defaultTTL ?? defaults.defaultTTL
    this._mergeFn = (options?.mergeFn ?? defaults.mergeFn) as (existing: V, incoming: V) => V
  }

  private computeExpiry(ttlOverride?: number): number | null {
    const effectiveTTL = ttlOverride ?? this._ttl ?? this._defaultTTL
    if (effectiveTTL === undefined || effectiveTTL === null) return null
    return Date.now() + effectiveTTL
  }

  private isExpired(entry: CacheEntry<V>): boolean {
    return entry.expiresAt !== null && entry.expiresAt <= Date.now()
  }

  private evictOldest(): void {
    const firstKey = this._map.keys().next().value
    if (firstKey !== undefined) {
      this._map.delete(firstKey)
      this._stats.evictions++
    }
  }

  private refreshEntry(key: K, entry: CacheEntry<V>): void {
    this._map.delete(key)
    const newExpiresAt = this.computeExpiry()
    if (newExpiresAt !== null) {
      entry.expiresAt = newExpiresAt
    }
    this._map.set(key, entry)
  }

  get(key: K): V | undefined {
    this._stats.gets++
    const entry = this._map.get(key)
    if (entry === undefined) {
      this._stats.misses++
      return undefined
    }
    if (this.isExpired(entry)) {
      this._map.delete(key)
      this._stats.misses++
      return undefined
    }
    this._stats.hits++
    this.refreshEntry(key, entry)
    return entry.value
  }

  set(key: K, value: V): void {
    const existing = this._map.get(key)
    if (existing !== undefined && !this.isExpired(existing)) {
      existing.value = this._mergeFn(existing.value, value)
      this._stats.merges++
      this.refreshEntry(key, existing)
    } else {
      if (existing !== undefined) {
        this._map.delete(key)
      }
      while (this._map.size >= this._maxSize && this._maxSize > 0) {
        this.evictOldest()
        this._stats.maxSizeReached++
      }
      if (this._maxSize <= 0) return
      this._map.set(key, {
        value,
        expiresAt: this.computeExpiry(),
      })
    }
    this._stats.sets++
  }

  delete(key: K): boolean {
    const result = this._map.delete(key)
    if (result) {
      this._stats.deletes++
    }
    return result
  }

  has(key: K): boolean {
    const entry = this._map.get(key)
    if (entry === undefined) return false
    if (this.isExpired(entry)) {
      this._map.delete(key)
      return false
    }
    return true
  }

  get size(): number {
    return this._map.size
  }

  get isEmpty(): boolean {
    return this._map.size === 0
  }

  clear(): void {
    this._map.clear()
    this._stats = {
      gets: 0,
      sets: 0,
      deletes: 0,
      hits: 0,
      misses: 0,
      evictions: 0,
      merges: 0,
      purges: 0,
      maxSizeReached: 0,
    }
  }

  keys(): K[] {
    const result: K[] = []
    for (const [key, entry] of this._map) {
      if (!this.isExpired(entry)) {
        result.push(key)
      }
    }
    return result
  }

  values(): V[] {
    const result: V[] = []
    for (const [, entry] of this._map) {
      if (!this.isExpired(entry)) {
        result.push(entry.value)
      }
    }
    return result
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = []
    for (const [key, entry] of this._map) {
      if (!this.isExpired(entry)) {
        result.push([key, entry.value])
      }
    }
    return result
  }

  forEach(callback: (value: V, key: K, cache: MergeCache<K, V>) => void): void {
    for (const [key, entry] of this._map) {
      if (!this.isExpired(entry)) {
        callback(entry.value, key, this)
      }
    }
  }

  *[Symbol.iterator](): Iterator<[K, V]> {
    for (const [key, entry] of this._map) {
      if (!this.isExpired(entry)) {
        yield [key, entry.value]
      }
    }
  }

  touch(key: K): boolean {
    const entry = this._map.get(key)
    if (entry === undefined) return false
    if (this.isExpired(entry)) {
      this._map.delete(key)
      return false
    }
    this.refreshEntry(key, entry)
    return true
  }

  getOrSet(key: K, factory: () => V): V {
    const entry = this._map.get(key)
    if (entry !== undefined && !this.isExpired(entry)) {
      this._stats.hits++
      this._stats.gets++
      this.refreshEntry(key, entry)
      return entry.value
    }
    this._stats.misses++
    this._stats.gets++
    const value = factory()
    this.set(key, value)
    return value
  }

  merge(key: K, value: V): void {
    this.set(key, value)
  }

  purge(): number {
    let count = 0
    for (const [key, entry] of this._map) {
      if (this.isExpired(entry)) {
        this._map.delete(key)
        count++
      }
    }
    this._stats.purges++
    return count
  }

  getRemainingTTL(key: K): number | undefined {
    const entry = this._map.get(key)
    if (entry === undefined) return undefined
    if (entry.expiresAt === null) return undefined
    const remaining = entry.expiresAt - Date.now()
    if (remaining <= 0) {
      this._map.delete(key)
      return undefined
    }
    return remaining
  }

  resize(maxSize: number): void {
    this._maxSize = maxSize
    while (this._map.size > this._maxSize) {
      this.evictOldest()
      this._stats.maxSizeReached++
    }
  }

  getStatistics(): MergeCacheStatistics {
    return { ...this._stats }
  }

  toJSON(): MergeCacheJSON<K, V> {
    const entries: Array<[K, MergeCacheEntryJSON<V>]> = []
    for (const [key, entry] of this._map) {
      entries.push([
        key,
        { value: entry.value, expiresAt: entry.expiresAt },
      ])
    }
    return {
      entries,
      maxSize: this._maxSize,
      ttl: this._ttl ?? null,
      defaultTTL: this._defaultTTL ?? null,
      statistics: { ...this._stats },
    }
  }

  static fromJSON<K, V>(data: MergeCacheJSON<K, V>): MergeCache<K, V> {
    const cache = new MergeCache<K, V>({
      maxSize: data.maxSize,
      ttl: data.ttl ?? undefined,
      defaultTTL: data.defaultTTL ?? undefined,
    })
    for (const [key, entryData] of data.entries) {
      cache._map.set(key, {
        value: entryData.value,
        expiresAt: entryData.expiresAt,
      })
    }
    cache._stats = { ...data.statistics }
    return cache
  }
}

export { DEFAULT_MERGE_CACHE_OPTIONS } from './types.js'
export type {
  MergeCacheOptions,
  MergeCacheStatistics,
  MergeCacheEntryJSON,
  MergeCacheJSON,
} from './types.js'
