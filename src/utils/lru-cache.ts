export interface LRUCacheOptions {
  maxSize: number
}

export interface LRUCacheStats {
  size: number
  maxSize: number
  hits: number
  misses: number
  evictions: number
  hitRate: number
}

export class LRUCache<K, V> {
  private cache: Map<K, V> = new Map()
  private _maxSize: number
  private _hits: number = 0
  private _misses: number = 0
  private _evictions: number = 0

  constructor(maxSizeOrOptions: number | LRUCacheOptions) {
    const maxSize = typeof maxSizeOrOptions === 'number'
      ? maxSizeOrOptions
      : maxSizeOrOptions.maxSize
    if (maxSize < 1) throw new RangeError(`maxSize must be >= 1, got ${maxSize}`)
    this._maxSize = maxSize
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      this._misses++
      return undefined
    }
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    this._hits++
    return value
  }

  getOrDefault(key: K, defaultValue: V): V {
    if (!this.cache.has(key)) {
      this._misses++
      return defaultValue
    }
    return this.get(key)!
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this._maxSize && this._maxSize > 0) {
      const firstKey = this.cache.keys().next()
      if (!firstKey.done) {
        this.cache.delete(firstKey.value)
        this._evictions++
      }
    } else if (this.cache.size > this._maxSize) {
      const firstKey = this.cache.keys().next()
      if (!firstKey.done) {
        this.cache.delete(firstKey.value)
        this._evictions++
      }
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  get size(): number {
    return this.cache.size
  }

  get maxSize(): number {
    return this._maxSize
  }

  get isEmpty(): boolean {
    return this.cache.size === 0
  }

  peek(key: K): V | undefined {
    return this.cache.get(key)
  }

  clear(): void {
    this.cache.clear()
    this._hits = 0
    this._misses = 0
    this._evictions = 0
  }

  keys(): K[] {
    return [...this.cache.keys()]
  }

  values(): V[] {
    return [...this.cache.values()]
  }

  entries(): [K, V][] {
    return [...this.cache.entries()]
  }

  forEach(callback: (value: V, key: K) => void): void {
    this.cache.forEach((value, key) => callback(value, key))
  }

  stats(): LRUCacheStats {
    const total = this._hits + this._misses
    return {
      size: this.cache.size,
      maxSize: this._maxSize,
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
      hitRate: total === 0 ? 0 : this._hits / total,
    }
  }

  resize(newMaxSize: number): void {
    if (newMaxSize < 1) throw new RangeError(`maxSize must be >= 1, got ${newMaxSize}`)
    while (this.cache.size > newMaxSize) {
      const firstKey = this.cache.keys().next()
      if (!firstKey.done) {
        this.cache.delete(firstKey.value)
        this._evictions++
      }
    }
    this._maxSize = newMaxSize
  }
}
