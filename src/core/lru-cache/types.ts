export interface LRUNode<T = unknown> {
  key: string
  value: T
  prev?: LRUNode<T>
  next?: LRUNode<T>
  createdAt: number
}

export interface LRUCacheOptions {
  maxSize: number
  ttlMs: number
}

export interface LRUCacheStats {
  size: number
  maxSize: number
  hits: number
  misses: number
  hitRate: number
  evictions: number
}

export const DEFAULT_LRU_CACHE_OPTIONS: LRUCacheOptions = {
  maxSize: 100,
  ttlMs: 0,
}
