export interface LRUCacheOptions {
  maxSize: number
}

export class LRUCache<K, V> {
  private accessOrder: K[]
  private cache: Map<K, { timestamp: number; value: V }>
  private maxSize: number

  constructor(options: LRUCacheOptions) {
    this.cache = new Map()
    this.maxSize = options.maxSize
    this.accessOrder = []
  }

  get size(): number {
    return this.cache.size
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  delete(key: K): boolean {
    if (!this.cache.has(key)) return false
    this.cache.delete(key)
    const index = this.accessOrder.indexOf(key)
    if (index !== -1) {
      this.accessOrder.splice(index, 1)
    }

    return true
  }

  /**
   * Returns an iterable of key-value pairs
   */
  entries(): IterableIterator<[K, V]> {
    const entries: [K, V][] = []
    for (const [key, entry] of this.cache.entries()) {
      entries.push([key, entry.value])
    }

    return entries[Symbol.iterator]()
  }

  /**
   * Iterate over all entries in the cache
   */
  forEach(callback: (value: V, key: K) => void): void {
    for (const [key, entry] of this.cache.entries()) {
      callback(entry.value, key)
    }
  }

  get(key: K): undefined | V {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    this.updateAccessOrder(key)
    return entry.value
  }

  /**
   * Returns the value associated with the key, or default if not found
   */
  getOrDefault(key: K, defaultValue: V): V {
    const value = this.get(key)
    return value === undefined ? defaultValue : value
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * Returns an iterable of keys
   */
  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!
      entry.value = value
      entry.timestamp = Date.now()
      this.updateAccessOrder(key)
      return
    }

    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, { timestamp: Date.now(), value })
    this.accessOrder.push(key)
  }

  /**
   * Returns an iterable of values
   */
  values(): IterableIterator<V> {
    const values: V[] = []
    for (const [, entry] of this.cache) {
      values.push(entry.value)
    }

    return values[Symbol.iterator]()
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return

    const lruKey = this.accessOrder.shift()
    if (lruKey !== undefined) {
      this.cache.delete(lruKey)
    }
  }

  private updateAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key)
    if (index !== -1) {
      this.accessOrder.splice(index, 1)
      this.accessOrder.push(key)
    }
  }
}
