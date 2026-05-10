export interface ConcurrentHashMapOptions<K = unknown> {
  initialCapacity: number
  concurrencyLevel: number
  loadFactor: number
  hashFn: (key: K) => number
}

export interface ConcurrentHashMapStatistics {
  gets: number
  sets: number
  deletes: number
  hits: number
  misses: number
  resizes: number
  putIfAbsentCalls: number
  computeIfAbsentCalls: number
  segmentLockContentions: number
}

export const DEFAULT_CONCURRENT_HASH_MAP_OPTIONS: ConcurrentHashMapOptions<unknown> = {
  initialCapacity: 64,
  concurrencyLevel: 16,
  loadFactor: 0.75,
  hashFn: (key: unknown) => {
    const str = String(key)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      hash = ((hash << 5) - hash + ch) | 0
    }
    return hash >>> 0
  },
}
