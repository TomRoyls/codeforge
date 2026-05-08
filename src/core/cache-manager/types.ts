export interface CacheEntry<T = unknown> {
  key: string
  value: T
  createdAt: number
  accessedAt: number
  ttl: number
  size: number
  tags: string[]
  metadata: Record<string, unknown>
}

export interface CacheConfig {
  maxSize: number
  maxEntries: number
  defaultTTL: number
  evictionPolicy: 'lru' | 'lfu' | 'fifo'
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  size: number
  entries: number
  evictions: number
}

export interface CacheEvent {
  type: 'hit' | 'miss' | 'set' | 'delete' | 'evict' | 'expire' | 'clear'
  key: string
  timestamp: number
}

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxSize: 1024 * 1024 * 100,
  maxEntries: 1000,
  defaultTTL: 60000,
  evictionPolicy: 'lru',
}
