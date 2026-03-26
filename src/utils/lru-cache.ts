export interface LRUCacheOptions {
  maxSize: number
}

export class LRUCache<K, V> {
  private cache: Map<K, { value: V; timestamp: number }>
  private maxSize: number
  private accessOrder: K[]

  constructor(options: LRUCacheOptions) {
    this.cache = new Map()
    this.maxSize = options.maxSize
    this.accessOrder = []
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    this.updateAccessOrder(key)
    return entry.value
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

    this.cache.set(key, { value, timestamp: Date.now() })
    this.accessOrder.push(key)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  delete(key: K): boolean {
    if (!this.cache.has(key)) return false
    this.cache.delete(key)
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    return true
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }

  get size(): number {
    return this.cache.size
  }

  /**
   * Iterate over all entries in the cache
   */
  forEach(callback: (value: V, key: K) => void): void {
    this.cache.forEach((entry, key) => {
      callback(entry.value, key)
    })
  }

  /**
   * Returns an iterable of key-value pairs
   */
  entries(): IterableIterator<[K, V]> {
    const entries: [K, V][] = []
    this.cache.forEach((entry, key) => {
      entries.push([key, entry.value])
    })
    return entries[Symbol.iterator]()
  }

  /**
   * Returns an iterable of keys
   */
  keys(): IterableIterator<K> {
    return this.cache.keys()
  }

  /**
   * Returns an iterable of values
   */
  values(): IterableIterator<V> {
    const values: V[] = []
    this.cache.forEach((entry) => {
      values.push(entry.value)
    })
    return values[Symbol.iterator]()
  }

  /**
   * Returns the value associated with the key, or default if not found
   */
  getOrDefault(key: K, defaultValue: V): V {
    const value = this.get(key)
    return value !== undefined ? value : defaultValue
  }

  private updateAccessOrder(key: K): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
      this.accessOrder.push(key)
    }
  }

  private evictLRU(): void {
    if (this.accessOrder.length === 0) return

    const lruKey = this.accessOrder.shift()
    if (lruKey !== undefined) {
      this.cache.delete(lruKey)
    }
  }
}
