export interface WeakRefCacheOptions {
  maxSize?: number
  ttl?: number
}

export interface WeakRefCacheStatistics {
  gets: number
  sets: number
  deletes: number
  hits: number
  misses: number
  gcCollections: number
  maxAlive: number
}

export interface WeakRefCacheJSON<K> {
  entries: Array<{ key: K; alive: boolean }>
  options: { maxSize: number; ttl: number }
  statistics: WeakRefCacheStatistics
}

export const DEFAULT_WEAK_REF_CACHE_OPTIONS: Required<WeakRefCacheOptions> = {
  maxSize: Infinity,
  ttl: Infinity,
}
