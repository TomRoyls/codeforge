export const BITS_PER_WORD = 32
export const WORD_SHIFT = 5
export const WORD_MASK = 31
export const ALL_ONES = 0xffffffff

export interface SparseBitmapIndexOptions {
  initialCapacity?: number
  autoCompress?: boolean
  compressionThreshold?: number
}

export interface SparseBitmapIndexStatistics {
  sets: number
  clears: number
  toggles: number
  rangeOperations: number
  compressions: number
  lookups: number
}

export const DEFAULT_SPARSE_BITMAP_INDEX_OPTIONS: Required<SparseBitmapIndexOptions> = {
  initialCapacity: 64,
  autoCompress: true,
  compressionThreshold: 0.3,
}

export interface WordRun {
  wordIndex: number
  value: number
}
