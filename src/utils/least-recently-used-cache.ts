export class LeastRecentlyUsedCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
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

  get isEmpty(): boolean {
    return this.cache.size === 0
  }

  get capacity(): number {
    return this.maxSize
  }

  get fillRatio(): number {
    return this.cache.size / this.maxSize
  }

  evict(): K | undefined {
    if (this.cache.size === 0) return undefined
    const firstKey = this.cache.keys().next().value
    this.cache.delete(firstKey)
    return firstKey
  }

  clear(): void {
    this.cache.clear()
  }

  toArray(): Array<[K, V]> {
    return Array.from(this.cache.entries())
  }

  toString(): string {
    return JSON.stringify({ size: this.size, capacity: this.maxSize })
  }

  toJSON(): Record<string, unknown> {
    return { size: this.size, capacity: this.maxSize, fillRatio: this.fillRatio }
  }

  clone(): LeastRecentlyUsedCache<K, V> {
    const copy = new LeastRecentlyUsedCache<K, V>(this.maxSize)
    copy.cache = new Map(this.cache)
    return copy
  }

  equals(other: unknown): boolean {
    if (!(other instanceof LeastRecentlyUsedCache)) return false
    return this.size === other.size && this.maxSize === other.maxSize
  }
}
