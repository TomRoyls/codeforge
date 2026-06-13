export class CacheStore2<K, V> {
  private store = new Map<K, { value: V; expires: number | null }>()
  private hits = 0
  private misses = 0
  private defaultTTL: number | null

  constructor(defaultTTL: number | null = null) {
    this.defaultTTL = defaultTTL
  }

  set(key: K, value: V, ttl?: number): void {
    const expires = ttl !== undefined ? Date.now() + ttl : this.defaultTTL ? Date.now() + this.defaultTTL : null
    this.store.set(key, { value, expires })
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key)
    if (!entry) { this.misses++; return undefined }
    if (entry.expires !== null && Date.now() > entry.expires) {
      this.store.delete(key)
      this.misses++
      return undefined
    }
    this.hits++
    return entry.value
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    return this.store.delete(key)
  }

  get size(): number { return this.store.size }
  get hitRate(): number {
    const total = this.hits + this.misses
    return total === 0 ? 0 : this.hits / total
  }

  keys(): K[] { return [...this.store.keys()] }

  cleanup(): number {
    let removed = 0
    for (const [key, entry] of this.store) {
      if (entry.expires !== null && Date.now() > entry.expires) {
        this.store.delete(key)
        removed++
      }
    }
    return removed
  }

  clear(): void { this.store.clear(); this.hits = 0; this.misses = 0 }

  toArray(): K[] { return this.keys() }
  toString(): string { return JSON.stringify({ size: this.size, hits: this.hits, misses: this.misses }) }
  toJSON(): Record<string, number> { return { size: this.size, hits: this.hits, misses: this.misses } }
  clone(): CacheStore2<K, V> { return new CacheStore2<K, V>(this.defaultTTL) }
  equals(other: unknown): boolean { return other instanceof CacheStore2 }
}
