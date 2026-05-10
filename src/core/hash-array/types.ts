export interface HashArrayOptions {
  initialCapacity?: number
  hashFn?: (value: unknown) => string
}

export interface HashArrayStatistics {
  pushes: number
  pops: number
  sets: number
  removes: number
  compacts: number
  gaps: number
  maxDenseLength: number
}

export interface HashArrayJSON<T = unknown> {
  slots: Array<{ index: number; value: T }>
  capacity: number
  length: number
  denseLength: number
  statistics: HashArrayStatistics
}

export const DEFAULT_HASH_ARRAY_OPTIONS: Required<HashArrayOptions> = {
  initialCapacity: 16,
  hashFn: (value: unknown): string => JSON.stringify(value),
}
