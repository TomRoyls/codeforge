export interface LRUKCacheOptions {
  k: number
  capacity: number
}

interface CacheEntry<V> {
  value: V
  history: number[]
}

export class LRUKCache<K, V> {
  private readonly k: number
  private readonly capacity: number
  private readonly cache: Map<K, CacheEntry<V>>
  private clock: number

  constructor(options: LRUKCacheOptions) {
    if (options.capacity < 1) {
      throw new RangeError(`capacity must be >= 1, got ${options.capacity}`)
    }
    if (options.k < 1) {
      throw new RangeError(`k must be >= 1, got ${options.k}`)
    }
    this.k = options.k
    this.capacity = options.capacity
    this.cache = new Map()
    this.clock = 0
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    this.recordAccess(entry)
    return entry.value
  }

  set(key: K, value: V): void {
    const existing = this.cache.get(key)
    if (existing) {
      existing.value = value
      this.recordAccess(existing)
      return
    }

    if (this.cache.size >= this.capacity) {
      this.evict()
    }

    const entry: CacheEntry<V> = { value, history: [this.clock++] }
    this.cache.set(key, entry)
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

  clear(): void {
    this.cache.clear()
  }

  get kValue(): number {
    return this.k
  }

  get capacityValue(): number {
    return this.capacity
  }

  getAccessHistory(key: K): number[] {
    const entry = this.cache.get(key)
    return entry ? [...entry.history] : []
  }

  private recordAccess(entry: CacheEntry<V>): void {
    entry.history.push(this.clock++)
    if (entry.history.length > this.k) {
      entry.history.shift()
    }
  }

  private evict(): void {
    let evictKey: K | undefined
    let evictScore = Infinity

    for (const [key, entry] of this.cache) {
      const score = this.evictionScore(entry)
      if (score < evictScore) {
        evictScore = score
        evictKey = key
      }
    }

    if (evictKey !== undefined) {
      this.cache.delete(evictKey)
    }
  }

  private evictionScore(entry: CacheEntry<V>): number {
    if (entry.history.length < this.k) {
      return entry.history[0] ?? -1
    }
    return entry.history[0]!
  }

  toString(): string {
    return `LRUKCache(k=${this.k}, ${this.cache.size}/${this.capacity})`
  }

  toJSON(): unknown {
    const result: Array<[K, V]> = []
    for (const [k, e] of this.cache) result.push([k, e.value])
    return result
  }

  clone(): LRUKCache<K, V> {
    const copy = new LRUKCache<K, V>({ k: this.k, capacity: this.capacity })
    for (const [k, e] of this.cache) {
      copy.cache.set(k, { value: e.value, history: [...e.history] })
    }
    copy.clock = this.clock
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LRUKCache)) return false
    if (this.k !== other.k) return false
    if (this.capacity !== other.capacity) return false
    if (this.cache.size !== other.cache.size) return false
    for (const [k, e] of this.cache) {
      const oe = other.cache.get(k)
      if (!oe) return false
      if (!Object.is(e.value, oe.value)) return false
    }
    return true
  }
}
