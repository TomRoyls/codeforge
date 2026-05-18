export interface TTLCacheOptions {
  readonly defaultTTL: number
  readonly maxSize?: number
}

interface CacheEntry<V> {
  value: V
  expiresAt: number
}

export class TTLCache<K, V> {
  private cache: Map<K, CacheEntry<V>>
  private readonly defaultTTL: number
  private readonly maxSize: number
  private _hits: number = 0
  private _misses: number = 0
  private _evictions: number = 0

  constructor(options: TTLCacheOptions) {
    if (options.defaultTTL <= 0) {
      throw new RangeError('defaultTTL must be positive')
    }
    this.defaultTTL = options.defaultTTL
    this.maxSize = options.maxSize ?? Infinity
    this.cache = new Map()
  }

  set(key: K, value: V, ttl?: number): void {
    const effectiveTTL = ttl ?? this.defaultTTL
    if (effectiveTTL <= 0) {
      throw new RangeError('TTL must be positive')
    }
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
        this._evictions++
      }
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + effectiveTTL,
    })
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (entry === undefined) {
      this._misses++
      return undefined
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this._evictions++
      this._misses++
      return undefined
    }
    this._hits++
    this.cache.delete(key)
    this.cache.set(key, entry)
    return entry.value
  }

  has(key: K): boolean {
    const entry = this.cache.get(key)
    if (entry === undefined) return false
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this._evictions++
      return false
    }
    return true
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  peek(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (entry === undefined) return undefined
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this._evictions++
      return undefined
    }
    return entry.value
  }

  getTTL(key: K): number {
    const entry = this.cache.get(key)
    if (entry === undefined) return -1
    const remaining = entry.expiresAt - Date.now()
    if (remaining <= 0) {
      this.cache.delete(key)
      this._evictions++
      return -1
    }
    return remaining
  }

  touch(key: K, ttl?: number): boolean {
    const entry = this.cache.get(key)
    if (entry === undefined) return false
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this._evictions++
      return false
    }
    entry.expiresAt = Date.now() + (ttl ?? this.defaultTTL)
    return true
  }

  clear(): void {
    this.cache.clear()
  }

  purgeExpired(): number {
    let purged = 0
    const now = Date.now()
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        purged++
      }
    }
    this._evictions += purged
    return purged
  }

  get size(): number {
    return this.cache.size
  }

  get isEmpty(): boolean {
    return this.cache.size === 0
  }

  keys(): K[] {
    return Array.from(this.cache.keys())
  }

  values(): V[] {
    const result: V[] = []
    const now = Date.now()
    for (const [, entry] of this.cache) {
      if (now <= entry.expiresAt) {
        result.push(entry.value)
      }
    }
    return result
  }

  getStats(): { hits: number; misses: number; evictions: number; size: number; hitRate: number } {
    const total = this._hits + this._misses
    return {
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
      size: this.cache.size,
      hitRate: total === 0 ? 0 : this._hits / total,
    }
  }
}
