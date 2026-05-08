import type { CloudCacheConfig, CacheEntry, CacheLookupResult } from './types.js'
import { DEFAULT_CLOUD_CACHE_CONFIG } from './types.js'

function computeChecksum(value: unknown): string {
  const str = JSON.stringify(value) ?? 'undefined'
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return hash.toString(16).padStart(8, '0')
}

function computeSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value) ?? 'undefined').length
}

export class CloudCacheClient {
  private config: CloudCacheConfig
  private localCache: Map<string, CacheEntry>
  private stats: { hits: number; misses: number; stores: number; evictions: number }

  constructor(config?: Partial<CloudCacheConfig>) {
    this.config = { ...DEFAULT_CLOUD_CACHE_CONFIG, ...config }
    this.localCache = new Map()
    this.stats = { hits: 0, misses: 0, stores: 0, evictions: 0 }
  }

  async set<T>(
    key: string,
    value: T,
    options?: { ttl?: number; tags?: string[]; metadata?: Record<string, string> },
  ): Promise<boolean> {
    const ttl = options?.ttl ?? this.config.ttl
    const now = Date.now()
    const size = computeSize(value)

    if (size > this.config.maxEntrySize) {
      return false
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      createdAt: now,
      expiresAt: now + ttl,
      size,
      checksum: computeChecksum(value),
      tags: options?.tags ?? [],
      metadata: options?.metadata ?? {},
    }

    if (this.localCache.has(key)) {
      this.stats.evictions++
    }

    this.localCache.set(key, entry as CacheEntry)
    this.stats.stores++
    return true
  }

  async get<T>(key: string): Promise<CacheLookupResult<T>> {
    const start = Date.now()
    const entry = this.localCache.get(key)

    if (!entry) {
      this.stats.misses++
      return { found: false, fromCloud: false, latency: Date.now() - start }
    }

    if (Date.now() > entry.expiresAt) {
      this.localCache.delete(key)
      this.stats.evictions++
      this.stats.misses++
      return { found: false, fromCloud: false, latency: Date.now() - start }
    }

    this.stats.hits++
    return {
      found: true,
      entry: entry as CacheEntry<T>,
      fromCloud: false,
      latency: Date.now() - start,
    }
  }

  async has(key: string): Promise<boolean> {
    const entry = this.localCache.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.localCache.delete(key)
      return false
    }
    return true
  }

  delete(key: string): boolean {
    return this.localCache.delete(key)
  }

  async deleteByTags(tags: string[]): Promise<number> {
    let count = 0
    for (const [key, entry] of this.localCache) {
      if (tags.some((tag) => entry.tags.includes(tag))) {
        this.localCache.delete(key)
        this.stats.evictions++
        count++
      }
    }
    return count
  }

  async clear(): Promise<void> {
    const size = this.localCache.size
    this.localCache.clear()
    this.stats.evictions += size
  }

  getStats(): {
    hits: number
    misses: number
    stores: number
    evictions: number
    hitRate: number
    size: number
  } {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      stores: this.stats.stores,
      evictions: this.stats.evictions,
      hitRate: total === 0 ? 0 : this.stats.hits / total,
      size: this.localCache.size,
    }
  }

  async sync(): Promise<{ uploaded: number; downloaded: number }> {
    let expired = 0
    for (const [key, entry] of this.localCache) {
      if (Date.now() > entry.expiresAt) {
        this.localCache.delete(key)
        expired++
      }
    }
    return {
      uploaded: this.localCache.size,
      downloaded: expired,
    }
  }

  getKeys(): string[] {
    return [...this.localCache.keys()]
  }

  resetStats(): void {
    this.stats = { hits: 0, misses: 0, stores: 0, evictions: 0 }
  }
}
