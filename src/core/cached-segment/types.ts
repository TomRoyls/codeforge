export const DEFAULT_CACHED_SEGMENT_OPTIONS = {
  segmentSize: 64,
  cacheCapacity: 8,
} as const

export interface CachedSegmentOptions {
  segmentSize?: number
  cacheCapacity?: number
}

export interface CachedSegmentStatistics {
  reads: number
  writes: number
  cacheHits: number
  cacheMisses: number
  evictions: number
  flushes: number
  segmentsLoaded: number
}
