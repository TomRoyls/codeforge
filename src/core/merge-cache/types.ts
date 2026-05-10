export interface MergeCacheOptions<V> {
  maxSize?: number
  ttl?: number
  defaultTTL?: number
  mergeFn?: (existing: V, incoming: V) => V
}

export interface MergeCacheStatistics {
  gets: number
  sets: number
  deletes: number
  hits: number
  misses: number
  evictions: number
  merges: number
  purges: number
  maxSizeReached: number
}

export interface MergeCacheEntryJSON<V> {
  value: V
  expiresAt: number | null
}

export interface MergeCacheJSON<K, V> {
  entries: Array<[K, MergeCacheEntryJSON<V>]>
  maxSize: number
  ttl: number | null
  defaultTTL: number | null
  statistics: MergeCacheStatistics
}

export interface MergeCacheResolvedOptions<V> {
  maxSize: number
  ttl: number | undefined
  defaultTTL: number | undefined
  mergeFn: (existing: V, incoming: V) => V
}

export const DEFAULT_MERGE_CACHE_OPTIONS: MergeCacheResolvedOptions<unknown> = {
  maxSize: 1000,
  ttl: undefined,
  defaultTTL: undefined,
  mergeFn: (_existing: unknown, incoming: unknown) => incoming,
}
