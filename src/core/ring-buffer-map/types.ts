export interface RingBufferMapOptions {
  capacity: number
}

export interface RingBufferMapStatistics {
  sets: number
  gets: number
  deletes: number
  evictions: number
  overwrites: number
  maxSize: number
}

export interface RingBufferMapJSON<K, V> {
  entries: Array<[K, V]>
  capacity: number
  statistics: RingBufferMapStatistics
}

export const DEFAULT_RING_BUFFER_MAP_OPTIONS: Required<RingBufferMapOptions> = {
  capacity: 1024,
}
