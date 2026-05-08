import type { CacheStats } from './types.js'

interface TTLCacheEntry {
  key: string
  value: unknown
  createdAt: number
  ttl: number
}

export class TTLCache {
  private entries: Map<string, TTLCacheEntry> = new Map()
  private hits: number = 0
  private misses: number = 0
  private evictions: number = 0

  set(key: string, value: unknown, ttl: number = 60000): void {
    this.entries.set(key, {
      key,
      value,
      createdAt: Date.now(),
      ttl,
    })
  }

  get(key: string): unknown | undefined {
    const entry = this.entries.get(key)
    if (!entry) {
      this.misses++
      return undefined
    }

    if (this.isExpired(entry)) {
      this.entries.delete(key)
      this.misses++
      return undefined
    }

    this.hits++
    return entry.value
  }

  has(key: string): boolean {
    const entry = this.entries.get(key)
    if (!entry) return false
    if (this.isExpired(entry)) {
      this.entries.delete(key)
      return false
    }
    return true
  }

  delete(key: string): boolean {
    return this.entries.delete(key)
  }

  clear(): void {
    this.entries.clear()
    this.hits = 0
    this.misses = 0
    this.evictions = 0
  }

  getRemainingTTL(key: string): number {
    const entry = this.entries.get(key)
    if (!entry) return 0
    const elapsed = Date.now() - entry.createdAt
    const remaining = entry.ttl - elapsed
    return remaining > 0 ? remaining : 0
  }

  getExpiredKeys(): string[] {
    const now = Date.now()
    const expired: string[] = []
    for (const entry of this.entries.values()) {
      if (now - entry.createdAt >= entry.ttl) {
        expired.push(entry.key)
      }
    }
    return expired
  }

  cleanup(): number {
    const expired = this.getExpiredKeys()
    for (const key of expired) {
      this.entries.delete(key)
    }
    this.evictions += expired.length
    return expired.length
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      size: this.entries.size,
      entries: this.entries.size,
      evictions: this.evictions,
    }
  }

  private isExpired(entry: TTLCacheEntry): boolean {
    return Date.now() - entry.createdAt >= entry.ttl
  }
}
