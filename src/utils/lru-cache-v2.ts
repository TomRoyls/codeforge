export class LRUCacheV2<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map()
  private capacity: number
  private clock = 0

  constructor(capacity: number) {
    this.capacity = capacity
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined
    entry.timestamp = ++this.clock
    return entry.value
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!
      entry.value = value
      entry.timestamp = ++this.clock
      return
    }
    if (this.cache.size >= this.capacity) this.evict()
    this.cache.set(key, { value, timestamp: ++this.clock })
  }

  has(key: string): boolean { return this.cache.has(key) }

  delete(key: string): boolean { return this.cache.delete(key) }

  get size(): number { return this.cache.size }
  get isEmpty(): boolean { return this.cache.size === 0 }

  private evict(): void {
    let oldest = ''
    let minTime = Infinity
    for (const [key, entry] of this.cache) {
      if (entry.timestamp < minTime) { minTime = entry.timestamp; oldest = key }
    }
    if (oldest) this.cache.delete(oldest)
  }

  clear(): void { this.cache.clear(); this.clock = 0 }

  toArray(): Array<{ key: string; value: T }> {
    return Array.from(this.cache.entries()).map(([k, v]) => ({ key: k, value: v.value }))
  }

  toString(): string { return JSON.stringify({ size: this.size, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this.size, capacity: this.capacity } }

  clone(): LRUCacheV2<T> {
    const c = new LRUCacheV2<T>(this.capacity)
    c.cache = new Map(this.cache)
    c.clock = this.clock
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LRUCacheV2)) return false
    return this.capacity === other.capacity && this.size === other.size
  }
}
