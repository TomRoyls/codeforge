export class LRUCacheV3<K, V> {
  private cache = new Map<K, V>()
  private capacity: number

  constructor(capacity: number) {
    this.capacity = capacity
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined
    const val = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, val)
    return val
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key)
    else if (this.cache.size >= this.capacity) {
      const first = this.cache.keys().next().value!
      this.cache.delete(first)
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean { return this.cache.has(key) }

  delete(key: K): boolean { return this.cache.delete(key) }

  get size(): number { return this.cache.size }
  get isEmpty(): boolean { return this.cache.size === 0 }

  clear(): void { this.cache.clear() }

  toArray(): Array<[K, V]> { return Array.from(this.cache.entries()) }

  toString(): string { return JSON.stringify({ size: this.size, capacity: this.capacity }) }
  toJSON(): Record<string, number> { return { size: this.size, capacity: this.capacity } }

  clone(): LRUCacheV3<K, V> {
    const c = new LRUCacheV3<K, V>(this.capacity)
    for (const [k, v] of this.cache) c.cache.set(k, v)
    return c
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LRUCacheV3)) return false
    return this.capacity === other.capacity && this.size === other.size
  }
}
