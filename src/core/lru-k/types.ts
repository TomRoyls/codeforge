export interface LruKOptions {
  capacity: number
  k?: number
}

export interface LruKStatistics {
  hits: number
  misses: number
  evictions: number
}

export interface LruKEntry<V> {
  key: string
  value: V
  accessHistory: number[]
}

export const DEFAULT_LRU_K_OPTIONS: Required<LruKOptions> = {
  capacity: 100,
  k: 2,
}
