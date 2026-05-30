interface Entry<V> {
  value: V
  expiresAt: number
}

export interface LRUTTLCacheOptions {
  maxSize: number
  defaultTTL: number
}

export class LRUTTLCache<K, V> {
  private cache: Map<K, Entry<V>> = new Map()
  private readonly maxSize: number
  private readonly defaultTTL: number
  private _hits = 0
  private _misses = 0
  private _evictions = 0

  constructor(options: LRUTTLCacheOptions) {
    if (options.maxSize < 1) throw new RangeError('maxSize must be >= 1')
    if (options.defaultTTL <= 0) throw new RangeError('defaultTTL must be positive')
    this.maxSize = options.maxSize
    this.defaultTTL = options.defaultTTL
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) {
      this._misses++
      return undefined
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this._misses++
      this._evictions++
      return undefined
    }
    this.cache.delete(key)
    this.cache.set(key, entry)
    this._hits++
    return entry.value
  }

  set(key: K, value: V, ttl?: number): void {
    const effectiveTTL = ttl ?? this.defaultTTL
    if (effectiveTTL <= 0) throw new RangeError('TTL must be positive')
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }
    while (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
        this._evictions++
      }
    }
    this.cache.set(key, { value, expiresAt: Date.now() + effectiveTTL })
  }

  has(key: K): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  get size(): number {
    this.evictExpired()
    return this.cache.size
  }

  get hits(): number {
    return this._hits
  }

  get misses(): number {
    return this._misses
  }

  get evictions(): number {
    return this._evictions
  }

  get hitRate(): number {
    const total = this._hits + this._misses
    return total === 0 ? 0 : this._hits / total
  }

  private evictExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        this._evictions++
      }
    }
  }
}
